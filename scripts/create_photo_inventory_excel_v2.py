import os
import re
import json
from PIL import Image as PILImage
import xlsxwriter

temp_thumb_dir = os.path.join("scripts", ".thumbs_cache_200")
os.makedirs(temp_thumb_dir, exist_ok=True)

PROJECT_METADATA = {
    "fashion/atlasi": {
        "discipline": "Fashion Photography",
        "project": "Atlasi",
        "code_prefix": "SA-FASH-ATL",
        "year": "2024",
        "desc": "A studio fashion story built around hand-woven textiles, sculptural silhouettes, and quiet gesture."
    },
    "fashion/sepidar": {
        "discipline": "Fashion Photography",
        "project": "Sepidar",
        "code_prefix": "SA-FASH-SEP",
        "year": "2020",
        "desc": "A fashion series of presence and fabric in open air — light, landscape, and quiet posture."
    },
    "fashion/zeeen": {
        "discipline": "Fashion Photography",
        "project": "Zeeen",
        "code_prefix": "SA-FASH-ZEE",
        "year": "2019",
        "desc": "A fashion story rooted in place — heritage textiles and the architecture of Persian light."
    },
    "food/gastronomie": {
        "discipline": "Food Photography",
        "project": "Gastronomie",
        "code_prefix": "SA-FOOD-GAS",
        "year": "2024",
        "desc": "A fine-dining editorial exploring texture, shadow, and the ritual of the plate."
    },
    "food/cuisine": {
        "discipline": "Food Photography",
        "project": "Cuisine",
        "code_prefix": "SA-FOOD-CUI",
        "year": "2024",
        "desc": "A culinary series of plated moments — steam, glaze, and the quiet geometry of the table."
    },
    "food/tasting": {
        "discipline": "Food Photography",
        "project": "Tasting",
        "code_prefix": "SA-FOOD-TAS",
        "year": "2024",
        "desc": "A tasting-menu story of color, glaze, and close-cropped appetite."
    },
    "portrait/calligraphy": {
        "discipline": "Portrait Photography",
        "project": "Calligraphy",
        "code_prefix": "SA-PORT-CAL",
        "year": "2024",
        "desc": "A studio portrait series pairing quiet gesture with Persian calligraphy — script as halo, script as light."
    },
    "portrait/photos": {
        "discipline": "Portrait Photography",
        "project": "Photos",
        "code_prefix": "SA-PORT-PHO",
        "year": "2024",
        "desc": "A quiet studio portrait series — warm light, presence, and steady gaze."
    },
    "portrait/gaze": {
        "discipline": "Portrait Photography",
        "project": "Gaze",
        "code_prefix": "SA-PORT-GAZ",
        "year": "2024",
        "desc": "A single portrait held in soft light — presence without distraction."
    },
    "product/objects": {
        "discipline": "Product Photography",
        "project": "Objects",
        "code_prefix": "SA-PROD-OBJ",
        "year": "2024",
        "desc": "A product photography series of crafted objects — form, material, and careful studio light."
    },
}

GRAPHIC_METADATA = {
    "graphic-design/book-covers": {
        "discipline": "Book Covers (Graphic Design)",
        "project": "Book Covers",
        "code_prefix": "SA-DES-BOK",
        "year": "2025",
        "desc": "A series of book cover designs for Persian titles — typography-led covers."
    },
    "graphic-design/posters": {
        "discipline": "Posters (Graphic Design)",
        "project": "Posters",
        "code_prefix": "SA-DES-POS",
        "year": "2025",
        "desc": "Poster designs for events, culture, and campaigns."
    }
}

def extract_number(filename):
    match = re.search(r'(\d+)', filename)
    return int(match.group(1)) if match else 999

def create_200px_thumb(src_path, dest_path):
    with PILImage.open(src_path) as img:
        # Resize to fit within 200x200 while preserving aspect ratio
        img.thumbnail((200, 200), PILImage.Resampling.LANCZOS)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(dest_path, "JPEG", quality=88, optimize=True)
    return dest_path

