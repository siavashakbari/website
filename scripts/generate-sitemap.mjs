import fs from "node:fs";
import path from "node:path";

const projectsFile = fs.readFileSync(path.join(process.cwd(), "src/data/projects.ts"), "utf8");
const disciplinesFile = fs.readFileSync(path.join(process.cwd(), "src/data/disciplines.ts"), "utf8");
const blogPostsFile = fs.readFileSync(path.join(process.cwd(), "src/data/blog-posts.ts"), "utf8");
const inventoryFile = fs.readFileSync(path.join(process.cwd(), "src/data/photo-inventory.ts"), "utf8");

// Extract project IDs and years
const projectMatches = [];
const projectRegex = /id:\s*["']([^"']+)["'][\s\S]*?year:\s*["']([^"']+)["']/g;
let match;
while ((match = projectRegex.exec(projectsFile)) !== null) {
  projectMatches.push({ id: match[1], year: match[2] });
}

// Extract discipline paths
const disciplinePaths = [];
const discRegex = /path:\s*["']([^"']+)["']/g;
while ((match = discRegex.exec(disciplinesFile)) !== null) {
  disciplinePaths.push(match[1]);
}

// Extract blog post slugs & publish dates
const blogMatches = [];
const blogRegex = /slug:\s*["']([^"']+)["'][\s\S]*?publishedAt:\s*["']([^"']+)["']/g;
while ((match = blogRegex.exec(blogPostsFile)) !== null) {
  blogMatches.push({ slug: match[1], publishedAt: match[2] });
}

function slugifyValue(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Parse photo inventory items
const photoMatch = inventoryFile.match(/export const PHOTO_INVENTORY: PhotoInventoryItem\[\] = (\[[\s\S]*?\]);\s*const codeMap/);
let inventoryItems = [];
if (photoMatch) {
  try {
    inventoryItems = JSON.parse(photoMatch[1]);
  } catch (e) {
    console.error("Failed to parse inventory items:", e);
  }
}

const baseUrl = "https://www.siavashakbari.ir";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/photography", changefreq: "weekly", priority: "0.9" },
  { path: "/video", changefreq: "weekly", priority: "0.9" },
  { path: "/product-design", changefreq: "weekly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/brand-discovery", changefreq: "monthly", priority: "0.8" },
];

const disciplinePages = disciplinePaths.map((path) => ({
  path,
  changefreq: "weekly",
  priority: "0.85",
}));

const projectPages = projectMatches.map((p) => ({
  path: `/projects/${p.id}`,
  changefreq: "monthly",
  priority: "0.7",
  lastmod: p.year ? `${p.year}-01-01` : undefined,
}));

const blogPages = blogMatches.map((b) => ({
  path: `/blog/${b.slug}`,
  changefreq: "weekly",
  priority: "0.8",
  lastmod: b.publishedAt,
}));

// Build asset pages with image:image extensions
const assetPages = inventoryItems.map((item) => {
  const seqMatch = item.code.match(/(\d+)$/);
  const seq = seqMatch ? seqMatch[1] : "01";
  const projSlug = slugifyValue(item.project || "work");
  const subSlug = slugifyValue(item.subdiscipline || "showcase");
  const seoSlug = projSlug.includes(subSlug)
    ? `${projSlug}-${seq}`
    : `${projSlug}-${subSlug}-${seq}`;

  const imageSrc = item.imgSrc.replace(/^src\//, "/");
  const imageLoc = `${baseUrl}${imageSrc.startsWith("/") ? imageSrc : `/${imageSrc}`}`;

  return {
    path: `/${item.disciplineSlug}/${seoSlug}`,
    changefreq: "monthly",
    priority: "0.75",
    lastmod: item.date ? `${item.date}-01-01` : undefined,
    image: {
      loc: imageLoc,
      title: `${item.project} — ${item.code}`,
      caption: `${item.project} ${item.subdiscipline || item.discipline} by Siavash Akbari`,
    },
  };
});

const allEntries = [...staticPages, ...disciplinePages, ...blogPages, ...assetPages];

const urls = allEntries.map((e) => {
  const loc = `${baseUrl}${e.path === "/" ? "/" : e.path}`;
  const parts = [
    `  <url>`,
    `    <loc>${loc}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    e.image
      ? `    <image:image>\n      <image:loc>${e.image.loc}</image:loc>\n      <image:title>${e.image.title.replace(/&/g, "&amp;")}</image:title>\n      <image:caption>${e.image.caption.replace(/&/g, "&amp;")}</image:caption>\n    </image:image>`
      : null,
    `  </url>`,
  ].filter(Boolean);
  return parts.join("\n");
});

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
  ...urls,
  `</urlset>`,
  "",
].join("\n");

const outPath = path.join(process.cwd(), "public/sitemap.xml");
fs.writeFileSync(outPath, xml, "utf8");

console.log(`Generated ${outPath} with ${allEntries.length} URLs (including ${assetPages.length} image assets).`);
