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
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
} from "@/lib/taxonomy";
import { notifyStudioStoreUpdated } from "@/lib/studio-store";

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
// Complete Pre-Scanned Default Pages
// -------------------------------------------------------------

export function getInitialScannedPages(): VaultPageItem[] {
  const pages: VaultPageItem[] = [
    // 1. Root Fields (Level 0)
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

    // 2. Specialties under Photography (Level 1)
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

    // 3. Specialties under Graphic Design (Level 1)
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

    // 4. Projects under Fashion Photography (Level 2)
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

    // 5. Projects under Food Photography (Level 2)
    {
      id: "photography-food-signature-restaurant",
      route: "/photography/food-photography/signature-restaurant",
      name: "Signature Restaurant",
      parentRoute: "/photography/food-photography",
      coverPhoto: "src/assets/food/gastronomie/food-gastronomie-19.jpg",
      descriptionEn: "Fine dining culinary showcase, atmospheric interior lighting, and signature dish plating.",
      descriptionFa: "عکاسی غذا و فضای رستوران سیگنچر — روایتی از طعم، نورپردازی و هنر پذیرایی مدرن.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Category", value: "Fine Dining" }, { key: "Year", value: "2026" }],
      order: 40,
    },
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
      order: 41,
    },
    {
      id: "photography-food-cuisine",
      route: "/photography/food-photography/cuisine",
      name: "Cuisine",
      parentRoute: "/photography/food-photography",
      coverPhoto: "src/assets/food/cuisine/food-cuisine-01.jpg",
      descriptionEn: "Fresh culinary preparations and textural restaurant storytelling.",
      descriptionFa: "روایت تازه از آماده‌سازی غذا و طعم‌های رستورانی.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 42,
    },

    // 6. Projects under Portrait Photography (Level 2)
    {
      id: "photography-portrait-calligraphy",
      route: "/photography/portrait-photography/calligraphy",
      name: "Calligraphy",
      parentRoute: "/photography/portrait-photography",
      coverPhoto: "src/assets/portrait/calligraphy/portrait-calligraphy-02.jpg",
      descriptionEn: "Calligraphy conceptual portrait series.",
      descriptionFa: "مجموعه پرتره مفهومی کالیگرافی.",
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

    // 7. Projects under Product Photography (Level 2)
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

    // 8. Projects under Visual Identity (Level 2)
    {
      id: "graphic-design-visual-identity-meatlab",
      route: "/graphic-design/visual-identity/meatlab",
      name: "Meatlab",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/meatlab/graphic-design-meatlab-01.jpg",
      descriptionEn: "Visual identity and conceptual brand design for Meatlab.",
      descriptionFa: "طراحی هویت بصری و سیستم برند میت‌لب.",
      uiType: "UI01",
      isHidden: false,
      pairedBoxes: [
        { key: "Client", value: "Meatlab" },
        { key: "Category", value: "Visual Identity" },
        { key: "Year", value: "2025" },
      ],
      order: 69,
    },
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
      id: "graphic-design-femiq",
      route: "/graphic-design/visual-identity/femiq",
      name: "FEMIQ",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/femiq/graphic-design-femiq-01.jpg",
      descriptionEn: "Brand identity, pattern system, and cosmetics packaging for FEMIQ.",
      descriptionFa: "هویت بصری و بسته‌بندی محصولات فمیک.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Client", value: "FEMIQ" }, { key: "Year", value: "2024" }],
      order: 73,
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
      order: 74,
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
      order: 75,
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
      order: 76,
    },
    {
      id: "graphic-design-nozad-publication-visual-identity",
      route: "/graphic-design/visual-identity/nozad-publication-visual-identity",
      name: "Nozad Publication",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/nozad-publication/graphic-design-nozad-publication-01.jpg",
      descriptionEn: "Publishing house identity, colophon mark, and stationery system.",
      descriptionFa: "هویت بصری و نشان نشر نوزاد.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 77,
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
      order: 78,
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
      order: 79,
    },
    {
      id: "graphic-design-artemis",
      route: "/graphic-design/visual-identity/artemis",
      name: "Artemis",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/artemis/graphic-design-artemis-01.jpg",
      descriptionEn: "Artisanal food jar packaging and visual branding.",
      descriptionFa: "هویت و بسته‌بندی آرتمیس.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 80,
    },
    {
      id: "graphic-design-cichon",
      route: "/graphic-design/visual-identity/cichon",
      name: "Cichon",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/cichon/graphic-design-cichon-01.jpg",
      descriptionEn: "Typographic brand system and stationery suite.",
      descriptionFa: "سیستم تایپوگرافی و ست اداری سیچون.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 81,
    },
    {
      id: "graphic-design-farshid-rahimi",
      route: "/graphic-design/visual-identity/farshid-rahimi",
      name: "Farshid Rahimi",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/farshid-rahimi/graphic-design-farshid-rahimi-01.jpg",
      descriptionEn: "Personal identity and signature stationery system.",
      descriptionFa: "هویت بصری شخصی فرشید رحیمی.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 82,
    },
    {
      id: "graphic-design-maanaar",
      route: "/graphic-design/visual-identity/maanaar",
      name: "Maanaar",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/maanaar/graphic-design-maanaar-01.jpg",
      descriptionEn: "Minimalist architectural identity and monogram.",
      descriptionFa: "هویت مینیمال مانار.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 83,
    },
    {
      id: "graphic-design-mamrezz",
      route: "/graphic-design/visual-identity/mamrezz",
      name: "Mamrezz",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/mamrezz/graphic-design-mamrezz-01.jpg",
      descriptionEn: "Bold contemporary emblem and graphic brand expression.",
      descriptionFa: "نشان گرافیکی و هویت بصری ممرز.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 84,
    },
    {
      id: "graphic-design-snow-snack",
      route: "/graphic-design/visual-identity/snow-snack",
      name: "Snow Snack",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/snow-snack/graphic-design-snow-snack-01.jpg",
      descriptionEn: "Playful packaging patterns and identity for frozen treats.",
      descriptionFa: "طراحی بسته‌بندی و هویت اسنو اسنک.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 85,
    },
    {
      id: "graphic-design-zeee-products",
      route: "/graphic-design/visual-identity/zeee-products",
      name: "ZEEE Products",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/zeee-products/graphic-design-zeee-products-01.jpg",
      descriptionEn: "Industrial design packaging and product branding system.",
      descriptionFa: "هویت صنعتی و بسته‌بندی محصولات زی.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 86,
    },
    {
      id: "graphic-design-awli",
      route: "/graphic-design/visual-identity/awli",
      name: "AWLI",
      parentRoute: "/graphic-design/visual-identity",
      coverPhoto: "src/assets/graphic-design/awli/graphic-design-awli-01.jpg",
      descriptionEn: "Dynamic digital symbol and motion logo identity.",
      descriptionFa: "هویت بصری و لوگوموشن عالی.",
      uiType: "UI03",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2024" }],
      order: 87,
    },

    // 9. Book Covers Projects (Level 2)
    {
      id: "graphic-design-nozad-publications",
      route: "/graphic-design/book-covers/nozad-publications",
      name: "Nozad Publications",
      parentRoute: "/graphic-design/book-covers",
      coverPhoto: "src/assets/graphic-design/book-covers/graphic-design-book-covers-01.jpg",
      descriptionEn: "Literary book cover designs and typographic layouts for Nozad Publications.",
      descriptionFa: "طراحی جلدهای ادبی و لی‌اوت کتاب نشر نوزاد.",
      uiType: "UI02",
      isHidden: false,
      pairedBoxes: [{ key: "Client", value: "Nozad" }, { key: "Year", value: "2024" }],
      order: 95,
    },

    // 10. Video Projects (Level 2)
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
      order: 100,
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

    const ext = p.imgSrc?.toLowerCase().endsWith(".png")
      ? ".PNG"
      : p.imgSrc?.toLowerCase().endsWith(".mp4")
      ? ".MP4"
      : ".JPG";
    const dynamicFileName = `${dynamicCode}${ext}`;

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
      title: dynamicFileName,
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
// Pages CRUD with Dynamic Route Discovery & Synchronization
// -------------------------------------------------------------

