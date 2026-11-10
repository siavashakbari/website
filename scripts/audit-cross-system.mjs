import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

  const assignedRoute = `/${[field, category, project].filter(Boolean).join("/")}`;
  const dynamicCode = [uniqueCode, cleanSegment(field), cleanSegment(category), cleanSegment(project)]
    .filter(Boolean)
    .join("-");

  return { uniqueCode, field, category, project, assignedRoute, dynamicCode };
}

// 1. Photo Inventory
const invContent = fs.readFileSync(path.join(root, "src/data/photo-inventory.ts"), "utf8");
const startMarker = "export const PHOTO_INVENTORY: PhotoInventoryItem[] = ";
const startIdx = invContent.indexOf(startMarker);
const endMatch = invContent.match(/\];\r?\n\r?\nconst codeMap/);
const invItems = JSON.parse(invContent.slice(startIdx + startMarker.length, endMatch.index + 1));

// 2. projects.ts
const prjContent = fs.readFileSync(path.join(root, "src/data/projects.ts"), "utf8");
const prjList = [...prjContent.matchAll(/id:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["']/g)].map((m) => ({
  id: m[1],
  title: m[2],
}));
const prjIdSet = new Set(prjList.map((p) => p.id));

// 3. vault-store.ts initial pages
const vsContent = fs.readFileSync(path.join(root, "src/lib/vault-store.ts"), "utf8");
const initPagesBlock = vsContent.match(/export function getInitialScannedPages\(\): VaultPageItem\[\] \{([\s\S]*?)return pages;/)[1];
const vsPages = [...initPagesBlock.matchAll(/route:\s*["'](\/[^"']+)["'],\s*name:\s*["']([^"']+)["']/g)].map((m) => ({
  route: m[1],
  name: m[2],
}));
const vaultRouteSet = new Set(vsPages.map((p) => p.route));

const routeMediaCounts = new Map();
const issues = [];

invItems.forEach((p, idx) => {
  const res = resolveMedia(p, idx);
  routeMediaCounts.set(res.assignedRoute, (routeMediaCounts.get(res.assignedRoute) || 0) + 1);
  if (!vaultRouteSet.has(res.assignedRoute)) {
    issues.push(`Inventory item #${res.uniqueCode} maps to '${res.assignedRoute}' which is missing in getInitialScannedPages()`);
  }
});

// Check all projects in projects.ts appear in Vault pages
prjList.forEach((proj) => {
  const foundInVault = vsPages.some((vp) => vp.route.split("/").pop() === proj.id);
  if (!foundInVault) {
    issues.push(`Project '${proj.id}' (${proj.title}) from projects.ts has no matching Vault Page`);
  }
});

// Check all project-level Vault pages (depth 3 or depth 2 under video/product-design) exist in projects.ts
vsPages.forEach((vp) => {
  const segs = vp.route.split("/").filter(Boolean);
  if (segs.length === 3 || (segs.length === 2 && (segs[0] === "video" || segs[0] === "product-design"))) {
    const slug = segs[segs.length - 1];
    if (!prjIdSet.has(slug)) {
      issues.push(`Vault Page '${vp.route}' has project slug '${slug}' missing from projects.ts`);
    }
  }
});

// Check public/sitemap.xml & STUDIO_ARCHITECTURE_AND_ROUTE_MAP.html have zero /projects/ links
for (const docFile of ["public/sitemap.xml", "STUDIO_ARCHITECTURE_AND_ROUTE_MAP.html"]) {
  const full = path.join(root, docFile);
  if (fs.existsSync(full)) {
    const content = fs.readFileSync(full, "utf8");
    if (content.includes("/projects/")) {
      issues.push(`${docFile} still contains legacy '/projects/' reference!`);
    }
  }
}

console.log("=== CROSS-SYSTEM AUDIT ===");
console.log(`Projects in projects.ts:      ${prjList.length}`);
console.log(`Vault Pages (initial):        ${vsPages.length}`);
console.log(`Inventory media items:        ${invItems.length}`);
console.log(`Distinct gallery collections: ${routeMediaCounts.size}`);

console.log("\n=== COLLECTIONS BREAKDOWN ===");
for (const [r, c] of routeMediaCounts.entries()) {
  console.log(`  ${r.padEnd(55)} ${c} assets`);
}

if (issues.length === 0) {
  console.log("\n✓ ZERO CROSS-SYSTEM DISCREPANCIES DETECTED!");
} else {
  console.error(`\n❌ Found ${issues.length} cross-system discrepancies:`);
  issues.forEach((i) => console.error(`  - ${i}`));
  process.exit(1);
}
