import { AsyncLocalStorage } from "node:async_hooks";
import type { ContentSnapshot } from "./published-store-core";
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
  return readVercelPublishedContent();
}

export function withRequestPublishedSnapshot<T>(
  snapshot: PublishedSnapshot | undefined,
  callback: () => T,
): T {
  return requestSnapshots.run(snapshot, callback);
}
