import { AsyncLocalStorage } from "node:async_hooks";
import { validateSnapshot, type ContentSnapshot } from "./published-store-core";
import { readVercelPublishedContent } from "./vercel-blob-content.server";

export interface PublishedSnapshot {
  revision: number;
  content: ContentSnapshot;
}

const requestSnapshots = new AsyncLocalStorage<PublishedSnapshot | undefined>();

// The synchronous portfolio readers run in route loaders and components. This
// accessor keeps their server reads isolated per request, even during concurrent SSR.
globalThis.__getRequestPublishedSnapshot = () => requestSnapshots.getStore();

export async function loadRequestPublishedSnapshot(): Promise<PublishedSnapshot | undefined> {
  if (import.meta.env.VITE_VAULT_BACKEND !== "supabase") {
    return readVercelPublishedContent();
  }
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return undefined;

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/vault_content?select=revision,content&id=eq.1`, {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`Published content request failed (${response.status}).`);
  const result = await response.json();
  const row = Array.isArray(result) ? result[0] : result;
  if (!row || !Number.isInteger(row.revision) || row.revision < 0) {
    throw new Error("Published content response is missing its revision.");
  }
  validateSnapshot(row.content);
  return { revision: row.revision, content: row.content };
}

export function withRequestPublishedSnapshot<T>(
  snapshot: PublishedSnapshot | undefined,
  callback: () => T,
): T {
  return requestSnapshots.run(snapshot, callback);
}