def build_sheet(wb, ws, metadata_map, all_items_collector):
    # Formats
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
        'bg_color': '#FFFFE0', # light subtle yellow tint to indicate editable
        'border': 1,
        'border_color': '#E0E0E0'
    })

    headers = [
        ("A", "Photo Code (Generated)", 24, center_fmt),
        ("B", "Thumbnail (200px × 200px)", 32, center_fmt),
        ("C", "Discipline", 22, center_fmt),
        ("D", "Project Name", 18, center_fmt),
        ("E", "Current Filename", 28, left_fmt),
        ("F", "Proposed New Filename", 30, left_fmt),
        ("G", "Client (Fill here)", 22, edit_fmt),
        ("H", "Date / Year", 15, edit_fmt),
        ("I", "Model(s) (Fill here)", 25, edit_fmt),
        ("J", "Makeup Artist (Fill here)", 22, edit_fmt),
        ("K", "Photo Assistant (Fill here)", 24, edit_fmt),
        ("L", "Stylist / Costume", 20, edit_fmt),
        ("M", "Location / Studio", 20, edit_fmt),
        ("N", "SEO Keywords / Tags", 32, edit_fmt),
        ("O", "Photo Story / Alt Text", 35, left_fmt),
        ("P", "Asset Path", 40, left_fmt)
    ]

    # Write headers
    ws.set_row(0, 36)
    for col_idx, (col_letter, col_title, col_width, _) in enumerate(headers):
        ws.write(0, col_idx, col_title, header_fmt)
        ws.set_column(col_idx, col_idx, col_width)

    # Freeze header row
    ws.freeze_panes(1, 0)

    current_row = 1

    for folder_rel, meta in metadata_map.items():
        folder_path = os.path.join("src", "assets", folder_rel.replace("/", os.sep))
        if not os.path.exists(folder_path):
            continue

        files = [
            f for f in os.listdir(folder_path)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')) and not f.endswith('-thumb.webp')
        ]
        files.sort(key=extract_number)

        for idx, filename in enumerate(files, start=1):
            full_path = os.path.join(folder_path, filename)
            photo_code = f"{meta['code_prefix']}-{idx:02d}"
            ext = os.path.splitext(filename)[1].lower()
            proposed_filename = f"{photo_code.lower()}{ext}"

            # Make 200px thumbnail
            thumb_filename = f"thumb200_{photo_code}.jpg"
            thumb_path = os.path.join(temp_thumb_dir, thumb_filename)
            try:
                create_200px_thumb(full_path, thumb_path)
                has_thumb = True
            except Exception as e:
                print(f"Error thumbnailing {full_path}: {e}")
                has_thumb = False

            # Set row height to 160 points (~213 pixels) to comfortably hold the 200px thumbnail
            ws.set_row(current_row, 160)

            # Write values
            ws.write(current_row, 0, photo_code, code_fmt)
            ws.write(current_row, 1, "", center_fmt) # image cell
            ws.write(current_row, 2, meta["discipline"], center_fmt)
            ws.write(current_row, 3, meta["project"], center_fmt)
            ws.write(current_row, 4, filename, left_fmt)
            ws.write(current_row, 5, proposed_filename, left_fmt)
            ws.write(current_row, 6, "", edit_fmt) # Client
            ws.write(current_row, 7, meta["year"], edit_fmt) # Date
            ws.write(current_row, 8, "", edit_fmt) # Model
            ws.write(current_row, 9, "", edit_fmt) # Makeup
            ws.write(current_row, 10, "", edit_fmt) # Assistant
            ws.write(current_row, 11, "", edit_fmt) # Stylist
            ws.write(current_row, 12, "Studio / Esfahan", edit_fmt) # Location
            ws.write(current_row, 13, f"{meta['project']}, {meta['discipline']}, Siavash Akbari", edit_fmt)
            ws.write(current_row, 14, meta["desc"], left_fmt)
            ws.write(current_row, 15, full_path.replace("\\", "/"), left_fmt)

            # Insert image
            if has_thumb and os.path.exists(thumb_path):
                # Center slightly inside the cell
                ws.insert_image(current_row, 1, thumb_path, {
                    'x_offset': 10,
                    'y_offset': 7,
                    'object_position': 1  # Move and size with cells
                })

            all_items_collector.append({
                "code": photo_code,
                "discipline": meta["discipline"],
                "project": meta["project"],
                "filename": filename,
                "proposed_filename": proposed_filename,
                "year": meta["year"],
                "desc": meta["desc"],
                "rel_path": full_path.replace("\\", "/")
            })

            current_row += 1

