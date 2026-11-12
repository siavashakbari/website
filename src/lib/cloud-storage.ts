/**
 * Supabase Storage upload for Vault media.
 *
 * When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are configured, compressed
 * uploads go to the public `vault-media` bucket and only the public URL is kept
 * in Vault. Failed uploads are surfaced; they never silently fall back to this device.
 */

import { requireVaultToken } from "./supabase-client";
import { uploadPresigned } from "@vercel/blob/client";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, "") || "";
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "";
const BUCKET = "vault-media";

export function isCloudStorageConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabaseConfig(): { url: string; key: string; bucket: string } | null {
  if (!isCloudStorageConfigured()) return null;
  return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, bucket: BUCKET };
}

function sanitizeFileName(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || "upload"
  );
}

export interface CloudUploadResult {
  url: string;
  path: string;
  sizeBytes: number;
}

export async function publishInlineMedia(src: string, name: string): Promise<string> {
  if (!src.startsWith("data:")) return src;
  const blob = await (await fetch(src)).blob();
  return (await uploadToCloudStorage(blob, name)).url;
}

/**
 * Uploads a Blob/File to the public vault-media bucket and returns its public URL.
 */
export async function uploadToCloudStorage(
  blob: Blob,
  fileName: string,
  options: { contentType?: string; onProgress?: (percent: number) => void } = {},
): Promise<CloudUploadResult> {
  const contentType = options.contentType || blob.type || "application/octet-stream";
  if (import.meta.env.VITE_VAULT_BACKEND !== "supabase" && contentType.startsWith("image/")) {
    const clean = sanitizeFileName(fileName);
    const pathname = `images/${crypto.randomUUID()}-${clean}`;
    const uploaded = await uploadPresigned(pathname, blob, {
      access: "private",
      contentType,
      handleUploadUrl: "/api/blob-upload",
      headers: { authorization: `Bearer ${await requireVaultToken()}` },
      onUploadProgress: ({ percentage }) => options.onProgress?.(Math.round(percentage)),
    });
    options.onProgress?.(100);
    return {
      url: `/api/blob-media?pathname=${encodeURIComponent(uploaded.pathname)}`,
      path: uploaded.pathname,
      sizeBytes: blob.size,
    };
  }
  const cfg = getSupabaseConfig();
  if (!cfg) {
    throw new Error("Cloud storage is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }

  const clean = sanitizeFileName(fileName);
  const token = await requireVaultToken();
  const objectPath = `${crypto.randomUUID()}-${clean}`;
  const endpoint = `${cfg.url}/storage/v1/object/${cfg.bucket}/${encodeURIComponent(objectPath)}`;

  options.onProgress?.(5);

  // Use XHR so we get upload progress on large files.
  const xhr = new XMLHttpRequest();
  const result = await new Promise<CloudUploadResult>((resolve, reject) => {
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("apikey", cfg.key);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        options.onProgress?.(Math.round((ev.loaded / ev.total) * 90) + 5);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${objectPath
          .split("/")
          .map((s) => encodeURIComponent(s))
          .join("/")}`;
        options.onProgress?.(100);
        resolve({ url: publicUrl, path: objectPath, sizeBytes: blob.size });
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading to cloud storage."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.timeout = 15 * 60 * 1000;
    xhr.send(blob);
  });

  return result;
}
