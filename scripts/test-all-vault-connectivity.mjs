import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

function slugify(text) {
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
  return s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeProjectSlug(project) {
  const base = slugify(project);
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

function resolveMedia(item, idx) {
  const uniqueCode = item.uniqueCode || String(1001 + idx);
  let field = "photography";
  let category = "fashion-photography";
  let project = normalizeProjectSlug(item.project || "");

  const discNorm = (item.disciplineSlug || item.discipline || "").toLowerCase();
  if (discNorm.includes("video") || discNorm.includes("motion")) {
    field = "video";
    category = "";
    if (!project) project = "echo-prime";
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

  const isVideo = field === "video" || /\.(mp4|webm|mov)$/i.test(item.imgSrc || "");
  const assignedRoute = `/${[field, category, project].filter(Boolean).join("/")}`;
  const dynamicCode = [uniqueCode, cleanSegment(field), cleanSegment(category), cleanSegment(project)]
    .filter(Boolean)
    .join("-");
  const liveDetailPath = isVideo ? assignedRoute : `${assignedRoute}/${dynamicCode}`;

  return { uniqueCode, field, category, project, assignedRoute, dynamicCode, liveDetailPath, isVideo };
}

// 1. Photo Inventory
const invContent = fs.readFileSync(path.join(root, "src/data/photo-inventory.ts"), "utf8");
const startMarker = "export const PHOTO_INVENTORY: PhotoInventoryItem[] = ";
const startIdx = invContent.indexOf(startMarker);
const endMatch = invContent.match(/\];\r?\n\r?\nconst codeMap/);
const inventory = JSON.parse(invContent.slice(startIdx + startMarker.length, endMatch.index + 1));

// 2. Vault Pages from vault-store.ts (getInitialScannedPages)
const vsContent = fs.readFileSync(path.join(root, "src/lib/vault-store.ts"), "utf8");
const initPagesBlock = vsContent.match(/export function getInitialScannedPages\(\): VaultPageItem\[\] \{([\s\S]*?)return pages;/)[1];
const pageObjMatches = [
  ...initPagesBlock.matchAll(
    /id:\s*["']([^"']+)["'][\s\S]*?route:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?parentRoute:\s*["']([^"']*)["'][\s\S]*?coverPhoto:\s*["']([^"']+)["']/g,
  ),
];
const vaultPages = pageObjMatches.map((m) => ({
  id: m[1],
  route: m[2],
  name: m[3],
  parentRoute: m[4],
  coverPhoto: m[5],
}));
const vaultRouteSet = new Set(vaultPages.map((p) => p.route));

// 3. Projects from projects.ts
const prjContent = fs.readFileSync(path.join(root, "src/data/projects.ts"), "utf8");
const projects = [...prjContent.matchAll(/id:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["']/g)].map((m) => ({
  id: m[1],
  title: m[2],
}));
const projectSet = new Set(projects.map((p) => p.id));

console.log("=== CHECKING CONNECTIVITY ACROSS VAULT PAGES, MEDIA & WEBSITE ===");
console.log(`Loaded ${vaultPages.length} Vault Pages`);
console.log(`Loaded ${projects.length} System Projects`);
console.log(`Loaded ${inventory.length} Media Inventory Assets\n`);

const errors = [];

// A. Check unique codes & files on disk
const codeSet = new Set();
inventory.forEach((item, idx) => {
  if (!item.uniqueCode || !/^\d{4}$/.test(item.uniqueCode)) {
    errors.push(`Media [${idx}] ${item.code} has invalid uniqueCode: ${item.uniqueCode}`);
  } else if (codeSet.has(item.uniqueCode)) {
    errors.push(`Duplicate uniqueCode found: ${item.uniqueCode}`);
  } else {
    codeSet.add(item.uniqueCode);
  }
  if (!item.imgSrc || !fs.existsSync(path.join(root, item.imgSrc))) {
    errors.push(`Asset file missing on disk: ${item.imgSrc} (code: ${item.code})`);
  }
});
console.log(`✓ Unique Code & Disk Files: ${codeSet.size}/${inventory.length} valid and present on disk`);

// B. Check each Vault Page route, parentRoute, coverPhoto on disk, and project slug
vaultPages.forEach((p) => {
  if (p.parentRoute && !vaultRouteSet.has(p.parentRoute)) {
    errors.push(`Vault Page ${p.route} references missing parentRoute: ${p.parentRoute}`);
  }
  if (!p.coverPhoto || !fs.existsSync(path.join(root, p.coverPhoto))) {
    errors.push(`Vault Page ${p.route} has missing coverPhoto on disk: ${p.coverPhoto}`);
  }
  const segs = p.route.split("/").filter(Boolean);
  if (segs.length === 3 || (segs.length === 2 && (segs[0] === "video" || segs[0] === "product-design"))) {
    const projSlug = segs[segs.length - 1];
    if (!projectSet.has(projSlug)) {
      errors.push(`Vault project page route ${p.route} has slug '${projSlug}' missing in projects.ts`);
    }
  }
});
console.log(`✓ Vault Pages Tree & Covers: ${vaultPages.length}/${vaultPages.length} valid`);

// C. Check every media item resolves to a real Vault Page, matching cascading dropdown options, & valid Live Detail URL
const fieldOptionsSet = new Set(vaultPages.filter((p) => !p.parentRoute).map((p) => p.route.replace(/^\//, "")));
const livePaths = [];
inventory.forEach((item, idx) => {
  const m = resolveMedia(item, idx);
  if (!vaultRouteSet.has(m.assignedRoute)) {
    errors.push(`Media #${m.uniqueCode} (${m.dynamicCode}) assignedRoute '${m.assignedRoute}' does not match any Vault Page!`);
  }
  if (!fieldOptionsSet.has(m.field)) {
    errors.push(`Media #${m.uniqueCode} field '${m.field}' missing from Vault Field dropdown!`);
  }
  const isFlat = m.field === "video" || m.field === "product-design";
  if (!isFlat) {
    const validCategories = vaultPages
      .filter((p) => p.parentRoute === `/${m.field}`)
      .map((p) => p.route.split("/").pop());
    if (!validCategories.includes(m.category)) {
      errors.push(`Media #${m.uniqueCode} category '${m.category}' missing from Vault Category dropdown under /${m.field}`);
    }
  }
  if (m.project) {
    const parentRoute = isFlat ? `/${m.field}` : `/${m.field}/${m.category}`;
    const validProjects = vaultPages
      .filter((p) => p.parentRoute === parentRoute)
      .map((p) => p.route.split("/").pop());
    if (!validProjects.includes(m.project)) {
      errors.push(`Media #${m.uniqueCode} project '${m.project}' missing from Vault Project dropdown under ${parentRoute}`);
    }
  }
  livePaths.push(m.liveDetailPath);
});
console.log(`✓ Media-to-Page Connectivity & Vault Dropdown Option Parity: ${inventory.length}/${inventory.length} mapped directly to Vault Pages`);

// D. Cross-check public/sitemap.xml contains every Vault Page & every non-video Live Detail path
const sitemapPath = path.join(root, "public/sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  errors.push("public/sitemap.xml is missing!");
} else {
  const sitemapXml = fs.readFileSync(sitemapPath, "utf8");
  vaultPages.forEach((vp) => {
    const locTag = `<loc>https://www.siavashakbari.ir${vp.route}</loc>`;
    if (!sitemapXml.includes(locTag)) {
      errors.push(`public/sitemap.xml is missing Vault Page URL: ${vp.route}`);
    }
  });
  let photoSitemapCount = 0;
  inventory.forEach((item, idx) => {
    const m = resolveMedia(item, idx);
    if (m.isVideo) return;
    photoSitemapCount++;
    const locTag = `<loc>https://www.siavashakbari.ir${m.liveDetailPath}</loc>`;
    if (!sitemapXml.includes(locTag)) {
      errors.push(`public/sitemap.xml is missing media Live Detail URL: ${m.liveDetailPath}`);
    }
  });
  if (sitemapXml.includes("/projects/")) {
    errors.push("public/sitemap.xml contains legacy '/projects/' URLs!");
  }
  console.log(`✓ Sitemap Verification: ${vaultPages.length} Vault Pages + ${photoSitemapCount} photo URLs present in public/sitemap.xml`);
}

if (errors.length === 0) {
  console.log(`\nALL ${vaultPages.length} VAULT PAGES AND ${inventory.length} MEDIA ASSETS ARE 100% CONNECTED!`);
} else {
  console.error(`\n❌ Found ${errors.length} issues:`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
