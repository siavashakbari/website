/**
 * Extract dominant (non-white / non-black) colors + aspect ratios for gallery assets.
 * Run: npx --yes -p sharp node scripts/extract-dominant-colors.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assetsRoot = path.join(root, "src", "assets");
const outFile = path.join(root, "src", "data", "image-colors.json");

const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name === "node_modules") continue;
      walk(full, files);
    } else if (EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function isNearWhiteOrBlack(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Near black
  if (max < 40) return true;
  // Near white / light gray
  if (min > 220) return true;
  // Low saturation light/dark gray
  if (max - min < 18 && (max < 55 || min > 200)) return true;
  return false;
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

async function analyze(file) {
  const image = sharp(file);
  const meta = await image.metadata();
  const ratio =
    meta.width && meta.height && meta.height > 0
      ? Number((meta.width / meta.height).toFixed(5))
      : 0.75;

  const { data, info } = await image
    .clone()
    .resize(48, 48, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isNearWhiteOrBlack(r, g, b)) continue;
    // Quantize to reduce noise
    const qr = r >> 4;
    const qg = g >> 4;
    const qb = b >> 4;
    const key = (qr << 8) | (qg << 4) | qb;
    const prev = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    prev.n += 1;
    prev.r += r;
    prev.g += g;
    prev.b += b;
    buckets.set(key, prev);
  }

  let best = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.n > best.n) best = bucket;
  }

  let color = "#8a8a8a";
  if (best && best.n > 0) {
    color = rgbToHex(
      Math.round(best.r / best.n),
      Math.round(best.g / best.n),
      Math.round(best.b / best.n),
    );
  } else {
    // Fallback: average of all pixels (still avoid pure extremes when possible)
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n += 1;
    }
    if (n > 0) {
      const ar = Math.round(r / n);
      const ag = Math.round(g / n);
      const ab = Math.round(b / n);
      if (!isNearWhiteOrBlack(ar, ag, ab)) color = rgbToHex(ar, ag, ab);
      else if (ar + ag + ab > 382) color = "#c4c4c4";
      else color = "#5a5a5a";
    }
  }

  const stem = path.basename(file, path.extname(file));
  return { stem, color, ratio };
}

const files = walk(assetsRoot);
const map = {};

for (const file of files) {
  try {
    const { stem, color, ratio } = await analyze(file);
    map[stem] = { color, ratio };
    process.stdout.write(".");
  } catch (err) {
    console.error(`\nFailed ${file}:`, err.message);
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(map, null, 2) + "\n");
console.log(`\nWrote ${Object.keys(map).length} entries → ${path.relative(root, outFile)}`);
