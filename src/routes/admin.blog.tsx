import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Calendar, 
  Clock, 
  Search, 
  X, 
  Check, 
  ExternalLink,
  Sparkles,
  Bot,
  Eye,
  CheckCircle2,
  Download
} from "lucide-react";
import { getStudioBlogPosts, saveStudioBlogPost, deleteStudioBlogPost } from "@/lib/studio-store";
import type { StudioBlogItem } from "@/types/admin";
import { BLOG_CATEGORIES, type BlogCategory } from "@/data/blog-posts";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlogView,
});

function AdminBlogView() {
  const [posts, setPosts] = useState<StudioBlogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<StudioBlogItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [titleFa, setTitleFa] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<BlogCategory>("my-blogs");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [excerptFa, setExcerptFa] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [readTime, setReadTime] = useState("4 min read");
  const [isPublished, setIsPublished] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setPosts(getStudioBlogPosts());
  }, []);

  const openNewPostForm = () => {
    setEditingPost(null);
    setTitle("");
    setTitleFa("");
    setSlug("");
    setCategory("my-blogs");
    setCoverImage("https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80");
    setExcerpt("");
    setExcerptFa("");
    setContentMarkdown("");
    setReadTime("4 min read");
    setIsPublished(true);
    setAiSummary("");
    setIsEditorOpen(true);
  };

  const openEditPostForm = (post: StudioBlogItem) => {
    setEditingPost(post);
    setTitle(post.title);
    setTitleFa(post.titleFa || "");
    setSlug(post.slug);
    setCategory(post.category);
    setCoverImage(post.coverImage);
    setExcerpt(post.excerpt);
    setExcerptFa(post.excerptFa || "");
    setContentMarkdown(post.contentMarkdown || post.excerpt);
    setReadTime(post.readTime);
    setIsPublished(post.published);
    setAiSummary(post.aiSummary || "");
    setIsEditorOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingPost) {
      setSlug(
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleContentChange = (text: string) => {
    setContentMarkdown(text);
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    setReadTime(`${minutes} min read`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    const matchedCat = BLOG_CATEGORIES.find((c) => c.key === category);

    const postToSave: StudioBlogItem = {
      slug: slug.trim(),
      title: title.trim(),
      titleFa: titleFa.trim() || undefined,
      excerpt: excerpt.trim(),
      excerptFa: excerptFa.trim() || undefined,
      category,
      categoryLabel: matchedCat?.label || (category === "my-blogs" ? "My Blogs" : "News"),
      coverImage: coverImage.trim(),
      publishedAt: editingPost ? editingPost.publishedAt : new Date().toISOString().split("T")[0],
      readTime,
      contentMarkdown: contentMarkdown.trim(),
      published: isPublished,
      aiSummary: aiSummary.trim() || undefined,
      author: editingPost?.author || {
        name: "Siavash Akbari",
        role: "Photographer, Designer & Creative Director",
        avatar: "/og.jpg",
        bio: "Multidisciplinary designer and photographer based in Esfahan, focusing on minimal aesthetics, visual identity systems, and contemporary art direction.",
      },
      tags: editingPost?.tags || ["Editorial", "Design", "Studio"],
    };

    saveStudioBlogPost(postToSave);
    setPosts(getStudioBlogPosts());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditorOpen(false);
    }, 800);
  };

  const handleDelete = (postSlug: string, postTitle: string) => {
    if (window.confirm(`Are you sure you want to delete blog post "${postTitle}"?`)) {
      deleteStudioBlogPost(postSlug);
      setPosts(getStudioBlogPosts());
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `siavash_blog_posts_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.titleFa && p.titleFa.includes(searchQuery));
    const matchesCategory =
      selectedCategoryFilter === "all" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Editorial & Blog Manager
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Write architectural essays, design theories, and studio news with AI Search / GEO optimization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
            title="Download JSON backup of all blog posts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={openNewPostForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-semibold shadow-[0_0_15px_rgba(44,227,192,0.25)] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-[#121212] border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search articles by title, slug, or Persian heading..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategoryFilter(cat.key)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategoryFilter === cat.key
                  ? "bg-[#2CE3C0] text-black font-semibold"
                  : "text-neutral-400 hover:text-white bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#181818] border-b border-white/10 text-neutral-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Published</th>
                <th className="py-3.5 px-4">Read Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPosts.map((post) => (
                <tr key={post.slug} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.coverImage}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-black shrink-0 border border-white/10"
                      />
                      <div>
                        <div className="font-bold text-white hover:text-[#2CE3C0] transition-colors">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          /blog/{post.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-300">
                      {post.categoryLabel}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-neutral-400">{post.publishedAt}</td>
                  <td className="py-4 px-4 text-neutral-400">{post.readTime}</td>
                  <td className="py-4 px-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 text-[#2CE3C0] font-medium text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2CE3C0]" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-neutral-500 text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-colors"
                        title="View live article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEditPostForm(post)}
                        className="p-1.5 rounded-lg border border-white/10 hover:border-[#2CE3C0] hover:text-[#2CE3C0] text-neutral-400 transition-colors cursor-pointer"
                        title="Edit article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug, post.title)}
                        className="p-1.5 rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-neutral-400 transition-colors cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blog Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingPost ? "Edit Article" : "Write New Article"}
                </h2>
                <p className="text-xs text-neutral-400">
                  Publish rich editorial essays with automated AI search (GEO) summaries.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Titles & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Article Title (English) *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Architectural Rhythm in Design"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    عنوان مقاله (فارسی)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={titleFa}
                    onChange={(e) => setTitleFa(e.target.value)}
                    placeholder="عنوان به فارسی..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    URL Slug (/blog/[slug]) *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="architectural-rhythm-in-design"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 font-mono text-[#2CE3C0] focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Category Pillar
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BlogCategory)}
                    className="w-full bg-[#181818] border border-white/15 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                  >
                    <option value="my-blogs">My Blogs (وبلاگ من)</option>
                    <option value="news">News (اخبار)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                />
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Short Excerpt / Teaser (English)
                  </label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="2-sentence teaser for card previews..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    خلاصه کوتاه (فارسی)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={excerptFa}
                    onChange={(e) => setExcerptFa(e.target.value)}
                    placeholder="خلاصه برای نمایش در کارت..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>
              </div>

              {/* AI Search & GEO Optimization Summary */}
              <div className="p-4 rounded-xl bg-[#2CE3C0]/5 border border-[#2CE3C0]/25 space-y-2">
                <div className="flex items-center gap-2 text-[#2CE3C0] font-semibold">
                  <Bot className="w-4 h-4" />
                  <span>AI Search / GEO Citation Summary (ChatGPT, Perplexity & Google AI Overviews)</span>
                </div>
                <textarea
                  rows={2}
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  placeholder="Direct, factual 40-word summary structured for LLM answer engines to quote and cite directly in answers..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#2CE3C0]"
                />
              </div>

              {/* Main Content Markdown Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                    Article Body (Markdown Supported)
                  </label>
                  <span className="text-[11px] text-[#2CE3C0] font-mono">
                    Estimated {readTime}
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={contentMarkdown}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="## Introduction&#10;&#10;Write your article here using standard Markdown headers, bullet points, quotes, and links..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-xs leading-relaxed text-white focus:outline-none focus:border-[#2CE3C0]"
                />
              </div>

              {/* Publication Status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published-check"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-white/20 bg-black/50 text-[#2CE3C0] focus:ring-[#2CE3C0]"
                />
                <label htmlFor="published-check" className="text-neutral-300 cursor-pointer">
                  Publish article immediately (Uncheck to save as draft)
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(44,227,192,0.3)]"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Article Saved!</span>
                    </>
                  ) : (
                    <span>{editingPost ? "Update Article" : "Publish Article"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
