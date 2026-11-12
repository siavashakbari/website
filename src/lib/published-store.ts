import { supabase, requireVaultToken } from "./supabase-client";
import {
  commitSnapshot,
  PUBLIC_CONTENT_KEYS,
  validateSnapshot,
  type ContentSnapshot,
} from "./published-store-core";

const OUTBOX = "siavash_pending_public_content_v1";
export const CONTENT_STATUS_EVENT = "siavash_content_status";
let content: ContentSnapshot = {};
let revision = -1;
let generation = 0;
let dirty = false;
let saving = false;
let loading: Promise<void> | null = null;
let status = "Loading published content…";
const publicKeys = new Set<string>(PUBLIC_CONTENT_KEYS);
const useVercelBlob = import.meta.env.VITE_VAULT_BACKEND !== "supabase";
export const isVercelContentBackend = useVercelBlob;

type PublishedSnapshot = { revision: number; content: ContentSnapshot };
declare global {
  var __getRequestPublishedSnapshot: (() => PublishedSnapshot | undefined) | undefined;
}

function requestSnapshot(): PublishedSnapshot | undefined {
  return typeof window === "undefined" ? globalThis.__getRequestPublishedSnapshot?.() : undefined;
}

export function getPublishedHydrationSnapshot(): PublishedSnapshot {
  return requestSnapshot() || { revision, content };
}

export function seedPublishedContent(snapshot: PublishedSnapshot) {
  if (typeof window === "undefined" || dirty || saving) return;
  if (snapshot.revision > revision) {
    validateSnapshot(snapshot.content);
    content = snapshot.content;
    revision = snapshot.revision;
  }
}

export function getContentStatus() {
  return status;
}
export function isContentReady() {
  return (requestSnapshot()?.revision ?? revision) >= 0;
}
function setStatus(message: string) {
  status = message;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONTENT_STATUS_EVENT));
}
function announceContent() {
  window.dispatchEvent(new Event("storage"));
}

export function hasPendingRecovery() {
  return !dirty && typeof window !== "undefined" && Boolean(localStorage.getItem(OUTBOX));
}

// Existing synchronous readers use the shared snapshot. Private invoice data
// has its own authenticated Vercel endpoint; legacy local storage stays available
// only for a one-time import from the original browser.
export const contentStorage = {
  getItem(key: string): string | null {
    if (publicKeys.has(key)) return (requestSnapshot()?.content ?? content)[key] ?? null;
    return typeof window === "undefined" ? null : localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    if (!publicKeys.has(key)) {
      localStorage.setItem(key, value);
      return;
    }
    content[key] = value;
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    if (!publicKeys.has(key)) {
      localStorage.removeItem(key);
      return;
    }
    delete content[key];
  },
};

export function getPublishedArray<T>(key: string): T[] {
  const raw = contentStorage.getItem(key);
  if (!raw) throw new Error(`Published content is missing ${key}.`);
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error(`Published content has an invalid ${key} collection.`);
  return parsed as T[];
}

