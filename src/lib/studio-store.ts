import type { StudioProjectItem, StudioBlogItem } from "@/types/admin";
import type { InvoiceData } from "@/types/invoice";
import { INITIAL_INVOICE_DATA } from "@/types/invoice";
import { BLOG_POSTS } from "@/data/blog-posts";
import { projects as DEFAULT_PROJECTS, type Project } from "@/data/projects";

const STORAGE_PROJECTS_KEY = "siavash_studio_custom_projects";
const STORAGE_BLOG_KEY = "siavash_studio_custom_blogs";
const STORAGE_INVOICES_KEY = "siavash_studio_invoices_archive";

function normalizeDisciplineSlug(discipline: string, category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("fashion")) return "fashion-photography";
  if (cat.includes("food")) return "food-photography";
  if (cat.includes("portrait")) return "portrait-photography";
  if (cat.includes("product photo") || cat.includes("objects")) return "product-photography";
  if (cat.includes("visual identity")) return "visual-identity";
  if (cat.includes("book cover")) return "book-covers";
  if (cat.includes("poster")) return "posters";
  if (discipline === "video" || cat.includes("video")) return "video";
  if (discipline === "product-design") return "product-photography";
  if (discipline === "graphic-design") return "graphic-design";
  return discipline || "fashion-photography";
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
    discipline: normalizeDisciplineSlug(p.discipline, p.category),
    category: p.category,
    subDiscipline: p.subDiscipline || "",
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

// 1. Projects Store
export function getStudioProjects(): StudioProjectItem[] {
  let customMap: Record<string, StudioProjectItem> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (raw) {
        const parsed: StudioProjectItem[] = JSON.parse(raw);
        parsed.forEach((item) => {
          customMap[item.id] = item;
        });
      }
    } catch (e) {
      console.error("Error reading projects:", e);
    }
  }

  const defaults = DEFAULT_PROJECTS.map(defaultProjectToStudioItem);
  const merged: StudioProjectItem[] = [];
  const seenIds = new Set<string>();

  // 1. Any newly created project not in defaults comes first
  Object.values(customMap).forEach((custom) => {
    if (!DEFAULT_PROJECTS.some((dp) => dp.id === custom.id)) {
      merged.push(custom);
      seenIds.add(custom.id);
    }
  });

  // 2. Add defaults (or their custom overrides if edited in Studio)
  defaults.forEach((def) => {
    if (customMap[def.id]) {
      merged.push({ ...def, ...customMap[def.id] });
    } else {
      merged.push(def);
    }
    seenIds.add(def.id);
  });

  return merged;
}

export function getProjectById(id: string): Project | undefined {
  if (typeof window !== "undefined") {
    const list = getStudioProjects();
    const found = list.find((p) => p.id === id);
    if (found) {
      const gallery = found.images && found.images.length > 0 ? found.images.map((im) => im.url) : [found.coverImage];
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
        models: found.models,
        makeupArtist: found.makeupArtist,
        assistant: found.assistant,
        stylist: found.stylist,
        location: found.location,
        seoKeywords: found.seoKeywords,
        videoUrl: found.videoUrl,
      };
    }
  }
  return DEFAULT_PROJECTS.find((p) => p.id === id);
}

export function saveStudioProject(project: StudioProjectItem): void {
  if (typeof window === "undefined") return;
  const list = getStudioProjects();
  const index = list.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    list[index] = project;
  } else {
    list.unshift(project);
  }
  localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(list));
}

export function deleteStudioProject(id: string): void {
  if (typeof window === "undefined") return;
  const list = getStudioProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(list));
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
];

export const DEFAULT_TAXONOMY_SPECIALTIES: TaxonomySpecialty[] = [
  { slug: "fashion", label: "Fashion Photography", disciplineSlug: "photography", code: "FASH" },
  { slug: "food", label: "Food Photography", disciplineSlug: "photography", code: "FOOD" },
  { slug: "portrait", label: "Portrait Photography", disciplineSlug: "photography", code: "PORT" },
  { slug: "product", label: "Product Photography", disciplineSlug: "photography", code: "PROD" },
  { slug: "visual-identity", label: "Visual Identity", disciplineSlug: "graphic-design", code: "VIID" },
  { slug: "book-covers", label: "Book Covers", disciplineSlug: "graphic-design", code: "BOOK" },
  { slug: "posters", label: "Posters", disciplineSlug: "graphic-design", code: "POST" },
  { slug: "videos", label: "Videos", disciplineSlug: "video", code: "VIDO" },
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

export function getPhotoDedupeKey(item: Partial<PhotoInventoryItem>): string {
  // If we have an image source, strip path, directory, vite hash, thumb suffix, query params
  if (item.imgSrc) {
    const rawNoQuery = item.imgSrc.split("?")[0].split("#")[0];
    const rawFile = rawNoQuery.replace(/^.*[\\\/]/, "").toLowerCase().trim();
    // Strip thumb indicator: e.g. -thumb
    const noThumb = rawFile.replace(/[-_]thumb\./i, ".");
    // Strip Vite asset hash: e.g. fashion-zeeen-01-B4g9Z1qa.jpg -> fashion-zeeen-01.jpg
    const noHash = noThumb.replace(/[-_][a-zA-Z0-9_-]{6,16}(\.[a-z0-9]+)$/i, "$1");
    // Remove extension
    const stem = noHash.replace(/\.[a-z0-9]+$/i, "");
    if (stem && stem.length > 2 && stem !== "placeholder") {
      return `file:${stem}`;
    }
  }

  const stdCode = (item.standardCode || "").toUpperCase().trim();
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/i.test(stdCode)) {
    return `std:${stdCode}`;
  }

  const code = (item.code || "").toUpperCase().trim();
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/i.test(code)) {
    return `std:${code}`;
  }

  if (code.startsWith("SA-")) {
    return `legacy:${code}`;
  }

  if (item.project && (item.title || item.displayName)) {
    return `proj:${taxNormProj(item.project)}:${(item.displayName || item.title || "").toLowerCase()}`;
  }

  return `item:${item.title || Math.random()}`;
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
}

