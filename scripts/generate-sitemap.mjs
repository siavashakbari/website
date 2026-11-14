import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Local preview only. Production /sitemap.xml is generated from the published
// snapshot by the TanStack server route; writing public/sitemap.xml shadows it.

const vaultStoreFile = fs.readFileSync(path.join(process.cwd(), "src/lib/vault-store.ts"), "utf8");
const blogPostsFile = fs.readFileSync(path.join(process.cwd(), "src/data/blog-posts.ts"), "utf8");
const inventoryFile = fs.readFileSync(path.join(process.cwd(), "src/data/photo-inventory.ts"), "utf8");

function slugifyValue(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function cleanSegment(s) {
  if (!s) return "";
  return String(s).trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeProjectSlug(project) {
  const base = slugifyValue(project);
  if (!base) return "";
  if (base === "tasting") return "gastronomie";
  if (
    base === "signature-cafe-restaurant" ||
    base === "signature-cafe" ||
    base === "signature-restaurant" ||
    base === "signature"
  ) {
    return "signature-restaurant";
  }
  if (base === "dodareh" || base === "dobareh-accesories" || base === "dobareh-accessories") return "dobareh";
  if (base === "shekarchian" || base === "shekarchian-honey") return "shekarchian-sweets";
  if (base === "on-swipe") return "onswipe";
  if (base === "polarity-atelier") return "polarity";
  if (base === "nozad-publication" || base === "nozad-publication-visual-identity" || base === "nozad-vi") {
    return "nozad-publication-visual-identity";
  }
  if (base === "goats") return "goats-coffee";
  if (base === "zen-studio" || base === "zen-studio-products") return "zen-studio";
  return base;
}

function buildDynamicCode(uniqueCode, field, category, project) {
  return [uniqueCode, cleanSegment(field), cleanSegment(category), cleanSegment(project)]
    .filter(Boolean)
    .join("-");
}

function resolveMediaRoute(item, idx) {
  const uniqueCode = item.uniqueCode || String(1001 + idx);
  let field = "photography";
  let category = "fashion-photography";
  let project = normalizeProjectSlug(item.project || "");

  const discNorm = (item.disciplineSlug || item.discipline || "").toLowerCase();
  if (discNorm.includes("video") || discNorm.includes("motion")) {
    return { skip: true };
  } else if (discNorm.includes("graphic") || discNorm.includes("identity") || discNorm.includes("book") || discNorm.includes("poster")) {
    field = "graphic-design";
    if (discNorm.includes("book")) {
      category = "book-covers";
      if (!project) project = "nozad-publications";
    } else if (discNorm.includes("poster")) {
      category = "posters";
      if (!project || project === "posters" || project === "nozad-publications") {
        project = "";
      }
    } else {
      category = "visual-identity";
    }
  } else if (discNorm.includes("product-design") || discNorm.includes("product design")) {
    field = "product-design";
    category = "";
  } else {
    field = "photography";
    if (discNorm.includes("food")) category = "food-photography";
    else if (discNorm.includes("portrait")) category = "portrait-photography";
    else if (discNorm.includes("product")) category = "product-photography";
    else category = "fashion-photography";
  }

  const routeParts = [field, category, project].filter(Boolean);
  const assignedRoute = `/${routeParts.join("/")}`;
  const dynamicCode = buildDynamicCode(uniqueCode, field, category, project);

  return {
    skip: false,
    path: `${assignedRoute}/${dynamicCode}`,
    dynamicCode,
    project: project || category || field,
  };
}

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Extract seeded Vault page routes from getInitialScannedPages()
const initPagesBlock = vaultStoreFile.match(/export function getInitialScannedPages\(\): VaultPageItem\[\] \{([\s\S]*?)return pages;/);
const vaultRoutes = [];
if (initPagesBlock) {
  const routeRegex = /route:\s*["'](\/[^"']+)["']/g;
  let m;
  while ((m = routeRegex.exec(initPagesBlock[1])) !== null) {
    vaultRoutes.push(m[1]);
  }
}

// Extract blog post slugs & publish dates
const blogMatches = [];
const blogRegex = /slug:\s*["']([^"']+)["'][\s\S]*?publishedAt:\s*["']([^"']+)["']/g;
let match;
while ((match = blogRegex.exec(blogPostsFile)) !== null) {
  blogMatches.push({ slug: match[1], publishedAt: match[2] });
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
  { path: "/graphic-design", changefreq: "weekly", priority: "0.9" },
  { path: "/product-design", changefreq: "weekly", priority: "0.9" },
  { path: "/video", changefreq: "weekly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/brand-discovery", changefreq: "monthly", priority: "0.8" },
];

const seenPaths = new Set(staticPages.map((p) => p.path));

const vaultPageEntries = [];
for (const r of vaultRoutes) {
  if (seenPaths.has(r)) continue;
  seenPaths.add(r);
  const depth = r.split("/").filter(Boolean).length;
  vaultPageEntries.push({
    path: r,
    changefreq: depth <= 2 ? "weekly" : "monthly",
    priority: depth <= 2 ? "0.85" : "0.8",
  });
}

const blogPages = blogMatches.map((b) => ({
  path: `/blog/${b.slug}`,
  changefreq: "weekly",
  priority: "0.8",
  lastmod: b.publishedAt,
}));

// Build canonical dedicated asset pages (with real /thumbs/<stem>.webp URLs where present)
const assetPages = [];
inventoryItems.forEach((item, idx) => {
  const resolved = resolveMediaRoute(item, idx);
  if (resolved.skip || seenPaths.has(resolved.path)) return;
  seenPaths.add(resolved.path);

  const stem = path.basename(item.imgSrc || "").replace(/\.[^.]+$/, "");
  const thumbDiskPath = stem ? path.join(process.cwd(), "public/thumbs", `${stem}.webp`) : "";
  const imageLoc =
    thumbDiskPath && fs.existsSync(thumbDiskPath)
      ? `${baseUrl}/thumbs/${stem}.webp`
      : undefined;

  assetPages.push({
    path: resolved.path,
    changefreq: "monthly",
    priority: "0.75",
    lastmod: item.date ? `${item.date}-01-01` : undefined,
    image: imageLoc
      ? {
          loc: imageLoc,
          title: `${item.project || resolved.project} — ${resolved.dynamicCode}`,
          caption: `${item.project || "Portfolio"} ${item.subdiscipline || item.discipline} by Siavash Akbari`,
        }
      : undefined,
  });
});

const allEntries = [...staticPages, ...vaultPageEntries, ...blogPages, ...assetPages];

const urls = allEntries.flatMap((e) => ["en", "fa"].map((locale) => {
  const localizedPath = (lang) => `/${lang}${e.path === "/" ? "" : e.path}`;
  const loc = `${baseUrl}${localizedPath(locale)}`;
  const parts = [
    `  <url>`,
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${baseUrl}${localizedPath("en")}`)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="fa" href="${escapeXml(`${baseUrl}${localizedPath("fa")}`)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}${localizedPath("en")}`)}"/>`,
    e.lastmod ? `    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    e.image
      ? `    <image:image>\n      <image:loc>${escapeXml(e.image.loc)}</image:loc>\n      <image:title>${escapeXml(e.image.title)}</image:title>\n      <image:caption>${escapeXml(e.image.caption)}</image:caption>\n    </image:image>`
      : null,
    `  </url>`,
  ].filter(Boolean);
  return parts.join("\n");
}));

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
  ...urls,
  `</urlset>`,
  "",
].join("\n");

const outPath = path.join(os.tmpdir(), "creative-showcase-sitemap-preview.xml");
fs.writeFileSync(outPath, xml, "utf8");

console.log(
  `Generated ${outPath} with ${urls.length} localized URLs (${vaultPageEntries.length} Vault sub-routes, ${blogPages.length} blog posts, ${assetPages.length} dedicated photo assets).`,
);
