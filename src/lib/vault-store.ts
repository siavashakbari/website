/**
 * Studio Vault Master Store
 * Replaces legacy database dependencies with a resilient, reactive, zero-trust client-side architecture.
 * Manages all Pages (routes hierarchy), Media (unique 4-digit + dynamic codes), Sizing, and UI Types.
 */

import { PHOTO_INVENTORY, type PhotoInventoryItem } from "@/data/photo-inventory";
import { projects as DEFAULT_PROJECTS } from "@/data/projects";
import { DISCIPLINES } from "@/data/disciplines";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import type { UITypeCode } from "@/components/ui-types";
import type { KeyValuePair } from "@/components/vault/PairedBoxesEditor";

export interface VaultPageItem {
  id: string;
  route: string; // e.g. "/photography/fashion-photography/sepidar"
  name: string;  // e.g. "Sepidar" -> tab title "Siavash Akbari - Sepidar"
  parentRoute: string; // e.g. "/photography/fashion-photography" or ""
  coverPhoto: string;
  descriptionEn: string;
  descriptionFa: string;
  uiType: UITypeCode;
  isHidden: boolean;
  pairedBoxes: KeyValuePair[];
  order: number;
}

export interface VaultMediaItem {
  id: string;
  uniqueCode: string;   // 4-digit unique code, e.g. "5826"
  dynamicCode: string;  // e.g. "5826-PHOTOGRAPHY-FASHION-SEPIDAR"
  imgSrc: string;
  thumbSrc: string;
  field: string;        // e.g. "photography"
  category: string;     // e.g. "fashion-photography"
  project: string;      // e.g. "sepidar"
  assignedRoute: string; // e.g. "/photography/fashion-photography/sepidar"
  title: string;
  year: string;
  client?: string;
  model?: string;
  makeupArtist?: string;
  assistant?: string;
  caption?: string;
  isHidden: boolean;
  pairedBoxes: KeyValuePair[];
  isVideo: boolean;
  createdAt: string;
}

const STORAGE_VAULT_PAGES = "siavash_vault_pages_v2";
const STORAGE_VAULT_MEDIA = "siavash_vault_media_v2";
export const VAULT_STORE_CHANGED_EVENT = "siavash_vault_store_changed";

let vaultBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    vaultBroadcastChannel = new BroadcastChannel("siavash_vault_bus");
  } catch (e) {
    /* ignore */
  }
}

export function notifyVaultUpdated(detail?: { type: string; id?: string }): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(VAULT_STORE_CHANGED_EVENT, { detail }));
    window.dispatchEvent(new Event("storage"));
    vaultBroadcastChannel?.postMessage(detail || { type: "generic" });
  } catch (e) {
    console.error("Vault broadcast error:", e);
  }
}

