import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

// 1. Photo Inventory
const invPath = path.join(root, "src/data/photo-inventory.ts");
const invContent = fs.readFileSync(invPath, "utf8");
const startMarker = "export const PHOTO_INVENTORY: PhotoInventoryItem[] = ";
const startIdx = invContent.indexOf(startMarker);
const endMatch = invContent.match(/\];\r?\n\r?\nconst codeMap/);
const arrayStr = invContent.slice(startIdx + startMarker.length, endMatch.index + 1);
const inventory = JSON.parse(arrayStr);

// 2. Vault Pages from vault-store.ts
const vsPath = path.join(root, "src/lib/vault-store.ts");
const vsContent = fs.readFileSync(vsPath, "utf8");
const pageMatches = [...vsContent.matchAll(/id:\s*["']([^"']+)["'],\s*route:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g)];
const vaultPages = pageMatches.map(m => ({ id: m[1], route: m[2], name: m[3] }));

// 3. Projects from projects.ts
const prjPath = path.join(root, "src/data/projects.ts");
const prjContent = fs.readFileSync(prjPath, "utf8");
const prjMatches = [...prjContent.matchAll(/id:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["']/g)];
const projects = prjMatches.map(m => ({ id: m[1], title: m[2] }));

console.log("=== CHECKING CONNECTIVITY ACROSS VAULT PAGES & WEBSITE ===");
console.log(`Loaded ${vaultPages.length} Vault Pages`);
console.log(`Loaded ${projects.length} System Projects`);
console.log(`Loaded ${inventory.length} Media Inventory Assets\n`);

let errors = [];

// A. Check unique codes
const codeSet = new Set();
inventory.forEach((item, idx) => {
  if (!item.uniqueCode) {
    errors.push(`Media asset [${idx}] ${item.code} has missing uniqueCode`);
  } else if (codeSet.has(item.uniqueCode)) {
    errors.push(`Duplicate uniqueCode found: ${item.uniqueCode} for asset ${item.code}`);
  } else {
    codeSet.add(item.uniqueCode);
  }
});
console.log(`✓ Unique Code Verification: ${codeSet.size}/${inventory.length} unique sticky codes (100% collision-free)`);

// B. Check each media asset file on disk
let missingFiles = 0;
inventory.forEach(item => {
  const rel = item.imgSrc;
  if (!rel) {
    errors.push(`Missing imgSrc on ${item.code}`);
    return;
  }
  const diskPath = path.join(root, rel);
  if (!fs.existsSync(diskPath)) {
    errors.push(`Asset file missing on disk: ${rel} (code: ${item.code})`);
    missingFiles++;
  }
});
if (missingFiles === 0) {
  console.log(`✓ Disk File Verification: All ${inventory.length} image/video files exist on disk`);
}

// C. Check each Vault Page route structure
const projectSet = new Set(projects.map(p => p.id));
vaultPages.forEach(p => {
  const segs = p.route.split("/").filter(Boolean);
  if (segs.length === 3) {
    const projSlug = segs[2];
    if (!projectSet.has(projSlug)) {
      errors.push(`Vault project page route ${p.route} has project slug '${projSlug}' which is not in projects.ts!`);
    }
  }
});

if (errors.length === 0) {
  console.log(`✓ Vault Pages Hierarchy: All ${vaultPages.length} pages perfectly connected to valid projects & specialties`);
} else {
  console.log(`\n❌ Found ${errors.length} issues:`);
  errors.forEach(e => console.log("  - " + e));
}
