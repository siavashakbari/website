# Feature Specification & Implementation Guide: Dedicated Photo Detail Pages & High-Rank Entity SEO

## 1. Executive Summary & Vision
Currently, clicking a photo in the discipline galleries (`/fashion-photography`, `/food-photography`, `/portrait-photography`, `/product-photography`) opens an in-page expandable popup modal (`<ExpandableCard>`). 

This feature transitions from ephemeral popups to **dedicated, canonical, high-authority photo detail pages** (e.g. `/photos/$photoCode` or `/photography/$slug/$photoId`).

### Key Objectives:
1. **Preserve Main Discipline UX**: The main discipline pages remain **completely unchanged** in their visual appearance and masonry/grid flow. The only change is that clicking a photo transitions to its dedicated permalink page instead of triggering an overlay.
2. **Editorial Split-Screen UI/UX**:
   - **Visual Side**: Crisp, full-height responsive presentation of the photograph/work with subtle ambient back-glow matching the image's dominant palette (`image-colors.json`).
   - **Editorial & Metadata Side**: Detailed photography & design credits:
     - **Sub-Discipline / Specialty**: Granular categorization (e.g. within Product Photography $\rightarrow$ *Furniture Photography*, *Plants & Botanicals*, *Ceramics & Tableware*, *Lighting & Lamps*; within Fashion $\rightarrow$ *Textile & Silhouette*, *Lookbook*; within Visual Identity $\rightarrow$ *Packaging*, *Wordmark*).
     - **Model(s) / Subject**: Featured talent or primary subject.
     - **Client**: Brand name or commissioning studio.
     - **Date / Year**: Production date.
     - **Makeup Artist (MUA)**: Name & credit.
     - **Photography / Design Assistant**: Name & credit.
     - **Art Direction / Styling**: Credit.
     - **Technical / Lighting Notes**: Camera, optics, light modifiers.
3. **Hyper-Aggressive Entity SEO & AI Search Engine Discovery**:
   - Tailored specifically so that searching the **Model's name**, **Client**, **Makeup artist**, or **Specific Sub-Discipline** (e.g. *"furniture photographer Esfahan"*, *"plant photography Iran"*, *"minimalist packaging design"*) in Google, ChatGPT Search, Perplexity, or Google AI Overviews directly surfaces Siavash Akbari's portfolio page.
   - Deep structured data (`Photograph`, `ImageObject`, `VisualArtwork`, `Person` tags for Models/MUA/Photographer).
   - Seamless sitemap and `llms.txt` automated indexing.

---

## 2. Accompanying Assets Created
Before executing this feature, an inventory workbook has been generated in the project root:
📁 **`PHOTO_INVENTORY_SIAVASH_AKBARI.xlsx`**
- **Sheet 1**: `Photography Portfolio` (211 photos across Fashion, Food, Portrait, Product).
- **Sheet 2**: `Graphic Design & Posters` (20 items).
- Each row contains:
  - **Photo Code**: Clean generated identifier (e.g., `SA-FASH-ATL-01`, `SA-PORT-CAL-02`).
  - **Embedded Low-Res Thumbnail**: For instant visual identification.
  - **Project Name & Category**: Pre-filled from current project definitions.
  - **Current Filename & Relative Path**.
  - **Proposed New Filename**.
  - **Editable Columns for You**: `Client`, `Date / Exact Year`, `Model(s)`, `Makeup Artist`, `Photography Assistant`, `Stylist`, `Location`, and `SEO Keywords`.

Once you fill in the models and team details in that Excel file, you or Gemini can run the accompanying data conversion script to populate `src/data/photos-data.ts`.

---

## 3. UI/UX Architecture: Dedicated Photo Detail Page

### Route URL Pattern:
`/photos/$photoCode` (e.g. `/photos/sa-fash-atl-01` or `/photos/atlasi-08`)

### Desktop Layout (>= 1024px):
- **Sticky Image Column (Right Side / 60% Width)**:
  - Viewport-aware image container preventing vertical page blowout.
  - High-res image with zoom trigger, smooth fade-in, and dark luxury frame.
  - Keyboard shortcuts: `Left Arrow` (Previous photo), `Right Arrow` (Next photo), `Escape` (Back to discipline).
- **Metadata & Story Column (Left Side / 40% Width)**:
  - **Discipline & Breadcrumbs**: `Works` > `Fashion Photography` > `Atlasi`.
  - **Headline**: e.g., `Atlasi — Frame 08`.
  - **Model & Credits Grid** (Clean tabular typography in Satoshi/Peyda):
    - **Model(s)**: Prominent styled badge/link (e.g. `✦ Niloufar Rostami`).
    - **Client / Production**: e.g. `Atlasi Textile Studio`.
    - **Date**: `Autumn 2024`.
    - **Makeup Artist**: Name & credit.
    - **Photography Assistant**: Name & credit.
    - **Lighting / Camera Notes**: e.g. `Broncolor Softbox 120, Hasselblad H6D-100c`.
  - **Curatorial Notes**: 2-3 paragraphs describing the light, textile texture, posture, and artistic rationale.
  - **Action Bar**:
    - "Back to Gallery" button (restores scroll position).
    - "Book a Consultation / Similar Shoot" (pre-fills topic in `/contact`).
- **Footer Section**:
  - Miniature horizontal carousel of other frames from the same project/discipline.

### Mobile Layout (< 1024px):
- Full-bleed photo top section with pinch-to-zoom support.
- Smooth scrolling metadata cards below.
- Floating bottom bar with "Prev / Next / Back" quick actions.

