# Feature Specification & Implementation Guide: TwelveLabs-Inspired Blog System & AI/Search Engine SEO

## 1. Executive Summary & Design Reference

This document specifies the complete architecture and implementation instructions for a modern, high-performance blog & case-study section inspired by **Twelve Labs** (`https://www.twelvelabs.io/blog`).

### UI/UX Hallmarks of Twelve Labs to Replicate:

1. **Modular "Thread" Architecture**: A structured, grid-based card layout that feels continuous and architectural rather than disjointed boxes.
2. **Category / Tag Filter Tabs**: Horizontal sticky or high-contrast filter pills (e.g. `All`, `Case Studies`, `Design Theory`, `Video & Motion`, `Branding`, `AI & Tech`).
3. **Card Anatomy**:
   - High-contrast 16:9 or 4:3 visual preview with subtle hover zoom and border radiance.
   - Category badge with micro-dot or subtle accent glow (`#3febcc`).
   - Publication date & estimated reading time (e.g., `Sep 24, 2026 · 6 min read`).
   - Editorial headline in display font (`Satoshi`).
   - 2-line teaser description with clean truncation.
4. **Detail Page Experience**:
   - Hero header with category tag, title, publish date, author avatar/badge, and share buttons.
   - Clean, readable typography layout with custom blockquotes, high-res image galleries, code blocks, and callout callouts.
   - "Related Articles / Next Project" section at the end.

---

## 2. SEO & AI Search Engine Optimization Strategy

To maximize visibility in **Google Search**, **ChatGPT Search**, **Perplexity**, **Claude**, and **Google AI Overviews**:

1. **Rich Structured Data (JSON-LD)**:
   - Schema `BlogPosting` with `headline`, `image`, `datePublished`, `dateModified`, `author` (Person: Siavash Akbari), and `publisher`.
   - `BreadcrumbList` Schema for rich search snippet navigation.
2. **AI Engine Optimization (GEO / AEO)**:
   - Direct, factual summary blocks at the top of posts (easy for LLMs to cite).
   - Dynamic update to `public/llms.txt` or a dedicated endpoint `/llms.txt` listing all blog post summaries.
3. **Sitemap & Metadata Integration**:
   - Automated registration into `scripts/generate-sitemap.mjs` and `src/routes/sitemap[.]xml.ts`.
   - OpenGraph `article` tags with published time and tags.

---

## 3. Data Architecture

Create `src/data/blog-posts.ts`:

```typescript
export interface BlogPost {
  slug: string;
  title: string;
  titleFa?: string;
  excerpt: string;
  excerptFa?: string;
  category: "case-study" | "design" | "photography" | "video" | "branding" | "technology";
  categoryLabel: string;
  coverImage: string;
  publishedAt: string; // ISO date format e.g. "2026-09-28"
  readTime: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
  content: string; // Markdown or rich HTML content
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "crafting-visual-identities-in-ai-era",
    title: "Crafting Enduring Visual Identities in the Age of Generative Intelligence",
    excerpt:
      "How design studios can blend timeless typography and physical craft with AI-assisted creative workflows.",
    category: "branding",
    categoryLabel: "Branding & Strategy",
    coverImage: "/og.jpg",
    publishedAt: "2026-09-25",
    readTime: "5 min read",
    featured: true,
    author: {
      name: "Siavash Akbari",
      role: "Creative Director & Designer",
      avatar: "/og.jpg",
    },
    tags: ["Visual Identity", "Art Direction", "AI Design", "Case Study"],
    content: `...`,
  },
];
```

---

## 4. Routes Implementation

### Route 1: Blog Index (`src/routes/blog.index.tsx` or `src/routes/blog.tsx`)

- **Route URL**: `/blog`
- **Features**:
  - Filter state via URL search parameters (`?category=...`) or local React state.
  - Featured article hero section at the top (full-width banner style like Twelve Labs).
  - 3-column / 2-column responsive responsive grid for secondary articles.
  - Clean animated hover cards with glowing borders (`#3febcc/20`).

### Route 2: Blog Post Detail (`src/routes/blog.$slug.tsx`)

- **Route URL**: `/blog/$slug`
- **Features**:
  - Breadcrumbs (`Home` > `Blog` > `Article Title`).
  - Table of Contents (for long posts).
  - Rich reading layout (`prose prose-invert prose-emerald max-w-3xl mx-auto`).
  - Author bio & links.
  - Social share triggers & related articles grid.

---

## 5. SEO & Structured Data Implementation

Inside `src/routes/blog.$slug.tsx`:

```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { BLOG_POSTS } from "@/data/blog-posts";
import { getSiteUrl, absoluteUrl, pageHead, jsonLdScript } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const { post } = loaderData;
    const url = absoluteUrl(`/blog/${post.slug}`);
    const siteUrl = getSiteUrl();

    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: absoluteUrl(post.coverImage),
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      url: url,
      author: {
        "@type": "Person",
        name: post.author.name,
        jobTitle: post.author.role,
        url: siteUrl,
      },
      publisher: {
        "@type": "Person",
        name: "Siavash Akbari",
        url: siteUrl,
      },
      keywords: post.tags.join(", "),
    };

    return {
      ...pageHead({
        title: `${post.title} — Siavash Akbari`,
        description: post.excerpt,
        path: `/blog/${post.slug}`,
        image: post.coverImage,
        type: "article",
      }),
      scripts: [jsonLdScript(blogPostingSchema)],
    };
  },
  component: BlogPostDetailComponent,
});
```

---

## 6. Navigation & Sitemap Updates

1. Add `Blog` link to `src/routes/__root.tsx` desktop and mobile navigations.
2. In `scripts/generate-sitemap.mjs`, import or parse `BLOG_POSTS` and add `/blog` and `/blog/${slug}` to `allEntries`.
3. In `src/routes/sitemap[.]xml.ts`, include blog posts in `buildEntries()`.