export function subscribeToVaultStore(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(VAULT_STORE_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  if (vaultBroadcastChannel) {
    vaultBroadcastChannel.onmessage = handler;
  }
  return () => {
    window.removeEventListener(VAULT_STORE_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
    if (vaultBroadcastChannel) {
      vaultBroadcastChannel.onmessage = null;
    }
  };
}

// -------------------------------------------------------------
// Dynamic Code & Unique Code Generators
// -------------------------------------------------------------

function cleanSegment(s?: string): string {
  if (!s) return "";
  let str = s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  str = str.replace(/^-+|-+$/g, "");
  if (str.endsWith("-PHOTOGRAPHY")) {
    str = str.replace(/-PHOTOGRAPHY$/, "");
  }
  return str;
}

/**
 * Builds dynamic code from route segments:
 * e.g. 5826-PHOTOGRAPHY-FASHION-SEPIDAR
 */
export function buildDynamicMediaCode(
  uniqueCode: string,
  field?: string,
  category?: string,
  project?: string
): string {
  const segs = [
    uniqueCode.trim(),
    cleanSegment(field),
    cleanSegment(category),
    cleanSegment(project),
  ].filter(Boolean);
  return segs.join("-");
}

/**
 * Generates an unused random 4-digit unique code (1000-9999)
 */
export function getAvailable4DigitCode(existingCodes: Set<string>): string {
  let attempts = 0;
  while (attempts < 10000) {
    const candidate = String(Math.floor(1000 + Math.random() * 9000));
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
    attempts++;
  }
  for (let i = 1000; i <= 9999; i++) {
    const candidate = String(i);
    if (!existingCodes.has(candidate)) return candidate;
  }
  return String(Math.floor(Date.now() % 10000)).padStart(4, "0");
}

// -------------------------------------------------------------
// Initial Pre-Scanned Default Pages
// -------------------------------------------------------------

export function getInitialScannedPages(): VaultPageItem[] {
  const pages: VaultPageItem[] = [
    // 1. Root Fields
    {
      id: "photography",
      route: "/photography",
      name: "Photography",
      parentRoute: "",
      coverPhoto: "src/assets/fashion/atlasi/fashion-atlasi-09.jpg",
      descriptionEn: "Studio photography, fashion editorials, culinary stories, and portraiture.",
      descriptionFa: "عکاسی استودیویی، مد و فشن، روایت‌های آشپزی و پرتره.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Discipline", value: "Photography" }],
      order: 1,
    },
    {
      id: "graphic-design",
      route: "/graphic-design",
      name: "Graphic Design",
      parentRoute: "",
      coverPhoto: "src/assets/graphic-design/shekarchian/graphic-design-shekarchian-01.jpg",
      descriptionEn: "Visual identity systems, typography, editorial book design, and posters.",
      descriptionFa: "سیستم‌های هویت بصری، تایپوگرافی، طراحی کتاب و پوستر.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Discipline", value: "Graphic Design" }],
      order: 2,
    },
    {
      id: "video",
      route: "/video",
      name: "Video & Motion",
      parentRoute: "",
      coverPhoto: "src/assets/video/echo-prime/video-echo-prime-01.mp4",
      descriptionEn: "Brand films, motion direction, visual effects, and dynamic sequences.",
      descriptionFa: "فیلم‌های برند، کارگردانی موشن، جلوه‌های بصری و ویدیوهای خلاق.",
      uiType: "UI04",
      isHidden: false,
      pairedBoxes: [{ key: "Discipline", value: "Motion & Film" }],
      order: 3,
    },
    {
      id: "product-design",
      route: "/product-design",
      name: "Product Design",
      parentRoute: "",
      coverPhoto: "src/assets/product/objects/product-objects-92.jpg",
      descriptionEn: "Objects, accessories, and industrial prototypes shaped with intent.",
      descriptionFa: "طراحی محصول، اکسسوری و پروتوتایپ‌های صنعتی هدفمند.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Discipline", value: "Product Design" }],
      order: 4,
    },

    // 2. Specialties under Photography
    {
      id: "photography-fashion-photography",
      route: "/photography/fashion-photography",
      name: "Fashion Photography",
      parentRoute: "/photography",
      coverPhoto: "src/assets/fashion/atlasi/fashion-atlasi-01.jpg",
      descriptionEn: "Studio fashion stories — silhouette, texture, and quiet gesture.",
      descriptionFa: "روایت‌های مد استودیویی — سیلوئت، بافت پارچه و ژست‌های آرام.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Fashion" }],
      order: 10,
    },
    {
      id: "photography-food-photography",
      route: "/photography/food-photography",
      name: "Food Photography",
      parentRoute: "/photography",
      coverPhoto: "src/assets/food/gastronomie/food-gastronomie-19.jpg",
      descriptionEn: "Culinary narratives built from light, shadow, and the ritual of the plate.",
      descriptionFa: "عکاسی غذا و روایات آشپزی مبتنی بر نور، سایه و طعم.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Food" }],
      order: 11,
    },
    {
      id: "photography-portrait-photography",
      route: "/photography/portrait-photography",
      name: "Portrait Photography",
      parentRoute: "/photography",
      coverPhoto: "src/assets/portrait/calligraphy/portrait-calligraphy-02.jpg",
      descriptionEn: "Portraits that hold a person still enough to be seen.",
      descriptionFa: "پرتره‌هایی متمرکز بر شخصیت و نگاه انسان.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Portrait" }],
      order: 12,
    },
    {
      id: "photography-product-photography",
      route: "/photography/product-photography",
      name: "Product Photography",
      parentRoute: "/photography",
      coverPhoto: "src/assets/product/objects/product-objects-92.jpg",
      descriptionEn: "Objects photographed with intent — light, form, material.",
      descriptionFa: "عکاسی محصولات، متریال‌ها و اجسام با زاویه‌دید دقیق.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Product" }],
      order: 13,
    },

    // 3. Specialties under Graphic Design
    {
      id: "graphic-design-visual-identity",
      route: "/graphic-design/visual-identity",
      name: "Visual Identity",
      parentRoute: "/graphic-design",
      coverPhoto: "src/assets/graphic-design/shekarchian/graphic-design-shekarchian-01.jpg",
      descriptionEn: "Identity systems that carry a brand's voice across every touchpoint.",
      descriptionFa: "سیستم‌های جامع هویت برند و زبان بصری.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Branding" }],
      order: 20,
    },
    {
      id: "graphic-design-posters",
      route: "/graphic-design/posters",
      name: "Posters",
      parentRoute: "/graphic-design",
      coverPhoto: "src/assets/graphic-design/posters/graphic-design-posters-06.jpg",
      descriptionEn: "Bold, graphic statements for spaces, events, and cultural campaigns.",
      descriptionFa: "پوسترهای گرافیکی رویدادها، تئاتر و فرهنگ.",
      uiType: "UI02",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Posters" }],
      order: 21,
    },
    {
      id: "graphic-design-book-covers",
      route: "/graphic-design/book-covers",
      name: "Book Covers",
      parentRoute: "/graphic-design",
      coverPhoto: "src/assets/graphic-design/book-covers/graphic-design-book-covers-12.jpg",
      descriptionEn: "Cover design and typography that invites the reader before the first page.",
      descriptionFa: "طراحی جلد کتاب و تایپوگرافی ادبی.",
      uiType: "UI02",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Publishing" }],
      order: 22,
    },

    // 4. Projects under Photography Fashion
    {
      id: "photography-fashion-sepidar",
      route: "/photography/fashion-photography/sepidar",
      name: "Sepidar",
      parentRoute: "/photography/fashion-photography",
      coverPhoto: "src/assets/fashion/sepidar/fashion-sepidar-01.jpg",
      descriptionEn: "Sepidar Fashion Editorial — contemporary Iranian garment presentation.",
      descriptionFa: "مجموعه مد و پوشاک سپیدار — فرم‌های مدرن ایرانی.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }, { key: "Client", value: "Sepidar" }],
      order: 30,
    },
    {
      id: "photography-fashion-atlasi",
      route: "/photography/fashion-photography/atlasi",
      name: "Atlasi",
      parentRoute: "/photography/fashion-photography",
      coverPhoto: "src/assets/fashion/atlasi/fashion-atlasi-01.jpg",
      descriptionEn: "Atlasi Textile & Silhouette Campaign — minimal drapery and natural illumination.",
      descriptionFa: "کمپین پارچه و پوشش اطلسی با نورپردازی طبیعی.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }, { key: "Client", value: "Atlasi" }],
      order: 31,
    },
    {
      id: "photography-fashion-zeeen",
      route: "/photography/fashion-photography/zeeen",
      name: "Zeeen",
      parentRoute: "/photography/fashion-photography",
      coverPhoto: "src/assets/fashion/zeeen/fashion-zeeen-01.jpg",
      descriptionEn: "Zeeen artisanal accessories and lifestyle editorial.",
      descriptionFa: "اکسسوری و استایل زین.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2023" }, { key: "Client", value: "Zeeen" }],
      order: 32,
    },

    // 5. Projects under Food Photography
    {
      id: "photography-food-gastronomie",
      route: "/photography/food-photography/gastronomie",
      name: "Gastronomie",
      parentRoute: "/photography/food-photography",
      coverPhoto: "src/assets/food/gastronomie/food-gastronomie-19.jpg",
      descriptionEn: "Gastronomie culinary series — textural nuances and table composition.",
      descriptionFa: "مجموعه عکاسی گاسترونومی و هنر چیدمان میز.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 40,
    },
    {
      id: "photography-food-cuisine",
      route: "/photography/food-photography/cuisine",
      name: "Cuisine",
      parentRoute: "/photography/food-photography",
      coverPhoto: "src/assets/food/cuisine/food-cuisine-01.jpg",
      descriptionEn: "Artisanal cuisine and ingredient studies.",
      descriptionFa: "مطالعات تصویری مواد غذایی و نوشیدنی‌ها.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2023" }],
      order: 41,
    },

    // 6. Projects under Portrait Photography
    {
      id: "photography-portrait-calligraphy",
      route: "/photography/portrait-photography/calligraphy",
      name: "Calligraphy",
      parentRoute: "/photography/portrait-photography",
      coverPhoto: "src/assets/portrait/calligraphy/portrait-calligraphy-02.jpg",
      descriptionEn: "Calligraphers and ink masters portraits in studio light.",
      descriptionFa: "پرتره اساتید خوشنویسی و مرکب در نور استودیو.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 50,
    },
    {
      id: "photography-portrait-photos",
      route: "/photography/portrait-photography/photos",
      name: "Photos",
      parentRoute: "/photography/portrait-photography",
      coverPhoto: "src/assets/portrait/photos/portrait-photos-01.jpg",
      descriptionEn: "Human gestures and character portraits.",
      descriptionFa: "پرتره‌های فردی و حالات انسانی.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 51,
    },
    {
      id: "photography-portrait-gaze",
      route: "/photography/portrait-photography/gaze",
      name: "Gaze",
      parentRoute: "/photography/portrait-photography",
      coverPhoto: "src/assets/portrait/gaze/portrait-gaze-01.jpg",
      descriptionEn: "Monochrome character studies capturing contemplation and presence.",
      descriptionFa: "مطالعات نگاه و تعمق در قاب‌های سیاه‌وسفید.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2023" }],
      order: 52,
    },

    // 7. Projects under Product Photography
    {
      id: "photography-product-objects",
      route: "/photography/product-photography/objects",
      name: "Objects",
      parentRoute: "/photography/product-photography",
      coverPhoto: "src/assets/product/objects/product-objects-92.jpg",
      descriptionEn: "Sculptural forms and commercial product photography.",
      descriptionFa: "عکاسی فرم‌های مجسمه‌وار و اشیای کاربردی.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 60,
    },

    // 8. Projects under Visual Identity
    {
      id: "graphic-design-shekarchian-sweets",
      route: "/graphic-design/visual-identity/shekarchian-sweets",
      name: "Shekarchian Sweets",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/shekarchian/graphic-design-shekarchian-01.jpg",
      descriptionEn: "Visual identity system for historical confectionery brand.",
      descriptionFa: "هویت بصری شیرینی سنتی شکرچیان با پیشینه اصیل اصفهان.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Client", value: "Shekarchian" }, { key: "Year", value: "2024" }],
      order: 70,
    },
    {
      id: "graphic-design-dobareh",
      route: "/graphic-design/visual-identity/dobareh",
      name: "Dobareh",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/dodareh/graphic-design-dodareh-01.jpg",
      descriptionEn: "Branding and packaging for Dobareh lifestyle accessories.",
      descriptionFa: "هویت بصری و بسته‌بندی برند دوباره.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Client", value: "Dobareh" }, { key: "Year", value: "2024" }],
      order: 71,
    },
    {
      id: "graphic-design-ahura-cctv",
      route: "/graphic-design/visual-identity/ahura-cctv",
      name: "Ahura CCTV",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/ahura-cctv/graphic-design-ahura-cctv-01.jpg",
      descriptionEn: "Corporate security technology brand identity.",
      descriptionFa: "هویت برند سیستم‌های نظارتی و امنیتی اهورا.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Client", value: "Ahura" }, { key: "Year", value: "2024" }],
      order: 72,
    },
    {
      id: "graphic-design-polarity",
      route: "/graphic-design/visual-identity/polarity",
      name: "Polarity",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/polarity/graphic-design-polarity-01.jpg",
      descriptionEn: "Polarity design atelier visual architecture.",
      descriptionFa: "هویت بصری آتلیه طراحی پولاریتی.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 73,
    },
    {
      id: "graphic-design-echo-supplements",
      route: "/graphic-design/visual-identity/echo-supplements",
      name: "Echo Supplements",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/echo-supplements/graphic-design-echo-supplements-01.jpg",
      descriptionEn: "Nutritional supplements modern identity & packaging.",
      descriptionFa: "هویت بصری و بسته‌بندی مکمل‌های اکو.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 74,
    },
    {
      id: "graphic-design-goats-coffee",
      route: "/graphic-design/visual-identity/goats-coffee",
      name: "Goats Coffee",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/goats/graphic-design-goats-01.jpg",
      descriptionEn: "Specialty roastery brand voice and cups.",
      descriptionFa: "برندینگ رستری قهوه گوتز.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2023" }],
      order: 75,
    },
    {
      id: "graphic-design-onswipe",
      route: "/graphic-design/visual-identity/onswipe",
      name: "OnSwipe",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/on-swipe/graphic-design-on-swipe-01.jpg",
      descriptionEn: "Digital payment and transaction brand interface.",
      descriptionFa: "هویت برند دیجیتال آن‌سوایپ.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 76,
    },
    {
      id: "graphic-design-zen-studio",
      route: "/graphic-design/visual-identity/zen-studio",
      name: "Zen Studio Products",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/zen/graphic-design-zen-01.jpg",
      descriptionEn: "Minimalist workspace objects and desk architecture.",
      descriptionFa: "اشیا و لوازم مینیمال استودیو ذن.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 77,
    },

    // 9. Video Projects
    {
      id: "video-echo-prime",
      route: "/video/echo-prime",
      name: "Echo Prime",
      parentRoute: "/video",
      coverPhoto: "src/assets/video/echo-prime/video-echo-prime-01.mp4",
      descriptionEn: "Motion visual effects sequences and editing rhythm.",
      descriptionFa: "جلوه‌های موشن و ریتم تدوین اکو پرایم.",
      uiType: "UI04",
      isHidden: false,
      pairedBoxes: [{ key: "Director", value: "Siavash Akbari" }, { key: "Year", value: "2026" }],
      order: 90,
    },
  ];

  return pages;
}

