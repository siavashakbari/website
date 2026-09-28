// Pre-mapped asset URLs for all inventory items
const assetModules: Record<string, string> = import.meta.glob(
  "../assets/**/*.{jpg,jpeg,png,webp,gif}",
  { eager: true, import: "default" }
);

export function resolveInventoryImage(relPath: string): string {
  if (!relPath) return "";
  // relPath is e.g. "src/assets/fashion/atlasi/fashion-atlasi-01.jpg"
  const norm = relPath.replace(/^src\//, "../");
  if (assetModules[norm]) return assetModules[norm];

  // Try relative with ./
  const norm2 = relPath.startsWith("/") ? `..${relPath}` : `../${relPath}`;
  if (assetModules[norm2]) return assetModules[norm2];

  // Fallback to stem search
  const file = relPath.split("/").pop() || "";
  const stem = file.replace(/\.[^.]+$/, "");
  for (const [k, v] of Object.entries(assetModules)) {
    if (k.endsWith(`/${file}`) || k.includes(`/${stem}.`)) {
      return v;
    }
  }

  return relPath;
}
