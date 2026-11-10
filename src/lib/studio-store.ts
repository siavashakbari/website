import type { StudioProjectItem, StudioBlogItem } from "@/types/admin";
export type { StudioProjectItem, StudioBlogItem };
import type { InvoiceData } from "@/types/invoice";
import { INITIAL_INVOICE_DATA } from "@/types/invoice";
import { BLOG_POSTS } from "@/data/blog-posts";
import { projects as DEFAULT_PROJECTS, type Project } from "@/data/projects";
import {
  generate4PartPhotoCode,
  getDiscipline4Code,
  getSpecialty4Code,
  getProject4Code,
  normalizeDisciplineSlug as taxNormDisc,
  normalizeSpecialtySlug as taxNormSpec,
  normalizeProjectSlug as taxNormProj,
  buildPhotoUrl,
  to4LetterCode,
  slugify,
} from "@/lib/taxonomy";

const STORAGE_PROJECTS_KEY = "siavash_studio_custom_projects";
export const STORAGE_DELETED_PROJECTS_KEY = "siavash_studio_deleted_projects";
const STORAGE_BLOG_KEY = "siavash_studio_custom_blogs";
const STORAGE_INVOICES_KEY = "siavash_studio_invoices_archive";

export const STUDIO_STORE_CHANGED_EVENT = "siavash_studio_store_changed";

let studioBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    studioBroadcastChannel = new BroadcastChannel("siavash_studio_bus");
  } catch (e) {
    /* ignore */
  }
}

export function notifyStudioStoreUpdated(detail?: { type: string; id?: string }): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(STUDIO_STORE_CHANGED_EVENT, { detail }));
    window.dispatchEvent(new Event("storage"));
    studioBroadcastChannel?.postMessage(detail || { type: "generic" });
  } catch (e) {
    console.error("Error broadcasting studio update:", e);
  }
}

export function subscribeToStudioStore(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(STUDIO_STORE_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  if (studioBroadcastChannel) {
    studioBroadcastChannel.onmessage = handler;
  }
  return () => {
    window.removeEventListener(STUDIO_STORE_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
    if (studioBroadcastChannel) {
      studioBroadcastChannel.onmessage = null;
    }
  };
}

function normalizeDisciplineSlug(discipline: string, category?: string): string {
  const q = (discipline || "").toLowerCase().trim();
  if (q.includes("product-design") || q.includes("product design")) return "product-design";
  if (q.includes("photo")) return "photography";
  if (q.includes("graphic") || q.includes("identity") || q.includes("book") || q.includes("poster")) {
    return "graphic-design";
  }
  if (q.includes("video") || q.includes("motion")) return "video";
  return discipline || "photography";
}

function defaultProjectToStudioItem(p: Project): StudioProjectItem {
  const images = (p.gallery && p.gallery.length > 0 ? p.gallery : [p.image]).map((url, idx) => ({
    id: `img-${p.id}-${idx}`,
    url,
    alt: `${p.title} ${idx + 1}`,
  }));

  return {
    id: p.id,
    title: p.title,
    titleFa: p.titleFa,
    client: p.client || "",
    year: p.year,
    discipline: normalizeDisciplineSlug(p.discipline),
    category: p.category,
    subDiscipline: p.subDiscipline || p.category,
    models: p.models || "",
    makeupArtist: p.makeupArtist || "",
    assistant: p.assistant || "",
    stylist: p.stylist || "",
    location: p.location || "",
    coverImage: p.image,
    description: p.description,
    caption: p.caption || "",
    seoKeywords: p.seoKeywords || `${p.title}, ${p.category}, Siavash Akbari`,
    videoUrl: p.videoUrl || (p.image?.endsWith(".mp4") ? p.image : undefined),
    images,
    featured: true,
    createdAt: new Date("2025-01-01").toISOString(),
  };
}

export function getDeletedProjectIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((s) => String(s).toLowerCase().trim()));
      }
    }
  } catch (e) {
    console.error("Error reading deleted projects:", e);
  }
  return new Set();
}

export function getCanonicalProjectSlug(item: { id: string; title?: string }): string {
  const normTitle = (item.title || "").toLowerCase().trim();
  const normId = (item.id || "").toLowerCase().trim();

  if (normId.includes("shekarchian") || normTitle.includes("shekarchian")) {
    return "shekarchian-sweets";
  }
  if (
    normId.includes("dobareh") ||
    normTitle.includes("dobareh") ||
    normTitle.includes("accesories") ||
    normTitle.includes("accessories") ||
    normId === "dodareh"
  ) {
    return "dobareh";
  }
  if (normId.includes("polarity") || normTitle.includes("polarity")) {
    return "polarity";
  }
  if (
    normId.includes("onswipe") ||
    normId === "on-swipe" ||
    normTitle.includes("onswipe") ||
    normTitle.includes("on swipe")
  ) {
    return "onswipe";
  }
  if (normId.includes("goat") || normTitle.includes("goat")) {
    return "goats-coffee";
  }
  if (
    normId === "tasting" ||
    normTitle === "tasting" ||
    normId === "gastronomie" ||
    normTitle === "gastronomie"
  ) {
    return "gastronomie";
  }
  if (normId.includes("nozad") || normTitle.includes("nozad")) {
    if (normTitle.includes("identity") || normId.includes("identity")) {
      return "nozad-publication-visual-identity";
    }
    return "nozad-publications";
  }
  if (
    normId.includes("echo-prime") ||
    normTitle.includes("echo prime") ||
    normTitle.includes("echo-prime")
  ) {
    return "echo-prime";
  }

  return taxNormProj(item.title || item.id);
}

