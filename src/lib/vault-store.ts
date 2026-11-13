import { contentStorage, getPublishedArray, isContentReady, isVercelContentBackend, queueContentSave } from "./published-store";
import { echoPrimeVideos } from "@/data/video-assets";
/**
 * Studio Vault Master Store
 * Synchronous portfolio views backed by the shared published-content store.
 * Manages all Pages (routes hierarchy), Media (unique 4-digit + dynamic codes), Sizing, and UI Types.
 */

import { PHOTO_INVENTORY } from "@/data/photo-inventory";
import { projects as DEFAULT_PROJECTS } from "@/data/projects";
import { resolveInventoryImage, resolveKnownAssetFile } from "@/lib/inventory-assets";
import { deleteMediaBlob, isIndexedDbMediaUrl, listMediaBlobKeys } from "@/lib/local-media-db";
import type { UITypeCode } from "@/components/ui-types";
import type { KeyValuePair } from "@/components/vault/PairedBoxesEditor";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
} from "@/lib/taxonomy";
import { notifyStudioStoreUpdated } from "@/lib/studio-store";
import { resolveMediaTitle } from "@/lib/media-title";

export interface VaultPageItem {
  id: string;
  route: string; // e.g. "/photography/fashion-photography/sepidar"
  name: string;  // e.g. "Sepidar" -> tab title "Siavash Akbari - Sepidar"
  parentRoute: string; // e.g. "/photography/fashion-photography" or ""
  coverPhoto: string;
  coverModifiedByUser?: boolean;
  descriptionEn: string;
  descriptionFa: string;
  uiType: UITypeCode;
  uiTypeModifiedByUser?: boolean;
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
  category: string;     // e.g. "fashion-photography" ("" for flat fields)
  project: string;      // e.g. "sepidar" ("" for Posters)
  assignedRoute: string; // e.g. "/photography/fashion-photography/sepidar"
  title: string;
  titleModifiedByUser?: boolean;
  year: string;
  client?: string;
  model?: string;
  makeupArtist?: string;
  assistant?: string;
  caption: string;
  isHidden: boolean;
  pairedBoxes: KeyValuePair[];
  isVideo: boolean;
  taxonomyModifiedByUser?: boolean;
  createdAt: string;
}

export const FLAT_FIELDS = new Set(["video", "product-design"]);

const NON_PROJECT_SLUGS = new Set([
  "photography",
  "graphic-design",
  "video",
  "product-design",
  "fashion-photography",
  "food-photography",
  "portrait-photography",
  "product-photography",
  "visual-identity",
  "book-covers",
  "posters",
  "videos",
  "products",
  "general",
]);

function normalizeRouteStr(route?: string): string {
  const clean = (route || "").trim().toLowerCase().replace(/\/+$/, "");
  return clean || "/";
}

