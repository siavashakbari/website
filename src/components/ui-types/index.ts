export * from "./UI01_VerticalScroll";
export * from "./UI02_HorizontalScroll";
export * from "./UI03_EqualCardsGrid";
export * from "./UI04_VideoShowcase";
export * from "./UI05_DedicatedMedia";
export * from "./PageHeader";
export * from "./HiddenPageNotice";

export type UITypeCode = "UI01" | "UI02" | "UI03" | "UI04" | "UI05";

export interface UITypeDefinition {
  code: UITypeCode;
  name: string;
  tagline: string;
  exampleUrl: string;
  description: string;
}

export const UI_TYPE_REGISTRY: Record<UITypeCode, UITypeDefinition> = {
  UI01: {
    code: "UI01",
    name: "UI01 — Vertical Scroll Masonry",
    tagline: "Simple vertical scrolling responsive photo columns",
    exampleUrl: "/photography/fashion-photography",
    description: "Responsive 1-3 column vertical masonry with progressive image loading. Best for fashion, food, portrait, and product photography.",
  },
  UI02: {
    code: "UI02",
    name: "UI02 — Horizontal Scroll Strip",
    tagline: "Horizontal wheel-scrolling strip gallery",
    exampleUrl: "/graphic-design/posters",
    description: "Full-height horizontal strip that scrolls sideways with the mouse wheel on Windows/desktop, with lightroom zoom on click. Best for posters and book covers.",
  },
  UI03: {
    code: "UI03",
    name: "UI03 — Equal Sized Cards Grid",
    tagline: "Grid of uniform cards linking to sub-projects",
    exampleUrl: "/graphic-design/visual-identity",
    description: "Structured grid of uniform aspect cards with project cover images and title badges. Best for visual identity brand directories and catalogues.",
  },
  UI04: {
    code: "UI04",
    name: "UI04 — Video Showcase",
    tagline: "Video cards with hover preview & modal player",
    exampleUrl: "/video",
    description: "Interactive video cards with hover playback preview and a custom high-definition theater modal player on click. Best for video films and motion design.",
  },
  UI05: {
    code: "UI05",
    name: "UI05 — Dedicated Media Detail Page",
    tagline: "Full-bleed single photo/video exhibition view",
    exampleUrl: "/photography/fashion-photography/sepidar/PHOT-FASH-SEPI-0003",
    description: "Dedicated artwork presentation page with high-res media viewport, credit pairs, client metadata, and sibling navigation arrows.",
  },
};

export const UI_TYPE_LIST = Object.values(UI_TYPE_REGISTRY);
