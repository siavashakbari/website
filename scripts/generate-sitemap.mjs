import fs from "node:fs";
import path from "node:path";

const projectsFile = fs.readFileSync(path.join(process.cwd(), "src/data/projects.ts"), "utf8");
const disciplinesFile = fs.readFileSync(path.join(process.cwd(), "src/data/disciplines.ts"), "utf8");

// Extract project IDs and years
const projectMatches = [];
const projectRegex = /id:\s*["']([^"']+)["'][\s\S]*?year:\s*["']([^"']+)["']/g;
let match;
while ((match = projectRegex.exec(projectsFile)) !== null) {
  projectMatches.push({ id: match[1], year: match[2] });
}

// Extract discipline slugs
const disciplineSlugs = [];
const discRegex = /slug:\s*["']([^"']+)["']/g;
while ((match = discRegex.exec(disciplinesFile)) !== null) {
  disciplineSlugs.push(match[1]);
}

const baseUrl = "https://www.siavashakbari.ir";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/photography", changefreq: "weekly", priority: "0.9" },
  { path: "/graphic-design", changefreq: "weekly", priority: "0.9" },
  { path: "/product-design", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
];

const disciplinePages = disciplineSlugs.map((slug) => ({
  path: `/${slug}`,
  changefreq: "weekly",
  priority: "0.85",
}));

const projectPages = projectMatches.map((p) => ({
  path: `/projects/${p.id}`,
  changefreq: "monthly",
  priority: "0.7",
  lastmod: p.year ? `${p.year}-01-01` : undefined,
}));

const allEntries = [...staticPages, ...disciplinePages, ...projectPages];

const urls = allEntries.map((e) => {
  const loc = `${baseUrl}${e.path === "/" ? "/" : e.path}`;
  const parts = [
    `  <url>`,
    `    <loc>${loc}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    `  </url>`,
  ].filter(Boolean);
  return parts.join("\n");
});

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...urls,
  `</urlset>`,
  "",
].join("\n");

const outPath = path.join(process.cwd(), "public/sitemap.xml");
fs.writeFileSync(outPath, xml, "utf8");

console.log(`Generated ${outPath} with ${allEntries.length} URLs.`);