export function getVaultPages(): VaultPageItem[] {
  const basePages = getInitialScannedPages();
  const pagesMap = new Map<string, VaultPageItem>();

  // 1. Populate all static base pages
  basePages.forEach((p) => {
    pagesMap.set(p.route.toLowerCase(), p);
  });

  // 2. Discover any custom projects from studio store (in browser)
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem("siavash_studio_custom_projects");
      if (customRaw) {
        const customList = JSON.parse(customRaw);
        if (Array.isArray(customList)) {
          customList.forEach((cp) => {
            if (!cp || !cp.id) return;
            const discNorm = normalizeDisciplineSlug(cp.discipline || "photography");
            let specNorm = normalizeSpecialtySlug(cp.subDiscipline || cp.category || "");
            if (!specNorm || specNorm === "general") {
              if (discNorm === "photography") specNorm = "food-photography";
              else if (discNorm === "graphic-design") specNorm = "visual-identity";
              else if (discNorm === "product-design") specNorm = "products";
              else if (discNorm === "video") specNorm = "videos";
            }
            const projSlug = normalizeProjectSlug(cp.title || cp.id);
            const route =
              discNorm === "video"
                ? `/video/${projSlug}`
                : discNorm === "product-design"
                ? `/product-design/${projSlug}`
                : `/${discNorm}/${specNorm}/${projSlug}`;
            const parentRoute =
              discNorm === "video"
                ? "/video"
                : discNorm === "product-design"
                ? "/product-design"
                : `/${discNorm}/${specNorm}`;

            const key = route.toLowerCase();
            if (!pagesMap.has(key)) {
              pagesMap.set(key, {
                id: `page-${discNorm}-${specNorm}-${projSlug}`,
                route,
                name: cp.title || projSlug,
                parentRoute,
                coverPhoto: cp.coverImage || "",
                descriptionEn: cp.description || "",
                descriptionFa: cp.descriptionFa || "",
                uiType: discNorm === "video" ? "UI04" : "UI01",
                isHidden: false,
                pairedBoxes: cp.year ? [{ key: "Year", value: String(cp.year) }] : [],
                order: 40,
              });
            }
          });
        }
      }
    } catch (e) {
      /* ignore */
    }

    // 3. Merge user customizations saved in STORAGE_VAULT_PAGES
    try {
      const savedRaw = localStorage.getItem(STORAGE_VAULT_PAGES);
      if (savedRaw) {
        const savedList: VaultPageItem[] = JSON.parse(savedRaw);
        if (Array.isArray(savedList)) {
          savedList.forEach((saved) => {
            if (!saved || !saved.route) return;
            const key = saved.route.toLowerCase();
            const existing = pagesMap.get(key) || Array.from(pagesMap.values()).find((p) => p.id === saved.id);
            if (existing) {
              pagesMap.set(existing.route.toLowerCase(), {
                ...existing,
                ...saved,
                name: saved.name !== undefined ? saved.name : existing.name,
                route: saved.route !== undefined ? saved.route : existing.route,
                parentRoute: saved.parentRoute !== undefined ? saved.parentRoute : existing.parentRoute,
                coverPhoto: (saved.coverPhoto && saved.coverPhoto.trim()) ? saved.coverPhoto : existing.coverPhoto,
                descriptionEn: saved.descriptionEn !== undefined ? saved.descriptionEn : existing.descriptionEn,
                descriptionFa: saved.descriptionFa !== undefined ? saved.descriptionFa : existing.descriptionFa,
                uiType: saved.uiType || existing.uiType,
                isHidden: saved.isHidden !== undefined ? saved.isHidden : existing.isHidden,
                pairedBoxes: saved.pairedBoxes || existing.pairedBoxes,
              });
            } else {
              // Custom user-created page
              pagesMap.set(key, saved);
            }
          });
        }
      }
    } catch (e) {
      console.error("Error merging saved vault pages:", e);
    }
  }

  const result = Array.from(pagesMap.values());
  return result;
}

