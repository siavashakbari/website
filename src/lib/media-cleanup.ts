import { managedMediaFromUrl } from "./managed-media";
import { requireVaultToken } from "./supabase-client";

const QUEUE_KEY = "siavash_pending_media_cleanup_v1";

function pending(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((source) => typeof source === "string") : [];
  } catch {
    return [];
  }
}

export function queueMediaCleanup(sources: string[]): string[] {
  const managed = [...new Set(sources.filter((source) => managedMediaFromUrl(source)))];
  if (managed.length)
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...new Set([...pending(), ...managed])]));
  return managed;
}

export async function runMediaCleanup(sources: string[]): Promise<void> {
  if (!sources.length) return;
  const response = await fetch("/api/media-cleanup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${await requireVaultToken()}`,
    },
    body: JSON.stringify({ sources }),
  });
  const result = await response.json();
  if (response.status === 409) {
    // Shared files must stay while another published page or media item uses them.
    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(pending().filter((source) => !sources.includes(source))),
    );
    return;
  }
  if (!response.ok) throw new Error(result.error || `Storage cleanup failed (${response.status}).`);
  localStorage.setItem(
    QUEUE_KEY,
    JSON.stringify(pending().filter((source) => !sources.includes(source))),
  );
}

export async function retryPendingMediaCleanup(): Promise<void> {
  for (const source of pending()) await runMediaCleanup([source]);
}
