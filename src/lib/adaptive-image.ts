/**
 * Gallery loading helpers:
 * - Dominant-color placeholders (from precomputed map)
 * - Full-quality images unlocked row-by-row (L→R, then next row)
 */

import imageColors from "@/data/image-colors.json";

type ColorMeta = { color: string; ratio: number };

const colorMap = imageColors as Record<string, ColorMeta>;

/** Strip Vite hash from asset basename → fashion-atlasi-01 */
export function assetStemFromSrc(src: string): string {
  const file = decodeURIComponent((src.split("/").pop() ?? src).split("?")[0] ?? "");
  let stem = file.replace(/\.[^.]+$/, "");
  stem = stem.replace(/-[A-Za-z0-9_]{7,}$/, (match) =>
    /^-\d+$/.test(match) ? match : "",
  );
  return stem;
}

export function metaFromSrc(src: string): ColorMeta {
  const stem = assetStemFromSrc(src);
  return colorMap[stem] ?? { color: "#8a8a8a", ratio: 0.75 };
}

/**
 * Ordered unlock: only the next `concurrency` ranks may start,
 * advancing from the top as earlier ranks complete.
 */
export function nextUnlockCount(doneCount: number, total: number, concurrency: number): number {
  return Math.min(total, doneCount + concurrency);
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