export async function refreshPublishedContent(): Promise<void> {
  if (dirty || saving) return;
  if (loading) return loading;
  const started = generation;
  loading = (async () => {
    try {
      let data: PublishedSnapshot;
      if (useVercelBlob) {
        const response = await fetch("/api/content", { cache: "no-store" });
        if (!response.ok) throw new Error(`Published content request failed (${response.status}).`);
        data = await response.json();
        validateSnapshot(data.content);
      } else {
        if (!supabase) throw new Error("Supabase is not configured.");
        const result = await supabase
          .from("vault_content")
          .select("revision,content")
          .eq("id", 1)
          .single();
        if (result.error) throw result.error;
        data = result.data;
      }
      if (dirty || generation !== started) return;
      if (data.revision > revision) {
        content = data.content;
        revision = data.revision;
        announceContent();
      }
      setStatus(
        localStorage.getItem(OUTBOX)
          ? "Unsaved changes are waiting to be sent. Retry saving."
          : "Published content loaded",
      );
    } catch (error) {
      setStatus(
        `Cannot load published content: ${error instanceof Error ? error.message : String((error as { message?: string })?.message || error)}`,
      );
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** Called only at mutation boundaries; getter self-healing never publishes. */
export function queueContentSave() {
  if (typeof window === "undefined") return;
  if (revision < 0) {
    setStatus("Not saved: load published content before editing.");
    return;
  }
  if (hasPendingRecovery()) {
    setStatus("Not saved: retry the pending save before editing.");
    return;
  }
  dirty = true;
  generation++;
  try {
    localStorage.setItem(OUTBOX, JSON.stringify({ revision, content }));
  } catch {
    setStatus("Not saved: browser backup is full. Keep this tab open and retry.");
    return;
  }
  setStatus("Saving to server…");
  queueMicrotask(() => {
    void flushContentSave();
  });
}

export async function flushContentSave(): Promise<void> {
  if (!dirty || saving) return;
  saving = true;
  try {
    await requireVaultToken();
    while (dirty) {
      const started = generation;
      const snapshot = { ...content };
      revision = await commitSnapshot(snapshot, revision, async (next, expected) => {
        if (useVercelBlob) {
          const response = await fetch("/api/content", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${await requireVaultToken()}`,
            },
            body: JSON.stringify({ expected_revision: expected, next_content: next }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || `Save failed (${response.status}).`);
          return result.revision as number;
        }
        const { data, error } = await supabase!.rpc("save_vault_content", {
          expected_revision: expected,
          next_content: next,
        });
        if (error) throw new Error(error.message);
        return data as number;
      });
      dirty = generation !== started;
      if (dirty) localStorage.setItem(OUTBOX, JSON.stringify({ revision, content }));
    }
    localStorage.removeItem(OUTBOX);
    setStatus("Saved to server");
  } catch (error) {
    setStatus(`Not saved: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    saving = false;
  }
}

/** Resume only the queued save, never historical localStorage collections. */
export async function retryContentSave() {
  if (saving) return;
  if (dirty) {
    await flushContentSave();
    return;
  }
  const raw = localStorage.getItem(OUTBOX);
  if (!raw) {
    await refreshPublishedContent();
    return;
  }
  try {
    await requireVaultToken();
    await refreshPublishedContent();
    if (revision < 0) return;
    const pending = JSON.parse(raw);
    validateSnapshot(pending.content);
    if (pending.revision !== revision) {
      throw new Error(
        "Newer changes exist on the server. Your pending edits were kept; discard them to load the latest version, then reapply your changes.",
      );
    }
    content = pending.content;
    dirty = true;
    generation++;
    announceContent();
    await flushContentSave();
  } catch (error) {
    setStatus("Not saved: " + (error instanceof Error ? error.message : String(error)));
  }
}

export async function discardPendingContentSave() {
  if (saving) return;
  localStorage.removeItem(OUTBOX);
  dirty = false;
  generation++;
  revision = -1;
  await refreshPublishedContent();
}

export function startPublishedContentSync() {
  void refreshPublishedContent();
  const refresh = () => {
    if (document.visibilityState === "visible") void refreshPublishedContent();
  };
  const timer = window.setInterval(refresh, 30000);
  window.addEventListener("focus", refresh);
  const reconnect = () => {
    if (dirty) void flushContentSave();
    else refresh();
  };
  const storageChanged = (event: StorageEvent) => {
    if (event.key === OUTBOX && event.newValue === null) refresh();
  };
  window.addEventListener("online", reconnect);
  window.addEventListener("storage", storageChanged);
  document.addEventListener("visibilitychange", refresh);
  const warn = (event: BeforeUnloadEvent) => {
    if (dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", warn);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("online", reconnect);
    window.removeEventListener("storage", storageChanged);
    document.removeEventListener("visibilitychange", refresh);
    window.removeEventListener("beforeunload", warn);
  };
}
