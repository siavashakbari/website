import os
import re
import json
from PIL import Image as PILImage
import xlsxwriter

temp_thumb_dir = os.path.join("scripts", ".thumbs_cache_full")
os.makedirs(temp_thumb_dir, exist_ok=True)

# Complete Portfolio Metadata Map
PHOTOGRAPHY_METADATA = {
    "fashion/atlasi": {
        "discipline": "Fashion Photography",
        "category_slug": "fashion-photography",
        "project": "Atlasi",
        "code_prefix": "SA-FASH-ATL",
        "year": "2024",
        "default_subdiscipline": "Textile & Silhouette",
        "desc": "A studio fashion story built around hand-woven textiles, sculptural silhouettes, and quiet gesture."
    },
    "fashion/sepidar": {
        "discipline": "Fashion Photography",
        "category_slug": "fashion-photography",
        "project": "Sepidar",
        "code_prefix": "SA-FASH-SEP",
        "year": "2020",
        "default_subdiscipline": "Outdoor / Natural Light",
        "desc": "A fashion series of presence and fabric in open air — light, landscape, and quiet posture."
    },
    "fashion/zeeen": {
        "discipline": "Fashion Photography",
        "category_slug": "fashion-photography",
        "project": "Zeeen",
        "code_prefix": "SA-FASH-ZEE",
        "year": "2019",
        "default_subdiscipline": "Heritage Textile",
        "desc": "A fashion story rooted in place — heritage textiles and the architecture of Persian light."
    },
    "food/gastronomie": {
        "discipline": "Food Photography",
        "category_slug": "food-photography",
        "project": "Gastronomie",
        "code_prefix": "SA-FOOD-GAS",
        "year": "2024",
        "default_subdiscipline": "Fine Dining Plating",
        "desc": "A fine-dining editorial exploring texture, shadow, and the ritual of the plate."
    },
    "food/cuisine": {
        "discipline": "Food Photography",
        "category_slug": "food-photography",
        "project": "Cuisine",
        "code_prefix": "SA-FOOD-CUI",
        "year": "2024",
        "default_subdiscipline": "Culinary Moments",
        "desc": "A culinary series of plated moments — steam, glaze, and the quiet geometry of the table."
    },
    "food/tasting": {
        "discipline": "Food Photography",
        "category_slug": "food-photography",
        "project": "Tasting",
        "code_prefix": "SA-FOOD-TAS",
        "year": "2024",
        "default_subdiscipline": "Tasting Menu & Details",
        "desc": "A tasting-menu story of color, glaze, and close-cropped appetite."
    },
    "portrait/calligraphy": {
        "discipline": "Portrait Photography",
        "category_slug": "portrait-photography",
        "project": "Calligraphy",
        "code_prefix": "SA-PORT-CAL",
        "year": "2024",
        "default_subdiscipline": "Artistic / Conceptual",
        "desc": "A studio portrait series pairing quiet gesture with Persian calligraphy — script as halo, script as light."
    },
    "portrait/photos": {
        "discipline": "Portrait Photography",
        "category_slug": "portrait-photography",
        "project": "Photos",
        "code_prefix": "SA-PORT-PHO",
        "year": "2024",
        "default_subdiscipline": "Studio Editorial",
        "desc": "A quiet studio portrait series — warm light, presence, and steady gaze."
    },
    "portrait/gaze": {
        "discipline": "Portrait Photography",
        "category_slug": "portrait-photography",
        "project": "Gaze",
        "code_prefix": "SA-PORT-GAZ",
        "year": "2024",
        "default_subdiscipline": "Close-up / Mood",
        "desc": "A single portrait held in soft light — presence without distraction."
    },
    "product/objects": {
        "discipline": "Product Photography",
        "category_slug": "product-photography",
        "project": "Objects",
        "code_prefix": "SA-PROD-OBJ",
        "year": "2024",
        "default_subdiscipline": "", # User will categorize: Furniture, Plants, Ceramics, Lighting
        "desc": "A product photography series of crafted objects — form, material, and careful studio light."
    },
}

