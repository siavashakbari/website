import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// 1. Photo Inventory projects
const invPath = path.join(root, "src/data/photo-inventory.ts");
const invContent = fs.readFileSync(invPath, "utf8");
const startMarker = "export const PHOTO_INVENTORY: PhotoInventoryItem[] = ";
const startIdx = invContent.indexOf(startMarker);
const endMatch = invContent.match(/\];\r?\n\r?\nconst codeMap/);
const arrayStr = invContent.slice(startIdx + startMarker.length, endMatch.index + 1);
const invItems = JSON.parse(arrayStr);

const invProjects = new Map();
invItems.forEach((p) => {
  const proj = p.project || "Unknown";
  if (!invProjects.has(proj)) invProjects.set(proj, 0);
  invProjects.set(proj, invProjects.get(proj) + 1);
});

// 2. projects.ts
const prjPath = path.join(root, "src/data/projects.ts");
const prjContent = fs.readFileSync(prjPath, "utf8");
const prjRegex = /id:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["']/g;
const prjList = [];
let match;
while ((match = prjRegex.exec(prjContent)) !== null) {
  prjList.push({ id: match[1], title: match[2] });
}

// 3. vault-store.ts initial pages
const vsPath = path.join(root, "src/lib/vault-store.ts");
const vsContent = fs.readFileSync(vsPath, "utf8");
const vsRegex = /route:\s*["'](\/[^"']+)["'],\s*name:\s*["']([^"']+)["']/g;
const vsPages = [];
while ((match = vsRegex.exec(vsContent)) !== null) {
  vsPages.push({ route: match[1], name: match[2] });
}

console.log("=== 1. PROJECTS IN projects.ts (" + prjList.length + ") ===");
prjList.forEach((p) => console.log(" ", p.id.padEnd(35), p.title));

console.log("\n=== 2. PROJECTS IN photo-inventory.ts (" + invProjects.size + ") ===");
for (const [proj, count] of invProjects.entries()) {
  console.log(" ", proj.padEnd(35), count, "photos");
}

console.log("\n=== 3. PROJECT LEVEL 2 PAGES IN vault-store.ts ===");
vsPages
  .filter((p) => p.route.split("/").length === 4)
  .forEach((p) => console.log(" ", p.route.padEnd(55), p.name));
