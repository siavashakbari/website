import { useState, useEffect } from "react";
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
import { getBlogPostBySlug, getMergedBlogPosts, type StudioBlogItem } from "@/lib/studio-store";
import { getSiteUrl, absoluteUrl, pageHead, jsonLdScript } from "@/lib/seo";
import { BackToTop } from "@/components/BackToTop";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    // 1. Direct match in persistent studio-store or default BLOG_POSTS
    const post = getBlogPostBySlug(params.slug) || BLOG_POSTS.find((p) => p.slug === params.slug);
    
    // In SSR (where localStorage is empty) a custom post created in admin might not exist on the server yet.
    // Instead of throwing a hard 404, we pass null or empty placeholder so client can hydrate from localStorage.
    if (!post) {
      if (typeof window === "undefined") {
        return { post: null, slug: params.slug };
      }
      throw notFound();
    }
    return { post, slug: params.slug };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return pageHead({
        title: "Blog — Siavash Akbari",
        description: "Studio Journal & News by Siavash Akbari",
        path: `/blog/${loaderData?.slug || ""}`,
      });
    }
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
        name: (post as any).author?.name || "Siavash Akbari",
        jobTitle: (post as any).author?.role || "Photographer, Designer & Creative Director",
        url: siteUrl,
      },
      publisher: {
        "@type": "Person",
        name: "Siavash Akbari",
        url: siteUrl,
      },
      keywords: ((post as any).tags || []).join(", "),
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
      scripts: [
        jsonLdScript(blogPostingSchema),
        jsonLdScript(breadcrumbSchema),
      ],
    };
  },
  component: BlogPostDetailPage,
});

