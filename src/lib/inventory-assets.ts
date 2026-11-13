// Pre-mapped asset URLs for all inventory items
const assetModules: Record<string, string> = import.meta.glob(
  "../assets/**/*.{jpg,jpeg,png,webp,gif}",
  { eager: true, import: "default" }
);

type AssetEntry = {
  key: string;
  url: string;
  fileLower: string;
  stem: string;
  ext: string;
};

const assetEntries: AssetEntry[] = Object.entries(assetModules)
  .map(([key, url]) => {
    const fileLower = (key.split("/").pop() || "").toLowerCase();
    const extMatch = fileLower.match(/\.([a-z0-9]+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "";
    const stem = fileLower.replace(/\.[^.]+$/, "");
    return { key, url, fileLower, stem, ext };
  })
  .sort((a, b) => b.stem.length - a.stem.length);

const byFileLower = new Map<string, AssetEntry[]>();
const byStem = new Map<string, AssetEntry[]>();

for (const entry of assetEntries) {
  const fList = byFileLower.get(entry.fileLower) ?? [];
  fList.push(entry);
  byFileLower.set(entry.fileLower, fList);

  const sList = byStem.get(entry.stem) ?? [];
  sList.push(entry);
  byStem.set(entry.stem, sList);
}

function matchAssetEntry(relPath: string): AssetEntry | null {
  if (!relPath) return null;
  if (
    relPath.startsWith("http://") ||
    relPath.startsWith("https://") ||
    relPath.startsWith("data:") ||
    relPath.startsWith("blob:") ||
    relPath.startsWith("/thumbs/")
  ) {
    return null;
  }

  let cleanPath = relPath.split(/[?#]/)[0] || relPath;
  try {
    cleanPath = decodeURIComponent(cleanPath);
  } catch {
    /* keep raw cleanPath */
  }

  // Direct module key lookup (e.g. "src/assets/..." or "../assets/...")
  const norm = cleanPath.replace(/^\/?src\//, "../");
  if (assetModules[norm]) {
    return assetEntries.find((e) => e.key === norm) ?? null;
  }
  const norm2 = cleanPath.startsWith("/") ? `..${cleanPath}` : `../${cleanPath}`;
  if (assetModules[norm2]) {
    return assetEntries.find((e) => e.key === norm2) ?? null;
  }

  const fileLower = (cleanPath.split("/").pop() || "").toLowerCase();
  if (!fileLower) return null;

  const exactFile = byFileLower.get(fileLower);
  if (exactFile?.length) return exactFile[0];

  const extMatch = fileLower.match(/\.([a-z0-9]+)$/i);
  const rawExt = extMatch ? extMatch[1].toLowerCase() : "";
  const rawStem = fileLower.replace(/\.[^.]+$/, "");
  if (!rawStem) return null;

  const exactStem = byStem.get(rawStem);
  if (exactStem?.length) {
    return (rawExt && exactStem.find((e) => e.ext === rawExt)) || exactStem[0];
  }

  // Match hashed production /assets/<stem>-<hash>.<ext> (sorted longest-stem-first)
  // Pass 1: exact extension match; Pass 2: stem match regardless of ext (e.g. webp <-> jpg)
  for (const requireSameExt of [true, false]) {
    if (requireSameExt && !rawExt) continue;
    for (const entry of assetEntries) {
      if (requireSameExt && entry.ext !== rawExt) continue;
      if (rawStem.length <= entry.stem.length + 1) continue;
      if (
        rawStem.startsWith(`${entry.stem}-`) ||
        rawStem.startsWith(`${entry.stem}_`)
      ) {
        const suffix = rawStem.slice(entry.stem.length);
        if (/^[-_][a-z0-9_-]{6,12}$/i.test(suffix) && !/^[-_]\d+$/.test(suffix)) {
          return entry;
        }
      }
    }
  }

  return null;
}

export function resolveKnownAssetStem(relPath: string): string {
  return matchAssetEntry(relPath)?.stem ?? "";
}

export function resolveKnownAssetFile(relPath: string): string {
  return matchAssetEntry(relPath)?.fileLower ?? "";
}

export function resolveInventoryImage(relPath: string): string {
  if (!relPath) return "";
  if (
    relPath.startsWith("http://") ||
    relPath.startsWith("https://") ||
    relPath.startsWith("data:") ||
    relPath.startsWith("blob:") ||
    relPath.startsWith("/thumbs/")
  ) {
    return relPath;
  }

  const matched = matchAssetEntry(relPath);
  if (matched) return matched.url;

  if (relPath.startsWith("/assets/")) {
    return relPath;
  }

  return relPath;
}