export function saveVaultPage(page: VaultPageItem): void {
  if (typeof window === "undefined") return;
  const currentPages = getVaultPages();
  const idx = currentPages.findIndex((p) => p.id === page.id || p.route.toLowerCase() === page.route.toLowerCase());

  if (idx >= 0) {
    const oldRoute = currentPages[idx].route;
    currentPages[idx] = { ...currentPages[idx], ...page };

    // If route was changed, update any children parentRoute
    if (oldRoute && oldRoute.toLowerCase() !== page.route.toLowerCase()) {
      currentPages.forEach((item) => {
        if (item.parentRoute.toLowerCase() === oldRoute.toLowerCase()) {
          item.parentRoute = page.route;
        }
      });
    }
  } else {
    currentPages.push(page);
  }

  localStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(currentPages));

  // Sync to studio store custom projects if it matches a project
  try {
    const rawStudio = localStorage.getItem("siavash_studio_custom_projects");
    let studioList: any[] = rawStudio ? JSON.parse(rawStudio) : [];
    if (!Array.isArray(studioList)) studioList = [];

    const projSlug = normalizeProjectSlug(page.route.split("/").pop() || page.name);
    const sIdx = studioList.findIndex((p) => normalizeProjectSlug(p.title) === projSlug || p.id === projSlug);

    if (sIdx >= 0) {
      studioList[sIdx] = {
        ...studioList[sIdx],
        title: page.name,
        description: page.descriptionEn,
        descriptionFa: page.descriptionFa,
        coverImage: page.coverPhoto || studioList[sIdx].coverImage,
      };
    } else {
      studioList.push({
        id: projSlug,
        title: page.name,
        description: page.descriptionEn,
        descriptionFa: page.descriptionFa,
        coverImage: page.coverPhoto || "",
        discipline: page.route.includes("photo") ? "photography" : page.route.includes("graphic") ? "graphic-design" : page.route.includes("video") ? "video" : "product-design",
        category: page.parentRoute.split("/").pop() || "general",
        year: "2026",
        images: [],
      });
    }
    localStorage.setItem("siavash_studio_custom_projects", JSON.stringify(studioList));
    notifyStudioStoreUpdated({ type: "project_updated", id: projSlug });
  } catch (e) {
    /* ignore */
  }

  notifyVaultUpdated({ type: "page_saved", id: page.id });
}