function BlogPostDetailPage() {
  const { post: initialPost, slug } = Route.useLoaderData();
  const [post, setPost] = useState<any>(initialPost || (() => getBlogPostBySlug(slug)));
  const [allPosts, setAllPosts] = useState(() => getMergedBlogPosts());
  const [copied, setCopied] = useState(false);

  const [lang, setLang] = useState<"en" | "fa">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("siavash_blog_lang");
      if (saved === "fa" || saved === "en") return saved;
    }
    return "en";
  });

  const isFa = lang === "fa";

  const toggleLanguage = () => {
    const nextLang = lang === "fa" ? "en" : "fa";
    setLang(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("siavash_blog_lang", nextLang);
    }
  };

  useEffect(() => {
    const livePost = getBlogPostBySlug(slug) || (initialPost ? getBlogPostBySlug(initialPost.slug) : undefined);
    if (livePost) {
      setPost(livePost as any);
    }
    setAllPosts(getMergedBlogPosts());
  }, [slug, initialPost]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center text-foreground">
        <h1 className="font-display text-4xl">Article Not Found</h1>
        <p className="mt-4 text-muted-foreground">The article you are looking for does not exist or has been removed.</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-5 py-2 text-xs uppercase tracking-widest text-secondary hover:bg-secondary hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Blog</span>
        </Link>
      </div>
    );
  }

  // Related posts (excluding current post)
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug && p.published !== false).slice(0, 3);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const postTitle = isFa ? (post.titleFa || post.title) : post.title;
  const postExcerpt = isFa ? (post.excerptFa || post.excerpt) : post.excerpt;
  const postCategoryLabel = isFa
    ? (post.category === "news" ? "اخبار" : "وبلاگ من")
    : post.categoryLabel;

  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    postTitle,
  )}&url=${encodeURIComponent(shareUrl)}`;
  const shareLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;

  return (
    <div
      className={`relative min-h-screen bg-background text-foreground transition-all duration-300 ${
        isFa ? "font-farsi" : ""
      }`}
      dir={isFa ? "rtl" : "ltr"}
      lang={lang}
    >
      {/* Top Breadcrumb & Back Bar */}
      <div className="border-b border-foreground/10 bg-background/80 px-6 py-4 backdrop-blur-md md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground/50">
            <Link to="/" className="transition-colors hover:text-secondary">
              {isFa ? "خانه" : "Home"}
            </Link>
            <ChevronRight className={`h-3 w-3 text-foreground/30 ${isFa ? "rotate-180" : ""}`} />
            <Link to="/blog" className="transition-colors hover:text-secondary">
              {isFa ? "وبلاگ" : "Blog"}
            </Link>
            <ChevronRight className={`h-3 w-3 text-foreground/30 ${isFa ? "rotate-180" : ""}`} />
            <span className="max-w-[160px] truncate text-foreground sm:max-w-xs md:max-w-md">
              {postTitle}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {/* Bilingual Switcher Pill */}
            <button
              type="button"
              role="switch"
              aria-checked={isFa}
              aria-label={isFa ? "تغییر زبان به انگلیسی" : "Switch language to Farsi"}
              onClick={toggleLanguage}
              dir="ltr"
              className="group relative inline-flex h-9 w-[6.2rem] shrink-0 items-center rounded-full border border-secondary/80 bg-background/60 p-1 shadow-none transition-[border-color,box-shadow] duration-300 ease-out hover:border-secondary hover:shadow-[0_0_12px_rgba(63,235,204,0.35)] cursor-pointer"
            >
              <span
                aria-hidden
                className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-secondary text-secondary-foreground shadow-[0_0_8px_rgba(63,235,204,0.4)] transition-all duration-300 ${
                  isFa ? "left-[calc(50%)]" : "left-0.5"
                }`}
              />
              <span
                className={`relative z-[1] flex w-1/2 items-center justify-center text-[10px] font-semibold tracking-wider transition-colors duration-200 ${
                  !isFa ? "text-secondary-foreground font-bold" : "text-foreground/70"
                }`}
              >
                ENG
              </span>
              <span
                className={`relative z-[1] flex w-1/2 items-center justify-center font-farsi text-[11px] font-semibold transition-colors duration-200 ${
                  isFa ? "text-secondary-foreground font-bold" : "text-foreground/70"
                }`}
              >
                فا
              </span>
            </button>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-secondary transition-transform hover:-translate-x-0.5"
            >
              <ArrowLeft className={`h-3.5 w-3.5 ${isFa ? "rotate-180" : ""}`} />
              <span className="hidden sm:inline">{isFa ? "همه مقالات" : "All Articles"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="px-6 pt-12 pb-10 md:px-12 md:pt-16 lg:px-20">
        <div className="mx-auto max-w-4xl">
          {/* Category Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3.5 py-1 text-xs uppercase tracking-widest text-secondary shadow-[0_0_12px_rgba(63,235,204,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
            <span>{postCategoryLabel}</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-6 font-display text-3xl font-normal leading-[1.2] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {postTitle}
          </h1>

          {/* Subtitle / Excerpt */}
          <p className="mt-6 text-base leading-relaxed text-foreground/70 md:text-xl">
            {postExcerpt}
          </p>

          {/* Meta & Author Bar */}
          <div className="mt-8 flex flex-col gap-6 border-y border-foreground/10 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={post.author?.avatar || "/og.jpg"}
                alt={post.author?.name || "Siavash Akbari"}
                className="h-11 w-11 rounded-full border border-secondary/40 object-cover shadow-[0_0_10px_rgba(63,235,204,0.2)]"
              />
              <div>
                <div className="text-sm font-medium tracking-wide text-foreground">
                  {post.author?.name || "Siavash Akbari"}
                </div>
                <div className="text-xs text-foreground/50">
                  {isFa
                    ? (post.author?.roleFa || "عکاس، طراح و کارگردان خلاقیت")
                    : (post.author?.role || "Photographer, Designer & Creative Director")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-xs text-foreground/50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-foreground/40" />
                  {new Date(post.publishedAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
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
              <div className={`flex items-center gap-2 ${isFa ? "border-r pr-6" : "border-l pl-6"} border-foreground/10`}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title={isFa ? "کپی پیوند مقاله" : "Copy article link"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-secondary hover:text-secondary cursor-pointer"
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
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Article Container */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-16">
        {/* Generative AI & Executive Summary Box (GEO / AEO Optimized) */}
        {((isFa && (post.aiSummaryFa || post.aiSummary)) || post.aiSummary) && (
          <section
            aria-label="Executive and AI Search Summary"
            className="relative mb-12 overflow-hidden rounded-xl border border-secondary/30 bg-gradient-to-b from-secondary/[0.07] to-secondary/[0.02] p-6 backdrop-blur-sm md:p-8"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
              <Sparkles className="h-4 w-4" />
              <span>
                {isFa
                  ? "خلاصه اجرایی و نکات کلیدی هوش مصنوعی"
                  : "Executive & AI Summary (Direct Factual Takeaways)"}
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-foreground/60">
              {isFa
                ? "طراحی‌شده برای درک سریع خواننده و استناد مستقیم موتورهای جستجوی مولد (ChatGPT، Perplexity و Google AI)."
                : "Engineered for rapid human comprehension and direct generative engine citation (Google AI Overviews, Perplexity, Claude & ChatGPT)."}
            </p>

            <ul className="mt-5 space-y-3">
              {(() => {
                const rawSummary = isFa ? (post.aiSummaryFa || post.aiSummary) : post.aiSummary;
                const points = Array.isArray(rawSummary)
                  ? rawSummary
                  : typeof rawSummary === "string"
                    ? rawSummary.split("\n").map((p: string) => p.trim()).filter(Boolean)
                    : [];
                return points.map((point: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm leading-relaxed text-foreground/90"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
                    <span>{point}</span>
                  </li>
                ));
              })()}
            </ul>
          </section>
        )}

        {/* Table of Contents for structured posts */}
        {post.sections && post.sections.length > 1 && (
          <nav
            aria-label="Table of Contents"
            className="mb-12 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-foreground/60">
              <BookOpen className="h-3.5 w-3.5 text-secondary" />
              <span>{isFa ? "فهرست عناوین" : "Table of Contents"}</span>
            </div>
            <ol className="mt-4 space-y-2">
              {post.sections.map((section: any, idx: number) => {
                const headingText = isFa ? (section.headingFa || section.heading) : section.heading;
                return (
                  <li key={idx}>
                    <a
                      href={`#section-${idx}`}
                      className="inline-flex items-center gap-2 text-xs tracking-wider text-foreground/70 transition-colors hover:text-secondary"
                    >
                      <span className="font-mono text-[10px] text-foreground/40">
                        0{idx + 1}.
                      </span>
                      <span>{headingText}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Body Content Sections */}
        {post.sections && post.sections.length > 0 ? (
          <article className="space-y-12">
            {post.sections.map((section: any, idx: number) => {
              const headingText = isFa ? (section.headingFa || section.heading) : section.heading;
              const bodyParas = isFa && section.bodyFa && section.bodyFa.length > 0
                ? section.bodyFa
                : section.body;
              const quoteText = isFa ? (section.quote?.textFa || section.quote?.text) : section.quote?.text;
              const quoteCaption = isFa ? (section.quote?.captionFa || section.quote?.caption) : section.quote?.caption;
              const calloutTitle = isFa ? (section.callout?.titleFa || section.callout?.title) : section.callout?.title;
              const calloutText = isFa ? (section.callout?.textFa || section.callout?.text) : section.callout?.text;
              const imgCaption = isFa ? (section.image?.captionFa || section.image?.caption) : section.image?.caption;

              return (
                <section key={idx} id={`section-${idx}`} className="scroll-mt-24 space-y-6">
                  <h2 className="font-display text-2xl font-normal tracking-tight text-foreground md:text-3xl">
                    {headingText}
                  </h2>

                  <div className="space-y-5 text-base leading-relaxed text-foreground/80 md:text-lg">
                    {bodyParas.map((para: string, pIdx: number) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>

                  {/* Optional Section Quote */}
                  {quoteText && (
                    <figure className={`my-8 ${isFa ? "border-r-2 pr-6 pl-4" : "border-l-2 pl-6 pr-4"} border-secondary bg-secondary/[0.03] py-4`}>
                      <blockquote className="font-display text-lg italic text-foreground/90 md:text-xl">
                        "{quoteText}"
                      </blockquote>
                      {quoteCaption && (
                        <figcaption className="mt-3 text-xs tracking-wider uppercase text-secondary">
                          — {quoteCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Optional Section Image */}
                  {section.image && (
                    <figure className="my-8 overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5">
                      <img
                        src={section.image.url}
                        alt={section.image.alt || headingText}
                        className="w-full object-cover"
                      />
                      {imgCaption && (
                        <figcaption className="p-4 text-center text-xs tracking-wide text-foreground/50">
                          {imgCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Optional Studio Callout Card */}
                  {calloutText && (
                    <div className="my-8 rounded-xl border border-secondary/30 bg-secondary/5 p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{calloutTitle}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        {calloutText}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
          </article>
        ) : (
          /* Render contentMarkdown for admin studio posts */
          <article className="space-y-6 text-base leading-relaxed text-foreground/85 md:text-lg">
            {(() => {
              const activeMarkdown = isFa
                ? (post.contentMarkdownFa || post.excerptFa || post.contentMarkdown || post.excerpt || "")
                : (post.contentMarkdown || post.excerpt || "");
              return activeMarkdown
                .split("\n\n")
                .map((block: string, idx: number) => {
                  const trimmed = block.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={idx} className="font-display text-xl font-normal tracking-tight text-foreground md:text-2xl pt-4">
                        {trimmed.replace(/^###\s+/, "")}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="font-display text-2xl font-normal tracking-tight text-foreground md:text-3xl pt-6">
                        {trimmed.replace(/^##\s+/, "")}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("# ")) {
                    return (
                      <h1 key={idx} className="font-display text-3xl font-normal tracking-tight text-foreground md:text-4xl pt-8">
                        {trimmed.replace(/^#\s+/, "")}
                      </h1>
                    );
                  }
                  if (trimmed.startsWith("> ")) {
                    return (
                      <figure key={idx} className={`my-6 ${isFa ? "border-r-2 pr-6 pl-4" : "border-l-2 pl-6 pr-4"} border-secondary bg-secondary/[0.03] py-4`}>
                        <blockquote className="font-display text-lg italic text-foreground/90 md:text-xl">
                          {trimmed.replace(/^>\s*/, "")}
                        </blockquote>
                      </figure>
                    );
                  }
                  return <p key={idx}>{trimmed}</p>;
                });
            })()}
          </article>
        )}

        {/* Categorized Hashtags / Tags Editable via Admin */}
        {(() => {
          const activeTags = isFa && post.tagsFa && post.tagsFa.length > 0
            ? post.tagsFa
            : (post.tags || []);
          if (activeTags.length === 0) return null;
          return (
            <div className="mt-16 flex flex-wrap items-center gap-2 border-t border-foreground/10 pt-8">
              <span className={`mr-2 text-xs uppercase tracking-widest text-foreground/40 ${isFa ? "ml-2 mr-0" : ""}`}>
                {isFa ? "دسته‌بندی موضوعی:" : "Categorized:"}
              </span>
              {activeTags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-foreground/70"
                >
                  <Hash className="h-3 w-3 text-secondary/70" />
                  {tag}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Author Bio Card */}
        <div className="mt-12 rounded-2xl border border-foreground/15 bg-foreground/[0.02] p-8 md:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={(post as any).author?.avatar || "/og.jpg"}
              alt={(post as any).author?.name || "Siavash Akbari"}
              className="h-20 w-20 rounded-full border-2 border-secondary/40 object-cover shadow-[0_0_16px_rgba(63,235,204,0.25)]"
            />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-secondary">
                {isFa ? "نوشته شده توسط مدیر استودیو" : "Written by Studio Director"}
              </div>
              <h3 className="mt-1 font-display text-xl font-normal text-foreground">
                {(post as any).author?.name || "Siavash Akbari"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                {isFa
                  ? "طراح و عکاس چندرشته‌ای مستقر در اصفهان؛ با تمرکز بر زیبایی‌شناسی مینیمال، سیستم‌های هویت بصری و مدیریت هنری معاصر."
                  : ((post as any).author?.bio ||
                    "Multidisciplinary designer and photographer based in Esfahan, focusing on minimal aesthetics, visual identity systems, and contemporary art direction.")}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <Link to="/about" className="text-secondary hover:underline">
                  {isFa ? "درباره سیاوش ←" : "About Siavash →"}
                </Link>
                <Link to="/contact" className="text-foreground/60 hover:text-foreground">
                  {isFa ? "ارتباط با ما ←" : "Get in Touch →"}
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
                {isFa ? "ادامه در ژورنال استودیو" : "Next in Studio Journal"}
              </span>
              <h3 className="mt-1 font-display text-2xl font-normal tracking-tight text-foreground md:text-3xl">
                {isFa ? "مطالب و اخبار مرتبط" : "Related Posts & News"}
              </h3>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-secondary transition-transform hover:translate-x-0.5"
            >
              <span>{isFa ? "مشاهده همه" : "Explore All"}</span>
              <ArrowRight className={`h-3.5 w-3.5 ${isFa ? "rotate-180" : ""}`} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {relatedPosts.map((related) => {
              const relTitle = isFa ? (related.titleFa || related.title) : related.title;
              const relExcerpt = isFa ? (related.excerptFa || related.excerpt) : related.excerpt;
              const relCatLabel = isFa
                ? (related.category === "news" ? "اخبار" : "وبلاگ من")
                : related.categoryLabel;

              return (
                <Link
                  key={related.slug}
                  to="/blog/$slug"
                  params={{ slug: related.slug }}
                  className="group flex flex-col overflow-hidden rounded-xl border border-foreground/15 bg-background transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(63,235,204,0.06)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-foreground/5">
                    <img
                      src={related.coverImage}
                      alt={relTitle}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className={`absolute top-3 inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background/85 px-2.5 py-0.5 text-[10px] font-medium tracking-widest uppercase text-foreground backdrop-blur-md ${
                        isFa ? "right-3" : "left-3"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
                      <span>{relCatLabel}</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="text-[11px] text-foreground/50">
                      {new Date(related.publishedAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {related.readTime}
                    </div>

                    <h4 className="mt-2.5 font-display text-base font-normal leading-snug tracking-tight text-foreground transition-colors group-hover:text-secondary">
                      {relTitle}
                    </h4>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/60">
                      {relExcerpt}
                    </p>

                    <div className="mt-4 flex items-center gap-1 pt-2 text-[11px] font-medium tracking-widest uppercase text-secondary">
                      <span>{isFa ? "مشاهده مقاله" : "Read Story"}</span>
                      <ArrowRight className={`h-3 w-3 ${isFa ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}