GRAPHIC_METADATA = {
    "graphic-design/shekarchian": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Shekarchian Honey",
        "code_prefix": "SA-VI-SHEK",
        "year": "2024",
        "default_subdiscipline": "Packaging & Brand Identity",
        "desc": "Shekarchian Honey visual identity, label architecture, and packaging system."
    },
    "graphic-design/dodareh": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Dodareh",
        "code_prefix": "SA-VI-DOD",
        "year": "2024",
        "default_subdiscipline": "Spatial Branding & Signage",
        "desc": "Dodareh architectural identity, mark, and environmental typography."
    },
    "graphic-design/ahura-cctv": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Ahura CCTV",
        "code_prefix": "SA-VI-AHU",
        "year": "2023",
        "default_subdiscipline": "Corporate Tech Branding",
        "desc": "Ahura CCTV visual identity and geometric mark system for security solutions."
    },
    "graphic-design/femiq": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Femiq",
        "code_prefix": "SA-VI-FEM",
        "year": "2023",
        "default_subdiscipline": "Brand Identity & Packaging",
        "desc": "Femiq feminine care brand system, typography, and unboxing."
    },
    "graphic-design/polarity": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Polarity",
        "code_prefix": "SA-VI-POL",
        "year": "2022",
        "default_subdiscipline": "Wordmark & System",
        "desc": "Polarity brand mark and typographic voice."
    },
    "graphic-design/echo-supplements": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Echo Supplements",
        "code_prefix": "SA-VI-ECH",
        "year": "2024",
        "default_subdiscipline": "Nutrition Packaging & System",
        "desc": "Echo Supplements athletic packaging, typography, and energetic color hierarchy."
    },
    "graphic-design/goats": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Goats Coffee",
        "code_prefix": "SA-VI-GOA",
        "year": "2024",
        "default_subdiscipline": "Cafe Identity & Cups",
        "desc": "Goats Coffee shop identity, cup packaging, and specialty merchandise."
    },
    "graphic-design/nozad-publication": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Nozad Publication",
        "code_prefix": "SA-VI-NOZ",
        "year": "2022",
        "default_subdiscipline": "Publishing House Identity",
        "desc": "Nozad Publication brand system, colophon mark, and book series guidelines."
    },
    "graphic-design/on-swipe": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "On-Swipe",
        "code_prefix": "SA-VI-ONS",
        "year": "2023",
        "default_subdiscipline": "Digital Platform Identity",
        "desc": "On-Swipe digital platform mark and responsive design system."
    },
    "graphic-design/zen": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Zen Studio Products",
        "code_prefix": "SA-VI-ZEN",
        "year": "2025",
        "default_subdiscipline": "Architectural Identity",
        "desc": "Zen Studio Products architectural wordmark with stencil geometry and industrial tone."
    },
    "graphic-design/artemis": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Artemis",
        "code_prefix": "SA-VI-ART",
        "year": "2019",
        "default_subdiscipline": "Jar Packaging & Identity",
        "desc": "Artemis brand system built around a mark, jar packaging, and patterned motion language."
    },
    "graphic-design/cichon": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Cichon",
        "code_prefix": "SA-VI-CIC",
        "year": "2024",
        "default_subdiscipline": "Typographic Brand System",
        "desc": "Cichon refined brand system with typographic presence across print and packaging."
    },
    "graphic-design/farshid-rahimi": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Farshid Rahimi",
        "code_prefix": "SA-VI-FAR",
        "year": "2019",
        "default_subdiscipline": "Personal Brand & Stationery",
        "desc": "Farshid Rahimi personal brand with logo mark, card system, and supporting pattern."
    },
    "graphic-design/maanaar": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Maanaar",
        "code_prefix": "SA-VI-MAA",
        "year": "2025",
        "default_subdiscipline": "Minimalist Brand Identity",
        "desc": "Maanaar quiet, considered brand system with a focused mark and application set."
    },
    "graphic-design/mamrezz": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Mamrezz",
        "code_prefix": "SA-VI-MAM",
        "year": "2023",
        "default_subdiscipline": "Bold Graphic Mark",
        "desc": "Mamrezz bold mark-led system with a compact set of brand applications."
    },
    "graphic-design/snow-snack": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "Snow Snack",
        "code_prefix": "SA-VI-SNO",
        "year": "2020",
        "default_subdiscipline": "Ice Cream Packaging & Pattern",
        "desc": "Snow Snack ice cream packaging across flavor lines, bottles, and playful pattern."
    },
    "graphic-design/zeee-products": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "ZEEE Products",
        "code_prefix": "SA-VI-ZEE",
        "year": "2025",
        "default_subdiscipline": "Industrial Product Branding",
        "desc": "ZEEE Products mark and type system with orange accents for industrial products."
    },
    "graphic-design/awli": {
        "discipline": "Visual Identity",
        "category_slug": "visual-identity",
        "project": "AWLI",
        "code_prefix": "SA-VI-AWL",
        "year": "2021",
        "default_subdiscipline": "Gamertag & Motion Identity",
        "desc": "AWLI gamertag mark system with focused application set and motion."
    },
    "graphic-design/book-covers": {
        "discipline": "Book Covers",
        "category_slug": "book-covers",
        "project": "Book Covers",
        "code_prefix": "SA-DES-BOK",
        "year": "2025",
        "default_subdiscipline": "Editorial Typography & Cover",
        "desc": "Book cover designs for Persian titles — script, image, and restraint."
    },
    "graphic-design/posters": {
        "discipline": "Posters",
        "category_slug": "posters",
        "project": "Posters",
        "code_prefix": "SA-DES-POS",
        "year": "2025",
        "default_subdiscipline": "Cultural & Exhibition Poster",
        "desc": "Poster designs for events, culture, and campaigns — bold composition and type."
    }
}

