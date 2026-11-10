/**
 * Gallery loading helpers:
 * - Dominant-color placeholders (from precomputed map)
 * - Full-quality images unlocked row-by-row (L→R, then next row)
 */

import imageColors from "@/data/image-colors.json";
import { resolveKnownAssetStem } from "@/lib/inventory-assets";

type ColorMeta = { color: string; ratio: number };

const colorMap = imageColors as Record<string, ColorMeta>;

/** Strip Vite/Rolldown hash from asset basename → fashion-atlasi-01 */
export function assetStemFromSrc(src: string): string {
  const raw = src.split(/[?#]/)[0] ?? src;
  let file = raw.split("/").pop() ?? raw;
  try {
    file = decodeURIComponent(file);
  } catch {
    /* keep raw */
  }
  const stem = file.replace(/\.[^.]+$/, "");

  // 1. Direct match if no hash
  if (colorMap[stem]) return stem;

  // 2. Canonical asset module registry match (handles stems omitted from colorMap too)
  const known = resolveKnownAssetStem(src);
  if (known) return known;

  // 3. Vite / Rolldown 8-char base64url hash (avoid stripping numeric sequence tokens like -01)
  const stripped = stem.replace(/-[A-Za-z0-9_-]{8}$/, (match) =>
    /^-\d+$/.test(match) ? match : "",
  );
  if (colorMap[stripped]) return stripped;

  // 4. Fallback for other build hash lengths
  const fallback = stem.replace(/-[A-Za-z0-9_-]{6,}$/, (match) =>
    /^-\d+$/.test(match) ? match : "",
  );
  if (colorMap[fallback]) return fallback;

  return stripped || stem;
}

export function metaFromSrc(src: string): ColorMeta {
  const stem = assetStemFromSrc(src);
  return colorMap[stem] ?? { color: "#8a8a8a", ratio: 0.75 };
}

/**
 * CSS `columns` fill column-major. Return DOM indices in visual row-major
 * order so we load left → middle → right per row.
 */
export function rowMajorLoadOrder(total: number, cols: number): number[] {
  const columnCount = Math.max(1, cols);
  const perCol = Math.ceil(total / columnCount);
  const order: number[] = [];
  for (let row = 0; row < perCol; row++) {
    for (let col = 0; col < columnCount; col++) {
      const idx = col * perCol + row;
      if (idx < total) order.push(idx);
    }
  }
  return order;
}

export function loadRankForIndex(domIndex: number, total: number, cols: number): number {
  const order = rowMajorLoadOrder(total, cols);
  const rank = order.indexOf(domIndex);
  return rank === -1 ? domIndex : rank;
}

/** Get <20KB WebP thumbnail URL from public/thumbs/ */
export function getThumbSrc(src: string): string {
  if (
    !src ||
    /\.(mp4|webm|mov|gif)(\?|#|$)/i.test(src) ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/thumbs/")
  ) {
    return src;
  }
  const stem = assetStemFromSrc(src);
  if (!stem) return src;
  return `/thumbs/${stem}.webp`;
}

