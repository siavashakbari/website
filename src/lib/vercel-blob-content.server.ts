import { BlobNotFoundError, BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { validateSnapshot, type ContentSnapshot } from "./published-store-core";
import { blobCredentials } from "./blob-credentials.server";

export interface BlobContentSnapshot {
  revision: number;
  content: ContentSnapshot;
}

const PUBLIC_CONTENT_PATH = "vault/published-content.json";

async function readSnapshotWithEtag(): Promise<{ snapshot: BlobContentSnapshot; etag: string } | null> {
  let result;
  try {
    result = await get(PUBLIC_CONTENT_PATH, {
      access: "private",
      useCache: false,
      ...blobCredentials(),
    });
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unexpected conditional Blob response.");
  const snapshot = await new Response(result.stream).json() as BlobContentSnapshot;
  if (!Number.isInteger(snapshot?.revision) || snapshot.revision < 0) {
    throw new Error("Invalid published Blob revision.");
  }
  validateSnapshot(snapshot.content);
  return { snapshot, etag: result.blob.etag };
}

export async function readVercelPublishedContent(): Promise<BlobContentSnapshot> {
  const result = await readSnapshotWithEtag();
  if (!result) throw new Error("Published Vault content has not been migrated to Vercel Blob.");
  return result.snapshot;
}

export async function saveVercelPublishedContent(
  nextContent: ContentSnapshot,
  expectedRevision: number,
): Promise<number> {
  validateSnapshot(nextContent);
  const current = await readSnapshotWithEtag();
  if (!current || current.snapshot.revision !== expectedRevision) {
    throw new Error("Newer changes exist on the server. Reload before saving.");
  }
  const nextRevision = expectedRevision + 1;
  try {
    await put(PUBLIC_CONTENT_PATH, JSON.stringify({ revision: nextRevision, content: nextContent }), {
      access: "private",
      ...blobCredentials(),
      contentType: "application/json",
      allowOverwrite: true,
      ifMatch: current.etag,
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) {
      throw new Error("Newer changes exist on the server. Reload before saving.");
    }
    throw error;
  }
  return nextRevision;
}

/** Used only during a verified one-time migration into an empty private store. */
export async function initializeVercelPublishedContent(snapshot: BlobContentSnapshot): Promise<void> {
  validateSnapshot(snapshot.content);
  const current = await readSnapshotWithEtag();
  if (current) throw new Error("The Vercel content store already contains published data.");
  await put(PUBLIC_CONTENT_PATH, JSON.stringify(snapshot), {
    access: "private",
    ...blobCredentials(),
    contentType: "application/json",
    allowOverwrite: false,
  });
}