// -------------------------------------------------------------
// Initial Pre-Scanned Default Media
// -------------------------------------------------------------

export function getInitialScannedMedia(): VaultMediaItem[] {
  const mediaList: VaultMediaItem[] = [];
  const existingCodes = new Set<string>();

  // Map each item in PHOTO_INVENTORY
  PHOTO_INVENTORY.forEach((p, idx) => {
    const uniqueCode = String(1001 + idx);
    existingCodes.add(uniqueCode);

    let field = "photography";
    let category = "fashion-photography";
    let project = p.project ? p.project.toLowerCase().replace(/\s+/g, "-") : "project";

    const discNorm = (p.disciplineSlug || p.discipline || "").toLowerCase();
    if (discNorm.includes("video") || discNorm.includes("motion")) {
      field = "video";
      category = "videos";
    } else if (discNorm.includes("graphic") || discNorm.includes("identity") || discNorm.includes("book") || discNorm.includes("poster")) {
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

    const assignedRoute = `/${field}/${category}/${project}`;
    const dynamicCode = buildDynamicMediaCode(uniqueCode, field, category, project);

    const pairedBoxes: KeyValuePair[] = [];
    if (p.model) pairedBoxes.push({ key: "Model", value: p.model });
    if (p.client) pairedBoxes.push({ key: "Client", value: p.client });
    if (p.makeupArtist) pairedBoxes.push({ key: "Makeup Artist", value: p.makeupArtist });
    if (p.assistant) pairedBoxes.push({ key: "Assistant", value: p.assistant });
    if (p.date) pairedBoxes.push({ key: "Year", value: p.date });

    mediaList.push({
      id: `media-${uniqueCode}`,
      uniqueCode,
      dynamicCode,
      imgSrc: p.imgSrc,
      thumbSrc: p.imgSrc,
      field,
      category,
      project,
      assignedRoute,
      title: p.title || p.project,
      year: p.date || "2024",
      client: p.client,
      model: p.model,
      makeupArtist: p.makeupArtist,
      assistant: p.assistant,
      caption: p.caption,
      isHidden: false,
      pairedBoxes,
      isVideo: Boolean(p.imgSrc?.endsWith(".mp4")),
      createdAt: new Date().toISOString(),
    });
  });

  return mediaList;
}

// -------------------------------------------------------------
// Pages CRUD
// -------------------------------------------------------------

export function getVaultPages(): VaultPageItem[] {
  if (typeof window === "undefined") return getInitialScannedPages();
  try {
    const raw = localStorage.getItem(STORAGE_VAULT_PAGES);
    if (raw) {
      const parsed: VaultPageItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading vault pages:", e);
  }
  const initial = getInitialScannedPages();
  localStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(initial));
  return initial;
}

export function saveVaultPage(page: VaultPageItem): void {
  if (typeof window === "undefined") return;
  const list = getVaultPages();
  const idx = list.findIndex((p) => p.id === page.id || p.route === page.route);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...page };
  } else {
    list.push(page);
  }
  localStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(list));
  notifyVaultUpdated({ type: "page_saved", id: page.id });
}

