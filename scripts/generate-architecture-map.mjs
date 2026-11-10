import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Read photo inventory
const invPath = path.join(rootDir, "src/data/photo-inventory.ts");
const invContent = fs.readFileSync(invPath, "utf8");

const startMarker = "export const PHOTO_INVENTORY: PhotoInventoryItem[] = ";
const startIdx = invContent.indexOf(startMarker);
const endMatch = invContent.match(/\];\r?\n\r?\nconst codeMap/);
const endIdx = endMatch ? endMatch.index : -1;

const arrayStr = invContent.slice(startIdx + startMarker.length, endIdx + 1);
const inventory = JSON.parse(arrayStr);

// Read Vault initial pages from src/lib/vault-store.ts
const vaultStorePath = path.join(rootDir, "src/lib/vault-store.ts");
const vaultStoreContent = fs.readFileSync(vaultStorePath, "utf8");
const initPagesMatch = vaultStoreContent.match(
  /export function getInitialScannedPages\(\): VaultPageItem\[\] \{([\s\S]*?)return pages;/,
);
const vaultPages = [];
if (initPagesMatch) {
  const objRegex =
    /id:\s*["']([^"']+)["'][\s\S]*?route:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?parentRoute:\s*["']([^"']*)["'][\s\S]*?uiType:\s*["']([^"']+)["']/g;
  let m;
  while ((m = objRegex.exec(initPagesMatch[1])) !== null) {
    vaultPages.push({
      id: m[1],
      route: m[2],
      name: m[3],
      parentRoute: m[4],
      uiType: m[5],
    });
  }
}

function cleanSegment(s) {
  if (!s) return "";
  return s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function buildDynamicCode(uniqueCode, field, category, project) {
  return [uniqueCode, cleanSegment(field), cleanSegment(category), cleanSegment(project)]
    .filter(Boolean)
    .join("-");
}

function extFromSrc(imgSrc) {
  const clean = (imgSrc || "").split(/[?#]/)[0].toLowerCase();
  if (clean.endsWith(".png")) return ".PNG";
  if (clean.endsWith(".webp")) return ".WEBP";
  if (clean.endsWith(".gif")) return ".GIF";
  if (clean.endsWith(".mp4")) return ".MP4";
  if (clean.endsWith(".webm")) return ".WEBM";
  if (clean.endsWith(".mov")) return ".MOV";
  return ".JPG";
}

function resolveHierarchy(item, idx) {
  let field = "photography";
  let category = "fashion-photography";
  let project = normalizeProjectSlug(item.project || "");

  const discNorm = (item.disciplineSlug || item.discipline || "").toLowerCase();
  if (discNorm.includes("video") || discNorm.includes("motion")) {
    field = "video";
    category = "";
    if (!project) project = "echo-prime";
  } else if (
    discNorm.includes("graphic") ||
    discNorm.includes("identity") ||
    discNorm.includes("book") ||
    discNorm.includes("poster")
  ) {
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

  const uniqueCode = item.uniqueCode || String(1001 + idx);
  const dynamicCode = buildDynamicCode(uniqueCode, field, category, project);
  const ext = extFromSrc(item.imgSrc);
  const imageName = `${dynamicCode}${ext}`;
  const isVideo = field === "video" || ext === ".MP4" || ext === ".WEBM" || ext === ".MOV";

  const assignedRoute = `/${[field, category, project].filter(Boolean).join("/")}`;
  const liveDetailPath = isVideo ? assignedRoute : `${assignedRoute}/${dynamicCode}`;
  const shortRedirectPath = isVideo ? `/${uniqueCode}` : `${assignedRoute}/${uniqueCode}`;

  const canonicalUrl = `https://www.siavashakbari.ir${liveDetailPath}`;
  const shortUrl = `https://www.siavashakbari.ir${shortRedirectPath}`;

  return {
    uniqueCode,
    field,
    category: category || "— (flat)",
    project: project || "— (top gallery)",
    projectName: item.project || "Posters Gallery",
    dynamicCode,
    imageName,
    assignedRoute,
    liveDetailPath,
    shortRedirectPath,
    canonicalUrl,
    shortUrl,
    imgSrc: item.imgSrc,
    client: item.client || "—",
    year: item.date || "2024",
    code: item.code,
    isVideo,
  };
}

const processedMedia = inventory.map(resolveHierarchy);
const videoCount = processedMedia.filter((m) => m.isVideo).length;
const photoCount = processedMedia.length - videoCount;

// Group media by assignedRoute (exact gallery destination)
const routeGroups = new Map();
processedMedia.forEach((m) => {
  if (!routeGroups.has(m.assignedRoute)) {
    routeGroups.set(m.assignedRoute, {
      name: m.projectName,
      slug: m.project,
      field: m.field,
      category: m.category,
      route: m.assignedRoute,
      count: 0,
      items: [],
    });
  }
  const g = routeGroups.get(m.assignedRoute);
  g.count++;
  g.items.push(m);
});

const projectsList = Array.from(routeGroups.values());

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Siavash Akbari Studio — Complete System Route & Architecture Map</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0A0A0A;
      --card-bg: #121212;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #2CE3C0;
      --accent-glow: rgba(44, 227, 192, 0.2);
      --text-main: #EDEDED;
      --text-muted: #8E8E93;
      --code-bg: #181818;
      --badge-bg: rgba(44, 227, 192, 0.1);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      line-height: 1.6;
      padding: 32px 20px 80px;
    }
    .container { max-width: 1440px; margin: 0 auto; }
    header {
      margin-bottom: 40px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }
    .title-group h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      background: var(--badge-bg);
      color: var(--accent);
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(44, 227, 192, 0.25);
    }
    .title-group p { color: var(--text-muted); font-size: 14px; margin-top: 6px; }
    .stats-strip { display: flex; gap: 14px; flex-wrap: wrap; }
    .stat-pill {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 10px 18px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-pill .num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      color: var(--accent);
    }
    .stat-pill .lbl {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .controls {
      background: rgba(18, 18, 18, 0.9);
      border: 1px solid var(--card-border);
      padding: 16px 20px;
      border-radius: 16px;
      margin-bottom: 32px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 16px;
      z-index: 100;
      backdrop-filter: blur(16px);
    }
    .search-input {
      flex: 1;
      min-width: 260px;
      background: var(--bg);
      border: 1px solid var(--card-border);
      color: #FFF;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      padding: 10px 16px;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-glow);
    }
    .filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-btn {
      background: var(--bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn.active, .filter-btn:hover {
      background: var(--badge-bg);
      color: var(--accent);
      border-color: rgba(44, 227, 192, 0.4);
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin: 40px 0 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #FFF;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 8px;
    }
    .section-desc { color: var(--text-muted); font-size: 13px; margin-bottom: 18px; }
    .arch-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .arch-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .arch-card:hover { border-color: rgba(44, 227, 192, 0.3); transform: translateY(-2px); }
    .arch-card h3 {
      font-size: 16px;
      font-weight: 600;
      color: #FFF;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .arch-card h3 .icon { color: var(--accent); }
    .arch-card p { font-size: 13px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.55; }
    .code-block {
      background: var(--code-bg);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--accent);
      word-break: break-all;
    }
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow-x: auto;
      margin-bottom: 40px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    thead { background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid var(--card-border); }
    th {
      padding: 14px 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      white-space: nowrap;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.015); }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .code-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(44, 227, 192, 0.1);
      color: var(--accent);
      border: 1px solid rgba(44, 227, 192, 0.2);
      display: inline-block;
    }
    .url-link {
      color: #FFF;
      text-decoration: none;
      transition: color 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .url-link:hover { color: var(--accent); text-decoration: underline; }
    .badge-gray {
      background: rgba(255, 255, 255, 0.06);
      color: #BBB;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      display: inline-block;
    }
    footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid var(--card-border);
      color: var(--text-muted);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-group">
        <h1>Siavash Akbari Studio <span class="badge">Architecture &amp; Route Map</span></h1>
        <p>Complete synchronized directory of ${vaultPages.length} Vault Pages, ${projectsList.length} gallery collections, and all ${processedMedia.length} media assets (${photoCount} dedicated photo routes + ${videoCount} video showcases).</p>
      </div>
      <div class="stats-strip">
        <div class="stat-pill">
          <div class="num">${processedMedia.length}</div>
          <div class="lbl">Media Assets</div>
        </div>
        <div class="stat-pill">
          <div class="num">${vaultPages.length}</div>
          <div class="lbl">Vault Pages</div>
        </div>
        <div class="stat-pill">
          <div class="num">${projectsList.length}</div>
          <div class="lbl">Collections</div>
        </div>
        <div class="stat-pill">
          <div class="num">4</div>
          <div class="lbl">Disciplines</div>
        </div>
      </div>
    </header>

    <!-- Structural Foundations -->
    <div class="section-title">Architectural Standards, Sizing &amp; Naming Logic</div>
    <div class="section-desc">Canonical algorithmic rules binding the Vault Admin Panel, client storage, SSR routing, and sitemap.</div>
    <div class="arch-grid">
      <div class="arch-card">
        <h3><span class="icon">#1</span> Sticky Unique Code</h3>
        <p>Every uploaded or catalogued media asset receives an immutable 4-digit numeric code (<code>1001–9999</code>). Moving a file between projects or categories updates its dynamic suffix without changing its sticky 4-digit anchor.</p>
        <div class="code-block">Format: [1001-9999] (e.g. 1211, 1221, 1306)</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#2</span> Placement Dynamic Code</h3>
        <p>Computed dynamically from placement hierarchy: <code>\${uniqueCode}-\${DISCIPLINE}[-\${CATEGORY}][-\${PROJECT}]</code>. Flat disciplines (<code>video</code>, <code>product-design</code>) omit category; top-level Posters omit project.</p>
        <div class="code-block">1211-GRAPHIC-DESIGN-VISUAL-IDENTITY-SHEKARCHIAN-SWEETS<br>1306-GRAPHIC-DESIGN-POSTERS<br>1314-VIDEO-ECHO-PRIME</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#3</span> Database Image Filename</h3>
        <p>Default media asset titles and logical filenames mirror the dynamic code plus uppercase extension (<code>.JPG</code>, <code>.PNG</code>, <code>.GIF</code>, <code>.WEBP</code>, <code>.MP4</code>) directly synced with Vault Media.</p>
        <div class="code-block">e.g. 1221-GRAPHIC-DESIGN-VISUAL-IDENTITY-AHURA-CCTV.JPG</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#4</span> Canonical URL Routing</h3>
        <p>Standard 3-level hierarchy: <code>/discipline/category/project/dynamicCode</code>. Flat fields &amp; top-level Posters resolve cleanly at 3 segments without empty/duplicate segments. Videos resolve at <code>/video/echo-prime</code>.</p>
        <div class="code-block">/graphic-design/visual-identity/meatlab/1317-...<br>/graphic-design/posters/1306-GRAPHIC-DESIGN-POSTERS</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#5</span> Image &amp; Video Sizing Logic</h3>
        <p><strong>Full High-Res:</strong> Max 2000px long edge (preserves aspect, JPEG/WebP ~80–82%, ~400KB soft cap).<br><strong>Grid Thumbnail:</strong> Max 450x450px WebP @ 60–65% (&lt;20KB for fast masonry/scroll grids).<br><strong>Video:</strong> MP4/WebM with 0.5s frame poster extraction.</p>
        <div class="code-block">Full &lt;= 2000px · Thumb &lt;= 450px WebP (&lt;20KB)</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#6</span> UI Layout Modes &amp; Fallback Redirects</h3>
        <p><strong>UI01:</strong> Vertical editorial scroll · <strong>UI02:</strong> Horizontal strip with wheel translation · <strong>UI03:</strong> Equal cover cards grid · <strong>UI04:</strong> Interactive video showcase. Legacy codes (<code>SA-...</code>), 4-part codes, aliases (<code>Signature-Cafe-Restaurant</code>), and short numeric URLs (<code>/1211</code>) 302-redirect cleanly.</p>
        <div class="code-block">/1211 or /photography/.../SA-... ➔ Canonical Dynamic URL</div>
      </div>
    </div>

    <!-- Interactive Search Controls -->
    <div class="controls">
      <input type="text" id="searchInput" class="search-input" placeholder="Search by code (e.g. 1222), project (e.g. Meatlab), Vault route, or dynamic code..." oninput="filterAllTables()">
      <div class="filter-pills">
        <button class="filter-btn active" onclick="filterDiscipline('all', this)">All Disciplines</button>
        <button class="filter-btn" onclick="filterDiscipline('photography', this)">Photography</button>
        <button class="filter-btn" onclick="filterDiscipline('graphic-design', this)">Graphic Design</button>
        <button class="filter-btn" onclick="filterDiscipline('video', this)">Video</button>
        <button class="filter-btn" onclick="filterDiscipline('product-design', this)">Product Design</button>
      </div>
    </div>

    <!-- Complete Vault Pages Architecture Directory -->
    <div class="section-title">Vault Pages Hierarchy Directory (${vaultPages.length} Pages)</div>
    <div class="section-desc">Every top-level discipline, specialty category, and project route managed in <code>/vault/pages</code>.</div>
    <div class="table-container">
      <table id="vaultPagesTable">
        <thead>
          <tr>
            <th>Discipline</th>
            <th>Vault Page Name</th>
            <th>Parent Route</th>
            <th>UI Type</th>
            <th>Live Route</th>
          </tr>
        </thead>
        <tbody>
          ${vaultPages
            .map((vp) => {
              const disc = vp.route.split("/").filter(Boolean)[0] || "all";
              return `
          <tr data-discipline="${disc}" data-search="${vp.id} ${vp.name} ${vp.route} ${vp.parentRoute} ${vp.uiType}">
            <td><span class="badge-gray">${disc}</span></td>
            <td><strong>${vp.name}</strong></td>
            <td class="mono" style="color: var(--text-muted);">${vp.parentRoute || "— (Root)"}</td>
            <td><span class="code-tag">${vp.uiType}</span></td>
            <td><a href="https://www.siavashakbari.ir${vp.route}" target="_blank" class="url-link mono">${vp.route} ↗</a></td>
          </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Projects / Gallery Collections Directory -->
    <div class="section-title">Gallery Collections &amp; Media Grouping (${projectsList.length} Total)</div>
    <div class="table-container">
      <table id="projectsTable">
        <thead>
          <tr>
            <th>Collection / Project</th>
            <th>Discipline</th>
            <th>Category</th>
            <th>Asset Count</th>
            <th>Live Gallery Route</th>
          </tr>
        </thead>
        <tbody>
          ${projectsList
            .map(
              (p) => `
          <tr data-discipline="${p.field}" data-search="${p.name} ${p.slug} ${p.field} ${p.category} ${p.route}">
            <td><strong>${p.name}</strong></td>
            <td><span class="badge-gray">${p.field}</span></td>
            <td>${p.category}</td>
            <td class="mono">${p.count} assets</td>
            <td><a href="https://www.siavashakbari.ir${p.route}" target="_blank" class="url-link mono">${p.route} ↗</a></td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Complete Media Assets Directory -->
    <div class="section-title">All Media Assets &amp; Live Detail Routes (${processedMedia.length} Total)</div>
    <div class="table-container">
      <table id="mediaTable">
        <thead>
          <tr>
            <th>Code</th>
            <th>Collection</th>
            <th>Dynamic Code &amp; Filename</th>
            <th>Discipline / Category</th>
            <th>Canonical Live Route</th>
            <th>Short Redirect</th>
          </tr>
        </thead>
        <tbody>
          ${processedMedia
            .map(
              (m) => `
          <tr data-discipline="${m.field}" data-search="${m.uniqueCode} ${m.dynamicCode} ${m.projectName} ${m.assignedRoute} ${m.code || ""}">
            <td><span class="code-tag">${m.uniqueCode}</span></td>
            <td><strong>${m.projectName}</strong></td>
            <td>
              <div class="mono" style="color: #FFF; font-weight: 500;">${m.dynamicCode}</div>
              <div class="mono" style="color: var(--text-muted); font-size: 11px;">${m.imageName}</div>
            </td>
            <td><span class="badge-gray">${m.field}</span><br><span style="font-size: 11px; color: var(--text-muted);">${m.category}</span></td>
            <td>
              <a href="${m.canonicalUrl}" target="_blank" class="url-link mono" style="color: var(--accent);">
                ${m.liveDetailPath} ↗
              </a>
            </td>
            <td>
              <a href="${m.shortUrl}" target="_blank" class="url-link mono" style="color: var(--text-muted);">
                ${m.shortRedirectPath} ↗
              </a>
            </td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <footer>
      Generated for Siavash Akbari Studio Architecture Documentation &copy; 2026. Sitemap, Vault &amp; Routes Synchronized.
    </footer>
  </div>

  <script>
    let currentDiscipline = 'all';

    function filterDiscipline(disc, btnEl) {
      currentDiscipline = disc;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      filterAllTables();
    }

    function filterAllTables() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      ['#vaultPagesTable tbody tr', '#projectsTable tbody tr', '#mediaTable tbody tr'].forEach(sel => {
        document.querySelectorAll(sel).forEach(r => {
          const disc = r.getAttribute('data-discipline');
          const text = (r.getAttribute('data-search') || '').toLowerCase();
          const discMatch = currentDiscipline === 'all' || disc === currentDiscipline;
          const textMatch = !q || text.includes(q);
          r.style.display = (discMatch && textMatch) ? '' : 'none';
        });
      });
    }
  </script>
</body>
</html>`;

// Write to root directory only (keep private local route map out of public/)
fs.writeFileSync(path.join(rootDir, "STUDIO_ARCHITECTURE_AND_ROUTE_MAP.html"), htmlContent, "utf8");

console.log(
  `Generated STUDIO_ARCHITECTURE_AND_ROUTE_MAP.html (${vaultPages.length} Vault pages, ${projectsList.length} collections, ${processedMedia.length} assets).`,
);