export function deleteCustomPhotoAsset(code: string): void {
  if (typeof window === "undefined") return;
  const list = getCustomPhotoAssets().filter((p) => p.code !== code && p.standardCode !== code);
  localStorage.setItem(STORAGE_CUSTOM_PHOTOS_KEY, JSON.stringify(list));
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
  if (item.specialtySlug) return item.specialtySlug;
  const combined = `${item.disciplineSlug} ${item.discipline} ${item.subdiscipline} ${item.project}`.toLowerCase();
  if (combined.includes("fashion")) return "fashion";
  if (combined.includes("food")) return "food";
  if (combined.includes("portrait")) return "portrait";
  if (combined.includes("product") || combined.includes("object")) return "product";
  if (combined.includes("visual identity") || combined.includes("brand") || combined.includes("identity")) return "visual-identity";
  if (combined.includes("book cover") || combined.includes("book")) return "book-covers";
  if (combined.includes("poster")) return "posters";
  if (combined.includes("video") || combined.includes("motion")) return "videos";
  return "fashion";
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
        : generate4PartPhotoCode(discSlug, specSlug, custom?.project || item.project, numInt));

    const canonicalPath = buildPhotoUrl(discSlug, specSlug, projSlug, standardCode);

    const mergedItem: PhotoInventoryItem = {
      ...item,
      ...custom,
      code: standardCode,
      standardCode,
      disciplineSlug: discSlug,
      specialtySlug: specSlug,
      projectSlug: projSlug,
      canonicalPath,
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
    const standardCode =
      custom?.standardCode ||
      item.standardCode ||
      item.code ||
      generate4PartPhotoCode(discSlug, specSlug, projSlug, idx + 1);
    const canonicalPath = buildPhotoUrl(discSlug, specSlug, projSlug, standardCode);

    const mergedItem: PhotoInventoryItem = {
      ...item,
      ...custom,
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

  // 1. Direct match on standard 4-part code (PHOT-FASH-SEPI-0001) or code
  const byStandardCode = all.find(
    (i) =>
      (i.standardCode && i.standardCode.toLowerCase() === q) ||
      i.code.toLowerCase() === q,
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
  const byStem = all.find((i) => {
    const stem = i.imgSrc?.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase() || "";
    return stem === q;
  });
  if (byStem) return byStem;

  // 5. Match by index in project if numeric (e.g., "1", "2")
  if (projectSlug && /^\d+$/.test(q)) {
    const index = parseInt(q, 10) - 1;
    const inProj = all.filter((i) => taxNormProj(i.projectSlug || i.project) === taxNormProj(projectSlug));
    if (index >= 0 && index < inProj.length) {
      return inProj[index];
    }
  }

  return undefined;
}

export function getPhotosByDiscipline(disciplineSlug: string): PhotoInventoryItem[] {
  const norm = taxNormDisc(disciplineSlug);
  return getMergedPhotoInventory().filter((i) => taxNormDisc(i.disciplineSlug) === norm);
}

export function getPhotosBySpecialty(
  specialtySlug: string,
  disciplineSlug?: string,
): PhotoInventoryItem[] {
  const sNorm = taxNormSpec(specialtySlug);
  const dNorm = disciplineSlug ? taxNormDisc(disciplineSlug) : null;
  return getMergedPhotoInventory().filter((i) => {
    if (dNorm && taxNormDisc(i.disciplineSlug) !== dNorm) return false;
    return taxNormSpec(i.specialtySlug || "") === sNorm;
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
}

export function deletePhotoInventoryItem(code: string): void {
  if (typeof window === "undefined") return;
  deleteCustomPhotoAsset(code);
  const map = getCustomPhotoMetadata();
  if (map[code]) {
    delete map[code];
    localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(map));
  }
}

export function saveBulkPhotoInventory(items: Record<string, Partial<PhotoInventoryItem>>): void {
  if (typeof window === "undefined") return;
  const current = getCustomPhotoMetadata();
  const merged = { ...current, ...items };
  localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(merged));
}
