import type { StudioProjectItem, StudioBlogItem } from "@/types/admin";
import type { InvoiceData } from "@/types/invoice";
import { INITIAL_INVOICE_DATA } from "@/types/invoice";
import { BLOG_POSTS } from "@/data/blog-posts";

const STORAGE_PROJECTS_KEY = "siavash_studio_custom_projects";
const STORAGE_BLOG_KEY = "siavash_studio_custom_blogs";
const STORAGE_INVOICES_KEY = "siavash_studio_invoices_archive";

// 1. Projects Store
export function getStudioProjects(): StudioProjectItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading projects:", e);
  }

  // Initial starter data
  return [
    {
      id: "proj-fashion-atlasi",
      title: "Atlasi Fashion Series",
      titleFa: "مجموعه مد اطلسی",
      client: "Atlasi Atelier",
      year: "2026",
      discipline: "fashion-photography",
      category: "Fashion Photography",
      coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      description: "Editorial studio shoot exploring structured silhouettes and muted monochromatic tones.",
      descriptionFa: "عکاسی استودیویی با بررسی سیلوئت‌های ساختاریافته و رنگ‌های مونوکروم.",
      images: [
        {
          id: "img-1",
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
          alt: "Atlasi Silhouette 01",
        },
        {
          id: "img-2",
          url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
          alt: "Atlasi Texture Detail",
        },
      ],
      featured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "proj-echo-prime-video",
      title: "Echo Prime Brand Film",
      titleFa: "فیلم برند اکو پرایم",
      client: "Echo Prime",
      year: "2026",
      discipline: "video",
      category: "Video & Motion",
      coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
      description: "Dynamic sound design, rapid motion cuts, and cinematic color science for athletic performance.",
      descriptionFa: "طراحی صدای پویا، کات‌های حرکتی سریع و کالر ساینس سینمایی.",
      images: [],
      featured: true,
      createdAt: new Date().toISOString(),
    },
  ];
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
