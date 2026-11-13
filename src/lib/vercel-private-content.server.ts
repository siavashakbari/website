import { BlobNotFoundError, BlobPreconditionFailedError, get, head, put } from "@vercel/blob";
import type { BankInfo, InvoiceData } from "@/types/invoice";
import { blobCredentials } from "./blob-credentials.server";

export interface PrivateVaultData {
  invoices: InvoiceData[];
  savedCards: BankInfo[];
  defaultPreset: InvoiceData | null;
}

export interface PrivateVaultSnapshot {
  revision: number;
  data: PrivateVaultData;
}

const PATH = "vault/private-content.json";

function validatePrivateData(value: unknown): asserts value is PrivateVaultData {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid private Vault data.");
  const data = value as Partial<PrivateVaultData>;
  if (!Array.isArray(data.invoices) || !Array.isArray(data.savedCards) ||
      (data.defaultPreset !== null && (typeof data.defaultPreset !== "object" || Array.isArray(data.defaultPreset)))) {
    throw new Error("Invalid private Vault collections.");
  }
}

async function readWithEtag(): Promise<{ snapshot: PrivateVaultSnapshot; etag: string } | null> {
  let result;
  try {
    result = await get(PATH, { access: "private", useCache: false, ...blobCredentials() });
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unexpected conditional Blob response.");
  const snapshot = await new Response(result.stream).json() as PrivateVaultSnapshot;
  if (!Number.isInteger(snapshot?.revision) || snapshot.revision < 0) throw new Error("Invalid private Vault revision.");
  validatePrivateData(snapshot.data);
  return { snapshot, etag: result.blob.etag };
}

export async function readVercelPrivateContent(): Promise<PrivateVaultSnapshot | null> {
  return (await readWithEtag())?.snapshot || null;
}

export async function saveVercelPrivateContent(data: PrivateVaultData, expectedRevision: number): Promise<number> {
  validatePrivateData(data);
  const current = await readWithEtag();
  if (current ? current.snapshot.revision !== expectedRevision : expectedRevision !== -1) {
    throw new Error("Newer private Vault changes exist. Reload before saving.");
  }
  const metadata = current ? await head(PATH, { ...blobCredentials() }) : null;
  if (current && metadata?.etag !== current.etag.replace(/^W\//, "")) {
    throw new Error("Newer private Vault changes exist. Reload before saving.");
  }
  const revision = expectedRevision + 1;
  try {
    await put(PATH, JSON.stringify({ revision, data }), {
      access: "private",
      ...blobCredentials(),
      contentType: "application/json",
      allowOverwrite: Boolean(current),
      ifMatch: metadata?.etag,
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) {
      throw new Error("Newer private Vault changes exist. Reload before saving.");
    }
    throw error;
  }
  return revision;
}