export function deleteVaultPage(id: string): void {
  if (typeof window === "undefined") return;
  const list = getVaultPages().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(list));
  notifyVaultUpdated({ type: "page_deleted", id });
}

export function getPageByRoute(route: string): VaultPageItem | undefined {
  const norm = route.replace(/\/+$/, "") || "/";
  const list = getVaultPages();
  return list.find((p) => {
    const pNorm = p.route.replace(/\/+$/, "") || "/";
    return pNorm === norm;
  });
}

// -------------------------------------------------------------
// Media CRUD
// -------------------------------------------------------------

export function getVaultMedia(): VaultMediaItem[] {
  if (typeof window === "undefined") return getInitialScannedMedia();
  try {
    const raw = localStorage.getItem(STORAGE_VAULT_MEDIA);
    if (raw) {
      const parsed: VaultMediaItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading vault media:", e);
  }
  const initial = getInitialScannedMedia();
  localStorage.setItem(STORAGE_VAULT_MEDIA, JSON.stringify(initial));
  return initial;
}

export function saveVaultMedia(item: VaultMediaItem): void {
  if (typeof window === "undefined") return;
  const list = getVaultMedia();
  const idx = list.findIndex(
    (m) => m.id === item.id || m.uniqueCode === item.uniqueCode
  );
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...item };
  } else {
    list.unshift(item);
  }
  localStorage.setItem(STORAGE_VAULT_MEDIA, JSON.stringify(list));
  notifyVaultUpdated({ type: "media_saved", id: item.id });
}

