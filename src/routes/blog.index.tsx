import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Calendar, Clock, Sparkles, Search, BookOpen } from "lucide-react";
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogCategory, type BlogPost } from "@/data/blog-posts";
import { pageHead, jsonLdScript, getSiteUrl } from "@/lib/seo";
import { BackToTop } from "@/components/BackToTop";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const siteUrl = getSiteUrl();
    const blogCollectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Blog & Studio News — Siavash Akbari",
      description:
        "Essays, architectural studies, design notes, and studio news by Siavash Akbari.",
      url: `${siteUrl}/blog`,
      author: {
        "@type": "Person",
        name: "Siavash Akbari",
        url: siteUrl,
      },
      hasPart: BLOG_POSTS.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: `${siteUrl}/blog/${post.slug}`,
        datePublished: post.publishedAt,
        author: {
          "@type": "Person",
          name: post.author.name,
        },
      })),
    };

    return {
      ...pageHead({
        title: "Blog & Studio News — Siavash Akbari",
        description:
          "Essays, architectural studies, design notes, and studio announcements by Siavash Akbari.",
        path: "/blog",
        image: "/og.jpg",
        type: "website",
      }),
      scripts: [jsonLdScript(blogCollectionSchema)],
    };
  },
  component: BlogIndexPage,
});

type Lang = "en" | "fa";

