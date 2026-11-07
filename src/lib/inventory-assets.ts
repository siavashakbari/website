// Pre-mapped asset URLs for all inventory items
const assetModules: Record<string, string> = import.meta.glob(
  "../assets/**/*.{jpg,jpeg,png,webp,gif,mp4}",
  { eager: true, import: "default" }
);

export function resolveInventoryImage(relPath: string): string {
  if (!relPath) return "";
  if (
    relPath.startsWith("/assets/") ||
    relPath.startsWith("http://") ||
    relPath.startsWith("https://") ||
    relPath.startsWith("data:") ||
    relPath.startsWith("blob:")
  ) {
    return relPath;
  }
  // relPath is e.g. "src/assets/fashion/atlasi/fashion-atlasi-01.jpg"
  const norm = relPath.replace(/^src\//, "../");
  if (assetModules[norm]) return assetModules[norm];

  // Try relative with ./
  const norm2 = relPath.startsWith("/") ? `..${relPath}` : `../${relPath}`;
  if (assetModules[norm2]) return assetModules[norm2];

  // Fallback to stem search
  const file = relPath.split("/").pop() || "";
  let stem = file.replace(/\.[^.]+$/, "").toLowerCase();
  // Strip vite hash if present
  stem = stem.replace(/[-_][a-zA-Z0-9]{8,10}$/, "");

  for (const [k, v] of Object.entries(assetModules)) {
    const kStem = (k.split("/").pop() || "").replace(/\.[^.]+$/, "").toLowerCase();
    if (k.endsWith(`/${file}`) || kStem === stem || k.includes(`/${stem}.`)) {
      return v;
    }
  }

  return relPath;
}