export function isProjectDeleted(
  item: { id: string; title?: string },
  deletedSet: Set<string>
): boolean {
  if (!deletedSet || deletedSet.size === 0) return false;
  const canonical = getCanonicalProjectSlug(item);
  if (deletedSet.has(canonical)) return true;
  if (deletedSet.has(item.id.toLowerCase().trim())) return true;
  if (deletedSet.has(taxNormProj(item.id))) return true;
  if (item.title) {
    if (deletedSet.has(item.title.toLowerCase().trim())) return true;
    if (deletedSet.has(taxNormProj(item.title))) return true;
  }
  return false;
}

// 1. Projects Store
export function getStudioProjects(): StudioProjectItem[] {
  const deletedSet = getDeletedProjectIds();
  const canonicalMap = new Map<string, StudioProjectItem>();

  // 1. Process custom projects from localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (raw) {
        const parsed: StudioProjectItem[] = JSON.parse(raw);
        parsed.forEach((item) => {
          if (!item || !item.id) return;
          if (isProjectDeleted(item, deletedSet)) return;

          const canonicalSlug = getCanonicalProjectSlug(item);
          if (deletedSet.has(canonicalSlug)) return;

          let cleanItem: StudioProjectItem = { ...item };
          if (canonicalSlug === "shekarchian-sweets") {
            cleanItem = { ...cleanItem, id: "shekarchian-sweets", title: "Shekarchian Sweets" };
          } else if (canonicalSlug === "dobareh") {
            cleanItem = { ...cleanItem, id: "dobareh", title: "Dobareh" };
          } else if (canonicalSlug === "polarity") {
            cleanItem = { ...cleanItem, id: "polarity", title: "Polarity" };
          } else if (canonicalSlug === "onswipe") {
            cleanItem = { ...cleanItem, id: "onswipe", title: "OnSwipe" };
          } else if (canonicalSlug === "goats-coffee") {
            cleanItem = { ...cleanItem, id: "goats-coffee", title: "Goats Coffee" };
          } else if (canonicalSlug === "gastronomie") {
            cleanItem = { ...cleanItem, id: "gastronomie", title: "Gastronomie" };
          } else if (canonicalSlug === "echo-prime") {
            cleanItem = { ...cleanItem, id: "echo-prime", title: "Echo Prime" };
          } else if (canonicalSlug === "meatlab") {
            cleanItem = { ...cleanItem, id: "meatlab", title: "Meatlab", discipline: "graphic-design", category: "visual-identity" };
          } else if (canonicalSlug === "signature-restaurant") {
            cleanItem = { ...cleanItem, id: "signature-restaurant", title: "Signature Restaurant", discipline: "photography", category: "food-photography" };
          } else if (canonicalSlug === "zen-studio") {
            cleanItem = { ...cleanItem, id: "zen-studio", title: "Zen Studio Products", discipline: "graphic-design", category: "visual-identity" };
          }

          if (canonicalMap.has(canonicalSlug)) {
            const existing = canonicalMap.get(canonicalSlug)!;
            const existingImgs =
              existing.images && existing.images.length > 0
                ? existing.images
                : existing.coverImage
                ? [{ id: "c-1", url: existing.coverImage }]
                : [];
            const newImgs =
              cleanItem.images && cleanItem.images.length > 0
                ? cleanItem.images
                : cleanItem.coverImage
                ? [{ id: "c-2", url: cleanItem.coverImage }]
                : [];
            const betterImages =
              newImgs.length >= existingImgs.length ? cleanItem.images : existing.images;
            const betterCover = cleanItem.coverImage || existing.coverImage;

            canonicalMap.set(canonicalSlug, {
              ...existing,
              ...cleanItem,
              images: betterImages && betterImages.length > 0 ? betterImages : existing.images,
              coverImage: betterCover || existing.coverImage,
            });
          } else {
            canonicalMap.set(canonicalSlug, cleanItem);
          }
        });
      }
    } catch (e) {
      console.error("Error reading projects:", e);
    }
  }

  // 2. Process defaults
  const defaults = DEFAULT_PROJECTS.map(defaultProjectToStudioItem);
  defaults.forEach((def) => {
    if (isProjectDeleted(def, deletedSet)) return;
    const canonicalSlug = getCanonicalProjectSlug(def);
    if (deletedSet.has(canonicalSlug)) return;

    if (canonicalMap.has(canonicalSlug)) {
      const custom = canonicalMap.get(canonicalSlug)!;
      const hasCustomImages = custom.images && custom.images.length > 0;

      // Protect default project coverImage against accidental cross-project corruption
      let finalCover = def.coverImage;
      if (custom.coverImage) {
        const cLower = custom.coverImage.toLowerCase();
        const dId = def.id.toLowerCase();
        if (cLower.includes(dId) || cLower.startsWith("data:") || cLower.startsWith("blob:") || cLower.startsWith("/assets/")) {
          finalCover = custom.coverImage;
        }
      }

      canonicalMap.set(canonicalSlug, {
        ...def,
        ...custom,
        images: hasCustomImages ? custom.images : def.images,
        coverImage: finalCover,
      });
    } else {
      canonicalMap.set(canonicalSlug, def);
    }
  });

  const result = Array.from(canonicalMap.values());

  // Scrub historical duplicates and deleted items from localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(result));
    } catch (e) {
      /* ignore */
    }
  }

  return result;
}

