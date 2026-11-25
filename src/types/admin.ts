import type { BlogCategory, BlogAuthor } from "@/data/blog-posts";

export interface StudioProjectItem {
  id: string;
  title: string;
  titleFa?: string;
  client: string;
  year: number | string;
  discipline: string; // e.g. "fashion-photography", "food-photography", "visual-identity", "graphic-design", "video", etc.
  category?: string;
  subDiscipline?: string;
  coverImage: string;
  description: string;
  descriptionFa?: string;
  caption?: string;
  models?: string | string[];
  makeupArtist?: string;
  assistant?: string;
  stylist?: string;
  location?: string;
  seoKeywords?: string;
  videoUrl?: string;
  images: {
    id: string;
    url: string;
    caption?: string;
    alt?: string;
  }[];
  featured?: boolean;
  createdAt: string;
}

export type BlogBlock =
  | { id: string; kind: "text"; en: string; fa: string }
  | { id: string; kind: "image" | "video" | "gif"; url: string; en: string; fa: string };

export interface StudioBlogItem {
  slug: string;
  title: string;
  titleFa?: string;
  excerpt: string;
  excerptFa?: string;
  category: BlogCategory;
  categoryLabel: string;
  categoryLabelFa?: string;
  coverImage: string;
  coverAltEn?: string;
  coverAltFa?: string;
  publishedAt: string;
  readTime: string;
  readTimeFa?: string;
  contentMarkdown: string;
  contentMarkdownFa?: string;
  blocks?: BlogBlock[];
  published: boolean;
  featured?: boolean;
  seoDescription?: string;
  seoDescriptionFa?: string;
  aiSummary?: string;
  aiSummaryFa?: string;
  author?: BlogAuthor;
  tags?: string[];
  tagsFa?: string[];
}
