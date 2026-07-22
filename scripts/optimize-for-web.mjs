/**
 * Resize + compress src/assets images for web delivery.
 * Max long edge 2000px, JPEG quality ~80, soft cap ~400KB.
 *
 * Run: node scripts/optimize-for-web.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "src", "assets");
const MAX_EDGE = 2000;
const QUALITY = 80;
const SOFT_MAX_BYTES = 400 * 1024;
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name === "fonts") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTS.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function optimizeFile(file) {
  const before = fs.statSync(file).size;
  const ext = path.extname(file).toLowerCase();
  const input = fs.readFileSync(file);
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const longEdge = Math.max(meta.width || 0, meta.height || 0);

  // Already small enough on disk and dimensions — skip
  if (before <= SOFT_MAX_BYTES && longEdge <= MAX_EDGE && ext !== ".png") {
    return { file, before, after: before, skipped: true };
  }

  let width =
    meta.width && meta.height && meta.width >= meta.height
      ? Math.min(meta.width, MAX_EDGE)
      : undefined;
  let height =
    meta.width && meta.height && meta.height > meta.width
      ? Math.min(meta.height, MAX_EDGE)
      : undefined;

  let quality = QUALITY;
  let best = null;
  let outExt = ext === ".png" ? ".jpg" : ext;

  for (let attempt = 0; attempt < 16; attempt++) {
    let pipeline = sharp(input, { failOn: "none" }).rotate();
    if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
    else if (height) pipeline = pipeline.resize({ height, withoutEnlargement: true });

    let buffer;
    if (outExt === ".webp") {
      buffer = await pipeline.webp({ quality }).toBuffer();
    } else {
      buffer = await pipeline
        .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
        .toBuffer();
      outExt = ".jpg";
    }

    if (!best || buffer.length < best.length) best = buffer;
    if (buffer.length <= SOFT_MAX_BYTES) {
      best = buffer;
      break;
    }

    if (quality > 62) quality -= 6;
    else if (width && width > 1200) width = Math.round(width * 0.85);
    else if (height && height > 1200) height = Math.round(height * 0.85);
    else if (quality > 50) quality -= 5;
    else break;
  }

  const outPath =
    outExt !== ext ? file.replace(/\.(png|jpeg)$/i, outExt === ".jpg" ? ".jpg" : outExt) : file;

  if (outPath !== file && fs.existsSync(file)) fs.unlinkSync(file);
  fs.writeFileSync(outPath, best);

  return {
    file: outPath,
    before,
    after: best.length,
    skipped: false,
    dims: `${meta.width}x${meta.height}`,
  };
}

/** Homepage-critical extras: WebP hero + discipline thumbs */
async function writeHomepageVariants() {
  const jobs = [
    {
      src: path.join(ROOT, "brand", "hero", "brand-hero-01.jpg"),
      outs: [
        { dest: path.join(ROOT, "brand", "hero", "brand-hero-01.webp"), width: 1920, quality: 78 },
        { dest: path.join(ROOT, "brand", "hero", "brand-hero-01-sm.webp"), width: 960, quality: 75 },
      ],
    },
    {
      src: path.join(ROOT, "food", "gastronomie", "food-gastronomie-19.jpg"),
      outs: [
        {
          dest: path.join(ROOT, "food", "gastronomie", "food-gastronomie-19-thumb.webp"),
          width: 800,
          quality: 75,
        },
      ],
    },
    {
      src: path.join(ROOT, "product", "objects", "product-objects-92.jpg"),
      outs: [
        {
          dest: path.join(ROOT, "product", "objects", "product-objects-92-thumb.webp"),
          width: 800,
          quality: 75,
        },
      ],
    },
    {
      src: path.join(ROOT, "fashion", "atlasi", "fashion-atlasi-09.jpg"),
      outs: [
        {
          dest: path.join(ROOT, "fashion", "atlasi", "fashion-atlasi-09-thumb.webp"),
          width: 800,
          quality: 75,
        },
      ],
    },
    {
      src: path.join(ROOT, "portrait", "calligraphy", "portrait-calligraphy-02.jpg"),
      outs: [
        {
          dest: path.join(ROOT, "portrait", "calligraphy", "portrait-calligraphy-02-thumb.webp"),
          width: 800,
          quality: 75,
        },
      ],
    },
  ];

  for (const job of jobs) {
    if (!fs.existsSync(job.src)) {
      console.warn(`skip variant, missing: ${job.src}`);
      continue;
    }
    const input = fs.readFileSync(job.src);
    for (const out of job.outs) {
      const buf = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width: out.width, withoutEnlargement: true })
        .webp({ quality: out.quality })
        .toBuffer();
      fs.writeFileSync(out.dest, buf);
      console.log(
        `variant ${path.relative(process.cwd(), out.dest)} → ${(buf.length / 1024).toFixed(0)} KB`,
      );
    }
  }
}

const files = walk(ROOT);
console.log(`Optimizing ${files.length} images under src/assets …`);

let saved = 0;
let changed = 0;
for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const rel = path.relative(process.cwd(), f);
  process.stdout.write(`[${i + 1}/${files.length}] ${rel} … `);
  try {
    const result = await optimizeFile(f);
    saved += result.before - result.after;
    if (result.skipped) {
      console.log("skip");
    } else {
      changed += 1;
      const kb = (n) => (n / 1024).toFixed(0);
      console.log(`${kb(result.before)} → ${kb(result.after)} KB`);
    }
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
}

console.log("\nHomepage variants…");
await writeHomepageVariants();

console.log(
  `\nDone. Changed ${changed}/${files.length}. Saved ${(saved / 1024 / 1024).toFixed(1)} MB`,
);