---

## 4. Entity SEO & AI Search Engine Strategy

### A. Schema.org JSON-LD Structured Data
Every photo detail page embeds rich JSON-LD combining `Photograph`, `ImageObject`, and multiple `Person` schemas:

```json
{
  "@context": "https://schema.org",
  "@type": ["Photograph", "ImageObject"],
  "@id": "https://www.siavashakbari.ir/photos/sa-fash-atl-08",
  "name": "Atlasi Editorial 08 — Featuring [Model Name]",
  "description": "Studio fashion editorial photograph by Siavash Akbari featuring model [Model Name] wearing hand-woven Atlasi textiles in Esfahan.",
  "contentUrl": "https://www.siavashakbari.ir/assets/fashion/atlasi/fashion-atlasi-08.jpg",
  "thumbnailUrl": "https://www.siavashakbari.ir/assets/fashion/atlasi/fashion-atlasi-08-thumb.webp",
  "dateCreated": "2024",
  "genre": "Fashion Photography",
  "locationCreated": {
    "@type": "Place",
    "name": "Studio Siavash Akbari",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Esfahan",
      "addressCountry": "IR"
    }
  },
  "creator": {
    "@type": "Person",
    "name": "Siavash Akbari",
    "jobTitle": "Photographer & Creative Director",
    "url": "https://www.siavashakbari.ir"
  },
  "character": [
    {
      "@type": "Person",
      "name": "[Model Name]",
      "jobTitle": "Fashion Model"
    }
  ],
  "contributor": [
    {
      "@type": "Person",
      "name": "[Makeup Artist Name]",
      "jobTitle": "Makeup Artist"
    },
    {
      "@type": "Person",
      "name": "[Assistant Name]",
      "jobTitle": "Photography Assistant"
    }
  ],
  "copyrightHolder": {
    "@type": "Person",
    "name": "Siavash Akbari"
  },
  "keywords": [
    "[Model Name]",
    "Fashion Photography",
    "Siavash Akbari",
    "Esfahan Photographer",
    "Atlasi Textiles",
    "Editorial Photography"
  ]
}
```

### B. Title & Meta Strategy
- **Page Title**: `[Project Name] — Frame [Index] ft. [Model Name] | Siavash Akbari Photography`
- **Meta Description**: `Editorial photography by Siavash Akbari. Client: [Client]. Model: [Model Name]. Makeup: [MUA]. Shot in Esfahan, Iran.`
- **OpenGraph**: High-resolution image card with `twitter:card` set to `summary_large_image`.

### C. `llms.txt` Entry
Add a dedicated photography index section to `public/llms.txt`:
```markdown
## Photography & Editorial Index
- [Atlasi 08 - Model: Niloufar](https://www.siavashakbari.ir/photos/sa-fash-atl-08): Fashion editorial with hand-woven textiles.
- [Sepidar 14 - Model: Sara](https://www.siavashakbari.ir/photos/sa-fash-sep-14): Natural light outdoor fashion photography.
```

---

## 5. Technical Implementation Steps for Gemini

### Step 1: Define the Structured Photo Data Store
Create `src/data/photos-data.ts`:

```typescript
export interface PhotoItem {
  code: string;            // e.g. "SA-PROD-OBJ-01" or "SA-FASH-ATL-01"
  slug: string;            // e.g. "sa-prod-obj-01"
  projectId: string;       // e.g. "objects" or "atlasi"
  projectTitle: string;    // e.g. "Objects" or "Atlasi"
  disciplineSlug: string;  // e.g. "product-photography" or "fashion-photography"
  disciplineLabel: string; // e.g. "Product Photography" or "Fashion Photography"
  subdiscipline?: string;  // e.g. "Furniture Photography", "Plants Photography", "Packaging", "Ceramics"
  imageSrc: string;        // Imported image variable
  aspect: "portrait" | "landscape";
  year: string;
  client?: string;
  models?: string[];
  makeupArtist?: string;
  assistant?: string;
  stylist?: string;
  location?: string;
  description: string;
  seoKeywords: string[];
}
```

### Step 2: Create the Detail Route
Create `src/routes/photos.$photoCode.tsx`:
- Loader finds the photo by `photoCode` or `slug`.
- Injects full `Photograph` JSON-LD schema into `head`.
- Renders the split editorial view (Photo on right, Credits on left on desktop; stacked on mobile).
- Includes previous/next photo links within the same project.

### Step 3: Update Discipline Pages
In `src/routes/$discipline.tsx`:
- In `PhotoMasonry`: Instead of `<ExpandableCard>` triggering an internal modal state `openCardId`:
- Wrap the card in a TanStack Router `<Link to="/photos/$photoCode" params={{ photoCode: item.key }}>`.
- Maintain all existing visual styles, glowing hover effects, and smooth layout animations.

### Step 4: Update Sitemap & Robots
In `scripts/generate-sitemap.mjs` and `src/routes/sitemap[.]xml.ts`:
- Append all 211 photo detail URLs with `changefreq: "monthly"` and `priority: "0.8"`.

---

## 6. Verification & Quality Checklist
- [ ] Discipline gallery cards look identical to original layout.
- [ ] Clicking a photo smoothly navigates to `/photos/...`.
- [ ] Photo detail page displays high-res image and all credit fields.
- [ ] Search Engine Schema validator (validator.schema.org) confirms valid `Photograph` & `Person` markup with no errors.
- [ ] Keyboard navigation (`Left`/`Right`/`Esc`) functions correctly.
- [ ] Mobile responsive layout tested at 375px, 768px, and 1440px.