function LanguageSwitch({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  const isFa = lang === "fa";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFa}
      aria-label={isFa ? "تغییر به انگلیسی" : "Switch to Persian"}
      onClick={onToggle}
      dir="ltr"
      className="group relative inline-flex h-9 w-[5.5rem] shrink-0 items-center rounded-full border border-secondary/40 bg-secondary/5 p-0.5 shadow-none transition-all duration-300 ease-out hover:border-secondary hover:shadow-[0_0_12px_rgba(63,235,204,0.3)]"
    >
      <motion.span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-secondary text-secondary-foreground shadow-[0_0_10px_rgba(63,235,204,0.4)]"
        initial={false}
        animate={{ x: isFa ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <span
        className={`relative z-[1] flex w-1/2 items-center justify-center text-[11px] font-medium uppercase tracking-wider transition-colors duration-200 ${
          !isFa ? "text-secondary-foreground font-semibold" : "text-foreground/60"
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-[1] flex w-1/2 items-center justify-center font-farsi text-xs font-medium transition-colors duration-200 ${
          isFa ? "text-secondary-foreground font-semibold" : "text-foreground/60"
        }`}
      >
        فا
      </span>
    </button>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function BlogIndexPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isFa = lang === "fa";

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "fa" : "en"));
  };

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const titleMatch =
        post.title.toLowerCase().includes(q) || post.titleFa.toLowerCase().includes(q);
      const excerptMatch =
        post.excerpt.toLowerCase().includes(q) || post.excerptFa.toLowerCase().includes(q);
      const tagMatch =
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.tagsFa.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && (titleMatch || excerptMatch || tagMatch);
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  }, []);

  return (
    <div
      dir={isFa ? "rtl" : "ltr"}
      className={`relative min-h-screen bg-background text-foreground ${isFa ? "font-farsi" : ""}`}
    >
      {/* Editorial Header Section */}
      <section className="relative overflow-hidden border-b border-foreground/10 px-6 pt-16 pb-12 md:px-12 md:pt-24 md:pb-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          {/* Top Row: Category Badge + Language Switcher */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/5 px-3.5 py-1 text-xs uppercase tracking-widest text-secondary backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_8px_#3febcc]" />
              <span>{isFa ? "نشریه و اخبار استودیو" : "Studio Journal & News"}</span>
            </div>

            <LanguageSwitch lang={lang} onToggle={toggleLanguage} />
          </div>

          <h1
            className={`mt-6 font-display text-4xl font-normal tracking-tight text-foreground md:text-6xl lg:text-7xl ${
              isFa ? "font-farsi leading-[1.3] md:leading-[1.25]" : ""
            }`}
          >
            {isFa ? (
              <>
                معماری اندیشه، <br />
                <span className="italic text-foreground/70">جستارهای دیزاین و اخبار استودیو</span>
              </>
            ) : (
              <>
                Thought Architecture, <br />
                <span className="italic text-foreground/70">Essays & Studio News</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-2xl text-base font-normal leading-relaxed text-foreground/60 md:text-lg">
            {isFa
              ? "جستارهای شخصی پیرامون پایداری هویت دیداری، هندسه سکوت در عکاسی، و تازه‌ترین رویدادها و افتخارات استودیو سیاوش اکبری."
              : "Personal essays on brand durability, negative space in photography, and official announcements from Siavash Akbari Studio."}
          </p>

          {/* Search bar & Category filter pills */}
          <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Horizontal Filter Tabs with Gliding Active Capsule */}
            <div className="flex flex-wrap items-center gap-2">
              {BLOG_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`group relative flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium tracking-wider uppercase transition-colors duration-200 ${
                      isActive
                        ? "text-secondary-foreground"
                        : "border border-foreground/15 bg-background/60 text-foreground/70 hover:border-secondary/40 hover:text-foreground hover:bg-secondary/5"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeFilterPill"
                        className="absolute inset-0 rounded-full bg-secondary shadow-[0_0_16px_rgba(63,235,204,0.35)]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-[1]">{isFa ? cat.labelFa : cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40 ${
                  isFa ? "right-3.5" : "left-3.5"
                }`}
                aria-hidden
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFa ? "جستجوی مطالب و برچسب‌ها..." : "Search articles & news..."}
                className={`w-full rounded-full border border-foreground/15 bg-foreground/5 py-2 text-xs tracking-wider text-foreground placeholder:text-foreground/40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50 ${
                  isFa ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-20">
        {/* Featured Post Banner - only show when viewing 'all' and no search query */}
        {selectedCategory === "all" && searchQuery.trim() === "" && featuredPost && (
          <div className="mb-16">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isFa ? "مطلب برگزیده استودیو" : "Featured Story"}</span>
            </div>

            <Link
              to="/blog/$slug"
              params={{ slug: featuredPost.slug }}
              className="group relative block overflow-hidden rounded-xl border border-foreground/15 bg-foreground/[0.02] p-4 transition-all duration-500 hover:border-secondary/50 hover:shadow-[0_0_30px_rgba(63,235,204,0.12)] md:p-6"
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                {/* 16:9 Visual Preview */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-foreground/5 lg:col-span-7">
                  <img
                    src={featuredPost.coverImage}
                    alt={isFa ? featuredPost.titleFa : featuredPost.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                  <div
                    className={`absolute bottom-4 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-[11px] font-medium tracking-widest uppercase text-foreground backdrop-blur-md ${
                      isFa ? "right-4" : "left-4"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
                    {isFa ? featuredPost.categoryLabelFa : featuredPost.categoryLabel}
                  </div>
                </div>

                {/* Editorial Content */}
                <div className="flex flex-col justify-center lg:col-span-5">
                  <div className="flex items-center gap-4 text-xs text-foreground/50">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(featuredPost.publishedAt).toLocaleDateString(
                        isFa ? "fa-IR" : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {isFa ? featuredPost.readTimeFa : featuredPost.readTime}
                    </span>
                  </div>

                  <h2
                    className={`mt-4 font-display text-2xl font-normal leading-snug tracking-tight text-foreground transition-colors group-hover:text-secondary md:text-3xl ${
                      isFa ? "font-farsi leading-normal" : ""
                    }`}
                  >
                    {isFa ? featuredPost.titleFa : featuredPost.title}
                  </h2>

                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-foreground/70">
                    {isFa ? featuredPost.excerptFa : featuredPost.excerpt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {(isFa ? featuredPost.tagsFa : featuredPost.tags).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-foreground/10 bg-foreground/5 px-2.5 py-1 text-[11px] text-foreground/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-secondary">
                    <span>{isFa ? "مطالعه کامل مطلب" : "Read Full Story"}</span>
                    {isFa ? (
                      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Section Heading for Articles Grid */}
        <div className="mb-8 flex items-center justify-between border-b border-foreground/10 pb-4">
          <h3 className="font-display text-lg uppercase tracking-widest text-foreground">
            {selectedCategory === "all"
              ? isFa
                ? "همه مطالب"
                : "All Posts"
              : selectedCategory === "my-blogs"
                ? isFa
                  ? "وبلاگ من"
                  : "My Blogs"
                : isFa
                  ? "اخبار استودیو"
                  : "Studio News"}
          </h3>
          <span className="text-xs text-foreground/50">
            {filteredPosts.length} {isFa ? "مطلب" : filteredPosts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {/* Modular Grid with Butter-Smooth Staggered Transition */}
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-foreground/15 py-24 text-center">
            <BookOpen className="h-10 w-10 text-foreground/30" />
            <h4 className="mt-4 text-base font-medium text-foreground">
              {isFa ? "مطلبی با این مشخصات یافت نشد" : "No posts found"}
            </h4>
            <p className="mt-1 text-xs text-foreground/50">
              {isFa
                ? "لطفاً عبارت جستجو یا فیلتر دسته‌بندی را تغییر دهید."
                : "Try adjusting your search terms or filter selection."}
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-6 rounded-full border border-secondary/40 bg-secondary/10 px-5 py-2 text-xs uppercase tracking-wider text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {isFa ? "بازنشانی فیلترها" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${searchQuery}-${lang}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredPosts.map((post) => (
                <motion.div key={post.slug} variants={cardVariants} className="flex">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-foreground/15 bg-foreground/[0.015] transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:bg-foreground/[0.03] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(63,235,204,0.08)]"
                  >
                    {/* Visual Card Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-foreground/5">
                      <img
                        src={post.coverImage}
                        alt={isFa ? post.titleFa : post.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-50" />

                      {/* Category Badge with Micro-Dot Glow */}
                      <div
                        className={`absolute top-3 inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background/85 px-2.5 py-0.5 text-[10px] font-medium tracking-widest uppercase text-foreground backdrop-blur-md ${
                          isFa ? "right-3" : "left-3"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_#3febcc]" />
                        <span>{isFa ? post.categoryLabelFa : post.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* Meta: Date & Read Time */}
                      <div className="flex items-center gap-3 text-[11px] text-foreground/50">
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>·</span>
                        <span>{isFa ? post.readTimeFa : post.readTime}</span>
                      </div>

                      {/* Editorial Title */}
                      <h4
                        className={`mt-3 font-display text-lg font-normal leading-snug tracking-tight text-foreground transition-colors group-hover:text-secondary ${
                          isFa ? "font-farsi leading-normal text-base" : ""
                        }`}
                      >
                        {isFa ? post.titleFa : post.title}
                      </h4>

                      {/* Teaser Excerpt */}
                      <p className="mt-2.5 line-clamp-2 flex-1 text-xs leading-relaxed text-foreground/60">
                        {isFa ? post.excerptFa : post.excerpt}
                      </p>

                      {/* Tags & Action Footer */}
                      <div className="mt-5 flex items-center justify-between border-t border-foreground/10 pt-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(isFa ? post.tagsFa : post.tags).slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] tracking-wider text-foreground/40">
                              #{t}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-medium tracking-widest uppercase text-secondary opacity-80 transition-all group-hover:opacity-100 group-hover:translate-x-0.5">
                          <span>{isFa ? "مطالعه" : "Read"}</span>
                          {isFa ? (
                            <ArrowLeft className="h-3 w-3" />
                          ) : (
                            <ArrowRight className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <BackToTop />
    </div>
  );
}