def extract_number(filename):
    match = re.search(r'(\d+)', filename)
    return int(match.group(1)) if match else 999

def create_200px_thumb(src_path, dest_path):
    with PILImage.open(src_path) as img:
        img.thumbnail((200, 200), PILImage.Resampling.LANCZOS)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(dest_path, "JPEG", quality=88, optimize=True)
    return dest_path

def build_excel_sheet(wb, ws, metadata_map, collector):
    header_fmt = wb.add_format({
        'bold': True,
        'bg_color': '#0F0F0F',
        'font_color': '#3FEBCC',
        'font_name': 'Segoe UI',
        'font_size': 11,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': True,
        'border': 1,
        'border_color': '#444444'
    })

    center_fmt = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'align': 'center',
        'valign': 'vcenter',
        'border': 1,
        'border_color': '#E0E0E0'
    })

    code_fmt = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'bold': True,
        'font_color': '#007A66',
        'align': 'center',
        'valign': 'vcenter',
        'border': 1,
        'border_color': '#E0E0E0'
    })

    left_fmt = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'align': 'left',
        'valign': 'vcenter',
        'text_wrap': True,
        'border': 1,
        'border_color': '#E0E0E0'
    })

    edit_fmt = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'align': 'left',
        'valign': 'vcenter',
        'text_wrap': True,
        'bg_color': '#FFFFE0', # highlight editable
        'border': 1,
        'border_color': '#E0E0E0'
    })

    headers = [
        ("A", "Photo Code (Generated)", 24, center_fmt),
        ("B", "Thumbnail (200px × 200px)", 32, center_fmt),
        ("C", "Discipline", 22, center_fmt),
        ("D", "Project Name", 20, center_fmt),
        ("E", "Sub-Discipline / Specialty (e.g. Furniture, Plants)", 30, edit_fmt),
        ("F", "Client (Fill here)", 22, edit_fmt),
        ("G", "Date / Year", 15, edit_fmt),
        ("H", "Model(s) / Subject (Fill here)", 25, edit_fmt),
        ("I", "Makeup Artist (Fill here)", 22, edit_fmt),
        ("J", "Photo / Design Assistant", 24, edit_fmt),
        ("K", "Stylist / Costume / Art Dir", 22, edit_fmt),
        ("L", "Location / Studio", 20, edit_fmt),
        ("M", "SEO Keywords / Tags", 32, edit_fmt),
        ("N", "Current Filename", 28, left_fmt),
        ("O", "Proposed New Filename", 30, left_fmt),
        ("P", "Asset Relative Path", 40, left_fmt)
    ]

    ws.set_row(0, 36)
    for col_idx, (col_letter, col_title, col_width, _) in enumerate(headers):
        ws.write(0, col_idx, col_title, header_fmt)
        ws.set_column(col_idx, col_idx, col_width)

    ws.freeze_panes(1, 0)

    current_row = 1

    for folder_rel, meta in metadata_map.items():
        folder_path = os.path.join("src", "assets", folder_rel.replace("/", os.sep))
        if not os.path.exists(folder_path):
            continue

        files = [
            f for f in os.listdir(folder_path)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')) and not f.endswith('-thumb.webp')
        ]
        files.sort(key=extract_number)

        for idx, filename in enumerate(files, start=1):
            full_path = os.path.join(folder_path, filename)
            photo_code = f"{meta['code_prefix']}-{idx:02d}"
            ext = os.path.splitext(filename)[1].lower()
            proposed_filename = f"{photo_code.lower()}{ext}"

            # Make 200px thumbnail
            thumb_filename = f"thumb_{photo_code}.jpg"
            thumb_path = os.path.join(temp_thumb_dir, thumb_filename)
            try:
                create_200px_thumb(full_path, thumb_path)
                has_thumb = True
            except Exception as e:
                has_thumb = False

            ws.set_row(current_row, 160)

            ws.write(current_row, 0, photo_code, code_fmt)
            ws.write(current_row, 1, "", center_fmt)
            ws.write(current_row, 2, meta["discipline"], center_fmt)
            ws.write(current_row, 3, meta["project"], center_fmt)
            ws.write(current_row, 4, meta.get("default_subdiscipline", ""), edit_fmt) # Sub-Discipline
            ws.write(current_row, 5, "", edit_fmt) # Client
            ws.write(current_row, 6, meta["year"], edit_fmt) # Date
            ws.write(current_row, 7, "", edit_fmt) # Model / Subject
            ws.write(current_row, 8, "", edit_fmt) # Makeup
            ws.write(current_row, 9, "", edit_fmt) # Assistant
            ws.write(current_row, 10, "", edit_fmt) # Stylist / Art Dir
            ws.write(current_row, 11, "Studio / Esfahan", edit_fmt) # Location
            ws.write(current_row, 12, f"{meta['project']}, {meta['discipline']}, Siavash Akbari", edit_fmt) # SEO Tags
            ws.write(current_row, 13, filename, left_fmt)
            ws.write(current_row, 14, proposed_filename, left_fmt)
            ws.write(current_row, 15, full_path.replace("\\", "/"), left_fmt)

            if has_thumb and os.path.exists(thumb_path):
                ws.insert_image(current_row, 1, thumb_path, {
                    'x_offset': 10,
                    'y_offset': 7,
                    'object_position': 1
                })

            collector.append({
                "code": photo_code,
                "discipline": meta["discipline"],
                "category_slug": meta["category_slug"],
                "project": meta["project"],
                "subdiscipline": meta.get("default_subdiscipline", ""),
                "filename": filename,
                "proposed_filename": proposed_filename,
                "year": meta["year"],
                "desc": meta["desc"],
                "rel_path": full_path.replace("\\", "/")
            })

            current_row += 1