export function deleteVaultPage(id: string): void {
  if (typeof window === "undefined") return;
  const list = getVaultPages().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(list));
  notifyVaultUpdated({ type: "page_deleted", id });
}

/**
 * Resilient lookup matching exact route, normalized route, or project slug
 */
export function getPageByRoute(route: string): VaultPageItem | undefined {
  if (!route) return undefined;
  const list = getVaultPages();
  const clean = route.trim().toLowerCase().replace(/\/+$/, "") || "/";

  // 1. Direct match
  const direct = list.find((p) => (p.route || "").trim().toLowerCase().replace(/\/+$/, "") === clean);
  if (direct) return direct;

  // 2. Trailing slug matching
  const segments = clean.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const lastSeg = segments[segments.length - 1];
    const prevSeg = segments[segments.length - 2];

    const byTwo = list.find((p) => {
      const pClean = (p.route || "").trim().toLowerCase().replace(/\/+$/, "");
      return pClean.endsWith(`/${prevSeg}/${lastSeg}`) || pClean.endsWith(`/${lastSeg}`);
    });
    if (byTwo) return byTwo;

    const bySlug = list.find((p) => {
      const pSlug = normalizeProjectSlug(p.name || p.id);
      return pSlug === lastSeg || p.id.toLowerCase().includes(lastSeg);
    });
    if (bySlug) return bySlug;
  }

  // 3. Single segment match
  if (segments.length === 1) {
    const seg = segments[0];
    const single = list.find((p) => {
      const pClean = (p.route || "").trim().toLowerCase().replace(/\/+$/, "");
      return pClean === `/${seg}` || p.id.toLowerCase() === seg;
    });
    if (single) return single;
  }

  return undefined;
}

// -------------------------------------------------------------
// Media CRUD
// -------------------------------------------------------------

export function getVaultMedia(): VaultMediaItem[] {
  const baseList = getInitialScannedMedia();
  if (typeof window === "undefined") return baseList;

  // Use a map keyed by uniqueCode or imgSrc to seamlessly merge base items + custom items + saved user edits
  const mediaMap = new Map<string, VaultMediaItem>();

  // 1. Load all base scanned items
  baseList.forEach((item) => {
    const key = (item.imgSrc || item.uniqueCode).toLowerCase();
    mediaMap.set(key, item);
  });

  // 2. Discover media from custom projects (e.g. from studio store in browser)
  try {
    const customRaw = localStorage.getItem("siavash_studio_custom_projects");
    if (customRaw) {
      const customProjects = JSON.parse(customRaw);
      if (Array.isArray(customProjects)) {
        customProjects.forEach((cp) => {
          if (!cp || !cp.id) return;
          const cpImages: string[] = Array.isArray(cp.images)
            ? cp.images.map((im: any) => (typeof im === "string" ? im : im.url))
            : cp.coverImage
            ? [cp.coverImage]
            : [];
          cpImages.forEach((src, idx) => {
            if (!src) return;
            const key = src.toLowerCase();
            if (!mediaMap.has(key)) {
              const uCode = String(8000 + mediaMap.size);
              const field = normalizeDisciplineSlug(cp.discipline || "graphic-design");
              const category = normalizeSpecialtySlug(cp.subDiscipline || cp.category || "visual-identity");
              const project = normalizeProjectSlug(cp.title || cp.id || "project");
              const ext = src.toLowerCase().endsWith(".png")
                ? ".PNG"
                : src.toLowerCase().endsWith(".mp4")
                ? ".MP4"
                : ".JPG";
              const dynamicCode = buildDynamicMediaCode(uCode, field, category, project);
              const dynamicFileName = `${dynamicCode}${ext}`;
              mediaMap.set(key, {
                id: `custom-media-${uCode}`,
                uniqueCode: uCode,
                dynamicCode,
                imgSrc: src,
                thumbSrc: src,
                field,
                category,
                project,
                assignedRoute: `/${field}/${category}/${project}`,
                title: dynamicFileName,
                year: String(cp.year || "2025"),
                client: cp.client || "",
                model: cp.models || "",
                makeupArtist: cp.makeupArtist || "",
                assistant: cp.assistant || "",
                caption: cp.caption || cp.description || "",
                isHidden: false,
                pairedBoxes: cp.client ? [{ key: "Client", value: cp.client }] : [],
                isVideo: Boolean(src.endsWith(".mp4")),
                createdAt: new Date().toISOString(),
              });
            }
          });
        });
      }
    }
  } catch (e) {
    console.error("Error discovering custom project media:", e);
  }

  // 3. Merge user edits from localStorage (toggled isHidden, modified pairedBoxes, etc.)
  try {
    const savedRaw = localStorage.getItem(STORAGE_VAULT_MEDIA);
    if (savedRaw) {
      const savedList: VaultMediaItem[] = JSON.parse(savedRaw);
      if (Array.isArray(savedList)) {
        savedList.forEach((saved) => {
          if (!saved) return;
          const key = (saved.imgSrc || saved.uniqueCode).toLowerCase();
          const existing =
            mediaMap.get(key) ||
            Array.from(mediaMap.values()).find(
              (m) => m.uniqueCode === saved.uniqueCode || m.id === saved.id,
            );
          if (existing) {
            mediaMap.set((existing.imgSrc || existing.uniqueCode).toLowerCase(), {
              ...existing,
              ...saved,
              imgSrc: saved.imgSrc || existing.imgSrc,
              thumbSrc: saved.thumbSrc || existing.thumbSrc,
            });
          } else {
            // New user-uploaded media item added directly in Vault
            mediaMap.set(key, saved);
          }
        });
      }
    }
  } catch (e) {
    console.error("Error loading vault media:", e);
  }

  const result = Array.from(mediaMap.values()).map(ensureMediaItemDynamicFields);
  return result;
}

