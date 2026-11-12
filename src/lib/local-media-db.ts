import { useEffect, useState } from "react";
import { resolveInventoryImage } from "@/lib/inventory-assets";

const DB_NAME = "siavash_vault_media_blobs";
const DB_VERSION = 1;
const STORE_NAME = "blobs";

const objectUrlCache = new Map<string, string>();
const inflightReads = new Map<string, Promise<string>>();

export function isIndexedDbMediaUrl(src?: string): boolean {
  return Boolean(src && src.startsWith("idb://"));
}

function openBlobDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable in this environment."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open IndexedDB."));
  });
}

export async function getMediaObjectUrl(idbUrl: string): Promise<string> {
  if (!isIndexedDbMediaUrl(idbUrl)) {
    return resolveInventoryImage(idbUrl) || idbUrl;
  }

  const cached = objectUrlCache.get(idbUrl);
  if (cached) return cached;

  const existingRead = inflightReads.get(idbUrl);
  if (existingRead) return existingRead;

  const promise = (async () => {
    try {
      const db = await openBlobDb();
      const blob = await new Promise<Blob | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(idbUrl);
        req.onsuccess = () => resolve(req.result as Blob | undefined);
        req.onerror = () => reject(req.error || new Error("Failed to read media blob."));
      });
      if (!blob) return "";
      const objUrl = URL.createObjectURL(blob);
      objectUrlCache.set(idbUrl, objUrl);
      return objUrl;
    } catch {
      return "";
    } finally {
      inflightReads.delete(idbUrl);
    }
  })();

  inflightReads.set(idbUrl, promise);
  return promise;
}

export async function listMediaBlobKeys(): Promise<string[]> {
  try {
    const db = await openBlobDb();
    return await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAllKeys();
      req.onsuccess = () => resolve((req.result as IDBValidKey[]).map(String));
      req.onerror = () => reject(req.error || new Error("Failed to list media keys."));
    });
  } catch {
    return [];
  }
}

export async function deleteMediaBlob(idbUrl: string): Promise<void> {
  if (!isIndexedDbMediaUrl(idbUrl)) return;
  const cached = objectUrlCache.get(idbUrl);
  if (cached) {
    try {
      URL.revokeObjectURL(cached);
    } catch {
      /* ignore */
    }
    objectUrlCache.delete(idbUrl);
  }
  try {
    const db = await openBlobDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(idbUrl);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

export function resolveVideoPoster(thumbSrc?: string): string | undefined {
  if (!thumbSrc || isIndexedDbMediaUrl(thumbSrc) || thumbSrc.startsWith("blob:")) return undefined;
  if (/\.(mp4|webm|mov)(\?|#|$)|^data:video\//i.test(thumbSrc)) return undefined;
  const resolved = resolveInventoryImage(thumbSrc) || thumbSrc;
  if (!resolved || resolved.startsWith("src/")) return undefined;
  return resolved;
}

export function resolveImmediateMediaSrc(src?: string): string {
  if (!src) return "";
  if (isIndexedDbMediaUrl(src)) {
    return objectUrlCache.get(src) || "";
  }
  return resolveInventoryImage(src) || src;
}

export function useResolvedMediaSrc(src?: string): string {
  const [resolved, setResolved] = useState<string>(() => resolveImmediateMediaSrc(src));

  useEffect(() => {
    if (!src) {
      setResolved("");
      return;
    }
    if (!isIndexedDbMediaUrl(src)) {
      setResolved(resolveInventoryImage(src) || src);
      return;
    }

    const immediate = objectUrlCache.get(src);
    if (immediate) {
      setResolved(immediate);
      return;
    }

    let cancelled = false;
    setResolved("");
    getMediaObjectUrl(src).then((url) => {
      if (!cancelled && url) {
        setResolved(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
}