export function getProjectById(id: string): Project | undefined {
  if (typeof window !== "undefined") {
    const list = getStudioProjects();
    const found = list.find((p) => p.id === id || getCanonicalProjectSlug(p) === taxNormProj(id));
    if (found) {
      const gallery = found.images && found.images.length > 0 ? found.images.map((im: any) => im.url) : [found.coverImage];
      return {
        id: found.id,
        title: found.title,
        titleFa: found.titleFa,
        discipline: (found.discipline as any) || "photography",
        category: found.category || found.discipline,
        subDiscipline: found.subDiscipline,
        year: String(found.year),
        description: found.description,
        caption: found.caption,
        image: found.coverImage,
        aspect: "portrait",
        gallery,
        client: found.client,
        models: Array.isArray(found.models) ? found.models.join(", ") : found.models,
        makeupArtist: found.makeupArtist,
        assistant: found.assistant,
        stylist: found.stylist,
        location: found.location,
        seoKeywords: found.seoKeywords,
        videoUrl: found.videoUrl,
      };
    }
  }
  const deletedSet = getDeletedProjectIds();
  const def = DEFAULT_PROJECTS.find((p) => p.id === id || taxNormProj(p.id) === taxNormProj(id));
  if (def && !isProjectDeleted(def, deletedSet)) {
    return def;
  }
  return undefined;
}

export function saveStudioProject(project: StudioProjectItem): void {
  if (typeof window === "undefined") return;

  // Unmark from deleted set
  const deletedSet = getDeletedProjectIds();
  const canonical = getCanonicalProjectSlug(project);
  deletedSet.delete(canonical);
  deletedSet.delete(project.id.toLowerCase().trim());
  deletedSet.delete(taxNormProj(project.id));
  if (project.title) {
    deletedSet.delete(project.title.toLowerCase().trim());
    deletedSet.delete(taxNormProj(project.title));
  }
  localStorage.setItem(STORAGE_DELETED_PROJECTS_KEY, JSON.stringify(Array.from(deletedSet)));

  let list: StudioProjectItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading projects:", e);
  }

  const existingIdx = list.findIndex(
    (p) => p.id === project.id || getCanonicalProjectSlug(p) === canonical
  );

  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...project };
  } else {
    list.unshift(project);
  }

  // Deduplicate list so multiple projects of same canonical slug cannot coexist
  list = list.filter((p, idx) => {
    if (getCanonicalProjectSlug(p) === canonical) {
      return idx === (existingIdx >= 0 ? existingIdx : 0);
    }
    return !isProjectDeleted(p, deletedSet);
  });

  localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(list));
  notifyStudioStoreUpdated({ type: "project_saved", id: project.id });
}

export function deleteStudioProject(id: string): void {
  if (typeof window === "undefined") return;

  const allCurrent = getStudioProjects();
  const target = allCurrent.find(
    (p) =>
      p.id === id ||
      taxNormProj(p.id) === taxNormProj(id) ||
      taxNormProj(p.title) === taxNormProj(id)
  );

  const deletedSet = getDeletedProjectIds();
  const idNorm = id.toLowerCase().trim();
  const idSlug = taxNormProj(id);
  deletedSet.add(idNorm);
  deletedSet.add(idSlug);

  if (target) {
    const canonical = getCanonicalProjectSlug(target);
    deletedSet.add(canonical);
    deletedSet.add(target.id.toLowerCase().trim());
    deletedSet.add(taxNormProj(target.id));
    if (target.title) {
      deletedSet.add(target.title.toLowerCase().trim());
      deletedSet.add(taxNormProj(target.title));
    }
  }

  if (idNorm.includes("shekarchian") || target?.title?.toLowerCase().includes("shekarchian")) {
    deletedSet.add("shekarchian");
    deletedSet.add("shekarchian-honey");
    deletedSet.add("shekarchian-sweets");
    deletedSet.add("shekarchian sweets");
  }
  if (idNorm.includes("dobareh") || target?.title?.toLowerCase().includes("dobareh")) {
    deletedSet.add("dobareh");
    deletedSet.add("dobareh-accesories");
    deletedSet.add("dobareh-accessories");
    deletedSet.add("dodareh");
  }

  // Persist deletion tombstones
  localStorage.setItem(STORAGE_DELETED_PROJECTS_KEY, JSON.stringify(Array.from(deletedSet)));

  // Remove from custom projects store
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (raw) {
      const parsed: StudioProjectItem[] = JSON.parse(raw);
      const filtered = parsed.filter((p) => !isProjectDeleted(p, deletedSet) && p.id !== id);
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error("Error updating custom projects on delete:", e);
  }

  // Also remove custom photos belonging to this project
  try {
    const rawPhotos = localStorage.getItem(STORAGE_CUSTOM_PHOTOS_KEY);
    if (rawPhotos) {
      const parsedPhotos: PhotoInventoryItem[] = JSON.parse(rawPhotos);
      const filteredPhotos = parsedPhotos.filter((item) => {
        const itemProjSlug = taxNormProj(item.projectSlug || item.project || "");
        return !deletedSet.has(itemProjSlug);
      });
      localStorage.setItem(STORAGE_CUSTOM_PHOTOS_KEY, JSON.stringify(filteredPhotos));
    }
  } catch (e) {
    console.error("Error updating custom photos on project delete:", e);
  }

  notifyStudioStoreUpdated({ type: "project_deleted", id });
}

// 2. Blog Posts Store
export function getStudioBlogPosts(): StudioBlogItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_BLOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading blog posts:", e);
  }

  // Pre-populate with existing BLOG_POSTS from the site
  return BLOG_POSTS.map((bp) => ({
    slug: bp.slug,
    title: bp.title,
    titleFa: bp.titleFa,
    excerpt: bp.excerpt,
    excerptFa: bp.excerptFa,
    category: bp.category,
    categoryLabel: bp.categoryLabel,
    coverImage: bp.coverImage,
    publishedAt: bp.publishedAt,
    readTime: bp.readTime,
    contentMarkdown: bp.contentMarkdown || bp.excerpt,
    contentMarkdownFa: bp.contentMarkdownFa || bp.excerptFa,
    published: true,
    featured: bp.featured,
    tags: bp.tags || [],
    tagsFa: bp.tagsFa || [],
    author: bp.author,
    aiSummary: bp.aiSummary?.join("\n"),
    aiSummaryFa: bp.aiSummaryFa?.join("\n"),
  }));
}

