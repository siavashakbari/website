// Public portfolio data only. Invoices and banking details must never enter this store.
export const PUBLIC_CONTENT_KEYS = [
  "siavash_vault_pages_v2",
  "siavash_vault_media_v2",
  "siavash_vault_deleted_pages_v1",
  "siavash_vault_deleted_media_v1",
  "siavash_studio_custom_projects",
  "siavash_studio_deleted_projects",
  "siavash_custom_photo_assets_v2",
  "siavash_portfolio_inventory_v3",
  "siavash_custom_taxonomy_v2",
  "siavash_studio_custom_blogs",
] as const;
export type ContentSnapshot = Record<string, string>;

export function validateSnapshot(value: unknown): asserts value is ContentSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid content snapshot.");
  for (const [key, raw] of Object.entries(value)) {
    if (!(PUBLIC_CONTENT_KEYS as readonly string[]).includes(key) || typeof raw !== "string") {
      throw new Error("Unexpected content key.");
    }
    JSON.parse(raw);
    if (/"(?:idb|blob):/i.test(raw))
      throw new Error("Upload browser-only media before publishing.");
  }
}

/** Revision checks prevent stale browsers from silently replacing published edits. */
export async function commitSnapshot(
  snapshot: ContentSnapshot,
  revision: number,
  write: (snapshot: ContentSnapshot, revision: number) => Promise<number>,
): Promise<number> {
  validateSnapshot(snapshot);
  const next = await write(snapshot, revision);
  if (next !== revision + 1) throw new Error("Unexpected server revision; reload before editing.");
  return next;
}
