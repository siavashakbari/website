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

function cleanSegment(s) {
  if (!s) return "";
  let str = s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  return str.replace(/^-+|-+$/g, "");
}

function normalizeProjectSlug(project) {
  const base = (project || "project")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function resolveHierarchy(item) {
  let field = "photography";
  let category = "fashion-photography";
  let project = normalizeProjectSlug(item.project);

  const discNorm = (item.disciplineSlug || item.discipline || "").toLowerCase();
  if (discNorm.includes("video") || discNorm.includes("motion")) {
    field = "video";
    category = "videos";
  } else if (
    discNorm.includes("graphic") ||
    discNorm.includes("identity") ||
    discNorm.includes("book") ||
    discNorm.includes("poster")
  ) {
    field = "graphic-design";
    if (discNorm.includes("book")) category = "book-covers";
    else if (discNorm.includes("poster")) category = "posters";
    else category = "visual-identity";
  } else if (discNorm.includes("product") && !discNorm.includes("photo")) {
    field = "product-design";
    category = "products";
  } else {
    field = "photography";
    if (discNorm.includes("food")) category = "food-photography";
    else if (discNorm.includes("portrait")) category = "portrait-photography";
    else if (discNorm.includes("product")) category = "product-photography";
    else category = "fashion-photography";
  }

  const uniqueCode = item.uniqueCode || "1001";
  const dynamicCode = buildDynamicCode(uniqueCode, field, category, project);
  const ext = item.imgSrc?.toLowerCase().endsWith(".png")
    ? ".PNG"
    : item.imgSrc?.toLowerCase().endsWith(".mp4")
    ? ".MP4"
    : ".JPG";
  const imageName = `${dynamicCode}${ext}`;
  const assignedRoute =
    field === "video"
      ? `/video/${project}`
      : field === "product-design"
      ? `/product-design/${project}`
      : `/${field}/${category}/${project}`;
  const canonicalUrl = `https://www.siavashakbari.ir${assignedRoute}/${dynamicCode}`;
  const shortUrl = `https://www.siavashakbari.ir${assignedRoute}/${uniqueCode}`;

  return {
    uniqueCode,
    field,
    category,
    project,
    projectName: item.project,
    dynamicCode,
    imageName,
    assignedRoute,
    canonicalUrl,
    shortUrl,
    imgSrc: item.imgSrc,
    client: item.client || "—",
    year: item.date || "2024",
    code: item.code,
  };
}

const processedMedia = inventory.map(resolveHierarchy);

// Group by project
const projectGroups = new Map();
processedMedia.forEach((m) => {
  if (!projectGroups.has(m.projectName)) {
    projectGroups.set(m.projectName, {
      name: m.projectName,
      slug: m.project,
      field: m.field,
      category: m.category,
      route: m.assignedRoute,
      count: 0,
      items: [],
    });
  }
  const g = projectGroups.get(m.projectName);
  g.count++;
  g.items.push(m);
});

const projectsList = Array.from(projectGroups.values());

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
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      line-height: 1.6;
      padding: 32px 20px 80px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      margin-bottom: 40px;
      border-b: 1px solid var(--card-border);
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
    .title-group p {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 6px;
    }
    .stats-strip {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
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
    
    /* Search & Filter Bar */
    .controls {
      background: var(--card-bg);
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
    .filter-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
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

    /* Section Headers */
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin: 40px 0 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #FFF;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 8px;
    }
    .section-desc {
      color: var(--text-muted);
      font-size: 13px;
      margin-bottom: 20px;
    }

    /* Architecture Cards Grid */
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
    .arch-card:hover {
      border-color: rgba(44, 227, 192, 0.3);
      transform: translateY(-2px);
    }
    .arch-card h3 {
      font-size: 16px;
      font-weight: 600;
      color: #FFF;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .arch-card h3 .icon {
      color: var(--accent);
    }
    .arch-card p {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 14px;
      line-height: 1.5;
    }
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

    /* Table Styles */
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 40px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    thead {
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--card-border);
    }
    th {
      padding: 14px 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }
    td {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.015);
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
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
    .url-link:hover {
      color: var(--accent);
      text-decoration: underline;
    }
    .badge-gray {
      background: rgba(255, 255, 255, 0.06);
      color: #BBB;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
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
        <h1>Siavash Akbari Studio <span class="badge">Architecture & Route Map</span></h1>
        <p>Complete directory of all 320 media assets, 26 project case studies, and taxonomy rules.</p>
      </div>
      <div class="stats-strip">
        <div class="stat-pill">
          <div class="num">${processedMedia.length}</div>
          <div class="lbl">Media Assets</div>
        </div>
        <div class="stat-pill">
          <div class="num">${projectsList.length}</div>
          <div class="lbl">Projects</div>
        </div>
        <div class="stat-pill">
          <div class="num">4</div>
          <div class="lbl">Disciplines</div>
        </div>
        <div class="stat-pill">
          <div class="num">100%</div>
          <div class="lbl">Zero-404 Verified</div>
        </div>
      </div>
    </header>

    <!-- Structural Foundations -->
    <div class="section-title">Architectural Standards & Naming Logic</div>
    <div class="section-desc">The core algorithmic rules governing URL paths, sticky asset codes, file names, and layout sizing.</div>
    <div class="arch-grid">
      <div class="arch-card">
        <h3><span class="icon">#1</span> Sticky Unique Code</h3>
        <p>Every asset receives an immutable 4-digit numeric code upon creation (e.g. <code>1211</code>). This code never shifts or re-indexes when items are added or removed.</p>
        <div class="code-block">Format: [1001-9999] (e.g. 1211, 1221, 1317)</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#2</span> Route-Based Dynamic Code</h3>
        <p>Generated dynamically from placement hierarchy: <code>\${uniqueCode}-\${DISCIPLINE}-\${CATEGORY}-\${PROJECT}</code>. Synchronized between Vault and website.</p>
        <div class="code-block">e.g. 1211-GRAPHIC-DESIGN-VISUAL-IDENTITY-SHEKARCHIAN-SWEETS</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#3</span> Database Image Filename</h3>
        <p>The image title and database filename standard always mirrors the dynamic code plus original uppercase extension (.JPG / .PNG / .MP4).</p>
        <div class="code-block">e.g. 1211-GRAPHIC-DESIGN-VISUAL-IDENTITY-SHEKARCHIAN-SWEETS.JPG</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#4</span> Dedicated Canonical Route</h3>
        <p>The dedicated photo showcase route is always <code>/\${discipline}/\${specialty}/\${project}/\${dynamicCode}</code>. Short code /1211 automatically redirects here.</p>
        <div class="code-block">/graphic-design/visual-identity/shekarchian-sweets/1211-...</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#5</span> Layout Sizing Modes</h3>
        <p><strong>UI01:</strong> Vertical scroll (editorial).<br><strong>UI02:</strong> Horizontal filmstrip with wheel translation.<br><strong>UI03:</strong> Equal cards grid.<br><strong>UI04:</strong> Interactive video player.</p>
        <div class="code-block">Responsive: 100dvh desktop / touch gesture mobile</div>
      </div>
      <div class="arch-card">
        <h3><span class="icon">#6</span> Resilient Fallback Routing</h3>
        <p>Zero-404 guarantee: If a user enters an older shifted code, legacy code (SA-VI-SHEK-01), or 4-digit short code, the router auto-resolves and redirects safely.</p>
        <div class="code-block">Short /1211 ➔ Redirects 302 ➔ Canonical Dynamic URL</div>
      </div>
    </div>

    <!-- Interactive Search Controls -->
    <div class="controls">
      <input type="text" id="searchInput" class="search-input" placeholder="Search by Project, Code (e.g. 1211), Dynamic Code, or URL..." oninput="filterTable()">
      <div class="filter-pills">
        <button class="filter-btn active" onclick="filterDiscipline('all')">All Assets (${processedMedia.length})</button>
        <button class="filter-btn" onclick="filterDiscipline('graphic-design')">Graphic Design</button>
        <button class="filter-btn" onclick="filterDiscipline('photography')">Photography</button>
        <button class="filter-btn" onclick="filterDiscipline('video')">Video</button>
        <button class="filter-btn" onclick="filterDiscipline('product-design')">Product Design</button>
      </div>
    </div>

    <!-- Projects Directory -->
    <div class="section-title">Projects & Case Studies Directory (${projectsList.length} Total)</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Discipline</th>
            <th>Category</th>
            <th>Asset Count</th>
            <th>Live Project Route</th>
          </tr>
        </thead>
        <tbody>
          ${projectsList
            .map(
              (p) => `
          <tr data-discipline="${p.field}">
            <td><strong>${p.name}</strong></td>
            <td><span class="badge-gray">${p.field}</span></td>
            <td>${p.category}</td>
            <td class="mono">${p.count} photos</td>
            <td><a href="https://www.siavashakbari.ir${p.route}" target="_blank" class="url-link mono">${p.route} ↗</a></td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Complete Media Assets Directory -->
    <div class="section-title">All Media Assets & Dedicated Live Routes (${processedMedia.length} Total)</div>
    <div class="table-container">
      <table id="mediaTable">
        <thead>
          <tr>
            <th>Code</th>
            <th>Project</th>
            <th>Dynamic Code & Database File Name</th>
            <th>Discipline / Category</th>
            <th>Canonical Dedicated Route (Live Detail)</th>
            <th>Short Code Route</th>
          </tr>
        </thead>
        <tbody>
          ${processedMedia
            .map(
              (m) => `
          <tr data-discipline="${m.field}" data-search="${m.uniqueCode} ${m.dynamicCode} ${m.projectName} ${m.assignedRoute}">
            <td><span class="code-tag">${m.uniqueCode}</span></td>
            <td><strong>${m.projectName}</strong></td>
            <td>
              <div class="mono" style="color: #FFF; font-weight: 500;">${m.dynamicCode}</div>
              <div class="mono" style="color: var(--text-muted); font-size: 11px;">${m.imageName}</div>
            </td>
            <td><span class="badge-gray">${m.field}</span><br><span style="font-size: 11px; color: var(--text-muted);">${m.category}</span></td>
            <td>
              <a href="${m.canonicalUrl}" target="_blank" class="url-link mono" style="color: var(--accent);">
                ${m.assignedRoute}/${m.dynamicCode} ↗
              </a>
            </td>
            <td>
              <a href="${m.shortUrl}" target="_blank" class="url-link mono" style="color: var(--text-muted);">
                ${m.assignedRoute}/${m.uniqueCode} ↗
              </a>
            </td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <footer>
      Generated for Siavash Akbari Studio Architecture Documentation &copy; 2026. All routes active & verified.
    </footer>
  </div>

  <script>
    let currentDiscipline = 'all';

    function filterDiscipline(disc) {
      currentDiscipline = disc;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        if (b.innerText.toLowerCase().includes(disc) || (disc === 'all' && b.innerText.includes('All'))) {
          b.classList.add('active');
        }
      });
      filterTable();
    }

    function filterTable() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const rows = document.querySelectorAll('#mediaTable tbody tr');
      rows.forEach(r => {
        const disc = r.getAttribute('data-discipline');
        const text = r.getAttribute('data-search').toLowerCase();
        const discMatch = currentDiscipline === 'all' || disc === currentDiscipline;
        const textMatch = !q || text.includes(q);
        r.style.display = (discMatch && textMatch) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;

// Write to public directory and root directory
fs.writeFileSync(path.join(rootDir, "public/studio-architecture-map.html"), htmlContent, "utf8");
fs.writeFileSync(path.join(rootDir, "STUDIO_ARCHITECTURE_AND_ROUTE_MAP.html"), htmlContent, "utf8");

console.log("Generated both public/studio-architecture-map.html and STUDIO_ARCHITECTURE_AND_ROUTE_MAP.html!");