def build_interactive_html(items, output_html):
    disciplines = sorted(list(set(i["discipline"] for i in items)))
    projects = sorted(list(set(i["project"] for i in items)))

    html_content = f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Siavash Akbari — Complete Portfolio Visual Inventory & Metadata Studio</title>
  <style>
    :root {{
      --bg: #0F0F0F;
      --card-bg: #141414;
      --card-hover: #1A1A1A;
      --text: #EFEFEF;
      --text-muted: #8E8D8D;
      --accent: #3FEBCC;
      --accent-dim: rgba(63, 235, 204, 0.12);
      --border: #242424;
      --border-focus: #3FEBCC;
      --chip-bg: #1F1F1F;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      padding: 24px 32px 100px;
    }}
    header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 16px;
    }}
    h1 {{ font-size: 26px; font-weight: 700; color: #FFF; letter-spacing: -0.02em; }}
    .subtitle {{ color: var(--text-muted); font-size: 14px; margin-top: 6px; line-height: 1.5; max-width: 800px; }}
    .actions {{ display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }}
    button.btn-primary {{
      background: var(--accent);
      color: #0F0F0F;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    button.btn-primary:hover {{ filter: brightness(1.12); transform: translateY(-1px); }}
    button.btn-secondary {{
      background: #1F1F1F;
      color: #FFF;
      border: 1px solid var(--border);
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }}
    button.btn-secondary:hover {{ border-color: var(--accent); }}
    .stats-bar {{
      display: flex;
      gap: 20px;
      align-items: center;
      background: #141414;
      padding: 12px 18px;
      border-radius: 10px;
      border: 1px solid var(--border);
      margin-bottom: 24px;
      font-size: 13px;
      color: var(--text-muted);
      flex-wrap: wrap;
    }}
    .stats-bar strong {{ color: var(--accent); font-weight: 600; }}
    .auto-save-pill {{
      margin-left: auto;
      background: var(--accent-dim);
      color: var(--accent);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }}
    .filter-panel {{
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }}
    input.search-box, select {{
      background: #181818;
      border: 1px solid var(--border);
      color: #FFF;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }}
    input.search-box:focus, select:focus {{ border-color: var(--border-focus); }}
    .grid {{
      display: flex;
      flex-direction: column;
      gap: 18px;
    }}
    .card {{
      display: flex;
      gap: 24px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px;
      align-items: flex-start;
      transition: border-color 0.2s, background 0.2s;
    }}
    .card:hover {{ border-color: rgba(63, 235, 204, 0.4); background: var(--card-hover); }}
    .img-wrap {{
      width: 200px;
      height: 200px;
      flex-shrink: 0;
      border-radius: 10px;
      overflow: hidden;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #222;
      position: relative;
    }}
    .img-wrap img {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }}
    .card:hover .img-wrap img {{ transform: scale(1.05); }}
    .details {{
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px 16px;
    }}
    .field {{
      display: flex;
      flex-direction: column;
      gap: 5px;
    }}
    .field.full-span {{
      grid-column: 1 / -1;
    }}
    label {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
      font-weight: 600;
      display: flex;
      justify-content: space-between;
    }}
    .subdiscipline-label {{
      color: #FFD166;
    }}
    .field input, .field textarea {{
      background: #1C1C1C;
      border: 1px solid #303030;
      color: #FFF;
      padding: 9px 12px;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }}
    .field input:focus, .field textarea:focus {{
      border-color: var(--accent);
      background: #222;
    }}
    .input-subdiscipline {{
      border-color: rgba(255, 209, 102, 0.4) !important;
    }}
    .input-subdiscipline:focus {{
      border-color: #FFD166 !important;
    }}
    .suggestions {{
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 4px;
    }}
    .chip {{
      font-size: 10px;
      background: #222;
      color: #BBB;
      border: 1px solid #333;
      padding: 2px 7px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .chip:hover {{
      background: #FFD166;
      color: #000;
      border-color: #FFD166;
    }}
    .badge {{
      display: inline-block;
      padding: 3px 8px;
      background: var(--accent-dim);
      color: var(--accent);
      border-radius: 4px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.03em;
    }}
    .badge-sub {{
      background: rgba(255, 209, 102, 0.12);
      color: #FFD166;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 500;
      margin-left: 6px;
    }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Siavash Akbari — Complete Portfolio Studio Inventory</h1>
      <p class="subtitle">
        Every visual asset across Photography (Fashion, Food, Portrait, Product/Objects) and Graphic Design (Visual Identity, Book Covers, Posters). All rendered at 200px × 200px with dedicated <strong>Sub-Discipline / Specialty</strong> tagging for SEO.
      </p>
    </div>
    <div class="actions">
      <button class="btn-primary" onclick="exportDataJSON()">💾 Export JSON</button>
      <button class="btn-primary" style="background:#5eead4;" onclick="exportDataCSV()">📊 Export CSV</button>
      <button class="btn-secondary" onclick="resetToSaved()">🔄 Reload Saved</button>
    </div>
  </header>

  <div class="stats-bar">
    <div>Total Assets: <strong>{len(items)} items</strong></div>
    <div>Showing: <strong id="showingCount">{len(items)}</strong></div>
    <div class="auto-save-pill" id="saveStatus">✓ Auto-saved to browser storage</div>
  </div>

  <div class="filter-panel">
    <input type="text" id="searchInput" class="search-box" placeholder="Search by model, project, sub-discipline, code..." oninput="filterCards()" style="min-width: 320px;">
    
    <select id="disciplineFilter" onchange="filterCards()">
      <option value="">All Disciplines ({len(items)})</option>
"""
    for d in disciplines:
        count = sum(1 for i in items if i["discipline"] == d)
        html_content += f'      <option value="{d}">{d} ({count})</option>\n'

    html_content += """    </select>

    <select id="projectFilter" onchange="filterCards()">
      <option value="">All Projects</option>
"""
    for p in projects:
        count = sum(1 for i in items if i["project"] == p)
        html_content += f'      <option value="{p}">{p} ({count})</option>\n'

    html_content += """    </select>
  </div>

  <div class="grid" id="photoGrid">
"""

    for it in items:
        proj = it["project"]
        disc = it["discipline"]
        code = it["code"]
        path = it["rel_path"]
        sub = it.get("subdiscipline", "")

        # Quick chips based on discipline
        if "Product" in disc:
            chips = ["Furniture", "Plants & Nature", "Ceramics & Pottery", "Lighting & Lamps", "Tableware", "Sculpture", "Textiles"]
        elif "Fashion" in disc:
            chips = ["Textiles & Fabric", "Silhouette & Posture", "Lookbook", "Campaign", "Accessories", "Streetwear"]
        elif "Food" in disc:
            chips = ["Fine Dining", "Plating & Geometry", "Beverage & Cocktail", "Pastry & Bakery", "Coffee", "Texture & Steam"]
        elif "Portrait" in disc:
            chips = ["Calligraphy & Art", "Studio Editorial", "Natural Light", "Close-up Gaze", "Expression"]
        elif "Visual Identity" in disc:
            chips = ["Packaging & Label", "Wordmark & Logo", "Signage & Spatial", "Stationery", "Motion Identity", "Pattern System"]
        elif "Book Covers" in disc:
            chips = ["Persian Typography", "Illustration Cover", "Minimalist Title", "Fiction", "Philosophy"]
        else:
            chips = ["Cultural Event", "Exhibition Poster", "Typographic Poster", "Social Campaign"]

        chips_html = "".join([f'<span class="chip" onclick="setSubdiscipline(this, \'{c}\')">{c}</span>' for c in chips])

        html_content += f"""
    <div class="card" data-code="{code}" data-project="{proj}" data-discipline="{disc}">
      <div class="img-wrap">
        <img src="{path}" alt="{code}" loading="lazy">
      </div>
      <div class="details">
        <div class="field">
          <label>Asset Code & Project</label>
          <div>
            <span class="badge">{code}</span>
            <span style="font-size: 13px; font-weight: 600; margin-left: 8px; color: #FFF;">{proj}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">{disc}</div>
        </div>

        <div class="field" style="grid-column: span 2;">
          <label class="subdiscipline-label">Sub-Discipline / Specific Specialty (e.g. Furniture, Plants)</label>
          <input type="text" class="input-subdiscipline" value="{sub}" placeholder="e.g. Furniture, Plants, Ceramics, Packaging" oninput="triggerAutoSave()">
          <div class="suggestions">
            <span style="font-size: 10px; color: #666; margin-right: 2px;">Quick tags:</span>
            {chips_html}
          </div>
        </div>

        <div class="field">
          <label>Model(s) / Main Subject</label>
          <input type="text" class="input-model" placeholder="Model name or key subject" oninput="triggerAutoSave()">
        </div>

        <div class="field">
          <label>Client / Brand</label>
          <input type="text" class="input-client" placeholder="Client or studio" oninput="triggerAutoSave()">
        </div>

        <div class="field">
          <label>Makeup Artist (MUA)</label>
          <input type="text" class="input-mua" placeholder="MUA Name (if applicable)" oninput="triggerAutoSave()">
        </div>

        <div class="field">
          <label>Assistant (Photo / Design)</label>
          <input type="text" class="input-assistant" placeholder="Assistant Name" oninput="triggerAutoSave()">
        </div>

        <div class="field">
          <label>Date / Year</label>
          <input type="text" class="input-date" value="{it['year']}" oninput="triggerAutoSave()">
        </div>

        <div class="field">
          <label>SEO Keywords / Entity Tags</label>
          <input type="text" class="input-keywords" value="{proj}, {disc}, Siavash Akbari" oninput="triggerAutoSave()">
        </div>
      </div>
    </div>
"""

    html_content += """
  </div>

  <script>
    const STORAGE_KEY = "siavash_portfolio_inventory_v3";

    function setSubdiscipline(el, val) {
      const input = el.closest('.field').querySelector('.input-subdiscipline');
      input.value = val;
      triggerAutoSave();
    }

    function filterCards() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const disc = document.getElementById('disciplineFilter').value;
      const proj = document.getElementById('projectFilter').value;
      const cards = document.querySelectorAll('.card');
      let visible = 0;

      cards.forEach(card => {
        const text = card.innerText.toLowerCase() + " " + Array.from(card.querySelectorAll('input')).map(i => i.value.toLowerCase()).join(" ");
        const cardProj = card.getAttribute('data-project');
        const cardDisc = card.getAttribute('data-discipline');
        const matchesQuery = !q || text.includes(q);
        const matchesDisc = !disc || cardDisc === disc;
        const matchesProj = !proj || cardProj === proj;

        if (matchesQuery && matchesDisc && matchesProj) {
          card.style.display = 'flex';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      document.getElementById('showingCount').innerText = visible;
    }

    let saveTimer;
    function triggerAutoSave() {
      clearTimeout(saveTimer);
      document.getElementById('saveStatus').innerText = "Saving...";
      saveTimer = setTimeout(() => {
        saveToLocalStorage();
        document.getElementById('saveStatus').innerText = "✓ Auto-saved to browser storage";
      }, 400);
    }

    function collectData() {
      const cards = document.querySelectorAll('.card');
      const results = {};
      cards.forEach(card => {
        const code = card.getAttribute('data-code');
        results[code] = {
          code: code,
          project: card.getAttribute('data-project'),
          discipline: card.getAttribute('data-discipline'),
          subdiscipline: card.querySelector('.input-subdiscipline')?.value.trim() || "",
          model: card.querySelector('.input-model')?.value.trim() || "",
          client: card.querySelector('.input-client')?.value.trim() || "",
          makeupArtist: card.querySelector('.input-mua')?.value.trim() || "",
          assistant: card.querySelector('.input-assistant')?.value.trim() || "",
          date: card.querySelector('.input-date')?.value.trim() || "",
          keywords: card.querySelector('.input-keywords')?.value.trim() || "",
        };
      });
      return results;
    }

    function saveToLocalStorage() {
      const data = collectData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function loadFromLocalStorage() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        document.querySelectorAll('.card').forEach(card => {
          const code = card.getAttribute('data-code');
          if (data[code]) {
            const item = data[code];
            if (item.subdiscipline) card.querySelector('.input-subdiscipline').value = item.subdiscipline;
            if (item.model) card.querySelector('.input-model').value = item.model;
            if (item.client) card.querySelector('.input-client').value = item.client;
            if (item.makeupArtist) card.querySelector('.input-mua').value = item.makeupArtist;
            if (item.assistant) card.querySelector('.input-assistant').value = item.assistant;
            if (item.date) card.querySelector('.input-date').value = item.date;
            if (item.keywords) card.querySelector('.input-keywords').value = item.keywords;
          }
        });
      } catch (e) {
        console.error("Failed to load local storage:", e);
      }
    }

    function resetToSaved() {
      loadFromLocalStorage();
      alert("Reloaded saved values from local storage!");
    }

    function exportDataJSON() {
      const data = Object.values(collectData());
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'portfolio_metadata_siavash_akbari.json';
      a.click();
    }

    function exportDataCSV() {
      const data = Object.values(collectData());
      if (!data.length) return;
      const headers = ["code", "discipline", "project", "subdiscipline", "model", "client", "makeupArtist", "assistant", "date", "keywords"];
      const rows = [headers.join(",")];
      data.forEach(d => {
        const row = headers.map(h => {
          const val = (d[h] || "").replace(/"/g, '""');
          return `"${val}"`;
        });
        rows.push(row.join(","));
      });
      const blob = new Blob(["\uFEFF" + rows.join("\\n")], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'portfolio_metadata_siavash_akbari.csv';
      a.click();
    }

    window.addEventListener('DOMContentLoaded', loadFromLocalStorage);
  </script>
</body>
</html>
"""
    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html_content)

def main():
    all_photo_items = []
    all_graphic_items = []

    out_excel = "PHOTO_INVENTORY_SIAVASH_AKBARI.xlsx"
    wb = xlsxwriter.Workbook(out_excel, {'constant_memory': False})

    ws_photo = wb.add_worksheet("Photography Portfolio")
    build_excel_sheet(wb, ws_photo, PHOTOGRAPHY_METADATA, all_photo_items)

    ws_graphic = wb.add_worksheet("Graphic Design & Branding")
    build_excel_sheet(wb, ws_graphic, GRAPHIC_METADATA, all_graphic_items)

    wb.close()
    print(f"XlsxWriter generated 100% compliant workbook: {out_excel}")

    all_items = all_photo_items + all_graphic_items
    html_file = "PHOTO_INVENTORY_VIEWER.html"
    build_interactive_html(all_items, html_file)
    print(f"Interactive browser viewer generated with {len(all_items)} items: {html_file}")

if __name__ == "__main__":
    main()
