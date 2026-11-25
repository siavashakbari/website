import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getMergedBlogPosts } from "@/lib/studio-store";
import {
  buildMediaLiveDetailUrl,
  getVaultMedia,
  getVaultPages,
  isRouteOrAncestorHidden,
} from "@/lib/vault-store";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { getSiteUrl } from "@/lib/seo";
import { isContentReady } from "@/lib/published-store";
import { isNonPublicPath, withLocale } from "@/lib/locale";
import { siteField } from "@/lib/site-content";

interface SitemapEntry {
  path: string;
  hasPersian?: boolean;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  images?: string[];
}

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildEntries(baseUrl: string): SitemapEntry[] {
  const imageUrls = (sources: (string | undefined)[]) => [...new Set(sources.flatMap(source => {
    if (!source) return [];
    const image = resolveInventoryImage(source);
    if (!image || !/^(?:https?:\/\/|\/(?!\/))/i.test(image)) return [];
    const url = URL.parse(image, baseUrl);
    return url ? [url.href] : [];
  }))];
  const vaultPages = getVaultPages();
  const allStaticPages: SitemapEntry[] = [
    {
      path: "/",
      hasPersian: !siteField("landing", "heading", "fa").missing,
      changefreq: "weekly",
      priority: "1.0",
    },
    { path: "/photography", changefreq: "weekly", priority: "0.9" },
    { path: "/graphic-design", changefreq: "weekly", priority: "0.9" },
    { path: "/product-design", changefreq: "weekly", priority: "0.9" },
    { path: "/video", changefreq: "weekly", priority: "0.9" },
    { path: "/blog", changefreq: "weekly", priority: "0.9" },
    {
      path: "/about",
      hasPersian: !siteField("about", "heroTitle", "fa").missing,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      path: "/contact",
      hasPersian: !siteField("contact", "headline", "fa").missing,
      changefreq: "monthly",
      priority: "0.8",
    },
    { path: "/brand-discovery", changefreq: "monthly", priority: "0.8" },
  ];
  const staticPages = allStaticPages.filter(
    (entry) => !isRouteOrAncestorHidden(entry.path, vaultPages),
  );

  const seenPaths = new Set(staticPages.map((p) => p.path));

  const vaultRouteEntries: SitemapEntry[] = [];
  for (const vp of vaultPages) {
    if (!vp.route || isNonPublicPath(vp.route) || isRouteOrAncestorHidden(vp.route, vaultPages) || seenPaths.has(vp.route))
      continue;
    seenPaths.add(vp.route);
    const depth = vp.route.split("/").filter(Boolean).length;
    vaultRouteEntries.push({
      path: vp.route,
      lastmod: vp.updatedAt,
      images: imageUrls([vp.coverPhoto]),
      hasPersian: Boolean(vp.nameFa?.trim() || vp.descriptionFa?.trim()),
      changefreq: depth <= 2 ? "weekly" : "monthly",
      priority: depth <= 2 ? "0.85" : "0.8",
    });
  }

  const blogPages: SitemapEntry[] = getMergedBlogPosts()
    .filter((bp) => bp.published !== false)
    .map((bp) => ({
      path: `/blog/${bp.slug}`,
      hasPersian: Boolean(bp.titleFa?.trim()),
      changefreq: "weekly" as const,
      priority: "0.8",
      lastmod: bp.updatedAt || bp.publishedAt,
      images: imageUrls([bp.coverImage, ...(bp.blocks ?? []).flatMap(block =>
        block.kind === "image" || block.kind === "gif" ? [block.url] : [],
      )]),
    }));

  const assetPages: SitemapEntry[] = [];
  for (const item of getVaultMedia()) {
    if (
      item.isHidden ||
      item.isVideo ||
      item.field === "video" ||
      isRouteOrAncestorHidden(item.assignedRoute, vaultPages)
    )
      continue;
    const livePath = buildMediaLiveDetailUrl(item);
    if (!livePath || seenPaths.has(livePath)) continue;
    seenPaths.add(livePath);

    assetPages.push({
      path: livePath,
      hasPersian: Boolean(item.titleFa?.trim() || item.captionFa?.trim()),
      changefreq: "monthly",
      priority: "0.75",
      lastmod: item.updatedAt,
      images: imageUrls([item.imgSrc]),
    });
  }

  return [...staticPages, ...vaultRouteEntries, ...blogPages, ...assetPages];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isContentReady())
          return new Response("Published content unavailable", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        const baseUrl = getSiteUrl(request);
        const entries = buildEntries(baseUrl);

        const urls = entries.flatMap((e) =>
          (e.hasPersian === false ? (["en"] as const) : (["en", "fa"] as const)).map((locale) =>
            [
              `  <url>`,
              `    <loc>${escapeXml(`${baseUrl}${withLocale(e.path, locale)}`)}</loc>`,
              `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${baseUrl}${withLocale(e.path, "en")}`)}"/>`,
              e.hasPersian === false
                ? null
                : `    <xhtml:link rel="alternate" hreflang="fa" href="${escapeXml(`${baseUrl}${withLocale(e.path, "fa")}`)}"/>`,
              `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}${withLocale(e.path, "en")}`)}"/>`,
              e.lastmod ? `    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : null,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              ...(e.images ?? []).map(image => `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`),
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=60",
          },
        });
      },
    },
  },
});
