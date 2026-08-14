import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { DISCIPLINES } from "@/data/disciplines";
import { projects } from "@/data/projects";
import { getSiteUrl } from "@/lib/seo";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function buildEntries(): SitemapEntry[] {
  const staticPages: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/photography", changefreq: "weekly", priority: "0.9" },
    { path: "/graphic-design", changefreq: "weekly", priority: "0.9" },
    { path: "/about", changefreq: "monthly", priority: "0.8" },
    { path: "/contact", changefreq: "monthly", priority: "0.8" },
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

  return [...staticPages, ...disciplinePages, ...projectPages];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const baseUrl = getSiteUrl(request);
        const entries = buildEntries();

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${baseUrl}${e.path === "/" ? "/" : e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
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
