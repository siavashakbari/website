import type { Discipline } from "@/data/projects";
import type { BlogCategory } from "@/data/blog-posts";

export interface AdminSession {
  authenticated: boolean;
  username: string;
  loginTime: string;
  mfaVerified: boolean;
  vaultKeyHash?: string;
  source: "supabase" | "local_master";
}

export interface StudioProjectItem {
  id: string;
  title: string;
  titleFa?: string;
  client?: string;
  year: number | string;
  discipline: string; // e.g. "fashion-photography", "food-photography", "visual-identity", "graphic-design", "video", etc.
  category?: string;
  subDiscipline?: string; // e.g. "Furniture", "Plants & Botanicals", "Packaging", "Ceramics", "Textiles"
  models?: string; // Model(s) or key subjects
  makeupArtist?: string; // Makeup Artist (MUA)
  assistant?: string; // Photo / Design Assistant
  stylist?: string; // Art Direction / Styling
  location?: string; // e.g. "Esfahan Studio"
  coverImage: string;
  description: string;
  descriptionFa?: string;
  caption?: string; // Dedicated Caption / Story / Long Text box
  seoKeywords?: string;
  videoUrl?: string; // Video URL or source
  videoSpecs?: {
    durationSec?: number;
    targetSizeMb?: number;
    actualSizeMb?: number;
    resolution?: string;
  };
  images: {
    id: string;
    url: string;
    caption?: string;
    alt?: string;
  }[];
  featured?: boolean;
  createdAt: string;
}

export interface StudioBlogItem {
  slug: string;
  title: string;
  titleFa?: string;
  excerpt: string;
  excerptFa?: string;
  category: BlogCategory;
  categoryLabel: string;
  coverImage: string;
  publishedAt: string;
  readTime: string;
  contentMarkdown: string;
  published: boolean;
  featured?: boolean;
  seoDescription?: string;
  aiSummary?: string;
}
