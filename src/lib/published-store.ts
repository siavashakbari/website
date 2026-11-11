import { supabase, requireVaultToken } from "./supabase-client";
import { commitSnapshot, PUBLIC_CONTENT_KEYS, type ContentSnapshot } from "./published-store-core";

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
          ? "Unpublished edits are stored in this browser. Recover them before editing."
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
    setStatus("Not saved: recover or export the existing unpublished edits first.");
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

export function hasBrowserRecovery(): boolean {
  return (
    Boolean(localStorage.getItem(OUTBOX)) ||
    PUBLIC_CONTENT_KEYS.some((key) => localStorage.getItem(key))
  );
}

export function browserRecoverySnapshot(): ContentSnapshot {
  const pending = localStorage.getItem(OUTBOX);
  if (pending) return JSON.parse(pending).content;
  return Object.fromEntries(
    PUBLIC_CONTENT_KEYS.flatMap((key) => {
      const value = localStorage.getItem(key);
      return value === null ? [] : [[key, value]];
    }),
  );
}

export async function recoverBrowserContent() {
  if (revision < 0) throw new Error("Load the server content first.");
  await requireVaultToken();
  const { getMediaObjectUrl } = await import("./local-media-db");
  const { uploadToCloudStorage } = await import("./cloud-storage");
  const urls = new Map<string, string>();
  async function migrate(value: unknown): Promise<unknown> {
    if (typeof value === "string" && /^(idb:|blob:|data:(image|video)\/)/.test(value)) {
      if (urls.has(value)) return urls.get(value);
      const source = value.startsWith("idb:") ? await getMediaObjectUrl(value) : value;
      if (!source)
        throw new Error(`Missing browser media: ${value}. Open Vault in the original browser.`);
      const response = await fetch(source);
      if (!response.ok) throw new Error("Cannot read browser media.");
      const blob = await response.blob();
      const ext = blob.type.includes("video")
        ? blob.type.includes("webm")
          ? "webm"
          : "mp4"
        : "jpg";
      const result = await uploadToCloudStorage(blob, `recovered.${ext}`);
      urls.set(value, result.url);
      return result.url;
    }
    if (Array.isArray(value)) return Promise.all(value.map(migrate));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(value).map(async ([key, item]) => [key, await migrate(item)]),
        ),
      );
    }
    return value;
  }
  setStatus("Recovering browser media…");
  const recovered: ContentSnapshot = {};
  for (const [key, value] of Object.entries(browserRecoverySnapshot())) {
    recovered[key] = JSON.stringify(await migrate(JSON.parse(value)));
  }
  content = { ...content, ...recovered };
  // Keep the previous outbox until the replacement snapshot has been persisted.
  dirty = true;
  queueContentSave();
  announceContent();
  await flushContentSave();
}

export function startPublishedContentSync() {
  void refreshPublishedContent();
  const refresh = () => {
    if (document.visibilityState === "visible") void refreshPublishedContent();
  };
  const timer = window.setInterval(refresh, 30000);
  window.addEventListener("focus", refresh);
  window.addEventListener("online", refresh);
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
    window.removeEventListener("online", refresh);
    window.removeEventListener("beforeunload", warn);
  };
}
