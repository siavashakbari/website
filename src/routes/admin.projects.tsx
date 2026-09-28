import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  X, 
  Star, 
  Film, 
  Search,
  Filter,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { getStudioProjects, saveStudioProject, deleteStudioProject } from "@/lib/studio-store";
import type { StudioProjectItem } from "@/types/admin";
import { DISCIPLINES } from "@/data/disciplines";

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjectsView,
});

const DISCIPLINE_OPTIONS = [
  { slug: "fashion-photography", label: "Fashion Photography", category: "photography" },
  { slug: "food-photography", label: "Food Photography", category: "photography" },
  { slug: "portrait-photography", label: "Portrait Photography", category: "photography" },
  { slug: "product-photography", label: "Product Photography", category: "photography" },
  { slug: "visual-identity", label: "Visual Identity", category: "graphic-design" },
  { slug: "graphic-design", label: "Graphic Design", category: "graphic-design" },
  { slug: "video", label: "Video & Motion", category: "video" },
  { slug: "book-covers", label: "Book Covers", category: "graphic-design" },
  { slug: "posters", label: "Posters", category: "graphic-design" },
];

function AdminProjectsView() {
  const [projects, setProjects] = useState<StudioProjectItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<StudioProjectItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [titleFa, setTitleFa] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState("2026");
  const [discipline, setDiscipline] = useState("fashion-photography");
  const [description, setDescription] = useState("");
  const [descriptionFa, setDescriptionFa] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState<{ id: string; url: string; alt?: string; caption?: string }[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setProjects(getStudioProjects());
  }, []);

  const openNewProjectForm = () => {
    setEditingProject(null);
    setTitle("");
    setTitleFa("");
    setClient("");
    setYear("2026");
    setDiscipline("fashion-photography");
    setDescription("");
    setDescriptionFa("");
    setCoverImage("");
    setImages([]);
    setIsFeatured(false);
    setIsEditorOpen(true);
  };

  const openEditProjectForm = (proj: StudioProjectItem) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setTitleFa(proj.titleFa || "");
    setClient(proj.client);
    setYear(String(proj.year));
    setDiscipline(proj.discipline);
    setDescription(proj.description);
    setDescriptionFa(proj.descriptionFa || "");
    setCoverImage(proj.coverImage);
    setImages(proj.images || []);
    setIsFeatured(Boolean(proj.featured));
    setIsEditorOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (!url) return;

        const newImg = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          url,
          alt: file.name.replace(/\.[^/.]+$/, ""),
        };

        setImages((prev) => [...prev, newImg]);

        // If coverImage is empty, set this first image as cover automatically
        setCoverImage((current) => current || url);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (imgId: string) => {
    setImages((prev) => {
      const next = prev.filter((im) => im.id !== imgId);
      if (coverImage === prev.find((im) => im.id === imgId)?.url) {
        setCoverImage(next[0]?.url || "");
      }
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const projectId = editingProject
      ? editingProject.id
      : `proj-${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)}`;

    const selectedDiscObj = DISCIPLINE_OPTIONS.find((d) => d.slug === discipline);

    const projectToSave: StudioProjectItem = {
      id: projectId,
      title: title.trim(),
      titleFa: titleFa.trim() || undefined,
      client: client.trim() || "Independent",
      year: year.trim() || "2026",
      discipline,
      category: selectedDiscObj?.label || discipline,
      coverImage: coverImage || images[0]?.url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      description: description.trim(),
      descriptionFa: descriptionFa.trim() || undefined,
      images,
      featured: isFeatured,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString(),
    };

    saveStudioProject(projectToSave);
    setProjects(getStudioProjects());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditorOpen(false);
    }, 800);
  };

  const handleDelete = (id: string, projectTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectTitle}" from your portfolio?`)) {
      deleteStudioProject(id);
      setProjects(getStudioProjects());
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.titleFa && p.titleFa.includes(searchQuery)) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline =
      selectedDisciplineFilter === "all" || p.discipline === selectedDisciplineFilter;
    return matchesSearch && matchesDiscipline;
  });

  return (
    <div className="space-y-8">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Content & Project Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Create showcase projects, upload media series, and target specific discipline pages.
          </p>
        </div>

        <button
          onClick={openNewProjectForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-semibold shadow-[0_0_15px_rgba(44,227,192,0.25)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-[#121212] border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search projects by title, Persian name, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
          />
        </div>

        {/* Discipline Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setSelectedDisciplineFilter("all")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedDisciplineFilter === "all"
                ? "bg-[#2CE3C0] text-black font-semibold"
                : "text-neutral-400 hover:text-white bg-white/5"
            }`}
          >
            All ({projects.length})
          </button>
          {DISCIPLINE_OPTIONS.map((d) => {
            const count = projects.filter((p) => p.discipline === d.slug).length;
            if (count === 0 && selectedDisciplineFilter !== d.slug) return null;
            return (
              <button
                key={d.slug}
                onClick={() => setSelectedDisciplineFilter(d.slug)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedDisciplineFilter === d.slug
                    ? "bg-[#2CE3C0] text-black font-semibold"
                    : "text-neutral-400 hover:text-white bg-white/5"
                }`}
              >
                {d.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-300">No projects found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "No projects matched your search criteria."
              : "You haven't created any custom projects yet. Click 'Create New Project' to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const discObj = DISCIPLINE_OPTIONS.find((d) => d.slug === project.discipline);
            return (
              <div
                key={project.id}
                className="group rounded-2xl border border-white/10 bg-[#121212] overflow-hidden hover:border-[#2CE3C0]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Cover */}
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#2CE3C0] px-2.5 py-1 rounded-md border border-white/10">
                        {discObj?.label || project.discipline}
                      </span>
                      {project.featured && (
                        <span className="text-[10px] bg-[#2CE3C0] text-black px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-[#2CE3C0] transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-xs font-mono text-neutral-500">{project.year}</span>
                    </div>

                    {project.titleFa && (
                      <div className="text-xs text-neutral-400 font-sans" dir="rtl">
                        {project.titleFa}
                      </div>
                    )}

                    <div className="text-xs text-neutral-500 flex items-center gap-2 pt-1">
                      <span>Client: {project.client}</span>
                      <span>·</span>
                      <span>{project.images?.length || 0} media assets</span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 pt-1 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 border-t border-white/5 bg-black/30 flex items-center justify-between">
                  <a
                    href={`/${project.discipline}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>View Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditProjectForm(project)}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-[#2CE3C0] hover:text-[#2CE3C0] text-neutral-300 text-xs transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-neutral-400 text-xs transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal / Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingProject ? "Edit Showcase Project" : "Create New Project"}
                </h2>
                <p className="text-xs text-neutral-400">
                  Configure project imagery, descriptions, and destination discipline.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Discipline Target Selector */}
              <div className="p-4 rounded-xl bg-black/40 border border-[#2CE3C0]/30 space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#2CE3C0] font-semibold">
                  Target Discipline Gallery (Where will this show up?)
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-[#181818] border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                >
                  {DISCIPLINE_OPTIONS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.label} (/{d.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-400">
                  Selecting this automatically publishes the project to the matching showcase section on your website.
                </p>
              </div>

              {/* Title Fields (English & Persian) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Project Title (English) *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Atlasi Fashion Series"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    عنوان پروژه (فارسی)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={titleFa}
                    onChange={(e) => setTitleFa(e.target.value)}
                    placeholder="مثلاً مجموعه مد اطلسی"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>
              </div>

              {/* Client & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Vishnu Clinic / Studio Atlasi"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Year of Production
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026 / 1405"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>
              </div>

              {/* Descriptions (English & Persian) */}
              <div className="space-y-4">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Project Narrative & Art Direction (English)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the aesthetic direction, lighting setup, or conceptual rationale..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    توضیحات و یادداشت‌های هنری (فارسی)
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={descriptionFa}
                    onChange={(e) => setDescriptionFa(e.target.value)}
                    placeholder="توضیحات مربوط به جهت‌گیری هنری، نورپردازی یا جزئیات ساختار..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>
              </div>

              {/* Media Uploader Zone */}
              <div className="space-y-3 pt-2">
                <label className="block font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                  Project Imagery & Media Assets ({images.length})
                </label>

                {/* Dropzone */}
                <label className="border-2 border-dashed border-white/20 hover:border-[#2CE3C0] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/[0.02]">
                  <Upload className="w-8 h-8 text-[#2CE3C0]" />
                  <div className="text-center">
                    <span className="font-semibold text-white">Click to upload photos</span> or drag and drop
                    <p className="text-[11px] text-neutral-500 mt-0.5">Supports WebP, JPG, PNG, and MP4 video clips</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/mp4"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Thumbnails Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {images.map((img, idx) => {
                      const isCover = coverImage === img.url;
                      return (
                        <div
                          key={img.id}
                          className={`relative aspect-square rounded-lg overflow-hidden border ${
                            isCover ? "border-[#2CE3C0] ring-2 ring-[#2CE3C0]/40" : "border-white/10"
                          } group`}
                        >
                          <img src={img.url} alt={img.alt || "Uploaded"} className="w-full h-full object-cover" />

                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 bg-[#2CE3C0] text-black font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                              COVER
                            </span>
                          )}

                          {/* Hover Controls */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity p-2">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => setCoverImage(img.url)}
                                className="px-2 py-1 rounded bg-[#2CE3C0] text-black font-semibold text-[10px] w-full cursor-pointer"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="px-2 py-1 rounded bg-red-500/80 text-white font-semibold text-[10px] w-full cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-white/20 bg-black/50 text-[#2CE3C0] focus:ring-[#2CE3C0]"
                />
                <label htmlFor="featured-check" className="text-neutral-300 cursor-pointer">
                  Feature this project on the homepage / discipline cover showcase
                </label>
              </div>

              {/* Submit Buttons */}
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
                      <span>Saved Successfully!</span>
                    </>
                  ) : (
                    <span>{editingProject ? "Update Project" : "Publish Project"}</span>
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
