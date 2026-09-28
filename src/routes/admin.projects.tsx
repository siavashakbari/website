import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  ExternalLink,
  Sparkles,
  Info,
  Copy,
  Scissors,
  Download,
  Layers,
  Database
} from "lucide-react";
import { 
  getStudioProjects, 
  saveStudioProject, 
  deleteStudioProject,
  getMergedPhotoInventory,
  savePhotoInventoryItem,
  saveBulkPhotoInventory
} from "@/lib/studio-store";
import type { PhotoInventoryItem } from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";
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

const SUBDISCIPLINE_QUICK_TAGS = [
  "Furniture",
  "Plants & Botanicals",
  "Ceramics & Tableware",
  "Lighting & Lamps",
  "Textiles & Fabric",
  "Silhouette & Posture",
  "Lookbook",
  "Campaign",
  "Packaging",
  "Wordmark",
  "Identity System",
  "Editorial & Book",
  "Posters & Typography",
  "Streetwear",
  "Brand Film",
  "Motion Sequence",
];

// Client-side image optimizer (conforms to portfolio standard: max 2000px edge, ~82% JPEG quality)
async function optimizeImageFile(file: File): Promise<{ url: string; width: number; height: number; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const MAX_EDGE = 2000;
        if (width > MAX_EDGE || height > MAX_EDGE) {
          if (width >= height) {
            height = Math.round((height * MAX_EDGE) / width);
            width = MAX_EDGE;
          } else {
            width = Math.round((width * MAX_EDGE) / height);
            height = MAX_EDGE;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context error"));
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);
        resolve({ url: dataUrl, width, height, sizeKb });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AdminProjectsView() {
  const [activeTab, setActiveTab] = useState<"projects" | "inventory">("inventory");
  const [projects, setProjects] = useState<StudioProjectItem[]>(() => getStudioProjects());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<StudioProjectItem | null>(null);

  // Photo Inventory States (matches PHOTO_INVENTORY_VIEWER.html)
  const [inventory, setInventory] = useState<PhotoInventoryItem[]>(() => getMergedPhotoInventory());
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryDisciplineFilter, setInventoryDisciplineFilter] = useState("");
  const [inventoryProjectFilter, setInventoryProjectFilter] = useState("");
  const [inventorySaveStatus, setInventorySaveStatus] = useState("✓ Auto-saved to live storage");

  // Form states
  const [title, setTitle] = useState("");
  const [titleFa, setTitleFa] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState("2026");
  const [discipline, setDiscipline] = useState("fashion-photography");
  const [category, setCategory] = useState("Fashion Photography");
  const [subDiscipline, setSubDiscipline] = useState("");
  const [models, setModels] = useState("");
  const [makeupArtist, setMakeupArtist] = useState("");
  const [assistant, setAssistant] = useState("");
  const [stylist, setStylist] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionFa, setDescriptionFa] = useState("");
  const [caption, setCaption] = useState(""); // Dedicated Story / Data / Long text box
  const [seoKeywords, setSeoKeywords] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState<{ id: string; url: string; alt?: string; caption?: string }[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copiedFfmpeg, setCopiedFfmpeg] = useState(false);

  // Video Formula calculator state
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoTargetMb, setVideoTargetMb] = useState<number | null>(null);

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
    setCategory("Fashion Photography");
    setSubDiscipline("");
    setModels("");
    setMakeupArtist("");
    setAssistant("");
    setStylist("");
    setLocation("");
    setDescription("");
    setDescriptionFa("");
    setCaption("");
    setSeoKeywords("");
    setVideoUrl("");
    setCoverImage("");
    setImages([]);
    setIsFeatured(false);
    setVideoDuration(null);
    setVideoTargetMb(null);
    setIsEditorOpen(true);
  };

  const openEditProjectForm = (proj: StudioProjectItem) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setTitleFa(proj.titleFa || "");
    setClient(proj.client || "");
    setYear(String(proj.year));
    setDiscipline(proj.discipline);
    setCategory(proj.category || proj.discipline);
    setSubDiscipline(proj.subDiscipline || "");
    setModels(proj.models || "");
    setMakeupArtist(proj.makeupArtist || "");
    setAssistant(proj.assistant || "");
    setStylist(proj.stylist || "");
    setLocation(proj.location || "");
    setDescription(proj.description || "");
    setDescriptionFa(proj.descriptionFa || "");
    setCaption(proj.caption || "");
    setSeoKeywords(proj.seoKeywords || "");
    setVideoUrl(proj.videoUrl || "");
    setCoverImage(proj.coverImage);
    setImages(proj.images || []);
    setIsFeatured(Boolean(proj.featured));

    // If video, inspect duration if possible
    if (proj.videoUrl || proj.coverImage?.endsWith(".mp4")) {
      const v = document.createElement("video");
      v.src = proj.videoUrl || proj.coverImage;
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const sec = v.duration || 30;
        setVideoDuration(sec);
        setVideoTargetMb(Math.round(((sec / 30) * 12) * 10) / 10);
      };
    } else {
      setVideoDuration(null);
      setVideoTargetMb(null);
    }

    setIsEditorOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsOptimizing(true);
    const newItems: { id: string; url: string; alt?: string }[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        try {
          // Automatic 2000px max edge & JPEG 82% compression
          const opt = await optimizeImageFile(file);
          newItems.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: opt.url,
            alt: file.name.replace(/\.[^/.]+$/, ""),
          });
        } catch {
          const reader = new FileReader();
          reader.onload = (event) => {
            const url = event.target?.result as string;
            if (url) {
              setImages((prev) => [
                ...prev,
                {
                  id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  url,
                  alt: file.name.replace(/\.[^/.]+$/, ""),
                },
              ]);
            }
          };
          reader.readAsDataURL(file);
        }
      } else if (file.type.startsWith("video/")) {
        // Video file uploaded
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          if (!url) return;

          const tempVideo = document.createElement("video");
          tempVideo.src = url;
          tempVideo.preload = "metadata";
          tempVideo.onloadedmetadata = () => {
            const dur = tempVideo.duration || 30;
            setVideoDuration(dur);
            // Formula: 12MB per 30s
            setVideoTargetMb(Math.round(((dur / 30) * 12) * 10) / 10);
          };

          setImages((prev) => [
            ...prev,
            {
              id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url,
              alt: file.name,
            },
          ]);
          setVideoUrl(url);
          setCoverImage((current) => current || url);
        };
        reader.readAsDataURL(file);
      }
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      setCoverImage((current) => current || newItems[0].url);
    }
    setIsOptimizing(false);
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
      client: client.trim() || undefined,
      year: year.trim() || "2026",
      discipline,
      category: category.trim() || selectedDiscObj?.label || discipline,
      subDiscipline: subDiscipline.trim() || undefined,
      models: models.trim() || undefined,
      makeupArtist: makeupArtist.trim() || undefined,
      assistant: assistant.trim() || undefined,
      stylist: stylist.trim() || undefined,
      location: location.trim() || undefined,
      coverImage: coverImage || images[0]?.url || "",
      description: description.trim(),
      descriptionFa: descriptionFa.trim() || undefined,
      caption: caption.trim() || undefined, // Dedicated story / data / long text box
      seoKeywords: seoKeywords.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      videoSpecs: videoDuration
        ? {
            durationSec: Math.round(videoDuration),
            targetSizeMb: videoTargetMb || Math.round((videoDuration / 30) * 12),
            resolution: "1080p",
          }
        : undefined,
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
    }, 900);
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
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.subDiscipline && p.subDiscipline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.models && p.models.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiscipline =
      selectedDisciplineFilter === "all" ||
      p.discipline === selectedDisciplineFilter ||
      (selectedDisciplineFilter === "graphic-design" &&
        (p.discipline === "visual-identity" || p.discipline === "book-covers" || p.discipline === "posters" || p.discipline === "graphic-design")) ||
      (selectedDisciplineFilter === "photography" &&
        (p.discipline === "fashion-photography" || p.discipline === "food-photography" || p.discipline === "portrait-photography" || p.discipline === "product-photography" || p.discipline === "photography"));

    return matchesSearch && matchesDiscipline;
  });

  const ffmpegCommand = `ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -b:v 3200k -maxrate 3500k -bufsize 6400k -c:a aac -b:a 128k output_1080p.mp4`;

  // Photo Inventory handlers
  const handleUpdateInventoryField = (code: string, field: keyof PhotoInventoryItem, value: string) => {
    setInventory((prev) => {
      const next = prev.map((item) => {
        if (item.code === code) {
          const updated = { ...item, [field]: value };
          savePhotoInventoryItem({ code, [field]: value });
          return updated;
        }
        return item;
      });
      return next;
    });
    setInventorySaveStatus("✓ Auto-saved to live storage");
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inventory, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `siavash_photo_inventory_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ["code", "project", "discipline", "subdiscipline", "model", "client", "makeupArtist", "assistant", "date", "keywords", "imgSrc"];
    const rows = inventory.map((i) => [
      `"${i.code}"`,
      `"${(i.project || "").replace(/"/g, '""')}"`,
      `"${(i.discipline || "").replace(/"/g, '""')}"`,
      `"${(i.subdiscipline || "").replace(/"/g, '""')}"`,
      `"${(i.model || "").replace(/"/g, '""')}"`,
      `"${(i.client || "").replace(/"/g, '""')}"`,
      `"${(i.makeupArtist || "").replace(/"/g, '""')}"`,
      `"${(i.assistant || "").replace(/"/g, '""')}"`,
      `"${(i.date || "").replace(/"/g, '""')}"`,
      `"${(i.keywords || "").replace(/"/g, '""')}"`,
      `"${(i.imgSrc || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `siavash_portfolio_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleResetToSaved = () => {
    setInventory(getMergedPhotoInventory());
    setInventorySaveStatus("✓ Live storage reloaded");
  };

  // Filter inventory items
  const filteredInventory = inventory.filter((item) => {
    const q = inventorySearch.toLowerCase();
    const matchesSearch =
      !q ||
      item.code.toLowerCase().includes(q) ||
      (item.project && item.project.toLowerCase().includes(q)) ||
      (item.subdiscipline && item.subdiscipline.toLowerCase().includes(q)) ||
      (item.model && item.model.toLowerCase().includes(q)) ||
      (item.client && item.client.toLowerCase().includes(q)) ||
      (item.keywords && item.keywords.toLowerCase().includes(q));

    const matchesDiscipline = !inventoryDisciplineFilter || item.discipline === inventoryDisciplineFilter;
    const matchesProject = !inventoryProjectFilter || item.project === inventoryProjectFilter;

    return matchesSearch && matchesDiscipline && matchesProject;
  });

  // Unique projects in inventory for dropdown
  const uniqueInventoryProjects = Array.from(new Set(inventory.map((i) => i.project).filter(Boolean))).sort();

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Portfolio Studio & Media Manager</span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full">
              LIVE ONLINE
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
            Manage your visual assets, photography database, and showcase projects. Every change updates immediately and syncs with your live website and dedicated photo pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === "inventory" ? (
            <>
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-black text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleResetToSaved}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
              >
                <span>Reload</span>
              </button>
            </>
          ) : (
            <button
              onClick={openNewProjectForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-semibold shadow-[0_0_15px_rgba(44,227,192,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Protocol Information Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#2CE3C0]/10 text-[#2CE3C0]">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">Photo Sizing Protocol: Standardized</div>
            <div className="text-[11px] text-neutral-400">
              Uploaded photos auto-scale to 2000px max edge with 82% quality (~250-400KB), matching your existing gallery assets.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#FFD166]/10 text-[#FFD166]">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">Video 1080p Engine: 12 MB / 30s</div>
            <div className="text-[11px] text-neutral-400">
              Target Bitrate: 3.2 Mbps at 1080p. Formula: 30s = 12 MB · 60s = 24 MB · 3 mins = 72 MB.
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio View Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "inventory"
              ? "bg-[#2CE3C0] text-black shadow-[0_0_12px_rgba(44,227,192,0.3)]"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Photo & Visual Asset Inventory ({inventory.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "projects"
              ? "bg-[#2CE3C0] text-black shadow-[0_0_12px_rgba(44,227,192,0.3)]"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Case Study Projects ({projects.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PHOTO & VISUAL ASSET INVENTORY (MATCHES PHOTO_INVENTORY_VIEWER.HTML) */}
      {/* =================================================================== */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141414] p-3.5 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center gap-4 text-neutral-400">
              <div>Total Assets: <strong className="text-[#2CE3C0] font-semibold">{inventory.length} items</strong></div>
              <div>· Showing: <strong className="text-white font-semibold">{filteredInventory.length}</strong></div>
            </div>
            <div className="bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-3 py-1 rounded-full text-[11px] font-mono font-medium">
              {inventorySaveStatus}
            </div>
          </div>

          {/* Inventory Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by code, model, project, sub-discipline, keywords..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#2CE3C0]"
              />
            </div>

            <select
              value={inventoryDisciplineFilter}
              onChange={(e) => setInventoryDisciplineFilter(e.target.value)}
              className="bg-[#181818] border border-white/10 text-neutral-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#2CE3C0] cursor-pointer"
            >
              <option value="">All Disciplines ({inventory.length})</option>
              <option value="Fashion Photography">Fashion Photography (51)</option>
              <option value="Food Photography">Food Photography (42)</option>
              <option value="Portrait Photography">Portrait Photography (26)</option>
              <option value="Product Photography">Product Photography (92)</option>
              <option value="Visual Identity">Visual Identity (83)</option>
              <option value="Book Covers">Book Covers (12)</option>
              <option value="Posters">Posters (8)</option>
            </select>

            <select
              value={inventoryProjectFilter}
              onChange={(e) => setInventoryProjectFilter(e.target.value)}
              className="bg-[#181818] border border-white/10 text-neutral-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#2CE3C0] cursor-pointer"
            >
              <option value="">All Projects</option>
              {uniqueInventoryProjects.map((proj) => (
                <option key={proj} value={proj}>
                  {proj} ({inventory.filter((i) => i.project === proj).length})
                </option>
              ))}
            </select>
          </div>

          {/* Cards List (Matching PHOTO_INVENTORY_VIEWER.html Layout) */}
          {filteredInventory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
              <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">No visual assets found matching your search filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInventory.map((item) => {
                const resolvedUrl = resolveInventoryImage(item.imgSrc);
                // Map discipline to slug for dedicated page link
                const discSlug = item.discipline === "Fashion Photography"
                  ? "fashion-photography"
                  : item.discipline === "Food Photography"
                  ? "food-photography"
                  : item.discipline === "Portrait Photography"
                  ? "portrait-photography"
                  : item.discipline === "Product Photography"
                  ? "product-photography"
                  : item.discipline === "Visual Identity"
                  ? "visual-identity"
                  : "graphic-design";

                const isPhotoDiscipline = item.discipline.toLowerCase().includes("photography");

                return (
                  <div
                    key={item.code}
                    className="flex flex-col md:flex-row gap-5 p-4 rounded-xl bg-[#141414] border border-white/10 hover:border-[#2CE3C0]/40 transition-colors"
                  >
                    {/* 200px x 200px Thumbnail */}
                    <div className="w-[200px] h-[200px] flex-shrink-0 rounded-lg overflow-hidden bg-black border border-white/10 flex items-center justify-center relative group mx-auto md:mx-0">
                      <img
                        src={resolvedUrl}
                        alt={item.code}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {isPhotoDiscipline && (
                        <Link
                          to="/$discipline/$photoId"
                          params={{ discipline: discSlug, photoId: item.code }}
                          target="_blank"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-[#2CE3C0] font-semibold backdrop-blur-xs transition-opacity"
                        >
                          <span>Dedicated Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    {/* Metadata Form Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {/* Code & Project Badge */}
                      <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#2CE3C0]/15 text-[#2CE3C0] font-mono font-bold text-xs">
                            {item.code}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#FFD166]/15 text-[#FFD166] text-xs font-semibold">
                            {item.project}
                          </span>
                          <span className="text-neutral-500 text-[11px]">
                            {item.discipline}
                          </span>
                        </div>
                        {isPhotoDiscipline && (
                          <Link
                            to="/$discipline/$photoId"
                            params={{ discipline: discSlug, photoId: item.code }}
                            target="_blank"
                            className="text-[11px] text-neutral-400 hover:text-[#2CE3C0] flex items-center gap-1 transition-colors"
                          >
                            <span>/{discSlug}/{item.code}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {/* Sub-Discipline / Specialty */}
                      <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-[#FFD166] uppercase tracking-wider flex items-center justify-between">
                          <span>Sub-Discipline / Specialty</span>
                          <span className="text-[10px] text-neutral-500 font-normal">Click quick tag below or type custom</span>
                        </label>
                        <input
                          type="text"
                          value={item.subdiscipline || ""}
                          onChange={(e) => handleUpdateInventoryField(item.code, "subdiscipline", e.target.value)}
                          placeholder="e.g. Textiles & Fabric, Silhouette & Posture, Lookbook, Furniture..."
                          className="w-full bg-[#1C1C1C] border border-[#FFD166]/40 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#FFD166]"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {SUBDISCIPLINE_QUICK_TAGS.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleUpdateInventoryField(item.code, "subdiscipline", tag)}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#222] hover:bg-[#FFD166] hover:text-black text-neutral-400 border border-white/5 transition-colors cursor-pointer"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Model(s) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
                          Model(s)
                        </label>
                        <input
                          type="text"
                          value={item.model || ""}
                          onChange={(e) => handleUpdateInventoryField(item.code, "model", e.target.value)}
                          placeholder="Model names"
                          className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>

                      {/* Client / Brand */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
                          Client / Brand
                        </label>
                        <input
                          type="text"
                          value={item.client || ""}
                          onChange={(e) => handleUpdateInventoryField(item.code, "client", e.target.value)}
                          placeholder="Client or brand"
                          className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>

                      {/* Makeup Artist (MUA) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
                          Makeup Artist (MUA)
                        </label>
                        <input
                          type="text"
                          value={item.makeupArtist || ""}
                          onChange={(e) => handleUpdateInventoryField(item.code, "makeupArtist", e.target.value)}
                          placeholder="MUA"
                          className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>

                      {/* Assistant */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
                          Assistant
                        </label>
                        <input
                          type="text"
                          value={item.assistant || ""}
                          onChange={(e) => handleUpdateInventoryField(item.code, "assistant", e.target.value)}
                          placeholder="Photography assistant"
                          className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>

                      {/* Date / Year */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
                          Date / Year
                        </label>
                        <input
                          type="text"
                          value={item.date || ""}
                          onChange={(e) => handleUpdateInventoryField(item.code, "date", e.target.value)}
                          placeholder="e.g. 2024"
                          className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>

                      {/* SEO Keywords */}
                      <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
                          Keywords (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={item.keywords || ""}
                          onChange={(e) => handleUpdateInventoryField(item.code, "keywords", e.target.value)}
                          placeholder="Keywords for SEO and search"
                          className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: CASE STUDY PROJECTS                                         */}
      {/* =================================================================== */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-[#121212] border border-white/10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search projects by title, client, model, or sub-discipline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
              />
            </div>

            {/* Discipline Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
              <button
                onClick={() => setSelectedDisciplineFilter("all")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDisciplineFilter === "all"
                    ? "bg-[#2CE3C0] text-black font-semibold"
                    : "text-neutral-400 hover:text-white bg-white/5"
                }`}
              >
                All ({projects.length})
              </button>
              {DISCIPLINE_OPTIONS.map((d) => {
                const count = projects.filter((p) => {
                  if (p.discipline === d.slug) return true;
                  if (d.slug === "graphic-design") {
                    return (
                      p.discipline === "visual-identity" ||
                      p.discipline === "book-covers" ||
                      p.discipline === "posters" ||
                      p.discipline === "graphic-design"
                    );
                  }
                  if (d.slug === "photography") {
                    return (
                      p.discipline === "fashion-photography" ||
                      p.discipline === "food-photography" ||
                      p.discipline === "portrait-photography" ||
                      p.discipline === "product-photography" ||
                      p.discipline === "photography"
                    );
                  }
                  return false;
                }).length;
                return (
                  <button
                    key={d.slug}
                    onClick={() => setSelectedDisciplineFilter(d.slug)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
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
              <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">No projects found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const isVideo = project.coverImage?.endsWith(".mp4") || project.discipline === "video";
                return (
                  <div
                    key={project.id}
                    className="group rounded-2xl bg-[#141414] border border-white/10 hover:border-[#2CE3C0]/40 overflow-hidden flex flex-col transition-all duration-200"
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-[16/10] bg-black overflow-hidden flex items-center justify-center">
                      {isVideo ? (
                        <video
                          src={project.coverImage || project.videoUrl}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md text-[#2CE3C0] border border-white/15">
                          {project.discipline}
                        </span>
                        {project.subDiscipline && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/80 backdrop-blur-md text-[#FFD166] border border-[#FFD166]/30">
                            {project.subDiscipline}
                          </span>
                        )}
                      </div>

                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/80 text-neutral-400 border border-white/10">
                        {project.year}
                      </span>
                    </div>

                    {/* Details Box */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#2CE3C0] transition-colors">
                          {project.title}
                        </h3>
                        {project.titleFa && (
                          <div className="text-xs text-neutral-400 font-normal dir-rtl text-right">
                            {project.titleFa}
                          </div>
                        )}

                        <div className="text-[11px] text-neutral-500 flex items-center gap-2 pt-1 flex-wrap">
                          {project.client && <span>Client: <strong className="text-neutral-300">{project.client}</strong></span>}
                          {project.models && <span>· Model: <strong className="text-neutral-300">{project.models}</strong></span>}
                          <span>· {project.images?.length || 1} media assets</span>
                        </div>

                        {project.caption ? (
                          <p className="text-xs text-neutral-400 line-clamp-2 pt-1.5 leading-relaxed font-sans italic">
                            "{project.caption}"
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-400 line-clamp-2 pt-1 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <Link
                          to="/projects/$projectId"
                          params={{ projectId: project.id }}
                          target="_blank"
                          className="text-xs text-neutral-400 hover:text-[#2CE3C0] flex items-center gap-1 transition-colors"
                        >
                          <span>View Live Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-1.5">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* BOXED EDITING & CREATION MODAL (Matching HTML Inventory Studio)    */}
      {/* =================================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{editingProject ? `Edit: ${editingProject.title}` : "Create New Portfolio Project"}</span>
                  <span className="text-[10px] font-mono bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full uppercase">
                    Boxed Metadata Studio
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Full control over credits, sub-disciplines, storytelling captions, and 1080p video specifications.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* BOX 1: CORE IDENTIFICATION & DISCIPLINE TARGET */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                    Box 1 · Core Identity & Destination
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">WHERE WILL THIS APPEAR</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Target Discipline Gallery *
                    </label>
                    <select
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                    >
                      {DISCIPLINE_OPTIONS.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.label} (/{d.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Category Tag (e.g. Visual Identity Proposal, Editorial)
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Fashion Photography / Visual Identity"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-neutral-300 font-medium mb-1">
                      Project Title (English) *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Atlasi Fashion Series"
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      عنوان پروژه (فارسی)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={titleFa}
                      onChange={(e) => setTitleFa(e.target.value)}
                      placeholder="مثلاً مجموعه مد اطلسی"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>
                </div>
              </div>

              {/* BOX 2: SUB-DISCIPLINE & SPECIFIC SPECIALTY */}
              <div className="p-4 rounded-xl bg-black/40 border border-[#FFD166]/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD166] font-bold">
                    Box 2 · Sub-Discipline & Specific Specialty
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">HIGH-RANK ENTITY SEO</span>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Sub-Discipline / Specialty (e.g. Furniture, Plants, Ceramics, Packaging, Lookbook)
                  </label>
                  <input
                    type="text"
                    value={subDiscipline}
                    onChange={(e) => setSubDiscipline(e.target.value)}
                    placeholder="e.g. Furniture Photography, Plants & Botanicals, Packaging..."
                    className="w-full bg-black/50 border border-[#FFD166]/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FFD166]"
                  />
                </div>

                {/* Quick Tag Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 self-center mr-1 font-mono">Quick tags:</span>
                  {SUBDISCIPLINE_QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSubDiscipline(tag)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        subDiscipline === tag
                          ? "bg-[#FFD166] text-black border-[#FFD166] font-bold"
                          : "bg-white/5 text-neutral-300 border-white/10 hover:border-[#FFD166]/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOX 3: CREDITS & CREATIVE TEAM */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                    Box 3 · Credits & Production Team
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">ONLY NON-EMPTY FIELDS WILL DISPLAY</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Client / Brand</label>
                    <input
                      type="text"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="e.g. Atlasi Atelier"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Model(s) / Subject</label>
                    <input
                      type="text"
                      value={models}
                      onChange={(e) => setModels(e.target.value)}
                      placeholder="e.g. Niloufar Rostami"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Makeup Artist (MUA)</label>
                    <input
                      type="text"
                      value={makeupArtist}
                      onChange={(e) => setMakeupArtist(e.target.value)}
                      placeholder="MUA Name"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Assistant (Photo / Design)</label>
                    <input
                      type="text"
                      value={assistant}
                      onChange={(e) => setAssistant(e.target.value)}
                      placeholder="Assistant Name"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Art Direction / Stylist</label>
                    <input
                      type="text"
                      value={stylist}
                      onChange={(e) => setStylist(e.target.value)}
                      placeholder="Stylist Name"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Location / Setting</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Esfahan, Iran"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Year of Production</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2026 / 1405"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">SEO Entity Tags</label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="Keywords, Model name, Camera..."
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* BOX 4: NARRATIVES & DEDICATED CAPTION / STORY BOX */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                    Box 4 · Narratives & Dedicated Story Caption
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">EDITORIAL STORYTELLING</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">
                      Short Overview (English)
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Executive summary of the project..."
                      className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">
                      خلاصه کوتاه (فارسی)
                    </label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={descriptionFa}
                      onChange={(e) => setDescriptionFa(e.target.value)}
                      placeholder="خلاصه پروژه به زبان فارسی..."
                      className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* THE DEDICATED CAPTION BOX AS EXPLICITLY REQUESTED */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono uppercase tracking-wider text-[#2CE3C0] font-bold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dedicated Project Caption Box (Story, Data, or Long-form Narrative)</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {caption.length} characters · {caption.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Fill your detailed story, curatorial notes, technical lighting logs, or client case study data here. If left empty, it will not appear on the project page."
                    className="w-full bg-neutral-900 border border-[#2CE3C0]/40 rounded-xl px-4 py-3 text-white leading-relaxed focus:outline-none focus:border-[#2CE3C0] font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    * If this box is left empty, the story section will automatically be omitted from your public project page.
                  </p>
                </div>
              </div>

              {/* BOX 5: MEDIA ASSETS & VIDEO 1080P ENGINE */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                    Box 5 · Media Assets & 1080p Video Protocol
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">AUTO-RESIZING & FORMULA VERIFICATION</span>
                </div>

                {/* Video URL or Formula specs */}
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#FFD166]" />
                      <span className="font-semibold text-white">Video 1080p Engine (Formula: 12 MB per 30s)</span>
                    </div>
                    {videoDuration && (
                      <span className="text-[10px] font-mono bg-[#FFD166]/15 text-[#FFD166] px-2 py-0.5 rounded-full font-bold">
                        {Math.round(videoDuration)}s · Target: ~{videoTargetMb} MB
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Direct Video URL or Stream (.mp4)</label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://.../video.mp4"
                        className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                      />
                    </div>

                    <div className="text-[11px] text-neutral-400 flex flex-col justify-center">
                      <span>• Target Resolution: <strong>1080p (1920×1080 / 1080×1920)</strong></span>
                      <span>• Target Bitrate: <strong>3.2 Mbps (3200 kbps)</strong></span>
                    </div>
                  </div>

                  {/* Copyable FFmpeg recipe */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500 font-mono">FFmpeg Transcode Recipe:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(ffmpegCommand);
                        setCopiedFfmpeg(true);
                        setTimeout(() => setCopiedFfmpeg(false), 1500);
                      }}
                      className="text-[#2CE3C0] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copiedFfmpeg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFfmpeg ? "Command Copied!" : "Copy 1080p FFmpeg Command"}</span>
                    </button>
                  </div>
                </div>

                {/* Dropzone with photo auto-resizer */}
                <label className="border-2 border-dashed border-white/20 hover:border-[#2CE3C0] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/[0.02]">
                  <Upload className="w-7 h-7 text-[#2CE3C0]" />
                  <div className="text-center">
                    <span className="font-semibold text-white">Click to upload photos or videos</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Photos auto-compress to 2000px max edge. Videos inspect for 1080p formula compliance.
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/mp4"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {isOptimizing && (
                  <div className="p-2.5 rounded-lg bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 text-[#2CE3C0] text-center text-xs animate-pulse">
                    ⚡ Auto-optimizing photo sizes to portfolio standard...
                  </div>
                )}

                {/* Uploaded Gallery Thumbnails */}
                {images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span>Uploaded Assets ({images.length}):</span>
                      <span className="text-[10px] text-neutral-500">Click "Set Cover" on your favorite image</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {images.map((img) => {
                        const isCover = coverImage === img.url;
                        const isVid = img.url.startsWith("data:video") || img.url.endsWith(".mp4");
                        return (
                          <div
                            key={img.id}
                            className={`relative aspect-square rounded-xl overflow-hidden border ${
                              isCover ? "border-[#2CE3C0] ring-2 ring-[#2CE3C0]/40" : "border-white/10"
                            } group bg-black`}
                          >
                            {isVid ? (
                              <video src={img.url} muted className="w-full h-full object-cover" />
                            ) : (
                              <img src={img.url} alt={img.alt || "Asset"} className="w-full h-full object-cover" />
                            )}

                            {isCover && (
                              <span className="absolute top-1.5 left-1.5 bg-[#2CE3C0] text-black font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                                COVER
                              </span>
                            )}

                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity p-2">
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
                  </div>
                )}
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-white/20 bg-black/50 text-[#2CE3C0] focus:ring-[#2CE3C0] cursor-pointer"
                />
                <label htmlFor="featured-check" className="text-neutral-300 cursor-pointer">
                  Feature this project prominently on discipline cover showcases
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-[#121212] py-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(44,227,192,0.3)]"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Project Saved!</span>
                    </>
                  ) : (
                    <span>{editingProject ? "Update & Sync Project" : "Publish Project"}</span>
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
