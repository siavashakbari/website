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

export function getContentStatus() {
  return status;
}
export function isContentReady() {
  return revision >= 0;
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

// Existing synchronous readers now read the shared snapshot, not old browser edits.
// Non-public data (including invoices) retains its separate local storage.
export const contentStorage = {
  getItem(key: string): string | null {
    return publicKeys.has(key) ? (content[key] ?? null) : localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (!publicKeys.has(key)) {
      localStorage.setItem(key, value);
      return;
    }
    content[key] = value;
  },
  removeItem(key: string) {
    if (!publicKeys.has(key)) {
      localStorage.removeItem(key);
      return;
    }
    delete content[key];
  },
};

export async function refreshPublishedContent(): Promise<void> {
  if (dirty || saving) return;
  if (loading) return loading;
  const started = generation;
  loading = (async () => {
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error } = await supabase
        .from("vault_content")
        .select("revision,content")
        .eq("id", 1)
        .single();
      if (error) throw error;
      if (dirty || generation !== started) return;
      if (revision !== data.revision) {
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
