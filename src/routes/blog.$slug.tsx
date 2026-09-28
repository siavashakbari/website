import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Share2,
  Check,
  Twitter,
  Linkedin,
  Sparkles,
  BookOpen,
  ChevronRight,
  Hash,
} from "lucide-react";
import { BLOG_POSTS } from "@/data/blog-posts";
import { getSiteUrl, absoluteUrl, pageHead, jsonLdScript } from "@/lib/seo";
import { BackToTop } from "@/components/BackToTop";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return {};
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

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${siteUrl}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: url,
        },
      ],
    };

    return {
      ...pageHead({
        title: `${post.title} — Siavash Akbari`,
        description: post.excerpt,
        path: `/blog/${post.slug}`,
        image: post.coverImage,
        type: "article",
      }),
      scripts: [jsonLdScript(blogPostingSchema), jsonLdScript(breadcrumbSchema)],
    };
  },
  component: BlogPostDetailPage,
});

function BlogPostDetailPage() {
  const { post } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  // Related posts (excluding current post)
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    post.title,
  )}&url=${encodeURIComponent(shareUrl)}`;
  const shareLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Top Breadcrumb & Back Bar */}
      <div className="border-b border-foreground/10 bg-background/80 px-6 py-4 backdrop-blur-md md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground/50">
            <Link to="/" className="transition-colors hover:text-secondary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-foreground/30" />
            <Link to="/blog" className="transition-colors hover:text-secondary">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3 text-foreground/30" />
            <span className="max-w-[200px] truncate text-foreground sm:max-w-xs md:max-w-md">
              {post.title}
            </span>
          </nav>

          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-secondary transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">All Articles</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <header className="px-6 pt-12 pb-10 md:px-12 md:pt-16 lg:px-20">
        <div className="mx-auto max-w-4xl">
          {/* Category Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3.5 py-1 text-xs uppercase tracking-widest text-secondary shadow-[0_0_12px_rgba(63,235,204,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
            <span>{post.categoryLabel}</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-6 font-display text-3xl font-normal leading-[1.15] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {/* Subtitle / Excerpt */}
          <p className="mt-6 text-base leading-relaxed text-foreground/70 md:text-xl">
            {post.excerpt}
          </p>

          {/* Meta & Author Bar */}
          <div className="mt-8 flex flex-col gap-6 border-y border-foreground/10 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-11 w-11 rounded-full border border-secondary/40 object-cover shadow-[0_0_10px_rgba(63,235,204,0.2)]"
              />
              <div>
                <div className="text-sm font-medium tracking-wide text-foreground">
                  {post.author.name}
                </div>
                <div className="text-xs text-foreground/50">{post.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-xs text-foreground/50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-foreground/40" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-foreground/40" />
                  {post.readTime}
                </span>
              </div>

              {/* Share triggers */}
              <div className="flex items-center gap-2 border-l border-foreground/10 pl-6">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy article link"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-secondary hover:text-secondary"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-secondary" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <a
                  href={shareTwitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on X"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-secondary hover:text-secondary"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a
                  href={shareLinkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on LinkedIn"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-secondary hover:text-secondary"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image Showcase */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-foreground/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="relative aspect-[16/9] w-full bg-foreground/5 sm:aspect-[21/9]">
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Article Container */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-16">
        {/* Generative AI & Executive Summary Box (GEO / AEO Optimized) */}
        <section
          aria-label="Executive and AI Search Summary"
          className="relative mb-12 overflow-hidden rounded-xl border border-secondary/30 bg-gradient-to-b from-secondary/[0.07] to-secondary/[0.02] p-6 backdrop-blur-sm md:p-8"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
            <Sparkles className="h-4 w-4" />
            <span>Executive & AI Summary (Direct Factual Takeaways)</span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-foreground/60">
            Engineered for rapid human comprehension and direct generative engine citation (Google
            AI Overviews, Perplexity, Claude & ChatGPT).
          </p>

          <ul className="mt-5 space-y-3">
            {post.aiSummary.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm leading-relaxed text-foreground/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Table of Contents */}
        {post.sections.length > 1 && (
          <nav
            aria-label="Table of Contents"
            className="mb-12 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-foreground/60">
              <BookOpen className="h-3.5 w-3.5 text-secondary" />
              <span>Table of Contents</span>
            </div>
            <ol className="mt-4 space-y-2">
              {post.sections.map((section, idx) => (
                <li key={idx}>
                  <a
                    href={`#section-${idx}`}
                    className="inline-flex items-center gap-2 text-xs tracking-wider text-foreground/70 transition-colors hover:text-secondary"
                  >
                    <span className="font-mono text-[10px] text-foreground/40">0{idx + 1}.</span>
                    <span>{section.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body Content Sections */}
        <article className="space-y-12">
          {post.sections.map((section, idx) => (
            <section key={idx} id={`section-${idx}`} className="scroll-mt-24 space-y-6">
              <h2 className="font-display text-2xl font-normal tracking-tight text-foreground md:text-3xl">
                {section.heading}
              </h2>

              <div className="space-y-5 text-base leading-relaxed text-foreground/80 md:text-lg">
                {section.body.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Optional Section Quote */}
              {section.quote && (
                <figure className="my-8 border-l-2 border-secondary bg-secondary/[0.03] py-4 pl-6 pr-4">
                  <blockquote className="font-display text-lg italic text-foreground/90 md:text-xl">
                    "{section.quote.text}"
                  </blockquote>
                  {section.quote.caption && (
                    <figcaption className="mt-3 text-xs tracking-wider uppercase text-secondary">
                      — {section.quote.caption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Optional Section Image */}
              {section.image && (
                <figure className="my-8 overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5">
                  <img
                    src={section.image.url}
                    alt={section.image.alt}
                    className="w-full object-cover"
                  />
                  {section.image.caption && (
                    <figcaption className="p-4 text-center text-xs tracking-wide text-foreground/50">
                      {section.image.caption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Optional Studio Callout Card */}
              {section.callout && (
                <div className="my-8 rounded-xl border border-secondary/30 bg-secondary/5 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{section.callout.title}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                    {section.callout.text}
                  </p>
                </div>
              )}
            </section>
          ))}
        </article>

        {/* Tags */}
        <div className="mt-16 flex flex-wrap items-center gap-2 border-t border-foreground/10 pt-8">
          <span className="mr-2 text-xs uppercase tracking-widest text-foreground/40">
            Categorized:
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-foreground/70"
            >
              <Hash className="h-3 w-3 text-secondary/70" />
              {tag}
            </span>
          ))}
        </div>

        {/* Author Bio Card */}
        <div className="mt-12 rounded-2xl border border-foreground/15 bg-foreground/[0.02] p-8 md:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-20 w-20 rounded-full border-2 border-secondary/40 object-cover shadow-[0_0_16px_rgba(63,235,204,0.25)]"
            />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-secondary">
                Written by Studio Director
              </div>
              <h3 className="mt-1 font-display text-xl font-normal text-foreground">
                {post.author.name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground/60">{post.author.bio}</p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <Link to="/about" className="text-secondary hover:underline">
                  About Siavash →
                </Link>
                <Link to="/contact" className="text-foreground/60 hover:text-foreground">
                  Get in Touch →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles (Twelve Labs Modular Grid) */}
      <section className="border-t border-foreground/10 bg-foreground/[0.015] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-secondary">
                Next in Studio Journal
              </span>
              <h3 className="mt-1 font-display text-2xl font-normal tracking-tight text-foreground md:text-3xl">
                Related Posts & News
              </h3>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-secondary transition-transform hover:translate-x-0.5"
            >
              <span>Explore All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                to="/blog/$slug"
                params={{ slug: related.slug }}
                className="group flex flex-col overflow-hidden rounded-xl border border-foreground/15 bg-background transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(63,235,204,0.06)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-foreground/5">
                  <img
                    src={related.coverImage}
                    alt={related.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background/85 px-2.5 py-0.5 text-[10px] font-medium tracking-widest uppercase text-foreground backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
                    <span>{related.categoryLabel}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="text-[11px] text-foreground/50">
                    {new Date(related.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {related.readTime}
                  </div>

                  <h4 className="mt-2.5 font-display text-base font-normal leading-snug tracking-tight text-foreground transition-colors group-hover:text-secondary">
                    {related.title}
                  </h4>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/60">
                    {related.excerpt}
                  </p>

                  <div className="mt-4 flex items-center gap-1 pt-2 text-[11px] font-medium tracking-widest uppercase text-secondary">
                    <span>Read Story</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}