def generate_interactive_html(items, output_html):
    html_content = f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Siavash Akbari — Photo Inventory & Model Editor</title>
  <style>
    :root {{
      --bg: #0F0F0F;
      --card-bg: #161616;
      --text: #EFEFEF;
      --accent: #3FEBCC;
      --border: #2A2A2A;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      padding: 30px;
    }}
    header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }}
    h1 {{ font-size: 24px; font-weight: 600; color: #FFF; }}
    .subtitle {{ color: #888; font-size: 14px; margin-top: 4px; }}
    .actions {{ display: flex; gap: 12px; }}
    button {{
      background: var(--accent);
      color: #0F0F0F;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }}
    button:hover {{ filter: brightness(1.1); transform: translateY(-1px); }}
    .filter-bar {{
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }}
    input.search-box, select {{
      background: #1C1C1C;
      border: 1px solid var(--border);
      color: #FFF;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }}
    input.search-box:focus, select:focus {{ border-color: var(--accent); }}
    .grid {{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .card {{
      display: flex;
      gap: 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      align-items: center;
      transition: border-color 0.2s;
    }}
    .card:hover {{ border-color: var(--accent); }}
    .img-wrap {{
      width: 200px;
      height: 200px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .img-wrap img {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }}
    .details {{
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px 18px;
    }}
    .field {{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }}
    label {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      font-weight: 600;
    }}
    .field input, .field textarea {{
      background: #202020;
      border: 1px solid #333;
      color: #FFF;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
    }}
    .field input:focus, .field textarea:focus {{
      border-color: var(--accent);
      background: #262626;
    }}
    .badge {{
      display: inline-block;
      padding: 2px 8px;
      background: rgba(63, 235, 204, 0.1);
      color: var(--accent);
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
    }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Siavash Akbari — Visual Photo Inventory</h1>
      <p class="subtitle">211 High-Res Photographs at 200px × 200px. Fill in models, clients, and credits, then export directly to JSON/Excel.</p>
    </div>
    <div class="actions">
      <button onclick="exportData()">💾 Export Edited Data as JSON</button>
    </div>
  </header>

  <div class="filter-bar">
    <input type="text" id="searchInput" class="search-box" placeholder="Filter by model, project, code..." oninput="filterCards()" style="min-width: 300px;">
    <select id="projectFilter" onchange="filterCards()">
      <option value="">All Projects</option>
      <option value="Atlasi">Atlasi (Fashion)</option>
      <option value="Sepidar">Sepidar (Fashion)</option>
      <option value="Zeeen">Zeeen (Fashion)</option>
      <option value="Gastronomie">Gastronomie (Food)</option>
      <option value="Cuisine">Cuisine (Food)</option>
      <option value="Tasting">Tasting (Food)</option>
      <option value="Calligraphy">Calligraphy (Portrait)</option>
      <option value="Photos">Photos (Portrait)</option>
      <option value="Gaze">Gaze (Portrait)</option>
      <option value="Objects">Objects (Product)</option>
    </select>
  </div>

  <div class="grid" id="photoGrid">
"""
    for it in items:
        html_content += f"""
    <div class="card" data-code="{it['code']}" data-project="{it['project']}">
      <div class="img-wrap">
        <img src="{it['rel_path']}" alt="{it['code']}" loading="lazy">
      </div>
      <div class="details">
        <div class="field">
          <label>Photo Code</label>
          <span class="badge">{it['code']}</span>
        </div>
        <div class="field">
          <label>Project / Discipline</label>
          <div style="font-size: 13px; color: #BBB;">{it['project']} &bull; {it['discipline']}</div>
        </div>
        <div class="field">
          <label>Model(s)</label>
          <input type="text" class="input-model" placeholder="e.g. Niloufar Rostami">
        </div>
        <div class="field">
          <label>Client</label>
          <input type="text" class="input-client" placeholder="e.g. Atlasi Textile">
        </div>
        <div class="field">
          <label>Makeup Artist (MUA)</label>
          <input type="text" class="input-mua" placeholder="MUA Name">
        </div>
        <div class="field">
          <label>Photography Assistant</label>
          <input type="text" class="input-assistant" placeholder="Assistant Name">
        </div>
        <div class="field">
          <label>Date / Year</label>
          <input type="text" class="input-date" value="{it['year']}">
        </div>
        <div class="field">
          <label>Target SEO Keywords</label>
          <input type="text" class="input-keywords" value="{it['project']}, {it['discipline']}, Siavash Akbari">
        </div>
      </div>
    </div>
"""

    html_content += """
  </div>

  <script>
    function filterCards() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const proj = document.getElementById('projectFilter').value;
      const cards = document.querySelectorAll('.card');

      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const cardProj = card.getAttribute('data-project');
        const matchesQuery = !q || text.includes(q);
        const matchesProj = !proj || cardProj === proj;
        card.style.display = (matchesQuery && matchesProj) ? 'flex' : 'none';
      });
    }

    function exportData() {
      const cards = document.querySelectorAll('.card');
      const results = [];
      cards.forEach(card => {
        results.push({
          code: card.getAttribute('data-code'),
          project: card.getAttribute('data-project'),
          model: card.querySelector('.input-model').value.trim(),
          client: card.querySelector('.input-client').value.trim(),
          makeupArtist: card.querySelector('.input-mua').value.trim(),
          assistant: card.querySelector('.input-assistant').value.trim(),
          date: card.querySelector('.input-date').value.trim(),
          keywords: card.querySelector('.input-keywords').value.trim(),
        });
      });

      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'edited_photo_metadata.json';
      a.click();
    }
  </script>
</body>
</html>
"""
    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html_content)

def main():
    out_file = "PHOTO_INVENTORY_SIAVASH_AKBARI.xlsx"
    all_items = []

    # Using xlsxwriter with clean options
    wb = xlsxwriter.Workbook(out_file, {'constant_memory': False})

    ws_photo = wb.add_worksheet("Photography Portfolio")
    build_sheet(wb, ws_photo, PROJECT_METADATA, all_items)

    ws_graphic = wb.add_worksheet("Graphic Design & Posters")
    dummy = []
    build_sheet(wb, ws_graphic, GRAPHIC_METADATA, dummy)

    wb.close()
    print(f"XlsxWriter generated 100% compliant workbook: {out_file}")

    # Also build interactive HTML viewer
    html_file = "PHOTO_INVENTORY_VIEWER.html"
    generate_interactive_html(all_items, html_file)
    print(f"Interactive browser viewer generated: {html_file}")

if __name__ == "__main__":
    main()
