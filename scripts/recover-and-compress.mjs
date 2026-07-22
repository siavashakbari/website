import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const MIN = 2 * 1024 * 1024;
const MAX = 3 * 1024 * 1024;
const TARGET = Math.round((MIN + MAX) / 2); // ~2.5MB
const HQ_COMMIT = "5bdea01";
const RECOVER_DIR = path.join(".recover-hq");
const ROOT = process.cwd();

function git(args, opts = {}) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: opts.encoding ?? "buffer",
    maxBuffer: 64 * 1024 * 1024,
    stdio: opts.stdio,
  });
}

function listHqImages() {
  const out = git(["ls-tree", "-r", HQ_COMMIT], { encoding: "utf8" });
  const rows = [];
  for (const line of out.split("\n")) {
    if (!/\.(jpe?g|png|webp)$/i.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;
    const hash = parts[2];
    const filePath = parts.slice(3).join(" ");
    const size = Number(git(["cat-file", "-s", hash], { encoding: "utf8" }).trim());
    rows.push({ hash, filePath: filePath.replace(/\\/g, "/"), size });
  }
  return rows;
}

function resolveWorkingPath(hqPath) {
  // PNG sources that were converted to JPG in the working tree
  const jpgAlt = hqPath.replace(/\.png$/i, ".jpg");
  if (hqPath.toLowerCase().endsWith(".png") && fs.existsSync(jpgAlt)) return jpgAlt;
  if (fs.existsSync(hqPath)) return hqPath;
  if (fs.existsSync(jpgAlt)) return jpgAlt;
  return hqPath; // will create
}

function extractBlob(hash, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const data = git(["cat-file", "-p", hash]);
  fs.writeFileSync(dest, data);
}

async function encodeCandidate(inputBuf, { width, quality, asJpeg }) {
  let pipeline = sharp(inputBuf, { failOn: "none" }).rotate();
  if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  if (asJpeg) {
    return pipeline.jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  }
  const meta = await sharp(inputBuf, { failOn: "none" }).metadata();
  if (meta.format === "png") {
    return pipeline.png({ compressionLevel: 9 }).toBuffer();
  }
  if (meta.format === "webp") {
    return pipeline.webp({ quality }).toBuffer();
  }
  return pipeline.jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
}

async function compressToBand(inputBuf, preferJpeg) {
  const meta = await sharp(inputBuf, { failOn: "none" }).metadata();
  let width = meta.width || null;
  const asJpeg = preferJpeg || meta.format !== "png";

  // Binary search quality at current width, then shrink width if needed
  let bestInBand = null;
  let closest = null;

  for (let scalePass = 0; scalePass < 12; scalePass++) {
    let lo = 40;
    let hi = 95;
    for (let i = 0; i < 10; i++) {
      const quality = Math.round((lo + hi) / 2);
      const buf = await encodeCandidate(inputBuf, { width, quality, asJpeg: true });
      const diff = Math.abs(buf.length - TARGET);
      if (!closest || diff < Math.abs(closest.length - TARGET)) closest = buf;

      if (buf.length >= MIN && buf.length <= MAX) {
        // Prefer closer to target
        if (!bestInBand || Math.abs(buf.length - TARGET) < Math.abs(bestInBand.length - TARGET)) {
          bestInBand = buf;
        }
        // Try to get closer to target
        if (buf.length > TARGET) hi = quality - 1;
        else lo = quality + 1;
      } else if (buf.length > MAX) {
        hi = quality - 1;
      } else {
        lo = quality + 1;
      }
    }

    if (bestInBand) return bestInBand;

    // Still too big at q=40 -> shrink dimensions
    const probe = await encodeCandidate(inputBuf, { width, quality: 45, asJpeg: true });
    if (probe.length > MAX && width) {
      width = Math.max(1400, Math.round(width * 0.88));
      continue;
    }
    // Too small even at high quality -> stop shrinking, bump quality via closest
    break;
  }

  // If nothing landed in band, nudge closest
  if (closest && closest.length >= MIN && closest.length <= MAX) return closest;

  // Last resort: walk qualities finely at final width
  for (let q = 95; q >= 35; q -= 1) {
    const buf = await encodeCandidate(inputBuf, { width, quality: q, asJpeg: true });
    if (buf.length >= MIN && buf.length <= MAX) return buf;
    if (!closest || Math.abs(buf.length - TARGET) < Math.abs(closest.length - TARGET)) {
      closest = buf;
    }
  }

  // If still under MIN (tiny source), return highest-quality encode (may be <2MB)
  if (closest && closest.length < MIN) {
    const hiQ = await encodeCandidate(inputBuf, { width: meta.width, quality: 95, asJpeg: true });
    return hiQ.length >= closest.length ? hiQ : closest;
  }

  // If still over MAX, keep reducing
  let w = width || meta.width;
  let buf = closest;
  while (buf && buf.length > MAX && w > 1000) {
    w = Math.round(w * 0.9);
    buf = await encodeCandidate(inputBuf, { width: w, quality: 50, asJpeg: true });
  }
  return buf;
}

async function main() {
  fs.mkdirSync(RECOVER_DIR, { recursive: true });
  const hqImages = listHqImages();
  console.log(`HQ commit ${HQ_COMMIT}: ${hqImages.length} images`);

  let restoredInRange = 0;
  let compressed = 0;
  let tinySource = 0;
  let failed = 0;

  for (let i = 0; i < hqImages.length; i++) {
    const { hash, filePath, size } = hqImages[i];
    const dest = resolveWorkingPath(filePath);
    const label = `[${i + 1}/${hqImages.length}] ${filePath}`;

    const hqLocal = path.join(RECOVER_DIR, filePath);
    if (!fs.existsSync(hqLocal) || fs.statSync(hqLocal).size !== size) {
      extractBlob(hash, hqLocal);
    }

    const hqSize = fs.statSync(hqLocal).size;
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    // HQ already in 2-3MB: restore it, don't recompress
    if (hqSize >= MIN && hqSize <= MAX) {
      fs.copyFileSync(hqLocal, dest);
      console.log(`${label} RESTORE HQ in-range ${(hqSize / (1024 * 1024)).toFixed(2)}MB`);
      restoredInRange++;
      continue;
    }

    // HQ under 2MB: keep true original (cannot compress into a larger size)
    if (hqSize < MIN) {
      fs.copyFileSync(hqLocal, dest);
      console.log(`${label} RESTORE tiny HQ ${(hqSize / (1024 * 1024)).toFixed(2)}MB`);
      tinySource++;
      continue;
    }

    // HQ over 3MB: compress into 2-3MB band and replace
    try {
      const input = fs.readFileSync(hqLocal);
      const preferJpeg = dest.toLowerCase().endsWith(".jpg") || dest.toLowerCase().endsWith(".jpeg");
      const out = await compressToBand(input, preferJpeg);
      fs.writeFileSync(dest, out);
      const ok = out.length >= MIN && out.length <= MAX;
      console.log(
        `${label} ${(hqSize / (1024 * 1024)).toFixed(2)}MB -> ${(out.length / (1024 * 1024)).toFixed(2)}MB${ok ? "" : " WARN out-of-band"}`
      );
      compressed++;
      if (!ok && out.length < MIN) tinySource++;
    } catch (err) {
      console.log(`${label} ERROR ${err.message}`);
      failed++;
    }
  }

  console.log("\nDone.");
  console.log(`restored HQ already 2-3MB: ${restoredInRange}`);
  console.log(`compressed from HQ (>3MB): ${compressed}`);
  console.log(`tiny HQ sources (<2MB kept as-is): ${tinySource}`);
  console.log(`failed: ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