export function ensureMediaItemDynamicFields(item: VaultMediaItem): VaultMediaItem {
  const uCode = (item.uniqueCode || item.id?.replace(/^media-/, "") || "1001").trim();
  const field = item.field || "photography";
  const category = item.category || "fashion-photography";
  const project = item.project || "project";

  const dynamicCode = buildDynamicMediaCode(uCode, field, category, project);
  const assignedRoute = `/${field}/${category}/${project}`;

  const ext = item.imgSrc?.toLowerCase().endsWith(".png")
    ? ".PNG"
    : item.imgSrc?.toLowerCase().endsWith(".mp4")
    ? ".MP4"
    : ".JPG";
  const dynamicFileName = `${dynamicCode}${ext}`;

  // Keep title in sync with dynamicCode + extension if it hasn't been given a distinct custom filename
  let title = item.title;
  if (
    !title ||
    title === item.project ||
    title === item.uniqueCode ||
    title.includes("—") ||
    title.toLowerCase().startsWith("media ") ||
    title.toLowerCase().startsWith("frame ") ||
    !title.includes("-")
  ) {
    title = dynamicFileName;
  } else if (!title.endsWith(ext) && !title.endsWith(".jpg") && !title.endsWith(".png") && !title.endsWith(".mp4")) {
    title = `${title}${ext}`;
  }

  return {
    ...item,
    uniqueCode: uCode,
    dynamicCode,
    field,
    category,
    project,
    assignedRoute,
    title,
  };
}

export function saveVaultMedia(item: VaultMediaItem): void {
  if (typeof window === "undefined") return;
  const processed = ensureMediaItemDynamicFields(item);
  const list = getVaultMedia();
  const idx = list.findIndex(
    (m) => m.id === processed.id || m.uniqueCode === processed.uniqueCode
  );
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...processed };
  } else {
    list.unshift(processed);
  }
  localStorage.setItem(STORAGE_VAULT_MEDIA, JSON.stringify(list));
  notifyVaultUpdated({ type: "media_saved", id: processed.id });
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
  if (!code) return undefined;
  const list = getVaultMedia();
  const cClean = code.trim().toUpperCase();
  const cWithoutExt = cClean.replace(/\.(JPG|JPEG|PNG|WEBP|MP4)$/i, "");

  return list.find((m) => {
    const dyn = (m.dynamicCode || "").toUpperCase();
    const uCode = (m.uniqueCode || "").toUpperCase();
    const mId = (m.id || "").toUpperCase();
    return (
      dyn === cClean ||
      dyn === cWithoutExt ||
      uCode === cClean ||
      mId === cClean ||
      (cClean.length === 4 && /^\d{4}$/.test(cClean) && (uCode === cClean || dyn.startsWith(`${cClean}-`)))
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
