import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { DISCIPLINES } from "@/data/disciplines";
import { projects } from "@/data/projects";
import { BLOG_POSTS } from "@/data/blog-posts";
import { PHOTO_INVENTORY, computeItemSeoSlug } from "@/data/photo-inventory";
import { getSiteUrl } from "@/lib/seo";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  image?: {
    loc: string;
    title: string;
    caption: string;
  };
}

function buildEntries(baseUrl: string): SitemapEntry[] {
  const staticPages: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/blog", changefreq: "weekly", priority: "0.9" },
    { path: "/photography", changefreq: "weekly", priority: "0.9" },
    { path: "/graphic-design", changefreq: "weekly", priority: "0.9" },
    { path: "/product-design", changefreq: "weekly", priority: "0.9" },
    { path: "/about", changefreq: "monthly", priority: "0.8" },
    { path: "/contact", changefreq: "monthly", priority: "0.8" },
    { path: "/brand-discovery", changefreq: "monthly", priority: "0.8" },
  ];

  const disciplinePages: SitemapEntry[] = DISCIPLINES.map((d) => ({
    path: `/${d.slug}`,
    changefreq: "weekly" as const,
    priority: "0.85",
  }));

  const projectPages: SitemapEntry[] = projects.map((p) => ({
    path: `/projects/${p.id}`,
    changefreq: "monthly" as const,
    priority: "0.7",
    lastmod: p.year ? `${p.year}-01-01` : undefined,
  }));

  const blogPages: SitemapEntry[] = BLOG_POSTS.map((bp) => ({
    path: `/blog/${bp.slug}`,
    changefreq: "weekly" as const,
    priority: "0.8",
    lastmod: bp.publishedAt,
  }));

  const assetPages: SitemapEntry[] = PHOTO_INVENTORY.map((item) => {
    const seoSlug = computeItemSeoSlug(item);
    const rawSrc = item.imgSrc.replace(/^src\//, "/");
    const imageLoc = `${baseUrl}${rawSrc.startsWith("/") ? rawSrc : `/${rawSrc}`}`;

    return {
      path: `/${item.disciplineSlug}/${seoSlug}`,
      changefreq: "monthly" as const,
      priority: "0.75",
      lastmod: item.date ? `${item.date}-01-01` : undefined,
      image: {
        loc: imageLoc,
        title: `${item.project} — ${item.code}`,
        caption: `${item.project} ${item.subdiscipline || item.discipline} by Siavash Akbari`,
      },
    };
  });

  return [...staticPages, ...disciplinePages, ...projectPages, ...blogPages, ...assetPages];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const baseUrl = getSiteUrl(request);
        const entries = buildEntries(baseUrl);

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${baseUrl}${e.path === "/" ? "/" : e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            e.image
              ? `    <image:image>\n      <image:loc>${e.image.loc}</image:loc>\n      <image:title>${e.image.title.replace(/&/g, "&amp;")}</image:title>\n      <image:caption>${e.image.caption.replace(/&/g, "&amp;")}</image:caption>\n    </image:image>`
              : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
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