export function getMergedBlogPosts(): StudioBlogItem[] {
  const custom = getStudioBlogPosts();
  if (custom && custom.length > 0) {
    return custom;
  }
  return BLOG_POSTS.map((bp) => ({
    slug: bp.slug,
    title: bp.title,
    titleFa: bp.titleFa,
    excerpt: bp.excerpt,
    excerptFa: bp.excerptFa,
    category: bp.category,
    categoryLabel: bp.categoryLabel,
    coverImage: bp.coverImage,
    publishedAt: bp.publishedAt,
    readTime: bp.readTime,
    contentMarkdown: bp.contentMarkdown || bp.excerpt,
    contentMarkdownFa: bp.contentMarkdownFa || bp.excerptFa,
    published: true,
    featured: bp.featured,
    tags: bp.tags || [],
    tagsFa: bp.tagsFa || [],
    author: bp.author,
    aiSummary: bp.aiSummary?.join("\n"),
    aiSummaryFa: bp.aiSummaryFa?.join("\n"),
  }));
}

export function getBlogPostBySlug(slug: string): StudioBlogItem | undefined {
  if (typeof window !== "undefined") {
    const customPosts = getStudioBlogPosts();
    const found = customPosts.find((p) => p.slug === slug);
    if (found) return found;
  }
  const defaultFound = BLOG_POSTS.find((p) => p.slug === slug);
  if (defaultFound) {
    return {
      slug: defaultFound.slug,
      title: defaultFound.title,
      titleFa: defaultFound.titleFa,
      excerpt: defaultFound.excerpt,
      excerptFa: defaultFound.excerptFa,
      category: defaultFound.category,
      categoryLabel: defaultFound.categoryLabel,
      coverImage: defaultFound.coverImage,
      publishedAt: defaultFound.publishedAt,
      readTime: defaultFound.readTime,
      contentMarkdown: defaultFound.contentMarkdown || defaultFound.excerpt,
      contentMarkdownFa: defaultFound.contentMarkdownFa || defaultFound.excerptFa,
      published: true,
      featured: defaultFound.featured,
      tags: defaultFound.tags || [],
      tagsFa: defaultFound.tagsFa || [],
      author: defaultFound.author,
      aiSummary: defaultFound.aiSummary?.join("\n"),
      aiSummaryFa: defaultFound.aiSummaryFa?.join("\n"),
    };
  }
  return undefined;
}


export function saveStudioBlogPost(post: StudioBlogItem): void {
  if (typeof window === "undefined") return;
  const list = getStudioBlogPosts();
  const index = list.findIndex((p) => p.slug === post.slug);
  if (index >= 0) {
    list[index] = post;
  } else {
    list.unshift(post);
  }
  localStorage.setItem(STORAGE_BLOG_KEY, JSON.stringify(list));
}

export function deleteStudioBlogPost(slug: string): void {
  if (typeof window === "undefined") return;
  const list = getStudioBlogPosts().filter((p) => p.slug !== slug);
  localStorage.setItem(STORAGE_BLOG_KEY, JSON.stringify(list));
}

// 3. Invoice Store
export function getSavedInvoices(): InvoiceData[] {
  if (typeof window === "undefined") return [INITIAL_INVOICE_DATA];
  try {
    const raw = localStorage.getItem(STORAGE_INVOICES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading invoices:", e);
  }
  return [INITIAL_INVOICE_DATA];
}

export function saveInvoice(invoice: InvoiceData): void {
  if (typeof window === "undefined") return;
  const list = getSavedInvoices();
  const index = list.findIndex((inv) => inv.id === invoice.id || inv.invoiceNumber === invoice.invoiceNumber);
  if (index >= 0) {
    list[index] = invoice;
  } else {
    list.unshift(invoice);
  }
  localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(list));
}

export function deleteInvoice(id: string): void {
  if (typeof window === "undefined") return;
  const list = getSavedInvoices().filter((inv) => inv.id !== id);
  localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(list));
}

// 4. Photo Inventory Metadata Store (Matching PHOTO_INVENTORY_VIEWER.html)
export const STORAGE_INVENTORY_KEY = "siavash_portfolio_inventory_v3";
export const STORAGE_CUSTOM_PHOTOS_KEY = "siavash_custom_photo_assets_v2";
export const STORAGE_TAXONOMY_KEY = "siavash_custom_taxonomy_v2";

import { PHOTO_INVENTORY, computeItemSeoSlug, type PhotoInventoryItem } from "@/data/photo-inventory";

// -------------------------------------------------------------
// Dynamic Taxonomy Models & Defaults
// -------------------------------------------------------------

export interface TaxonomyDiscipline {
  slug: string;
  label: string;
  code: string;
}

export interface TaxonomySpecialty {
  slug: string;
  label: string;
  disciplineSlug: string;
  code: string;
}

export interface TaxonomyProject {
  slug: string;
  title: string;
  disciplineSlug: string;
  specialtySlug: string;
  code: string;
  client?: string;
  year?: string;
  description?: string;
}

