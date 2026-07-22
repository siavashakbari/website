import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MIN = 2 * 1024 * 1024;
const MAX = 3 * 1024 * 1024;
const TARGET = Math.round((MIN + MAX) / 2);
const ROOTS = ["fashion", "src/assets"];
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.has(path.extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function growToBand(file) {
  const input = fs.readFileSync(file);
  const meta = await sharp(input, { failOn: "none" }).metadata();
  let width = meta.width || 2000;
  let best = null;

  for (let pass = 0; pass < 30; pass++) {
    for (const quality of [92, 88, 85, 80, 75, 70]) {
      const buf = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width, kernel: "lanczos3" })
        .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" })
        .toBuffer();

      if (!best || Math.abs(buf.length - TARGET) < Math.abs(best.length - TARGET)) best = buf;

      if (buf.length >= MIN && buf.length <= MAX) {
        const outPath = file.replace(/\.png$/i, ".jpg");
        if (outPath !== file && fs.existsSync(file)) fs.unlinkSync(file);
        fs.writeFileSync(outPath, buf);
        return { file: outPath, size: buf.length, width, quality };
      }
    }

    // Too small -> enlarge; too big at lowest q -> shrink slightly
    const probe = await sharp(input, { failOn: "none" })
      .resize({ width, kernel: "lanczos3" })
      .jpeg({ quality: 70, mozjpeg: true })
      .toBuffer();

    if (probe.length < MIN) width = Math.round(width * 1.25);
    else width = Math.round(width * 0.92);
  }

  const outPath = file.replace(/\.png$/i, ".jpg");
  if (outPath !== file && fs.existsSync(file)) fs.unlinkSync(file);
  fs.writeFileSync(outPath, best);
  return { file: outPath, size: best.length, width, quality: "fallback" };
}

const files = walk("fashion").concat(walk("src/assets"));
const under = files.filter((f) => fs.statSync(f).size < MIN);
console.log(`Growing ${under.length} files into 2-3MB band...`);

for (let i = 0; i < under.length; i++) {
  const f = under[i];
  const before = fs.statSync(f).size;
  process.stdout.write(`[${i + 1}/${under.length}] ${f} ${(before / (1024 * 1024)).toFixed(2)}MB ... `);
  try {
    const r = await growToBand(f);
    const ok = r.size >= MIN && r.size <= MAX;
    console.log(`-> ${(r.size / (1024 * 1024)).toFixed(2)}MB w=${r.width} q=${r.quality}${ok ? "" : " WARN"}`);
  } catch (e) {
    console.log(`ERROR ${e.message}`);
  }
}

const all = walk("fashion").concat(walk("src/assets"));
const u = all.filter((f) => fs.statSync(f).size < MIN).length;
const o = all.filter((f) => fs.statSync(f).size > MAX).length;
const ok = all.filter((f) => {
  const s = fs.statSync(f).size;
  return s >= MIN && s <= MAX;
}).length;
console.log(`\nFinal: in-range=${ok} under2=${u} over3=${o} total=${all.length}`);
