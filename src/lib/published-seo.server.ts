import { isNonPublicPath, withLocale } from "./locale";
import type { ContentSnapshot } from "./published-store-core";
import { getSiteUrl } from "./seo";
import { buildMediaLiveDetailUrl, type VaultMediaItem } from "./vault-store";

const INDEXNOW_KEY = "8fb158bfbd9f4d2baf66a73f870381ab";
type RecordData = Record<string, unknown> & { updatedAt?: string };

const collections = [
  {
    key: "siavash_studio_custom_blogs",
    id: "slug",
    paths: (post: RecordData) => post.published === false || !post.slug ? [] : ["/blog", `/blog/${post.slug}`],
  },
  {
    key: "siavash_vault_pages_v2",
    id: "id",
    paths: (page: RecordData) => typeof page.route === "string" ? [page.route] : [],
  },
  {
    key: "siavash_vault_media_v2",
    id: "id",
    paths: (record: RecordData) => {
      const item = record as unknown as VaultMediaItem;
      return typeof item.assignedRoute === "string"
        ? [item.assignedRoute, buildMediaLiveDetailUrl(item)]
        : [];
    },
  },
] as const;

function records(raw?: string): RecordData[] {
  const value = raw ? JSON.parse(raw) : [];
  return Array.isArray(value) ? value : [];
}

export function preparePublishedSeo(previous: ContentSnapshot, next: ContentSnapshot, now: string) {
  const content = { ...next };
  const paths = new Set<string>();
  for (const collection of collections) {
    const { key, id } = collection;
    if (previous[key] === next[key]) continue;
    const before = new Map(records(previous[key]).map(record => [record[id], record]));
    const revised = records(next[key]).map(record => {
      const old = before.get(record[id]);
      before.delete(record[id]);
      const { updatedAt: _submitted, ...fields } = record;
      if (old) {
        const { updatedAt, ...oldFields } = old;
        if (JSON.stringify(fields) === JSON.stringify(oldFields)) return { ...fields, updatedAt };
        collection.paths(old).forEach(path => paths.add(path));
      }
      collection.paths(record).forEach(path => paths.add(path));
      return { ...fields, updatedAt: now };
    });
    for (const removed of before.values()) collection.paths(removed).forEach(path => paths.add(path));
    if (next[key] !== undefined) content[key] = JSON.stringify(revised);
  }

  const prior = JSON.parse(previous.siavash_site_content_v1 ?? "{}");
  const updated = JSON.parse(next.siavash_site_content_v1 ?? "{}");
  for (const [section, path] of [["landing", "/"], ["about", "/about"], ["contact", "/contact"]]) {
    if (JSON.stringify(prior[section]) !== JSON.stringify(updated[section])) paths.add(path);
  }
  return { content, paths: [...paths].filter(path => /^\/(?!\/)[^?#\\]*$/.test(path) && !isNonPublicPath(path)) };
}

export async function notifyIndexNow(paths: string[]) {
  if (!paths.length || process.env.VERCEL_ENV !== "production") return;
  try {
    const origin = new URL(getSiteUrl()).origin;
    const urlList = paths.flatMap(path => (["en", "fa"] as const).map(locale =>
      new URL(withLocale(path, locale), origin).href,
    ));
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ host: new URL(origin).host, key: INDEXNOW_KEY, keyLocation: `${origin}/${INDEXNOW_KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) console.warn("IndexNow submission returned", response.status);
  } catch (error) {
    console.warn("IndexNow notification failed after content was saved:", error);
  }
}