export const DEFAULT_TAXONOMY_DISCIPLINES: TaxonomyDiscipline[] = [
  { slug: "photography", label: "Photography", code: "PHOT" },
  { slug: "graphic-design", label: "Graphic Design", code: "DSGN" },
  { slug: "video", label: "Video", code: "VIDO" },
  { slug: "product-design", label: "Product Design", code: "PROD" },
];

export const DEFAULT_TAXONOMY_SPECIALTIES: TaxonomySpecialty[] = [
  { slug: "fashion-photography", label: "Fashion Photography", disciplineSlug: "photography", code: "FASH" },
  { slug: "food-photography", label: "Food Photography", disciplineSlug: "photography", code: "FOOD" },
  { slug: "portrait-photography", label: "Portrait Photography", disciplineSlug: "photography", code: "PORT" },
  { slug: "product-photography", label: "Product Photography", disciplineSlug: "photography", code: "PROD" },
  { slug: "visual-identity", label: "Visual Identity", disciplineSlug: "graphic-design", code: "VIID" },
  { slug: "book-covers", label: "Book Covers", disciplineSlug: "graphic-design", code: "BOOK" },
  { slug: "posters", label: "Posters", disciplineSlug: "graphic-design", code: "POST" },
  { slug: "videos", label: "Videos", disciplineSlug: "video", code: "VIDO" },
  { slug: "products", label: "Products", disciplineSlug: "product-design", code: "PROD" },
];

interface CustomTaxonomyState {
  disciplines: TaxonomyDiscipline[];
  specialties: TaxonomySpecialty[];
  projects: TaxonomyProject[];
}

export function getCustomTaxonomy(): CustomTaxonomyState {
  if (typeof window === "undefined") {
    return { disciplines: [], specialties: [], projects: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_TAXONOMY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading custom taxonomy:", e);
  }
  return { disciplines: [], specialties: [], projects: [] };
}

export function saveCustomTaxonomy(state: CustomTaxonomyState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_TAXONOMY_KEY, JSON.stringify(state));
  notifyStudioStoreUpdated({ type: "taxonomy_updated" });
}

export function getTaxonomyDisciplines(): TaxonomyDiscipline[] {
  const custom = getCustomTaxonomy().disciplines;
  const list = [...DEFAULT_TAXONOMY_DISCIPLINES];
  custom.forEach((c) => {
    if (!list.some((d) => d.slug === c.slug)) {
      list.push(c);
    }
  });
  return list;
}

export function getTaxonomySpecialties(disciplineSlug?: string): TaxonomySpecialty[] {
  const custom = getCustomTaxonomy().specialties;
  const list = [...DEFAULT_TAXONOMY_SPECIALTIES];
  custom.forEach((c) => {
    if (!list.some((s) => s.slug === c.slug && s.disciplineSlug === c.disciplineSlug)) {
      list.push(c);
    }
  });
  if (disciplineSlug) {
    const norm = taxNormDisc(disciplineSlug);
    return list.filter((s) => taxNormDisc(s.disciplineSlug) === norm);
  }
  return list;
}

export function addCustomDiscipline(title: string, code?: string, slug?: string): TaxonomyDiscipline {
  const discSlug = slug || slugify(title);
  const discCode = code ? to4LetterCode(code) : getDiscipline4Code(discSlug);
  const newDisc: TaxonomyDiscipline = {
    slug: discSlug,
    label: title.trim(),
    code: discCode,
  };
  const tax = getCustomTaxonomy();
  if (!tax.disciplines.some((d) => d.slug === discSlug)) {
    tax.disciplines.push(newDisc);
    saveCustomTaxonomy(tax);
  }
  return newDisc;
}

export function addCustomSpecialty(
  disciplineSlug: string,
  title: string,
  code?: string,
  slug?: string,
): TaxonomySpecialty {
  const dSlug = taxNormDisc(disciplineSlug);
  const sSlug = slug || slugify(title);
  const sCode = code ? to4LetterCode(code) : getSpecialty4Code(sSlug);
  const newSpec: TaxonomySpecialty = {
    slug: sSlug,
    label: title.trim(),
    disciplineSlug: dSlug,
    code: sCode,
  };
  const tax = getCustomTaxonomy();
  if (!tax.specialties.some((s) => s.slug === sSlug && s.disciplineSlug === dSlug)) {
    tax.specialties.push(newSpec);
    saveCustomTaxonomy(tax);
  }
  return newSpec;
}

// -------------------------------------------------------------
// Custom Photos & Merged Inventory (with Robust Deduplication)
// -------------------------------------------------------------
// Custom Photos & Merged Inventory (with Robust Deduplication)
// -------------------------------------------------------------

export function extractAssetFilename(imgSrc?: string): string {
  if (!imgSrc) return "";
  const clean = imgSrc.split("?")[0].split("#")[0].trim();
  let basename = clean.replace(/^.*[\\\/]/, "").toLowerCase();
  basename = basename.replace(/[-_]thumb\./i, ".");
  // Vite 8-character build hash right before file extension
  basename = basename.replace(/[-_][a-zA-Z0-9]{8}(\.[a-z0-9]+)$/i, "$1");
  return basename;
}

export function getPhotoDedupeKey(item: Partial<PhotoInventoryItem>): string {
  const filename = extractAssetFilename(item.imgSrc);
  if (filename && filename.length > 3 && filename !== "placeholder.svg") {
    return `file:${filename}`;
  }

  const stdCode = (item.standardCode || "").toUpperCase().trim();
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/i.test(stdCode)) {
    return `code:${stdCode}`;
  }

  const code = (item.code || "").toUpperCase().trim();
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/i.test(code)) {
    return `code:${code}`;
  }

  if (code.startsWith("SA-")) {
    return `legacy:${code}`;
  }

  if (item.project && (item.title || item.displayName)) {
    return `proj:${taxNormProj(item.project)}:${(item.displayName || item.title || "").toLowerCase()}`;
  }

  return `item:${item.title || item.code || Math.random()}`;
}

