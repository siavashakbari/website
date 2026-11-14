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
import { withLocale } from "@/lib/locale";
import { siteField } from "@/lib/site-content";

interface SitemapEntry {
  path: string;
  hasPersian?: boolean;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  image?: {
    loc: string;
    title: string;
    caption: string;
  };
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
    if (isRouteOrAncestorHidden(vp.route, vaultPages) || !vp.route || seenPaths.has(vp.route))
      continue;
    seenPaths.add(vp.route);
    const depth = vp.route.split("/").filter(Boolean).length;
    vaultRouteEntries.push({
      path: vp.route,
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
      lastmod: bp.publishedAt,
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

    const resolvedImg = resolveInventoryImage(item.imgSrc);
    const imageLoc =
      resolvedImg && !resolvedImg.startsWith("data:") && !resolvedImg.startsWith("src/")
        ? resolvedImg.startsWith("http")
          ? resolvedImg
          : `${baseUrl}${resolvedImg.startsWith("/") ? resolvedImg : `/${resolvedImg}`}`
        : undefined;

    assetPages.push({
      path: livePath,
      hasPersian: Boolean(item.titleFa?.trim() || item.captionFa?.trim()),
      changefreq: "monthly",
      priority: "0.75",
      lastmod: item.year ? `${item.year}-01-01` : undefined,
      image: imageLoc
        ? {
            loc: imageLoc,
            title: `${item.project || item.category || item.field} — ${item.dynamicCode}`,
            caption: `${item.title || item.dynamicCode} by Siavash Akbari`,
          }
        : undefined,
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
              e.image
                ? `    <image:image>\n      <image:loc>${escapeXml(e.image.loc)}</image:loc>\n      <image:title>${escapeXml(e.image.title)}</image:title>\n      <image:caption>${escapeXml(e.image.caption)}</image:caption>\n    </image:image>`
                : null,
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
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
