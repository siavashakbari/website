import { requireVaultToken } from "./supabase-client";
import type { PrivateVaultData, PrivateVaultSnapshot } from "./vercel-private-content.server";

export async function loadPrivateVaultContent(): Promise<PrivateVaultSnapshot | null> {
  const response = await fetch("/api/private-content", {
    headers: { authorization: `Bearer ${await requireVaultToken()}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Private Vault load failed (${response.status}).`);
  return response.json();
}

export async function savePrivateVaultContent(data: PrivateVaultData, expectedRevision: number): Promise<number> {
  const response = await fetch("/api/private-content", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${await requireVaultToken()}`,
    },
    body: JSON.stringify({ data, expectedRevision }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Private Vault save failed (${response.status}).`);
  return result.revision;
}