export function getCustomPhotoAssets(): PhotoInventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PHOTOS_KEY);
    if (raw) {
      const parsed: PhotoInventoryItem[] = JSON.parse(raw);
      // Clean up and deduplicate so historical duplicates in localStorage are purged
      const seen = new Set<string>();
      const deduped: PhotoInventoryItem[] = [];
      parsed.forEach((item) => {
        const key = getPhotoDedupeKey(item);
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(item);
        }
      });
      return deduped;
    }
  } catch (e) {
    console.error("Error reading custom photos:", e);
  }
  return [];
}

export function saveCustomPhotoAsset(photo: PhotoInventoryItem): void {
  if (typeof window === "undefined") return;
  const list = getCustomPhotoAssets();
  const photoKey = getPhotoDedupeKey(photo);

  const idx = list.findIndex(
    (p) =>
      getPhotoDedupeKey(p) === photoKey ||
      p.code === photo.code ||
      p.standardCode === photo.code ||
      (photo.standardCode &&
        (p.code === photo.standardCode || p.standardCode === photo.standardCode)),
  );

  if (idx >= 0) {
    list[idx] = { ...list[idx], ...photo };
  } else {
    list.unshift(photo);
  }

  // Deduplicate before saving back
  const seen = new Set<string>();
  const cleanList = list.filter((p) => {
    const k = getPhotoDedupeKey(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  localStorage.setItem(STORAGE_CUSTOM_PHOTOS_KEY, JSON.stringify(cleanList));
  notifyStudioStoreUpdated({ type: "photo_saved", id: photo.code });
}

export function deleteCustomPhotoAsset(code: string): void {
  if (typeof window === "undefined") return;
  const list = getCustomPhotoAssets().filter((p) => p.code !== code && p.standardCode !== code);
  localStorage.setItem(STORAGE_CUSTOM_PHOTOS_KEY, JSON.stringify(list));
  notifyStudioStoreUpdated({ type: "photo_deleted", id: code });
}

export function getCustomPhotoMetadata(): Record<string, Partial<PhotoInventoryItem>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_INVENTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading photo inventory metadata:", e);
  }
  return {};
}

/**
 * Infers normalized specialty slug for a static photo item.
 */
function inferItemSpecialty(item: PhotoInventoryItem): string {
  if (item.specialtySlug) return taxNormSpec(item.specialtySlug);
  const combined = `${item.disciplineSlug} ${item.discipline} ${item.subdiscipline} ${item.project}`.toLowerCase();
  if (combined.includes("fashion")) return "fashion-photography";
  if (combined.includes("food")) return "food-photography";
  if (combined.includes("portrait")) return "portrait-photography";
  if (combined.includes("product design") || combined.includes("product-design")) return "products";
  if (combined.includes("product") || combined.includes("object")) return "product-photography";
  if (combined.includes("visual identity") || combined.includes("brand") || combined.includes("identity")) return "visual-identity";
  if (combined.includes("book cover") || combined.includes("book")) return "book-covers";
  if (combined.includes("poster")) return "posters";
  if (combined.includes("video") || combined.includes("motion")) return "videos";
  return "fashion-photography";
}

/**
 * Returns complete photo inventory:
 * Guaranteed 100% deduplicated by image filename/source and code!
 */
export function getMergedPhotoInventory(): PhotoInventoryItem[] {
  const customMetadataMap = getCustomPhotoMetadata();
  const customPhotos = getCustomPhotoAssets();

  const resultMap = new Map<string, PhotoInventoryItem>();
  const projectSequenceMap: Record<string, number> = {};

  // 1. Process static inventory items first
  PHOTO_INVENTORY.forEach((item, idx) => {
    const custom = customMetadataMap[item.code] || customMetadataMap[item.standardCode || ""];

    const discSlug = custom?.disciplineSlug || taxNormDisc(item.disciplineSlug || item.discipline);
    const specSlug = custom?.specialtySlug || inferItemSpecialty(item);
    const projSlug = custom?.projectSlug || taxNormProj(custom?.project || item.project);

    let projName = custom?.project || item.project;
    if (projSlug === "gastronomie") projName = "Gastronomie";
    else if (projSlug === "dobareh") projName = "Dobareh";
    else if (projSlug === "shekarchian-sweets") projName = "Shekarchian Sweets";
    else if (projSlug === "onswipe") projName = "OnSwipe";
    else if (projSlug === "polarity") projName = "Polarity";
    else if (projSlug === "goats-coffee") projName = "Goats Coffee";
    else if (projSlug === "nozad-publication-visual-identity") projName = "Nozad Publication Visual Identity";
    else if (projSlug === "nozad-publications") projName = "Nozad Publications";
    else if (projSlug === "echo-prime") projName = "Echo Prime";
    else if (projSlug === "signature-restaurant") projName = "Signature Restaurant";
    else if (projSlug === "meatlab") projName = "Meatlab";
    else if (projSlug === "zen-studio") projName = "Zen Studio Products";

    if (!projectSequenceMap[projSlug]) projectSequenceMap[projSlug] = 0;
    projectSequenceMap[projSlug] += 1;
    const seq = projectSequenceMap[projSlug];

    const matchNum =
      item.imgSrc?.match(/[-_](\d+)(?:-thumb)?\.[a-z0-9]+$/i) ||
      item.code?.match(/[-_](\d+)$/);
    const numInt = matchNum ? parseInt(matchNum[1], 10) : seq;

    const standardCode =
      custom?.standardCode ||
      (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/i.test(item.code)
        ? item.code.toUpperCase()
        : generate4PartPhotoCode(discSlug, specSlug, projName, numInt));

    const canonicalPath = buildPhotoUrl(discSlug, specSlug, projSlug, standardCode);

    const mergedItem: PhotoInventoryItem = {
      ...item,
      ...custom,
      project: projName,
      code: standardCode,
      standardCode,
      legacyCode: item.code,
      disciplineSlug: discSlug,
      specialtySlug: specSlug,
      projectSlug: projSlug,
      canonicalPath,
      uniqueCode: item.uniqueCode || (item as any).uniqueCode || String(1001 + idx),
    };

    const key = getPhotoDedupeKey(mergedItem);
    resultMap.set(key, mergedItem);
  });

  // 2. Process custom photos: if same image exists, OVERWRITE/MERGE fields without duplicating!
  customPhotos.forEach((item, idx) => {
    const custom = customMetadataMap[item.code] || customMetadataMap[item.standardCode || ""];
    const discSlug = custom?.disciplineSlug || taxNormDisc(item.disciplineSlug || item.discipline || "photography");
    const specSlug = custom?.specialtySlug || taxNormSpec(item.specialtySlug || item.subdiscipline || "fashion");
    const projSlug = custom?.projectSlug || taxNormProj(custom?.project || item.project || "custom-project");

    let projName = custom?.project || item.project || "custom-project";
    if (projSlug === "gastronomie") projName = "Gastronomie";
    else if (projSlug === "dobareh") projName = "Dobareh";
    else if (projSlug === "shekarchian-sweets") projName = "Shekarchian Sweets";
    else if (projSlug === "onswipe") projName = "OnSwipe";
    else if (projSlug === "polarity") projName = "Polarity";
    else if (projSlug === "goats-coffee") projName = "Goats Coffee";
    else if (projSlug === "nozad-publication-visual-identity") projName = "Nozad Publication Visual Identity";
    else if (projSlug === "nozad-publications") projName = "Nozad Publications";
    else if (projSlug === "echo-prime") projName = "Echo Prime";
    else if (projSlug === "signature-restaurant") projName = "Signature Restaurant";
    else if (projSlug === "meatlab") projName = "Meatlab";
    else if (projSlug === "zen-studio") projName = "Zen Studio Products";

    const standardCode =
      custom?.standardCode ||
      item.standardCode ||
      item.code ||
      generate4PartPhotoCode(discSlug, specSlug, projName, idx + 1);
    const canonicalPath = buildPhotoUrl(discSlug, specSlug, projSlug, standardCode);

    const mergedItem: PhotoInventoryItem = {
      ...item,
      ...custom,
      project: projName,
      code: standardCode,
      standardCode,
      disciplineSlug: discSlug,
      specialtySlug: specSlug,
      projectSlug: projSlug,
      canonicalPath,
    };

    const key = getPhotoDedupeKey(mergedItem);

    // Also check if any existing item in resultMap matches by standardCode, legacy code, or project+image stem
    let matchedExistingKey: string | null = null;
    if (resultMap.has(key)) {
      matchedExistingKey = key;
    } else {
      for (const [existingKey, existingItem] of resultMap.entries()) {
        if (
          (existingItem.standardCode && existingItem.standardCode.toUpperCase() === standardCode.toUpperCase()) ||
          (existingItem.code && existingItem.code.toUpperCase() === mergedItem.code.toUpperCase()) ||
          (item.code && existingItem.code.toUpperCase() === item.code.toUpperCase()) ||
          (taxNormProj(existingItem.projectSlug || existingItem.project) === projSlug &&
            existingItem.imgSrc &&
            mergedItem.imgSrc &&
            getPhotoDedupeKey(existingItem) === key)
        ) {
          matchedExistingKey = existingKey;
          break;
        }
      }
    }

    if (matchedExistingKey) {
      const existing = resultMap.get(matchedExistingKey)!;
      resultMap.set(matchedExistingKey, { ...existing, ...mergedItem });
    } else {
      resultMap.set(key, mergedItem);
    }
  });

  return Array.from(resultMap.values());
}

export function getPhotoItemByCode(code: string): PhotoInventoryItem | undefined {
  if (!code) return undefined;
  const q = code.toUpperCase().trim();
  const all = getMergedPhotoInventory();
  return all.find(
    (i) =>
      i.code.toUpperCase() === q ||
      (i.standardCode && i.standardCode.toUpperCase() === q),
  );
}

/**
 * Universal lookup for photos matching 4-part code, legacy code, slug, or stem.
 */
export function getPhotoItemBySlugOrCode(
  slugOrCode: string,
  disciplineSlug?: string,
  specialtySlug?: string,
  projectSlug?: string,
): PhotoInventoryItem | undefined {
  if (!slugOrCode) return undefined;
  const q = slugOrCode.toLowerCase().trim();
  const all = getMergedPhotoInventory();

  // Alias for duplicate Atlasi 16 -> Atlasi 09
  if (q === "phot-fash-atla-0016" || q === "sa-fash-atl-15" || q === "fashion-atlasi-16") {
    const atla9 = all.find((i) => i.code.toUpperCase() === "PHOT-FASH-ATLA-0009" || (i.imgSrc && i.imgSrc.includes("fashion-atlasi-09")));
    if (atla9) return atla9;
  }

  // 1. Direct match on uniqueCode (e.g. "1211", "1317"), leading 4-digit code, standard 4-part code, code, or legacy code
  const leading4 = /^\d{4}/.test(q) ? q.slice(0, 4) : "";
  const byStandardCode = all.find(
    (i) =>
      i.uniqueCode === q ||
      (leading4 && i.uniqueCode === leading4) ||
      (i.standardCode && i.standardCode.toLowerCase() === q) ||
      i.code.toLowerCase() === q ||
      (i.legacyCode && i.legacyCode.toLowerCase() === q),
  );
  if (byStandardCode) return byStandardCode;

  // 2. Filtered match with project/specialty context
  if (projectSlug) {
    const normProj = taxNormProj(projectSlug);
    const inProj = all.filter((i) => taxNormProj(i.projectSlug || i.project) === normProj);
    const foundInProj = inProj.find(
      (i) =>
        i.code.toLowerCase() === q ||
        (i.standardCode && i.standardCode.toLowerCase() === q) ||
        (i.legacyCode && i.legacyCode.toLowerCase() === q) ||
        (i.seoSlug && i.seoSlug.toLowerCase() === q),
    );
    if (foundInProj) return foundInProj;
  }

  // 3. Match on explicit or computed seoSlug
  const bySlug = all.find((i) => {
    if (disciplineSlug && taxNormDisc(i.disciplineSlug) !== taxNormDisc(disciplineSlug)) return false;
    if (specialtySlug && taxNormSpec(i.specialtySlug || "") !== taxNormSpec(specialtySlug)) return false;
    if (i.seoSlug && i.seoSlug.toLowerCase() === q) return true;
    const computed = computeItemSeoSlug(i);
    return computed.toLowerCase() === q;
  });
  if (bySlug) return bySlug;

  // 4. Match on filename stem (e.g. "fashion-sepidar-01")
  const cleanQ = q.replace(/[-_][a-z0-9]{8,10}$/, "");
  const byStem = all.find((i) => {
    const stem = i.imgSrc?.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase() || "";
    return stem === q || stem === cleanQ;
  });
  if (byStem) return byStem;

  // 5. Match by index in project if numeric (e.g., "1", "2") or project-prefixed (e.g., "zeeen-1", "zeeen-01")
  if (projectSlug) {
    const normP = taxNormProj(projectSlug);
    let indexNum: number | null = null;
    if (/^\d+$/.test(q)) {
      indexNum = parseInt(q, 10);
    } else if (q.startsWith(`${normP}-`)) {
      const remainder = q.slice(normP.length + 1);
      if (/^\d+$/.test(remainder)) {
        indexNum = parseInt(remainder, 10);
      }
    }
    if (indexNum !== null) {
      const inProj = all.filter((i) => taxNormProj(i.projectSlug || i.project) === normP);
      const index = indexNum - 1;
      if (index >= 0 && index < inProj.length) {
        return inProj[index];
      }
    }
  }

  return undefined;
}

export function getPhotosByDiscipline(disciplineSlug: string): PhotoInventoryItem[] {
  const norm = taxNormDisc(disciplineSlug);
  return getMergedPhotoInventory().filter((i) => taxNormDisc(i.disciplineSlug || i.discipline) === norm);
}

export function getPhotosBySpecialty(
  specialtySlug: string,
  disciplineSlug?: string,
): PhotoInventoryItem[] {
  const sNorm = taxNormSpec(specialtySlug);
  const dNorm = disciplineSlug ? taxNormDisc(disciplineSlug) : null;
  return getMergedPhotoInventory().filter((i) => {
    if (dNorm && taxNormDisc(i.disciplineSlug || i.discipline) !== dNorm) return false;
    const itemSpec = taxNormSpec(i.specialtySlug || i.subdiscipline || "");
    return itemSpec === sNorm;
  });
}

export function getPhotosByProject(projectSlug: string): PhotoInventoryItem[] {
  const norm = taxNormProj(projectSlug);
  return getMergedPhotoInventory().filter((i) => taxNormProj(i.projectSlug || i.project) === norm);
}

export function savePhotoInventoryItem(
  item: Partial<PhotoInventoryItem> & { code: string },
  previousCode?: string,
): void {
  if (typeof window === "undefined") return;

  // 1. Update in custom photo assets if present
  const customList = getCustomPhotoAssets();
  const cIdx = customList.findIndex(
    (p) =>
      p.code === item.code ||
      (previousCode && p.code === previousCode) ||
      p.standardCode === item.code ||
      (previousCode && p.standardCode === previousCode),
  );
  if (cIdx >= 0) {
    customList[cIdx] = {
      ...customList[cIdx],
      ...item,
    };
    localStorage.setItem(STORAGE_CUSTOM_PHOTOS_KEY, JSON.stringify(customList));
  }

  // 2. Update custom metadata overlay
  const map = getCustomPhotoMetadata();
  if (previousCode && previousCode !== item.code && map[previousCode]) {
    map[item.code] = { ...map[previousCode], ...item };
    delete map[previousCode];
  } else {
    map[item.code] = {
      ...(map[item.code] || {}),
      ...item,
    };
  }
  localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(map));
  notifyStudioStoreUpdated({ type: "inventory_item_saved", id: item.code });
}

export function deletePhotoInventoryItem(code: string): void {
  if (typeof window === "undefined") return;
  deleteCustomPhotoAsset(code);
  const map = getCustomPhotoMetadata();
  if (map[code]) {
    delete map[code];
    localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(map));
  }
  notifyStudioStoreUpdated({ type: "inventory_item_deleted", id: code });
}

export function saveBulkPhotoInventory(items: Record<string, Partial<PhotoInventoryItem>>): void {
  if (typeof window === "undefined") return;
  const current = getCustomPhotoMetadata();
  const merged = { ...current, ...items };
  localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(merged));
  notifyStudioStoreUpdated({ type: "bulk_inventory_saved" });
}
