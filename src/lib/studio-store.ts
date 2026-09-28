import type { StudioProjectItem, StudioBlogItem } from "@/types/admin";
import type { InvoiceData } from "@/types/invoice";
import { INITIAL_INVOICE_DATA } from "@/types/invoice";
import { BLOG_POSTS } from "@/data/blog-posts";
import { projects as DEFAULT_PROJECTS, type Project } from "@/data/projects";

const STORAGE_PROJECTS_KEY = "siavash_studio_custom_projects";
const STORAGE_BLOG_KEY = "siavash_studio_custom_blogs";
const STORAGE_INVOICES_KEY = "siavash_studio_invoices_archive";

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
    discipline: p.discipline,
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
    contentMarkdown: bp.excerpt,
    published: true,
    featured: bp.featured,
  }));
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
