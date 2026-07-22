import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_BYTES = 3 * 1024 * 1024;
const ROOTS = ["fashion", "src/assets"];
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTS.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function compressFile(file) {
  const before = fs.statSync(file).size;
  if (before <= MAX_BYTES) return { file, before, after: before, skipped: true };

  const ext = path.extname(file).toLowerCase();
  const isPng = ext === ".png";
  const input = fs.readFileSync(file);
  const meta = await sharp(input, { failOn: "none" }).metadata();
  let width = meta.width || 0;
  let quality = 82;
  let best = null;

  for (let attempt = 0; attempt < 24; attempt++) {
    let pipeline = sharp(input, { failOn: "none" }).rotate();
    if (width > 0) pipeline = pipeline.resize({ width, withoutEnlargement: true });

    let buffer;
    if (isPng) {
      // Prefer JPEG for heavy PNGs when still oversized after PNG compression
      if (attempt < 8) {
        buffer = await pipeline.png({ compressionLevel: 9, palette: attempt > 3 }).toBuffer();
      } else {
        buffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      }
    } else if (ext === ".webp") {
      buffer = await pipeline.webp({ quality }).toBuffer();
    } else {
      buffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    }

    if (!best || buffer.length < best.length) best = buffer;
    if (buffer.length <= MAX_BYTES) {
      const outPath =
        isPng && attempt >= 8 ? file.replace(/\.png$/i, ".jpg") : file;
      if (outPath !== file) fs.unlinkSync(file);
      fs.writeFileSync(outPath, buffer);
      return { file: outPath, before, after: buffer.length, skipped: false };
    }

    if (quality > 55) quality -= 7;
    else if (width > 1600) width = Math.round(width * 0.85);
    else if (quality > 40) quality -= 5;
    else width = Math.max(1200, Math.round(width * 0.8));
  }

  // Last resort: write smallest attempt even if somehow still over (should be rare)
  fs.writeFileSync(file, best);
  return { file, before, after: best.length, skipped: false, warning: best.length > MAX_BYTES };
}

const files = ROOTS.flatMap((r) => walk(r));
const oversized = files.filter((f) => fs.statSync(f).size > MAX_BYTES);
console.log(`Found ${files.length} images, ${oversized.length} over 3MB`);

let saved = 0;
for (let i = 0; i < oversized.length; i++) {
  const f = oversized[i];
  process.stdout.write(`[${i + 1}/${oversized.length}] ${f} ... `);
  try {
    const result = await compressFile(f);
    const mb = (n) => (n / 1024 / 1024).toFixed(2);
    saved += result.before - result.after;
    console.log(`${mb(result.before)}MB -> ${mb(result.after)}MB${result.warning ? " WARN" : ""}`);
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
}

console.log(`Done. Saved ${(saved / 1024 / 1024).toFixed(1)} MB`);