function extFromMediaSrc(imgSrc?: string): string {
  const clean = (imgSrc || "").split(/[?#]/)[0].toLowerCase();
  if (clean.endsWith(".png") || clean.startsWith("data:image/png")) return ".PNG";
  if (clean.endsWith(".webp") || clean.startsWith("data:image/webp")) return ".WEBP";
  if (clean.endsWith(".gif") || clean.startsWith("data:image/gif")) return ".GIF";
  if (clean.endsWith(".mp4") || clean.startsWith("data:video/mp4")) return ".MP4";
  if (clean.endsWith(".webm") || clean.startsWith("data:video/webm")) return ".WEBM";
  if (clean.endsWith(".mov") || clean.startsWith("data:video/quicktime")) return ".MOV";
  return ".JPG";
}

function isVideoMediaSrc(imgSrc?: string): boolean {
  return Boolean(imgSrc && /\.(mp4|webm|mov)(\?|#|$)|^data:video\//i.test(imgSrc));
}

export function filenameKeyFromSrc(src?: string): string {
  if (!src || src.startsWith("data:") || src.startsWith("blob:") || isIndexedDbMediaUrl(src)) {
    return (src || "").toLowerCase();
  }
  const withoutOrigin = src.trim().replace(/^https?:\/\/[^/]+/i, "");
  const knownFile = resolveKnownAssetFile(withoutOrigin);
  if (knownFile) return knownFile;
  const clean = withoutOrigin.split(/[?#]/)[0].trim();
  const base = (clean.split("/").pop() || clean).toLowerCase();
  return base.replace(/-[a-z0-9_-]{8}(\.[a-z0-9]+)$/i, (m, ext, _offset, full) => {
    const hashPart = m.slice(1, m.length - ext.length);
    if (/^\d+$/.test(hashPart)) return m;
    const stem = full.slice(0, full.length - m.length);
    return stem ? ext : m;
  });
}

function stemKeyFromSrc(src?: string): string {
  const fKey = filenameKeyFromSrc(src);
  if (!fKey || fKey.startsWith("data:") || fKey.startsWith("blob:")) return fKey;
  return fKey.replace(/\.[^.]+$/, "").replace(/-thumb$/, "");
}

export function buildAssignedRoute(field?: string, category?: string, project?: string): string {
  const f = normalizeDisciplineSlug(field || "photography");
  if (FLAT_FIELDS.has(f)) {
    const p = project ? normalizeProjectSlug(project) : "";
    return p && p !== f ? `/${f}/${p}` : `/${f}`;
  }
  const c = category ? normalizeSpecialtySlug(category) : "";
  const p = project ? normalizeProjectSlug(project) : "";
  const isBarePosters = f === "graphic-design" && c === "posters" && (!p || p === "posters");
  if (c && p && !isBarePosters) return `/${f}/${c}/${p}`;
  if (c) return `/${f}/${c}`;
  if (p) return `/${f}/${p}`;
  return `/${f}`;
}

export function buildMediaLiveDetailUrl(item: Pick<VaultMediaItem, "field" | "assignedRoute" | "dynamicCode">): string {
  const assigned = normalizeRouteStr(item.assignedRoute);
  if (item.field === "video") {
    return assigned === "/" ? "/video" : assigned;
  }
  if (!item.dynamicCode) return assigned;
  return assigned === "/" ? `/${item.dynamicCode}` : `${assigned}/${item.dynamicCode}`;
}

const STORAGE_VAULT_PAGES = "siavash_vault_pages_v2";
const STORAGE_VAULT_MEDIA = "siavash_vault_media_v2";
const STORAGE_DELETED_VAULT_PAGES = "siavash_vault_deleted_pages_v1";
const STORAGE_DELETED_VAULT_MEDIA = "siavash_vault_deleted_media_v1";
export const VAULT_STORE_CHANGED_EVENT = "siavash_vault_store_changed";

function readDeletedKeySet(storageKey: string): Set<string> {
  if (!isContentReady()) return new Set();
  try {
    const raw = contentStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((s) => String(s).trim().toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

function writeDeletedKeySet(storageKey: string, keys: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    contentStorage.setItem(storageKey, JSON.stringify(Array.from(keys)));
  } catch {
    /* ignore */
  }
}

function addDeletedKeys(storageKey: string, values: string[]): void {
  if (typeof window === "undefined" || values.length === 0) return;
  const set = readDeletedKeySet(storageKey);
  let changed = false;
  values.forEach((v) => {
    const clean = (v || "").trim().toLowerCase();
    if (clean && !set.has(clean)) {
      set.add(clean);
      changed = true;
    }
  });
  if (changed) writeDeletedKeySet(storageKey, set);
}

function removeDeletedKeys(storageKey: string, values: string[]): void {
  if (typeof window === "undefined" || values.length === 0) return;
  const set = readDeletedKeySet(storageKey);
  let changed = false;
  values.forEach((v) => {
    const clean = (v || "").trim().toLowerCase();
    if (clean && set.delete(clean)) {
      changed = true;
    }
  });
  if (changed) writeDeletedKeySet(storageKey, set);
}

export function getDeletedVaultPageKeys(): Set<string> {
  return readDeletedKeySet(STORAGE_DELETED_VAULT_PAGES);
}

export function getDeletedVaultMediaKeys(): Set<string> {
  return readDeletedKeySet(STORAGE_DELETED_VAULT_MEDIA);
}

export function getDeletedVaultCounts(): { pages: number; media: number } {
  const basePages = getInitialScannedPages();
  const baseMedia = getInitialScannedMedia();
  const delPages = getDeletedVaultPageKeys();
  const delMedia = getDeletedVaultMediaKeys();
  const pages = basePages.filter(
    (p) => delPages.has(p.route.toLowerCase()) || delPages.has(p.id.toLowerCase()),
  ).length;
  const media = baseMedia.filter(
    (m) => delMedia.has(m.id.toLowerCase()) || delMedia.has(m.uniqueCode.toLowerCase()),
  ).length;
  return { pages, media };
}

export function restoreDeletedVaultPages(): void {
  if (typeof window === "undefined") return;
  contentStorage.removeItem(STORAGE_DELETED_VAULT_PAGES);
  try {
    const baseById = new Map<string, VaultPageItem>();
    getInitialScannedPages().forEach((bp) => baseById.set(bp.id.toLowerCase(), bp));
    const savedRaw = contentStorage.getItem(STORAGE_VAULT_PAGES);
    if (savedRaw) {
      const savedList: VaultPageItem[] = JSON.parse(savedRaw);
      if (Array.isArray(savedList)) {
        let changed = false;
        const nextList = savedList.map((item) => {
          const base = item?.id ? baseById.get(item.id.toLowerCase()) : undefined;
          if (base && normalizeRouteStr(item.route) !== normalizeRouteStr(base.route)) {
            changed = true;
            const seg = normalizeProjectSlug(item.route.split("/").pop() || "custom");
            return { ...item, id: `custom-page-${base.id}-${seg}` };
          }
          return item;
        });
        if (changed) {
          contentStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(nextList));
        }
      }
    }
  } catch {
    /* ignore */
  }
  notifyVaultUpdated({ type: "pages_restored" });
}

export function restoreDeletedVaultMedia(): void {
  if (typeof window === "undefined") return;
  contentStorage.removeItem(STORAGE_DELETED_VAULT_MEDIA);
  notifyVaultUpdated({ type: "media_restored" });
}

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
  queueContentSave();
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
  const channelHandler = () => callback();
  vaultBroadcastChannel?.addEventListener("message", channelHandler);
  return () => {
    window.removeEventListener(VAULT_STORE_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
    vaultBroadcastChannel?.removeEventListener("message", channelHandler);
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
      coverPhoto: echoPrimeVideos[0],
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
      coverPhoto: "src/assets/food/gastronomie/food-gastronomie-01.jpg",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      uiType: "UI02",
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
      coverPhoto: echoPrimeVideos[0],
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
    const uniqueCode = p.uniqueCode || String(1001 + idx);
    existingCodes.add(uniqueCode);

    let field = "photography";
    let category = "fashion-photography";
    let project = normalizeProjectSlug(p.project || "");

    const discNorm = (p.disciplineSlug || p.discipline || "").toLowerCase();
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

    const assignedRoute = buildAssignedRoute(field, category, project);
    const dynamicCode = buildDynamicMediaCode(uniqueCode, field, category, project);

    const ext = extFromMediaSrc(p.imgSrc);
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
      caption: p.caption || "",
      isHidden: false,
      pairedBoxes,
      isVideo: isVideoMediaSrc(p.imgSrc),
      createdAt: new Date().toISOString(),
    });
  });

  return mediaList;
}

// -------------------------------------------------------------
// Pages CRUD with Dynamic Route Discovery & Synchronization
// -------------------------------------------------------------

export function getVaultPages(): VaultPageItem[] {
  if (isVercelContentBackend && isContentReady()) {
    const deleted = readDeletedKeySet(STORAGE_DELETED_VAULT_PAGES);
    return getPublishedArray<VaultPageItem>(STORAGE_VAULT_PAGES).filter((page) =>
      page?.route && !deleted.has(page.route.toLowerCase()) && !deleted.has(page.id?.toLowerCase()),
    );
  }
  const basePages = getInitialScannedPages();
  const pagesMap = new Map<string, VaultPageItem>();
  const allBaseById = new Map<string, VaultPageItem>(basePages.map((p) => [p.id, p]));
  const deletedKeys = readDeletedKeySet(STORAGE_DELETED_VAULT_PAGES);
  const movedFromRoutes = new Set<string>();

  // 1. Populate all active (non-deleted/non-retired) static base pages
  basePages.forEach((p) => {
    const rKey = p.route.toLowerCase();
    if (deletedKeys.has(rKey) || deletedKeys.has(p.id.toLowerCase())) return;
    pagesMap.set(rKey, p);
  });

  // 2. Discover published custom projects on both server and browser.
  if (isContentReady()) {
    try {
      const customRaw = contentStorage.getItem("siavash_studio_custom_projects");
      if (customRaw) {
        const customList = JSON.parse(customRaw);
        if (Array.isArray(customList)) {
          customList.forEach((cp) => {
            if (!cp || !cp.id) return;
            const rawId = String(cp.id).toLowerCase().trim();
            const cpRouteSegs = cp.route
              ? String(cp.route).split("/").filter(Boolean)
              : [];

            // The record's own route is authoritative. Deriving a route from
            // discipline/category invents phantom pages at the wrong address
            // (e.g. an empty category defaulting to food-photography) whenever the
            // studio record is stale or only partially filled in.
            let discNorm = "";
            let specNorm = "";
            let projSlug = "";

            if (cpRouteSegs.length >= 2) {
              discNorm = normalizeDisciplineSlug(cpRouteSegs[0]);
              projSlug = normalizeProjectSlug(cpRouteSegs[cpRouteSegs.length - 1]);
              if (!FLAT_FIELDS.has(discNorm)) {
                // A 2-segment non-flat route is a category, not a project page.
                if (cpRouteSegs.length < 3) return;
                specNorm = normalizeSpecialtySlug(cpRouteSegs[1]);
              }
            } else {
              // Legacy records without a route: require explicit taxonomy, never guess.
              discNorm = normalizeDisciplineSlug(cp.discipline || "photography");
              const isFlatDisc = FLAT_FIELDS.has(discNorm);
              if (!isFlatDisc) {
                specNorm = normalizeSpecialtySlug(cp.subDiscipline || cp.category || "");
                if (!specNorm || specNorm === "general") return;
              }
              projSlug = normalizeProjectSlug(cp.id || cp.title);
            }

            const isFlat = FLAT_FIELDS.has(discNorm);
            if (!projSlug || NON_PROJECT_SLUGS.has(projSlug) || NON_PROJECT_SLUGS.has(rawId)) {
              return;
            }
            const route = isFlat
              ? `/${discNorm}/${projSlug}`
              : `/${discNorm}/${specNorm}/${projSlug}`;
            const parentRoute = isFlat
              ? `/${discNorm}`
              : `/${discNorm}/${specNorm}`;

            const key = route.toLowerCase();
            if (deletedKeys.has(key) || deletedKeys.has(rawId)) return;
            if (!pagesMap.has(key)) {
              const safeCover =
                cp.coverImage && !String(cp.coverImage).startsWith("blob:")
                  ? resolveInventoryImage(String(cp.coverImage))
                  : "";
              pagesMap.set(key, {
                id: isFlat ? `page-${discNorm}-${projSlug}` : `page-${discNorm}-${specNorm}-${projSlug}`,
                route,
                name: cp.title || projSlug,
                parentRoute,
                coverPhoto: safeCover,
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

    // 3. Merge user customizations saved in STORAGE_VAULT_PAGES (supporting renames, moves, and deletions)
    let needsWriteBack = false;
    try {
      const savedRaw = contentStorage.getItem(STORAGE_VAULT_PAGES);
      if (savedRaw) {
        const savedList: VaultPageItem[] = JSON.parse(savedRaw);
        if (Array.isArray(savedList)) {
          savedList.forEach((saved) => {
            if (!saved || !saved.route) return;

            let route = (saved.route || "").trim().toLowerCase();
            let parentRoute = (saved.parentRoute || "").trim().toLowerCase();
            let name = saved.name || "";
            let id = saved.id || "";

            // Heal case 1: Gastronomie page hijacked or misnamed in past browser session
            if (id === "photography-food-gastronomie") {
              route = "/photography/food-photography/gastronomie";
              parentRoute = "/photography/food-photography";
              if (name.toLowerCase().includes("signature") || name.toLowerCase().includes("cafe")) {
                name = "Gastronomie";
                needsWriteBack = true;
              }
            }

            // Heal case 2: Signature Restaurant variants and ghost slugs (Signature-Cafe-Restaurant)
            if (
              route.includes("signature-cafe-restaurant") ||
              route.includes("signature-cafe") ||
              route === "/photography/food-photography/signature" ||
              id === "photography-food-signature-cafe-restaurant"
            ) {
              route = "/photography/food-photography/signature-restaurant";
              parentRoute = "/photography/food-photography";
              id = "photography-food-signature-restaurant";
              if (!name || name.toLowerCase().includes("cafe") || name.toLowerCase().includes("signature")) {
                name = "Signature Restaurant";
              }
              needsWriteBack = true;
            }

            // Heal case 3: Zen Studio variants
            if (route.includes("zen-studio-products")) {
              route = "/graphic-design/visual-identity/zen-studio";
              parentRoute = "/graphic-design/visual-identity";
              needsWriteBack = true;
            }

            // Route segment normalization across all disciplines and projects
            const segs = route.split("/").filter(Boolean);
            if (segs.length === 3) {
              const d = normalizeDisciplineSlug(segs[0]);
              const s = normalizeSpecialtySlug(segs[1]);
              const p = normalizeProjectSlug(segs[2]);
              const normRoute = `/${d}/${s}/${p}`;
              if (normRoute !== route) {
                route = normRoute;
                needsWriteBack = true;
              }
              parentRoute = `/${d}/${s}`;
            } else if (segs.length === 2) {
              const d = normalizeDisciplineSlug(segs[0]);
              const second = FLAT_FIELDS.has(d)
                ? normalizeProjectSlug(segs[1])
                : normalizeSpecialtySlug(segs[1]);
              const normRoute = `/${d}/${second}`;
              if (normRoute !== route) {
                route = normRoute;
                needsWriteBack = true;
              }
              parentRoute = `/${d}`;
            } else if (segs.length === 1) {
              const d = normalizeDisciplineSlug(segs[0]);
              const normRoute = `/${d}`;
              if (normRoute !== route) {
                route = normRoute;
                needsWriteBack = true;
              }
              parentRoute = "";
            }

            const key = route.toLowerCase();
            if (deletedKeys.has(key) || (id && deletedKeys.has(id.toLowerCase()))) {
              return;
            }

            const baseMatch = id ? allBaseById.get(id) : undefined;
            const existingAtKey = pagesMap.get(key);
            const existingById = id
              ? Array.from(pagesMap.values()).find((p) => p.id === id)
              : undefined;

            // If this built-in or existing page was moved/renamed to a NEW route key,
            // remove the old route slot and retire the old built-in route so it isn't resurrected!
            if (existingById && existingById.route.toLowerCase() !== key) {
              const oldKey = existingById.route.toLowerCase();
              pagesMap.delete(oldKey);
              movedFromRoutes.add(oldKey);
              needsWriteBack = true;
            } else if (baseMatch && baseMatch.route.toLowerCase() !== key) {
              const oldKey = baseMatch.route.toLowerCase();
              pagesMap.delete(oldKey);
              movedFromRoutes.add(oldKey);
            }

            const template = existingAtKey || existingById || baseMatch;
            if (template) {
              let chosenCover = template.coverPhoto;
              const rawSavedCover = (saved.coverPhoto || "").trim();
              if (rawSavedCover && !rawSavedCover.startsWith("blob:")) {
                const resolvedCover = resolveInventoryImage(rawSavedCover);
                const resolvedExisting = resolveInventoryImage(template.coverPhoto);
                const isKnownAsset =
                  resolvedCover.startsWith("data:") ||
                  resolvedCover.startsWith("idb://") ||
                  resolvedCover.startsWith("http://") ||
                  resolvedCover.startsWith("https://") ||
                  resolvedCover !== rawSavedCover ||
                  !rawSavedCover.startsWith("/assets/");

                if (isKnownAsset) {
                  if (
                    saved.coverModifiedByUser ||
                    !rawSavedCover.startsWith("/assets/") ||
                    resolvedCover === resolvedExisting
                  ) {
                    chosenCover = rawSavedCover;
                  } else {
                    needsWriteBack = true;
                  }
                } else {
                  needsWriteBack = true;
                }
              } else if (rawSavedCover.startsWith("blob:")) {
                needsWriteBack = true;
              }

              // Heal legacy un-edited Visual Identity project pages that accidentally cached UI03 directory cards
              let resolvedUiType = saved.uiType || template.uiType;
              if (
                !saved.uiTypeModifiedByUser &&
                parentRoute === "/graphic-design/visual-identity" &&
                resolvedUiType === "UI03"
              ) {
                resolvedUiType = template.uiType;
                needsWriteBack = true;
              }

              pagesMap.set(key, {
                ...template,
                id: template.id || id,
                route,
                parentRoute,
                name: name && name !== template.id ? name : template.name,
                descriptionEn:
                  saved.descriptionEn !== undefined ? saved.descriptionEn : template.descriptionEn,
                descriptionFa:
                  saved.descriptionFa !== undefined ? saved.descriptionFa : template.descriptionFa,
                coverPhoto: chosenCover,
                coverModifiedByUser: saved.coverModifiedByUser ?? template.coverModifiedByUser,
                uiType: resolvedUiType,
                uiTypeModifiedByUser: saved.uiTypeModifiedByUser ?? template.uiTypeModifiedByUser,
                isHidden: saved.isHidden !== undefined ? saved.isHidden : template.isHidden,
                pairedBoxes: saved.pairedBoxes || template.pairedBoxes,
                order: saved.order !== undefined ? saved.order : template.order,
              });
            } else {
              // Custom user-created page (drop stale expired blob: covers)
              const cleanCustomCover =
                saved.coverPhoto && !saved.coverPhoto.startsWith("blob:")
                  ? saved.coverPhoto
                  : "";
              pagesMap.set(key, {
                ...saved,
                id: id || `custom-page-${Date.now()}`,
                route,
                parentRoute,
                name: name || route,
                coverPhoto: cleanCustomCover,
              });
            }
          });
        }
      }
    } catch (e) {
      console.error("Error merging saved vault pages:", e);
    }

    if (movedFromRoutes.size > 0) {
      addDeletedKeys(STORAGE_DELETED_VAULT_PAGES, Array.from(movedFromRoutes));
    }

    // 4. Restore missing default base pages ONLY if neither deleted nor moved elsewhere
    const latestDeleted = readDeletedKeySet(STORAGE_DELETED_VAULT_PAGES);
    basePages.forEach((bp) => {
      const k = bp.route.toLowerCase();
      if (
        !pagesMap.has(k) &&
        !latestDeleted.has(k) &&
        !latestDeleted.has(bp.id.toLowerCase()) &&
        !movedFromRoutes.has(k)
      ) {
        pagesMap.set(k, bp);
        needsWriteBack = true;
      }
    });

    // 5. Write-back healed state to localStorage if corrections were made.
    //    Idempotent: only persist when the merged result actually differs from what's
    //    stored, so repeated reads/refresh ticks can't thrash storage and trigger
    //    redundant re-renders across subscribers.
    if (needsWriteBack && typeof window !== "undefined") {
      try {
        const next = JSON.stringify(Array.from(pagesMap.values()));
        if (contentStorage.getItem(STORAGE_VAULT_PAGES) !== next) {
          contentStorage.setItem(STORAGE_VAULT_PAGES, next);
        }
      } catch (e) {
        /* ignore */
      }
    }
  }

  const result = Array.from(pagesMap.values());
  return result;
}

export function saveVaultPage(page: VaultPageItem): void {
  if (typeof window === "undefined") return;

  // Normalize route and parentRoute before saving
  let normRoute = (page.route || "").trim().toLowerCase().replace(/\/+$/, "");
  let normParent = (page.parentRoute || "").trim().toLowerCase().replace(/\/+$/, "");
  const segs = normRoute.split("/").filter(Boolean);
  if (segs.length === 3) {
    const d = normalizeDisciplineSlug(segs[0]);
    const s = normalizeSpecialtySlug(segs[1]);
    const p = normalizeProjectSlug(segs[2]);
    normRoute = `/${d}/${s}/${p}`;
    normParent = `/${d}/${s}`;
  } else if (segs.length === 2) {
    const d = normalizeDisciplineSlug(segs[0]);
    const second = FLAT_FIELDS.has(d)
      ? normalizeProjectSlug(segs[1])
      : normalizeSpecialtySlug(segs[1]);
    normRoute = `/${d}/${second}`;
    normParent = `/${d}`;
  } else if (segs.length === 1) {
    const d = normalizeDisciplineSlug(segs[0]);
    normRoute = `/${d}`;
    normParent = "";
  }

  const normalizedPage: VaultPageItem = {
    ...page,
    route: normRoute,
    parentRoute: normParent,
  };

  const currentPages = getVaultPages();
  const idx = currentPages.findIndex((p) => p.id === normalizedPage.id);
  const byRouteIdx =
    idx >= 0
      ? idx
      : currentPages.findIndex((p) => p.route.toLowerCase() === normalizedPage.route.toLowerCase());

  const routeConflict = currentPages.find(
    (p, i) => i !== byRouteIdx && p.route.toLowerCase() === normalizedPage.route.toLowerCase()
  );
  if (routeConflict) {
    throw new Error(`Another page already uses route "${normalizedPage.route}".`);
  }

  let oldRoute = "";
  if (byRouteIdx >= 0) {
    oldRoute = currentPages[byRouteIdx].route;
    currentPages[byRouteIdx] = { ...currentPages[byRouteIdx], ...normalizedPage };
    const oldRouteLower = oldRoute.toLowerCase();
    if (oldRoute && oldRouteLower !== normalizedPage.route.toLowerCase()) {
      // Cascade rename to ALL descendants: their route was an extension of the
      // old parent prefix, otherwise they become unreachable orphans.
      currentPages.forEach((item) => {
        const itemRouteLower = (item.route || "").toLowerCase();
        if (itemRouteLower.startsWith(`${oldRouteLower}/`)) {
          item.route = `${normalizedPage.route}${item.route.slice(oldRoute.length)}`;
        }
        const parentLower = (item.parentRoute || "").toLowerCase();
        if (parentLower === oldRouteLower) {
          item.parentRoute = normalizedPage.route;
        } else if (parentLower.startsWith(`${oldRouteLower}/`)) {
          item.parentRoute = `${normalizedPage.route}${(item.parentRoute || "").slice(oldRoute.length)}`;
        }
      });
    }
  } else {
    currentPages.push(normalizedPage);
  }

  // Collect every route that moved in this save (the page itself + every descendant
  // whose prefix was rewritten) so media can be rebound and old routes tombstoned.
  const routeRebinds: { oldRoute: string; newRoute: string }[] = [];
  const renaming = Boolean(oldRoute) && oldRoute.toLowerCase() !== normalizedPage.route.toLowerCase();
  if (renaming) {
    const oldRouteLower = oldRoute.toLowerCase();
    const rebound = new Set<string>();
    currentPages.forEach((item) => {
      const itemRouteLower = (item.route || "").toLowerCase();
      const newPrefixLower = normalizedPage.route.toLowerCase();
      if (itemRouteLower === newPrefixLower || itemRouteLower.startsWith(`${newPrefixLower}/`)) {
        const suffix = item.route.slice(normalizedPage.route.length);
        const impliedOld = `${oldRoute}${suffix}`;
        const impliedOldLower = impliedOld.toLowerCase();
        if (
          impliedOldLower !== itemRouteLower &&
          (impliedOldLower === oldRouteLower || impliedOldLower.startsWith(`${oldRouteLower}/`)) &&
          !rebound.has(impliedOldLower)
        ) {
          rebound.add(impliedOldLower);
          routeRebinds.push({ oldRoute: impliedOld, newRoute: item.route });
        }
      }
    });
    const renamedLower = oldRouteLower;
    if (!rebound.has(renamedLower)) {
      routeRebinds.push({ oldRoute, newRoute: normalizedPage.route });
    }
  }

  contentStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(currentPages));
  // Active route & id are un-deleted if recreated/reused; every retired route
  // (including descendants) becomes tombstoned so the built-ins don't resurrect.
  removeDeletedKeys(STORAGE_DELETED_VAULT_PAGES, [normRoute.toLowerCase(), normalizedPage.id.toLowerCase()]);
  if (renaming) {
    addDeletedKeys(
      STORAGE_DELETED_VAULT_PAGES,
      routeRebinds.map((r) => r.oldRoute.toLowerCase()),
    );
  }

  const oldProjSlug = oldRoute ? normalizeProjectSlug(oldRoute.split("/").pop() || "") : "";

  // Rebind assigned media for EVERY moved route (page + descendants), preserving
  // the relative remainder of each route so nested media follows its page.
  if (routeRebinds.length > 0) {
    try {
      const currentMedia = getVaultMedia();
      let mediaMoved = false;
      const nextMedia = currentMedia.map((m) => {
        const mRoute = normalizeRouteStr(m.assignedRoute);
        const hit = routeRebinds.find(
          (r) =>
            mRoute === normalizeRouteStr(r.oldRoute) ||
            mRoute.startsWith(`${normalizeRouteStr(r.oldRoute)}/`),
        );
        if (!hit) return m;
        const hitOldNorm = normalizeRouteStr(hit.oldRoute);
        const newAssigned = `${hit.newRoute}${mRoute.slice(hitOldNorm.length)}`;
        const newSegs = newAssigned.split("/").filter(Boolean);
        const newField = normalizeDisciplineSlug(newSegs[0] || "photography");
        const newFlat = FLAT_FIELDS.has(newField);
        const newCat = newFlat ? "" : normalizeSpecialtySlug(newSegs[1] || "");
        const newProj =
          newSegs.length >= 3
            ? normalizeProjectSlug(newSegs[2])
            : newSegs.length === 2 && newFlat
              ? normalizeProjectSlug(newSegs[1])
              : "";
        mediaMoved = true;
        return ensureMediaItemDynamicFields({
          ...m,
          field: newField,
          category: newCat,
          project: newProj,
          assignedRoute: newAssigned,
          taxonomyModifiedByUser: true,
        });
      });
      if (mediaMoved) {
        contentStorage.setItem(STORAGE_VAULT_MEDIA, JSON.stringify(nextMedia));
      }
    } catch {
      /* ignore */
    }
  }

  // Sync to studio store custom projects ONLY for project-level routes
  // (Level-0 disciplines & Level-1 categories must NEVER be stored as studio projects)
  const normSegs = normRoute.split("/").filter(Boolean);
  const isProjectLevel =
    normSegs.length === 3 || (normSegs.length === 2 && FLAT_FIELDS.has(normSegs[0]));

  if (isProjectLevel) {
    try {
      const rawStudio = contentStorage.getItem("siavash_studio_custom_projects");
      let studioList: any[] = rawStudio ? JSON.parse(rawStudio) : [];
      if (!Array.isArray(studioList)) studioList = [];

      if (oldRoute && oldRoute.toLowerCase() !== normRoute.toLowerCase()) {
        studioList = studioList.filter(
          (p) =>
            p &&
            (p.route || "").toLowerCase() !== oldRoute.toLowerCase() &&
            (!oldProjSlug || p.id !== oldProjSlug),
        );
      }

      const disc = normSegs[0];
      const spec = normSegs.length === 3 ? normSegs[1] : "";
      const projSlug = normalizeProjectSlug(normSegs[normSegs.length - 1] || page.name);
      if (projSlug && !NON_PROJECT_SLUGS.has(projSlug)) {
        const sIdx = studioList.findIndex(
          (p) =>
            (p.route || "").toLowerCase() === normRoute.toLowerCase() ||
            p.id === projSlug ||
            (oldProjSlug && p.id === oldProjSlug)
        );

        if (sIdx >= 0) {
          studioList[sIdx] = {
            ...studioList[sIdx],
            id: projSlug,
            route: normRoute,
            title: page.name,
            discipline: disc,
            category: spec || disc,
            subDiscipline: spec || page.name,
            description: page.descriptionEn,
            descriptionFa: page.descriptionFa,
            coverImage: page.coverPhoto || studioList[sIdx].coverImage,
            ...(page.coverModifiedByUser ? { coverImageModifiedByUser: true } : {}),
          };
        } else {
          studioList.push({
            id: projSlug,
            route: normRoute,
            title: page.name,
            description: page.descriptionEn,
            descriptionFa: page.descriptionFa,
            coverImage: page.coverPhoto || "",
            ...(page.coverModifiedByUser ? { coverImageModifiedByUser: true } : {}),
            discipline: disc,
            category: spec || disc,
            subDiscipline: spec || page.name,
            year: "2026",
            images: [],
          });
        }
        contentStorage.setItem("siavash_studio_custom_projects", JSON.stringify(studioList));
        notifyStudioStoreUpdated({ type: "project_updated", id: projSlug });
      }
    } catch (e) {
      /* ignore */
    }
  }

  notifyVaultUpdated({ type: "page_saved", id: page.id });
}

export function deleteVaultPage(id: string): void {
  if (typeof window === "undefined") return;
  const current = getVaultPages();
  const target = current.find((p) => p.id === id);
  if (!target) return;

  const targetRouteNorm = normalizeRouteStr(target.route);
  const toDelete = current.filter(
    (p) =>
      p.id === id ||
      normalizeRouteStr(p.route) === targetRouteNorm ||
      normalizeRouteStr(p.route).startsWith(`${targetRouteNorm}/`),
  );
  const deleteIdSet = new Set(toDelete.map((p) => p.id));
  const deleteTombstones: string[] = [];
  toDelete.forEach((p) => {
    deleteTombstones.push(p.id.toLowerCase(), p.route.toLowerCase());
  });
  addDeletedKeys(STORAGE_DELETED_VAULT_PAGES, deleteTombstones);

  const list = current.filter((p) => !deleteIdSet.has(p.id));
  contentStorage.setItem(STORAGE_VAULT_PAGES, JSON.stringify(list));

  try {
    const rawStudio = contentStorage.getItem("siavash_studio_custom_projects");
    if (rawStudio) {
      const studioList = JSON.parse(rawStudio);
      if (Array.isArray(studioList)) {
        const deletedRouteSet = new Set(toDelete.map((p) => p.route.toLowerCase()));
        const deletedSlugSet = new Set(
          toDelete.map((p) => normalizeProjectSlug(p.route.split("/").pop() || p.name)),
        );
        const filtered = studioList.filter(
          (cp: any) =>
            cp &&
            !deletedRouteSet.has((cp.route || "").toLowerCase()) &&
            !deletedSlugSet.has(String(cp.id || "").toLowerCase()) &&
            !deletedSlugSet.has(normalizeProjectSlug(cp.title || "")),
        );
        contentStorage.setItem("siavash_studio_custom_projects", JSON.stringify(filtered));
        toDelete.forEach((p) => {
          const slug = normalizeProjectSlug(p.route.split("/").pop() || p.name);
          notifyStudioStoreUpdated({ type: "project_deleted", id: slug });
        });
      }
    }
  } catch (e) {
    /* ignore */
  }

  notifyVaultUpdated({ type: "page_deleted", id });
}

/**
 * Checks whether a route or any of its parent ancestor routes is marked hidden in Vault Pages.
 */
export function isRouteOrAncestorHidden(route: string, pagesList?: VaultPageItem[]): boolean {
  const pages = pagesList || getVaultPages();
  const byRoute = new Map<string, VaultPageItem>();
  pages.forEach((p) => byRoute.set(normalizeRouteStr(p.route), p));

  const segs = normalizeRouteStr(route).split("/").filter(Boolean);
  for (let i = 1; i <= segs.length; i++) {
    const prefix = `/${segs.slice(0, i).join("/")}`;
    const page = byRoute.get(prefix);
    if (page?.isHidden) return true;
  }
  return false;
}

/**
 * Strict hierarchical lookup matching exact route, normalized canonical route, or flat-field route.
 * Never returns false matches via loose substring inclusion.
 */
export function getPageByRoute(route: string): VaultPageItem | undefined {
  if (!route) return undefined;
  const list = getVaultPages();
  const clean = normalizeRouteStr(route);

  // 1. Direct normalized route match
  const direct = list.find((p) => normalizeRouteStr(p.route) === clean);
  if (direct) return direct;

  // 2. Canonicalized segment matching
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 1) {
    const d = normalizeDisciplineSlug(segments[0]);
    const single = list.find((p) => normalizeRouteStr(p.route) === `/${d}` || p.id.toLowerCase() === segments[0]);
    if (single) return single;
  } else if (segments.length === 2) {
    const d = normalizeDisciplineSlug(segments[0]);
    const secondCandidate = FLAT_FIELDS.has(d)
      ? `/${d}/${normalizeProjectSlug(segments[1])}`
      : `/${d}/${normalizeSpecialtySlug(segments[1])}`;
    const matched = list.find((p) => normalizeRouteStr(p.route) === secondCandidate);
    if (matched) return matched;
  } else if (segments.length === 3) {
    const d = normalizeDisciplineSlug(segments[0]);
    const s = normalizeSpecialtySlug(segments[1]);
    const proj = normalizeProjectSlug(segments[2]);
    const canonical3 = `/${d}/${s}/${proj}`;
    const matched = list.find((p) => normalizeRouteStr(p.route) === canonical3);
    if (matched) return matched;
  }

  return undefined;
}

// -------------------------------------------------------------
// Media CRUD
// -------------------------------------------------------------

export function getVaultMedia(): VaultMediaItem[] {
  if (isVercelContentBackend && isContentReady()) {
    const deleted = readDeletedKeySet(STORAGE_DELETED_VAULT_MEDIA);
    return getPublishedArray<VaultMediaItem>(STORAGE_VAULT_MEDIA)
      .filter((item) => item && !deleted.has(item.id?.toLowerCase()) && !deleted.has(item.uniqueCode?.toLowerCase()))
      .map(ensureMediaItemDynamicFields);
  }
  const baseList = getInitialScannedMedia();
  if (!isContentReady()) return baseList;

  // Use maps keyed by normalized asset src/filename/stem/uniqueCode so base items, custom items, and edits merge cleanly
  const mediaMap = new Map<string, VaultMediaItem>();
  const byFileKey = new Map<string, string>();
  const byStemKey = new Map<string, string>();
  const byUniqueCode = new Map<string, string>();
  const deletedMediaKeys = readDeletedKeySet(STORAGE_DELETED_VAULT_MEDIA);
  const deletedFileKeys = new Set<string>();
  const deletedStemKeys = new Set<string>();

  // 1. Load all active (non-deleted) base scanned items
  baseList.forEach((item) => {
    const fKey = filenameKeyFromSrc(item.imgSrc);
    const sKey = stemKeyFromSrc(item.imgSrc);
    if (
      deletedMediaKeys.has(item.id.toLowerCase()) ||
      deletedMediaKeys.has(item.uniqueCode.toLowerCase())
    ) {
      if (fKey) deletedFileKeys.add(fKey);
      if (sKey) deletedStemKeys.add(sKey);
      return;
    }
    const key = (item.imgSrc || item.uniqueCode).toLowerCase();
    mediaMap.set(key, item);
    if (fKey) byFileKey.set(fKey, key);
    if (sKey) byStemKey.set(sKey, key);
    if (item.uniqueCode) byUniqueCode.set(item.uniqueCode, key);
  });

  // 2. Discover media from custom projects (e.g. from studio store in browser)
  try {
    const customRaw = contentStorage.getItem("siavash_studio_custom_projects");
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
          cpImages.forEach((src) => {
            if (!src || src.startsWith("blob:")) return;
            const key = src.toLowerCase();
            const fKey = filenameKeyFromSrc(src);
            const sKey = stemKeyFromSrc(src);
            if (
              (fKey && deletedFileKeys.has(fKey)) ||
              (sKey && deletedStemKeys.has(sKey))
            ) {
              return;
            }
            if (
              !mediaMap.has(key) &&
              !(fKey && byFileKey.has(fKey)) &&
              !(sKey && byStemKey.has(sKey))
            ) {
              const uCode = String(8000 + mediaMap.size);
              const field = normalizeDisciplineSlug(cp.discipline || "graphic-design");
              const category = FLAT_FIELDS.has(field)
                ? ""
                : normalizeSpecialtySlug(cp.subDiscipline || cp.category || "visual-identity");
              const project = normalizeProjectSlug(cp.title || cp.id || "project");
              if (!project || NON_PROJECT_SLUGS.has(project)) return;
              const ext = extFromMediaSrc(src);
              const dynamicCode = buildDynamicMediaCode(uCode, field, category, project);
              const dynamicFileName = `${dynamicCode}${ext}`;
              const assignedRoute = buildAssignedRoute(field, category, project);
              mediaMap.set(key, {
                id: `custom-media-${uCode}`,
                uniqueCode: uCode,
                dynamicCode,
                imgSrc: src,
                thumbSrc: src,
                field,
                category,
                project,
                assignedRoute,
                title: dynamicFileName,
                year: String(cp.year || "2025"),
                client: cp.client || "",
                model: cp.models || "",
                makeupArtist: cp.makeupArtist || "",
                assistant: cp.assistant || "",
                caption: cp.caption || cp.description || "",
                isHidden: false,
                pairedBoxes: cp.client ? [{ key: "Client", value: cp.client }] : [],
                isVideo: isVideoMediaSrc(src),
                createdAt: new Date().toISOString(),
              });
              if (fKey) byFileKey.set(fKey, key);
              if (sKey) byStemKey.set(sKey, key);
              byUniqueCode.set(uCode, key);
            }
          });
        });
      }
    }
  } catch (e) {
    console.error("Error discovering custom project media:", e);
  }

  // 3. Merge user edits from localStorage with self-healing
  let mediaNeedsWriteBack = false;
  try {
    const savedRaw = contentStorage.getItem(STORAGE_VAULT_MEDIA);
    if (savedRaw) {
      const savedList: VaultMediaItem[] = JSON.parse(savedRaw);
      if (Array.isArray(savedList)) {
        savedList.forEach((saved) => {
          if (!saved) return;
          if (
            (saved.id && deletedMediaKeys.has(saved.id.toLowerCase())) ||
            (saved.uniqueCode && deletedMediaKeys.has(saved.uniqueCode.toLowerCase()))
          ) {
            return;
          }
          const sSrc = (saved.imgSrc || "").toLowerCase();
          const sFileKey = filenameKeyFromSrc(saved.imgSrc);
          const sStemKey = stemKeyFromSrc(saved.imgSrc);

          const matchedKey =
            (sSrc && mediaMap.has(sSrc) ? sSrc : undefined) ||
            (sFileKey && byFileKey.get(sFileKey)) ||
            (sStemKey && byStemKey.get(sStemKey)) ||
            (saved.uniqueCode && byUniqueCode.get(saved.uniqueCode)) ||
            undefined;

          const existing = matchedKey
            ? mediaMap.get(matchedKey)
            : Array.from(mediaMap.values()).find((m) => m.id === saved.id);

          if (existing) {
            // Heal phantom duplicate custom-media entries that collide with canonical inventory items
            if (saved.id?.startsWith("custom-media-") && existing.id !== saved.id) {
              mediaNeedsWriteBack = true;
              return;
            }
            const existingKey = (existing.imgSrc || existing.uniqueCode).toLowerCase();
            const preserveTaxonomy = Boolean(saved.taxonomyModifiedByUser);
            const nextField = preserveTaxonomy && saved.field ? normalizeDisciplineSlug(saved.field) : existing.field;
            const nextCat = preserveTaxonomy
              ? FLAT_FIELDS.has(nextField)
                ? ""
                : saved.category !== undefined
                  ? saved.category
                    ? normalizeSpecialtySlug(saved.category)
                    : ""
                  : nextField === existing.field
                    ? existing.category
                    : ""
              : existing.category;
            const nextProj = preserveTaxonomy
              ? saved.project !== undefined
                ? normalizeProjectSlug(saved.project)
                : existing.project
              : existing.project;
            const nextAssigned = preserveTaxonomy
              ? buildAssignedRoute(nextField, nextCat, nextProj)
              : existing.assignedRoute;
            const nextDynamic = preserveTaxonomy
              ? buildDynamicMediaCode(existing.uniqueCode, nextField, nextCat, nextProj)
              : existing.dynamicCode;

            mediaMap.set(existingKey, {
              ...existing,
              field: nextField,
              category: nextCat,
              project: nextProj,
              assignedRoute: nextAssigned,
              dynamicCode: nextDynamic,
              taxonomyModifiedByUser: saved.taxonomyModifiedByUser ?? existing.taxonomyModifiedByUser,
              title: saved.title && saved.title !== existing.dynamicCode ? saved.title : existing.title,
              year: saved.year !== undefined ? saved.year : existing.year,
              isHidden: saved.isHidden !== undefined ? saved.isHidden : existing.isHidden,
              pairedBoxes: saved.pairedBoxes || existing.pairedBoxes,
              caption: saved.caption !== undefined ? saved.caption : existing.caption,
              client: saved.client !== undefined ? saved.client : existing.client,
              model: saved.model !== undefined ? saved.model : existing.model,
              makeupArtist: saved.makeupArtist !== undefined ? saved.makeupArtist : existing.makeupArtist,
              assistant: saved.assistant !== undefined ? saved.assistant : existing.assistant,
            });
          } else if (
            saved.id?.startsWith("custom-media-") ||
            sSrc.startsWith("data:") ||
            sSrc.startsWith("idb://") ||
            sSrc.startsWith("http://") ||
            sSrc.startsWith("https://")
          ) {
            // Valid user-uploaded media item added directly in Vault (ignore expired raw blob: uploads)
            const key = (saved.imgSrc || saved.uniqueCode).toLowerCase();
            if (!sSrc.startsWith("blob:")) {
              mediaMap.set(key, {
                ...saved,
                isVideo: saved.isVideo || isVideoMediaSrc(saved.imgSrc),
              });
              if (sFileKey) byFileKey.set(sFileKey, key);
              if (sStemKey) byStemKey.set(sStemKey, key);
              if (saved.uniqueCode) byUniqueCode.set(saved.uniqueCode, key);
            } else {
              mediaNeedsWriteBack = true;
            }
          }
        });
      }
    }
  } catch (e) {
    console.error("Error loading vault media:", e);
  }

  // 4. Invariant: Guarantee active non-deleted base inventory media items are present & un-shadowed,
  // while respecting explicit user-moved taxonomy (`taxonomyModifiedByUser === true`)
  baseList.forEach((bm) => {
    if (
      deletedMediaKeys.has(bm.id.toLowerCase()) ||
      deletedMediaKeys.has(bm.uniqueCode.toLowerCase())
    ) {
      return;
    }
    const k = (bm.imgSrc || bm.uniqueCode).toLowerCase();
    const current = mediaMap.get(k);
    if (!current) {
      mediaMap.set(k, bm);
      mediaNeedsWriteBack = true;
    } else if (!current.taxonomyModifiedByUser) {
      if (
        current.uniqueCode !== bm.uniqueCode ||
        current.project !== bm.project ||
        current.field !== bm.field ||
        current.category !== bm.category ||
        current.assignedRoute !== bm.assignedRoute ||
        current.dynamicCode !== bm.dynamicCode
      ) {
        mediaMap.set(k, {
          ...current,
          uniqueCode: bm.uniqueCode,
          dynamicCode: bm.dynamicCode,
          field: bm.field,
          category: bm.category,
          project: bm.project,
          assignedRoute: bm.assignedRoute,
        });
        mediaNeedsWriteBack = true;
      }
    } else if (current.uniqueCode !== bm.uniqueCode) {
      mediaMap.set(k, { ...current, uniqueCode: bm.uniqueCode });
      mediaNeedsWriteBack = true;
    }
  });

  // 5. Write-back healed state to localStorage if corrections were made
    if (mediaNeedsWriteBack && typeof window !== "undefined") {
      try {
        const next = JSON.stringify(Array.from(mediaMap.values()));
        if (contentStorage.getItem(STORAGE_VAULT_MEDIA) !== next) {
          contentStorage.setItem(STORAGE_VAULT_MEDIA, next);
        }
      } catch (e) {
        /* ignore */
      }
    }

  const processed = Array.from(mediaMap.values()).map(ensureMediaItemDynamicFields);
  const customUploads = processed
    .filter((m) => m.id?.startsWith("custom-media-"))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const baseItems = processed.filter((m) => !m.id?.startsWith("custom-media-"));
  return [...customUploads, ...baseItems];
}

export function ensureMediaItemDynamicFields(item: VaultMediaItem): VaultMediaItem {
  const uCode = (item.uniqueCode || item.id?.replace(/^media-/, "") || "1001").trim();
  const field = normalizeDisciplineSlug(item.field || "photography");
  const isFlat = FLAT_FIELDS.has(field);
  const category = isFlat
    ? ""
    : item.category
    ? normalizeSpecialtySlug(item.category)
    : field === "graphic-design"
    ? "visual-identity"
    : "fashion-photography";
  const rawProj = (item.project || "").trim();
  const isBarePosters =
    field === "graphic-design" &&
    category === "posters" &&
    (!rawProj || rawProj.toLowerCase() === "posters" || rawProj === "nozad-publications");
  const project = isBarePosters ? "" : rawProj ? normalizeProjectSlug(rawProj) : "";

  const dynamicCode = buildDynamicMediaCode(uCode, field, category, project);
  const assignedRoute = buildAssignedRoute(field, category, project);

  const ext = extFromMediaSrc(item.imgSrc);
  const title = resolveMediaTitle({ ...item, uniqueCode: uCode }, dynamicCode, ext);

  return {
    ...item,
    // Every Vault media type has the same editable description field. Older
    // records without one are normalized before they are saved again.
    caption: item.caption ?? "",
    uniqueCode: uCode,
    dynamicCode,
    field,
    category,
    project,
    assignedRoute,
    title,
    isVideo: item.isVideo || isVideoMediaSrc(item.imgSrc),
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
  try {
    contentStorage.setItem(STORAGE_VAULT_MEDIA, JSON.stringify(list));
  } catch (err) {
    throw new Error(
      "Could not save media metadata to browser localStorage (quota exceeded). Try deleting unused large inline uploads or use IndexedDB / hosted URLs.",
      { cause: err },
    );
  }
  notifyVaultUpdated({ type: "media_saved", id: processed.id });
}

export function deleteVaultMedia(idOrCode: string): void {
  if (typeof window === "undefined") return;
  const list = getVaultMedia();
  const target = list.find((m) => m.id === idOrCode || m.uniqueCode === idOrCode);
  if (target) {
    if (target.imgSrc && isIndexedDbMediaUrl(target.imgSrc)) {
      void deleteMediaBlob(target.imgSrc);
    }
    if (!target.id.startsWith("custom-media-")) {
      addDeletedKeys(STORAGE_DELETED_VAULT_MEDIA, [
        target.id.toLowerCase(),
        target.uniqueCode.toLowerCase(),
      ]);
    }
    const filtered = list.filter(
      (m) => m.id !== target.id && m.uniqueCode !== target.uniqueCode,
    );
    contentStorage.setItem(STORAGE_VAULT_MEDIA, JSON.stringify(filtered));
    notifyVaultUpdated({ type: "media_deleted", id: idOrCode });
  }
}

export function getMediaByCode(code: string): VaultMediaItem | undefined {
  if (!code) return undefined;
  const list = getVaultMedia();
  const cClean = code.trim().toUpperCase();
  const cWithoutExt = cClean.replace(/\.(JPG|JPEG|PNG|WEBP|GIF|MP4|WEBM|MOV)$/i, "");

  return list.find((m) => {
    const dyn = (m.dynamicCode || "").toUpperCase();
    const uCode = (m.uniqueCode || "").toUpperCase();
    const mId = (m.id || "").toUpperCase();
    const codeLeading4 = cClean.length >= 4 && /^\d{4}/.test(cClean) ? cClean.slice(0, 4) : "";
    return (
      dyn === cClean ||
      dyn === cWithoutExt ||
      uCode === cClean ||
      mId === cClean ||
      (codeLeading4 && (uCode === codeLeading4 || dyn.startsWith(`${codeLeading4}-`)))
    );
  });
}

/**
 * Returns visible Vault media items for a public gallery route (project, specialty, or discipline).
 * Enforces both item.isHidden and ancestor page isHidden flags, and preserves curated DEFAULT_PROJECTS
 * frame ordering while seamlessly including custom/moved items.
 */
export function getGalleryMediaForRoute(
  route: string,
  options?: { includeDescendants?: boolean }
): VaultMediaItem[] {
  const cleanRoute = normalizeRouteStr(route);
  const pages = getVaultPages();
  if (isRouteOrAncestorHidden(cleanRoute, pages)) return [];

  const includeDescendants = Boolean(options?.includeDescendants);
  const allMedia = getVaultMedia();

  const matching = allMedia.filter((m) => {
    if (m.isHidden) return false;
    const aRoute = normalizeRouteStr(m.assignedRoute);
    if (isRouteOrAncestorHidden(aRoute, pages)) return false;
    if (includeDescendants) {
      return aRoute === cleanRoute || aRoute.startsWith(`${cleanRoute}/`);
    }
    return aRoute === cleanRoute;
  });

  // Preserve curated editorial order from DEFAULT_PROJECTS when matching default project slug
  const routeSegs = cleanRoute.split("/").filter(Boolean);
  const lastSeg = routeSegs[routeSegs.length - 1] || "";
  const defProj = DEFAULT_PROJECTS.find(
    (p) => normalizeProjectSlug(p.id) === lastSeg || p.id.toLowerCase() === lastSeg
  );

  if (defProj && Array.isArray(defProj.gallery) && defProj.gallery.length > 0 && !includeDescendants) {
    const orderByStem = new Map<string, number>();
    defProj.gallery.forEach((src, i) => {
      const fKey = filenameKeyFromSrc(src);
      if (fKey && !orderByStem.has(fKey)) {
        orderByStem.set(fKey, i);
      }
    });

    matching.sort((a, b) => {
      const aIdx = orderByStem.get(filenameKeyFromSrc(a.imgSrc));
      const bIdx = orderByStem.get(filenameKeyFromSrc(b.imgSrc));
      if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
      if (aIdx !== undefined) return -1;
      if (bIdx !== undefined) return 1;
      return a.uniqueCode.localeCompare(b.uniqueCode);
    });
  }

  return matching;
}

/**
 * Returns all unique codes currently in use
 */
export function getUsedMediaCodes(): Set<string> {
  const list = getVaultMedia();
  return new Set(list.map((m) => m.uniqueCode));
}

// -------------------------------------------------------------
// Orphan Blob Purge & Vault Diagnostics
// -------------------------------------------------------------

export interface VaultDiagnostics {
  pageCount: number;
  mediaCount: number;
  hiddenPages: number;
  hiddenMedia: number;
  orphanBlobCount: number;
  orphanBlobKeys: string[];
  tombstonedPages: number;
  tombstonedMedia: number;
  duplicateCodes: string[];
  duplicateRoutes: string[];
  customPages: number;
  customMedia: number;
}

/**
 * Scans Vault state for inconsistencies: orphaned IndexedDB blobs (uploads whose
 * metadata no longer references them), duplicate unique codes, duplicate routes,
 * and tombstone counts. Read-only; never mutates state.
 */
export function computeVaultDiagnostics(): Promise<VaultDiagnostics> {
  return new Promise((resolve) => {
    const pages = getVaultPages();
    const media = getVaultMedia();
    const codeCounts = new Map<string, number>();
    media.forEach((m) => {
      const c = (m.uniqueCode || "").trim();
      if (c) codeCounts.set(c, (codeCounts.get(c) || 0) + 1);
    });
    const routeCounts = new Map<string, number>();
    pages.forEach((p) => {
      const r = normalizeRouteStr(p.route);
      routeCounts.set(r, (routeCounts.get(r) || 0) + 1);
    });

    const activeIdbUrls = new Set<string>();
    media.forEach((m) => {
      [m.imgSrc, m.thumbSrc].forEach((s) => {
        if (s && isIndexedDbMediaUrl(s)) activeIdbUrls.add(s);
      });
    });
    pages.forEach((p) => {
      if (p.coverPhoto && isIndexedDbMediaUrl(p.coverPhoto)) activeIdbUrls.add(p.coverPhoto);
    });

    listMediaBlobKeys().then((blobKeys) => {
      const orphanBlobKeys = blobKeys.filter((k) => !activeIdbUrls.has(k));
      resolve({
        pageCount: pages.length,
        mediaCount: media.length,
        hiddenPages: pages.filter((p) => p.isHidden).length,
        hiddenMedia: media.filter((m) => m.isHidden).length,
        orphanBlobCount: orphanBlobKeys.length,
        orphanBlobKeys,
        tombstonedPages: getDeletedVaultPageKeys().size,
        tombstonedMedia: getDeletedVaultMediaKeys().size,
        duplicateCodes: Array.from(codeCounts.entries())
          .filter(([, n]) => n > 1)
          .map(([c]) => c),
        duplicateRoutes: Array.from(routeCounts.entries())
          .filter(([, n]) => n > 1)
          .map(([r]) => r),
        customPages: pages.filter((p) => p.id.startsWith("custom-page-")).length,
        customMedia: media.filter((m) => m.id.startsWith("custom-media-")).length,
      });
    });
  });
}