export function deleteVaultMedia(idOrCode: string): void {
  if (typeof window === "undefined") return;
  const list = getVaultMedia().filter(
    (m) => m.id !== idOrCode && m.uniqueCode !== idOrCode
  );
  localStorage.setItem(STORAGE_VAULT_MEDIA, JSON.stringify(list));
  notifyVaultUpdated({ type: "media_deleted", id: idOrCode });
}

export function getMediaByCode(code: string): VaultMediaItem | undefined {
  const list = getVaultMedia();
  const cClean = code.trim().toUpperCase();
  return list.find((m) => {
    return (
      m.uniqueCode === cClean ||
      m.dynamicCode.toUpperCase() === cClean ||
      m.id === code
    );
  });
}

export function getMediaByRoute(route: string): VaultMediaItem[] {
  const norm = route.replace(/\/+$/, "").toLowerCase();
  const list = getVaultMedia();
  return list.filter((m) => {
    const aRoute = (m.assignedRoute || "").replace(/\/+$/, "").toLowerCase();
    return aRoute === norm || aRoute.startsWith(norm);
  });
}

/**
 * Returns all unique codes currently in use
 */
export function getUsedMediaCodes(): Set<string> {
  const list = getVaultMedia();
  return new Set(list.map((m) => m.uniqueCode));
}
