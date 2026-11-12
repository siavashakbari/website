import fs from "fs";
import path from "path";
import http from "http";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function cleanSegment(s) {
  if (!s) return "";
  return s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeProjectSlug(project) {
  const base = slugify(project);
  if (!base) return "";
  if (base === "tasting") return "gastronomie";
  if (
    base === "signature-cafe-restaurant" ||
    base === "signature-cafe" ||
    base === "signature-restaurant" ||
    base === "signature"
  ) {
    return "signature-restaurant";
  }
  if (base === "dodareh" || base === "dobareh-accesories" || base === "dobareh-accessories") return "dobareh";
  if (base === "shekarchian" || base === "shekarchian-honey") return "shekarchian-sweets";
  if (base === "on-swipe") return "onswipe";
  if (base === "polarity-atelier") return "polarity";
  if (base === "nozad-publication" || base === "nozad-publication-visual-identity" || base === "nozad-vi") {
    return "nozad-publication-visual-identity";
  }
  if (base === "goats") return "goats-coffee";
  if (base === "zen-studio" || base === "zen-studio-products") return "zen-studio";
  return base;
}

function resolveMedia(item, idx) {
  const uniqueCode = item.uniqueCode || String(1001 + idx);
  let field = "photography";
  let category = "fashion-photography";
  let project = normalizeProjectSlug(item.project || "");

  const discNorm = (item.disciplineSlug || item.discipline || "").toLowerCase();
  if (discNorm.includes("video") || discNorm.includes("motion")) {
    field = "video";
    category = "";
    if (!project) project = "echo-prime";
  } else if (discNorm.includes("graphic") || discNorm.includes("identity") || discNorm.includes("book") || discNorm.includes("poster")) {
    field = "graphic-design";
    if (discNorm.includes("book")) {
      category = "book-covers";
      if (!project) project = "nozad-publications";
    } else if (discNorm.includes("poster")) {
      category = "posters";
      if (!project || project === "posters" || project === "nozad-publications") {
        project = "";
      }
    } else {
      category = "visual-identity";
    }
  } else if (discNorm.includes("product-design") || discNorm.includes("product design")) {
    field = "product-design";
    category = "";
  } else {
    field = "photography";
    if (discNorm.includes("food")) category = "food-photography";
    else if (discNorm.includes("portrait")) category = "portrait-photography";
    else if (discNorm.includes("product")) category = "product-photography";
    else category = "fashion-photography";
  }

  const isVideo = field === "video" || /\.(mp4|webm|mov)$/i.test(item.imgSrc || "");
  const assignedRoute = `/${[field, category, project].filter(Boolean).join("/")}`;
  const dynamicCode = [uniqueCode, cleanSegment(field), cleanSegment(category), cleanSegment(project)]
    .filter(Boolean)
    .join("-");
  const liveDetailPath = isVideo ? assignedRoute : `${assignedRoute}/${dynamicCode}`;

  return { uniqueCode, field, category, project, assignedRoute, dynamicCode, liveDetailPath, isVideo };
}

function parseTestRoutes() {
  const invContent = fs.readFileSync(path.join(root, "src/data/photo-inventory.ts"), "utf8");
  const startMarker = "export const PHOTO_INVENTORY: PhotoInventoryItem[] = ";
  const startIdx = invContent.indexOf(startMarker);
  const endMatch = invContent.match(/\];\r?\n\r?\nconst codeMap/);
  const inventory = JSON.parse(invContent.slice(startIdx + startMarker.length, endMatch.index + 1));

  const vsContent = fs.readFileSync(path.join(root, "src/lib/vault-store.ts"), "utf8");
  const initPagesBlock = vsContent.match(/export function getInitialScannedPages\(\): VaultPageItem\[\] \{([\s\S]*?)return pages;/)[1];
  const vaultPages = [...initPagesBlock.matchAll(/route:\s*["'](\/[^"']+)["'],\s*name:\s*["']([^"']+)["']/g)].map((m) => ({
    route: m[1],
    name: m[2],
  }));

  const media = inventory.map(resolveMedia);
  return { vaultPages, media };
}

async function fetchWithTimeout(url, maxRedirects = 4) {
  let currentUrl = url;
  let redirectChain = [];
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const res = await fetch(currentUrl, { redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { status: res.status, finalUrl: currentUrl, body: "", redirectChain };
      redirectChain.push({ status: res.status, location: loc });
      currentUrl = new URL(loc, currentUrl).toString();
      continue;
    }
    const body = await res.text();
    return { status: res.status, finalUrl: currentUrl, body, redirectChain };
  }
  return { status: 508, finalUrl: currentUrl, body: "", redirectChain };
}

async function waitForServer(baseUrl, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${baseUrl}/`, { redirect: "manual" });
      if (r.status === 200) return true;
    } catch {
      /* waiting */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server failed to become ready at ${baseUrl}`);
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : 3499;
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

async function runBatch(items, concurrency, fn) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function main() {
  const externalBase = process.env.BASE_URL;
  let serverProc = null;
  let baseUrl = externalBase;

  if (!baseUrl) {
    const viteBin = path.join(root, "node_modules/vite/bin/vite.js");
    if (!fs.existsSync(path.join(root, ".vercel/output")) && !fs.existsSync(path.join(root, ".output"))) {
      console.error("Missing production build output — run `npm run build` first.");
      process.exit(1);
    }
    const port = await getFreePort();
    baseUrl = `http://127.0.0.1:${port}`;
    serverProc = spawn(process.execPath, [viteBin, "preview", "--port", String(port), "--host", "127.0.0.1", "--strictPort"], {
      cwd: root,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await waitForServer(baseUrl);
  }

  try {
    const { vaultPages, media } = parseTestRoutes();
    const failures = [];

    const staticRoutes = ["/", "/about", "/contact", "/blog", "/brand-discovery", "/sitemap.xml", "/vault/pages", "/vault/media"];
    const uniqueMediaDetailRoutes = Array.from(new Set(media.map((m) => m.liveDetailPath)));
    const all200Targets = Array.from(new Set([...staticRoutes, ...vaultPages.map((p) => p.route), ...uniqueMediaDetailRoutes]));

    console.log(`=== LIVE SSR ROUTE VERIFICATION (${baseUrl}) ===`);
    console.log(`Testing ${all200Targets.length} canonical routes (${vaultPages.length} Vault Pages, ${uniqueMediaDetailRoutes.length} Media Live routes, ${staticRoutes.length} Core routes)...`);

    await runBatch(all200Targets, 16, async (routePath) => {
      const res = await fetchWithTimeout(`${baseUrl}${routePath}`);
      if (res.status !== 200) {
        failures.push(`Expected HTTP 200 for ${routePath}, got ${res.status} (final: ${res.finalUrl})`);
        return;
      }
      if (routePath === "/sitemap.xml") {
        if (!res.body.includes("<urlset") || res.body.includes("/projects/")) {
          failures.push(`/sitemap.xml invalid or contains legacy /projects/ links`);
        }
        return;
      }
      if (res.body.includes("Something went wrong")) {
        failures.push(`Error boundary rendered on ${routePath}`);
      }
      if (res.body.includes("404 —") || res.body.includes("Page not found</h1")) {
        failures.push(`404 content rendered on ${routePath}`);
      }
    });

    // Critical SSR content assertions (regression checks for user-reported bugs!)
    const contentChecks = [
      {
        path: "/graphic-design",
        mustInclude: ["Visual Identity", "Posters", "Book Covers"],
        mustExclude: ["More coming soon", "Nothing here to see"],
      },
      {
        path: "/graphic-design/visual-identity",
        mustInclude: ["Meatlab", "Shekarchian Sweets", "/assets/"],
        mustExclude: ["More coming soon", "Coming soon"],
      },
      {
        path: "/graphic-design/visual-identity/meatlab",
        mustInclude: ["Meatlab", "/assets/"],
        mustExclude: ["More coming soon"],
      },
      {
        path: "/photography/food-photography",
        mustInclude: ["Signature Restaurant", "Gastronomie", "Cuisine"],
        mustExclude: ["Signature-Cafe-Restaurant", "More coming soon"],
      },
      {
        path: "/graphic-design/posters/1306-GRAPHIC-DESIGN-POSTERS",
        mustInclude: ["1306-GRAPHIC-DESIGN-POSTERS", "/assets/"],
        mustExclude: ["404 â€”", "Page not found"],
      },
      {
        path: "/video/echo-prime",
        mustInclude: ["Echo Prime", "/assets/"],
        mustExclude: ["More coming soon"],
      },
    ];

    for (const chk of contentChecks) {
      const res = await fetchWithTimeout(`${baseUrl}${chk.path}`);
      if (res.status !== 200) {
        failures.push(`Content check HTTP ${res.status} on ${chk.path}`);
        continue;
      }
      for (const s of chk.mustInclude) {
        if (!res.body.includes(s)) {
          failures.push(`SSR HTML for ${chk.path} missing expected content: "${s}"`);
        }
      }
      for (const s of chk.mustExclude) {
        if (res.body.includes(s)) {
          failures.push(`SSR HTML for ${chk.path} unexpectedly contained: "${s}"`);
        }
      }
    }

    // Redirect checks (legacy aliases, short codes, 4-part codes)
    const redirectChecks = [
      {
        from: "/photography/food-photography/Signature-Cafe-Restaurant",
        expectedEnd: "/photography/food-photography/signature-restaurant",
      },
      {
        from: "/graphic-design/posters/posters",
        expectedEnd: "/graphic-design/posters",
      },
      {
        from: "/video/videos/echo-prime",
        expectedEnd: "/video/echo-prime",
      },
      {
        from: "/posters",
        expectedEnd: "/graphic-design/posters",
      },
      {
        from: "/photography/1001",
        expectedEnd: "/photography/fashion-photography/atlasi/1001-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-ATLASI",
      },
      {
        from: "/photography/fashion-photography/sepidar/PHOT-FASH-SEPI-0001",
        expectedEnd: "/photography/fashion-photography/sepidar/1015-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-SEPIDAR",
      },
      {
        from: "/graphic-design/visual-identity/shekarchian-sweets/SA-VI-SHEK-01",
        expectedEnd: "/graphic-design/visual-identity/shekarchian-sweets/1211-GRAPHIC-DESIGN-VISUAL-IDENTITY-SHEKARCHIAN-SWEETS",
      },
      {
        from: "/1211",
        expectedEnd: "/graphic-design/visual-identity/shekarchian-sweets/1211-GRAPHIC-DESIGN-VISUAL-IDENTITY-SHEKARCHIAN-SWEETS",
      },
      {
        from: "/1306",
        expectedEnd: "/graphic-design/posters/1306-GRAPHIC-DESIGN-POSTERS",
      },
      {
        from: "/1314",
        expectedEnd: "/video/echo-prime",
      },
      {
        from: "/1317",
        expectedEnd: "/graphic-design/visual-identity/meatlab/1317-GRAPHIC-DESIGN-VISUAL-IDENTITY-MEATLAB",
      },
    ];

    for (const rc of redirectChecks) {
      const res = await fetchWithTimeout(`${baseUrl}${rc.from}`);
      const finalPathname = new URL(res.finalUrl).pathname.replace(/\/+$/, "") || "/";
      if (res.status !== 200 || finalPathname !== rc.expectedEnd) {
        failures.push(`Redirect ${rc.from} -> expected HTTP 200 at ${rc.expectedEnd}, got ${res.status} at ${finalPathname}`);
      }
    }

    if (failures.length === 0) {
      console.log(`✓ PASSED ALL ${all200Targets.length} CANONICAL ROUTES, ${contentChecks.length} SSR REGRESSION CHECKS, AND ${redirectChecks.length} REDIRECTS WITH ZERO ERRORS!`);
    } else {
      console.error(`\n❌ ${failures.length} FAILURES:`);
      failures.forEach((f) => console.error(`  - ${f}`));
      process.exitCode = 1;
    }
  } finally {
    if (serverProc) {
      serverProc.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
