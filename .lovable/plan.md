# Replicate the Elle-style discipline page

Reference: https://www.hollywoodexhibit2026.com/elle

## What the reference actually does

1. **Hero (viewport 1):** dark background, tiny "SCROLL TO EXPLORE" pill top-center, and one massive serif wordmark filling the screen (the discipline name, e.g. "FASHION PHOTOGRAPHY"). No header chrome yet.
2. **Scroll-driven zoom-out:** as the user scrolls, the giant wordmark scales down and fades, and the page reveals an **asymmetric editorial mosaic** of the project's photos scattered across the full width. The mosaic is not a uniform grid — images sit at varied widths, different vertical offsets, and staggered rows (some near the top, some far down, big/small mixed).
3. **Header appears** once you leave the hero: `View` (left) · centered wordmark · `Menu` (right).
4. **Each image has a small bracketed index caption** `[1] [2] [3] …` placed beside it (top-left of each image).
5. **Bottom-center zoom controls** (`+ / −` circle buttons) let the user scale the entire mosaic up/down.
6. Clicking an image opens the existing lightbox (already implemented site-wide).

## Scope

Apply this to every discipline route: `src/routes/disciplines.$discipline.tsx` — replace the current uniform card grid with the Elle-style layout. Keep site header/footer, routing, data, and lightbox behavior unchanged. Desktop only (≥1024px); on mobile fall back to the current simple stacked/uniform layout.

## Implementation

### 1. `src/routes/disciplines.$discipline.tsx`

Restructure the page into three stacked sections:

- **`<HeroTitle>`** — full-viewport dark section with the discipline name as a huge serif display (existing Inter font is sans; introduce one editorial serif — `Playfair Display` or `Cormorant` via the `<link>` in `__root.tsx` head — used only here). Small "SCROLL TO EXPLORE" label at top.
- **`<MosaicGallery>`** — the scattered image layout (details below).
- **`<ZoomControls>`** — fixed bottom-center `+ / −` buttons that adjust a `scale` CSS var on the mosaic (0.6 → 1.4, step 0.1).

Wire scroll-driven zoom of the hero title using `useScroll`/`useTransform` from `framer-motion` (already common) or a manual `scroll` listener: as `scrollY` goes 0 → 100vh, title `scale` goes 1 → 0.2 and `opacity` 1 → 0.

### 2. `src/components/MosaicGallery.tsx` (new)

Deterministic asymmetric layout, seeded by image index so the same project renders the same layout each visit.

- Container: `position: relative`, min-height sized to fit all items (`ITEMS_PER_ROW=4`, row height ≈ 520px, roughly `ceil(count/4) * 520px`).
- Each image is absolutely positioned:
  - `left`: one of 4 column anchors (5%, 30%, 55%, 80%) chosen by `index % 4`.
  - `top`: `Math.floor(index / 4) * 520 + jitter(index)` where `jitter` is a deterministic offset in `[-80, 80]` from a hash of the index.
  - `width`: picked from `[180, 240, 300, 380, 460]px` deterministically by `index % 5` (varied sizes = editorial feel).
  - Aspect preserved (`height: auto`).
- A `[n]` caption sits at `top: -14px; left: -22px` in a tiny monospace/sans label.
- Whole gallery wrapped in a `transform: scale(var(--mosaic-scale))` container driven by ZoomControls.
- Click on any image → existing lightbox (reuse the hook already added to project pages).

### 3. Mobile fallback

Below `lg` breakpoint, `MosaicGallery` renders the current `ProjectGrid`/card layout and the hero title shrinks to a normal H1 without the scroll-zoom effect.

### 4. Files touched

- `src/routes/disciplines.$discipline.tsx` — replace body with hero + mosaic + zoom controls; keep existing head/metadata.
- `src/components/MosaicGallery.tsx` — new.
- `src/components/ZoomControls.tsx` — new (small, ~30 lines).
- `src/routes/__root.tsx` — add Google Fonts `<link>` for the chosen serif.
- `src/styles.css` — add `--mosaic-scale` default and a `.font-display` utility for the serif.

No changes to data, no changes to project detail pages, no changes to the top navigation itself.

## Open questions before I build

1. **Serif choice for the giant discipline title:** `Playfair Display` (closest to Elle's Didone feel) vs `Cormorant` (more delicate) vs `DM Serif Display` (heavier). I'll default to **Playfair Display** unless you say otherwise.
2. **Mosaic seed:** deterministic per-image-index (same layout every visit) — confirming that's the desired feel, not shuffled randomly on each load.
3. **Same treatment on the four discipline pages that currently exist as static routes (`/photography`, `/graphic-design`, `/product-design`, `/work`) or only on the dynamic `/disciplines/$discipline` route?** I'll assume only the dynamic route (that's where the user reported it) unless you want all of them.
