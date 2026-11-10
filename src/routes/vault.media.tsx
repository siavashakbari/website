import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Play,
  Film,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  FolderTree,
} from "lucide-react";
import {
  getVaultMedia,
  saveVaultMedia,
  deleteVaultMedia,
  getVaultPages,
  getUsedMediaCodes,
  getAvailable4DigitCode,
  buildDynamicMediaCode,
  subscribeToVaultStore,
  type VaultMediaItem,
  type VaultPageItem,
} from "@/lib/vault-store";
import { PairedBoxesEditor, type KeyValuePair } from "@/components/vault/PairedBoxesEditor";
import { processMediaUpload, type SizedMediaResult } from "@/lib/media-sizing";
import { resolveInventoryImage } from "@/lib/inventory-assets";

export const Route = createFileRoute("/vault/media")({
  component: VaultMediaView,
});

const ITEMS_PER_PAGE = 24;

function VaultMediaView() {
  const [mediaList, setMediaList] = useState<VaultMediaItem[]>([]);
  const [pages, setPages] = useState<VaultPageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New media modal state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newSizedMedia, setNewSizedMedia] = useState<SizedMediaResult | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newField, setNewField] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newPairs, setNewPairs] = useState<KeyValuePair[]>([]);

  const refreshData = () => {
    setMediaList(getVaultMedia());
    setPages(getVaultPages());
  };

  useEffect(() => {
    refreshData();
    return subscribeToVaultStore(() => {
      refreshData();
    });
  }, []);

  // Pages hierarchy for cascading dropdowns
  // 1. Fields: pages with no parentRoute
  const fieldPages = useMemo(() => {
    return pages.filter((p) => !p.parentRoute);
  }, [pages]);

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle Show / Hide
  const handleToggleHide = (item: VaultMediaItem) => {
    const updated: VaultMediaItem = { ...item, isHidden: !item.isHidden };
    saveVaultMedia(updated);
  };

  // Delete media: frees uniqueCode
  const handleDeleteMedia = (item: VaultMediaItem) => {
    if (
      window.confirm(
        `Are you sure you want to delete media ${item.dynamicCode}? Its unique code (${item.uniqueCode}) will be freed up.`,
      )
    ) {
      deleteVaultMedia(item.id);
    }
  };

  // Update media item with auto dynamic code recalculation
  const handleUpdateMedia = (item: VaultMediaItem, updates: Partial<VaultMediaItem>) => {
    const nextField = updates.field ?? item.field;
    const nextCategory = updates.category ?? item.category;
    const nextProject = updates.project ?? item.project;

    // Build route: e.g. /photography/fashion-photography/sepidar
    const routeParts = [nextField, nextCategory, nextProject].filter(Boolean);
    const assignedRoute = `/${routeParts.join("/")}`;

    // Recalculate dynamic code: e.g. 1221-GRAPHIC-DESIGN-VISUAL-IDENTITY-AHURA-CCTV
    const dynamicCode = buildDynamicMediaCode(
      item.uniqueCode,
      nextField,
      nextCategory,
      nextProject,
    );

    const ext = item.imgSrc?.toLowerCase().endsWith(".png")
      ? ".PNG"
      : item.imgSrc?.toLowerCase().endsWith(".mp4")
      ? ".MP4"
      : ".JPG";
    const dynamicFileName = `${dynamicCode}${ext}`;

    let nextTitle = updates.title ?? item.title;
    if (
      !nextTitle ||
      nextTitle === `${item.dynamicCode}${ext}` ||
      nextTitle === item.dynamicCode ||
      nextTitle === item.project ||
      nextTitle.includes("—") ||
      nextTitle.toLowerCase().startsWith("media ") ||
      nextTitle.toLowerCase().startsWith("frame ")
    ) {
      nextTitle = dynamicFileName;
    }

    const updated: VaultMediaItem = {
      ...item,
      ...updates,
      field: nextField,
      category: nextCategory,
      project: nextProject,
      assignedRoute,
      dynamicCode,
      title: nextTitle,
    };

    saveVaultMedia(updated);
  };

  // Upload handler for Add Media
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const sized = await processMediaUpload(file);
      setNewSizedMedia(sized);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^.]+$/, ""));
      }
    } catch (err: any) {
      alert(`Error processing media upload: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  // Save New Media
  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizedMedia) {
      alert("Please upload a media file first.");
      return;
    }

    const usedCodes = getUsedMediaCodes();
    const uniqueCode = getAvailable4DigitCode(usedCodes);

    const field = newField || fieldPages[0]?.route.replace(/^\//, "") || "photography";
    const category = newCategory || "";
    const project = newProject || "";

    const routeParts = [field, category, project].filter(Boolean);
    const assignedRoute = `/${routeParts.join("/")}`;
    const dynamicCode = buildDynamicMediaCode(uniqueCode, field, category, project);

    const ext = newSizedMedia.isVideo ? ".MP4" : ".JPG";
    const dynamicTitle = newTitle.trim() || `${dynamicCode}${ext}`;

    const newMedia: VaultMediaItem = {
      id: `media-${uniqueCode}`,
      uniqueCode,
      dynamicCode,
      imgSrc: newSizedMedia.fullUrl,
      thumbSrc: newSizedMedia.thumbUrl,
      field,
      category,
      project,
      assignedRoute,
      title: dynamicTitle,
      year: new Date().getFullYear().toString(),
      isHidden: false,
      pairedBoxes: newPairs,
      isVideo: newSizedMedia.isVideo,
      createdAt: new Date().toISOString(),
    };

    saveVaultMedia(newMedia);
    setShowAddModal(false);
    // Reset form
    setNewSizedMedia(null);
    setNewTitle("");
    setNewField("");
    setNewCategory("");
    setNewProject("");
    setNewPairs([]);
  };

  // Filter & Search media
  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) => {
      // Visibility filter
      if (visibilityFilter === "visible" && m.isHidden) return false;
      if (visibilityFilter === "hidden" && !m.isHidden) return false;

      // Field filter
      if (fieldFilter !== "all") {
        const normField = m.field.toLowerCase();
        if (normField !== fieldFilter.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode =
          m.uniqueCode.includes(q) ||
          m.dynamicCode.toLowerCase().includes(q) ||
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.project && m.project.toLowerCase().includes(q)) ||
          (m.model && m.model.toLowerCase().includes(q)) ||
          (m.client && m.client.toLowerCase().includes(q));

        const matchesPairs = m.pairedBoxes?.some(
          (p) => p.key.toLowerCase().includes(q) || p.value.toLowerCase().includes(q),
        );

        return matchesCode || matchesPairs;
      }

      return true;
    });
  }, [mediaList, visibilityFilter, fieldFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE) || 1;
  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedia.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedia, currentPage]);

  const usedCodesCount = mediaList.length;
  const freeCodesCount = 9000 - usedCodesCount;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 text-[#2CE3C0] text-xs font-mono mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>MEDIA ASSETS VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Media Library ({mediaList.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            All scanned website photos and videos. Each media card carries a static 4-digit unique code
            and a dynamic route-bound code (e.g.{" "}
            <span className="font-mono text-[#2CE3C0]">5826-PHOTOGRAPHY-FASHION-SEPIDAR</span>). Sizing
            is automatically optimized upon upload.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right font-mono text-[11px] text-neutral-400 border-r border-white/10 pr-4">
            <span className="text-white font-bold">{freeCodesCount}</span>
            <span className="text-[10px] text-neutral-500">Free 4-Digit Codes</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (fieldPages.length > 0) {
                setNewField(fieldPages[0].route.replace(/^\//, ""));
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2CE3C0] text-black font-semibold text-xs transition-all hover:bg-[#2CE3C0]/90 shadow-[0_0_15px_rgba(44,227,192,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Media</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 flex items-center gap-3 bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by code (e.g. 5826), title, project, model..."
            className="bg-transparent border-none text-xs text-white placeholder:text-neutral-500 focus:outline-none w-full font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-neutral-500 hover:text-white font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Field Filter */}
        <div>
          <select
            value={fieldFilter}
            onChange={(e) => {
              setFieldFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
          >
            <option value="all">All Fields</option>
            {fieldPages.map((f) => (
              <option key={f.id} value={f.route.replace(/^\//, "")}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Visibility Filter */}
        <div>
          <select
            value={visibilityFilter}
            onChange={(e) => {
              setVisibilityFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Media Cards Grid */}
      {paginatedMedia.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0F0F0F]">
          <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white">No media items found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Try adjusting your search criteria or click &quot;Add Media&quot; above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMedia.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              pages={pages}
              fieldPages={fieldPages}
              onToggleHide={handleToggleHide}
              onUpdateMedia={handleUpdateMedia}
              onDeleteMedia={handleDeleteMedia}
              onCopyCode={handleCopyCode}
              isCopied={copiedCode === item.dynamicCode}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-xs font-mono text-neutral-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedia.length)} of{" "}
            {filteredMedia.length} items
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-white px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Add New Media Asset</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Upload image or video. Sizing is automatically optimized into high-res and fast
                  thumbnails.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-neutral-400 hover:text-white font-mono"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateMedia} className="space-y-4">
              {/* Media File Upload Area */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                  Upload Media File (Image or Video) *
                </label>
                <div className="border border-dashed border-white/20 hover:border-[#2CE3C0] rounded-xl p-5 text-center transition-colors bg-black/40">
                  {uploadingFile ? (
                    <div className="py-6 flex flex-col items-center gap-2 text-xs text-[#2CE3C0] font-mono">
                      <div className="w-6 h-6 border-2 border-[#2CE3C0] border-t-transparent animate-spin rounded-full" />
                      <span>Optimizing media dimensions & quality...</span>
                    </div>
                  ) : newSizedMedia ? (
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-black shrink-0 relative">
                        {newSizedMedia.isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <Film className="w-8 h-8 text-[#2CE3C0]" />
                          </div>
                        ) : (
                          <img
                            src={newSizedMedia.thumbUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-1 font-mono text-[11px]">
                        <span className="text-[#2CE3C0] font-semibold block">
                          Optimized Successfully!
                        </span>
                        <span className="text-neutral-400 block">
                          Dimensions: {newSizedMedia.width}x{newSizedMedia.height}px
                        </span>
                        <span className="text-neutral-400 block">
                          Full: {newSizedMedia.fullSizeKb} KB | Thumb: {newSizedMedia.thumbSizeKb} KB
                        </span>
                        <label className="text-xs text-[#2CE3C0] underline cursor-pointer inline-block pt-1">
                          Replace file
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                      <Upload className="w-8 h-8 text-neutral-500" />
                      <span className="text-xs text-neutral-300 font-medium">
                        Click to select image or video
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        JPEG, PNG, WebP or MP4 · Max long edge 2000px · Auto WebP thumbnail
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                  Title / Name
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sepidar Editorial Look 01"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                />
              </div>

              {/* Cascading Dropdowns: Field -> Category -> Project */}
              <div className="space-y-3 p-3.5 rounded-xl bg-black/40 border border-white/10">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300">
                  Project Assignment (Cascading Dropdowns)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Box 1: Field */}
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                      1. Field
                    </label>
                    <select
                      value={newField}
                      onChange={(e) => {
                        setNewField(e.target.value);
                        setNewCategory("");
                        setNewProject("");
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                    >
                      <option value="">Select Field...</option>
                      {fieldPages.map((f) => (
                        <option key={f.id} value={f.route.replace(/^\//, "")}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Box 2: Category (children of Field) */}
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                      2. Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        setNewCategory(e.target.value);
                        setNewProject("");
                      }}
                      disabled={!newField}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0] disabled:opacity-30"
                    >
                      <option value="">Select Category...</option>
                      {pages
                        .filter(
                          (p) =>
                            (p.parentRoute || "").toLowerCase().trim().replace(/\/+$/, "") ===
                            `/${newField}`.toLowerCase().replace(/\/+$/, ""),
                        )
                        .map((c) => (
                          <option key={c.id} value={c.route.split("/").pop()}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Box 3: Project (children of Category) */}
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                      3. Project
                    </label>
                    <select
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      disabled={!newCategory}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0] disabled:opacity-30"
                    >
                      <option value="">Select Project...</option>
                      {pages
                        .filter(
                          (p) =>
                            (p.parentRoute || "").toLowerCase().trim().replace(/\/+$/, "") ===
                            `/${newField}/${newCategory}`.toLowerCase().replace(/\/+$/, ""),
                        )
                        .map((proj) => (
                          <option key={proj.id} value={proj.route.split("/").pop()}>
                            {proj.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Paired Boxes */}
              <PairedBoxesEditor
                pairs={newPairs}
                onChange={(p) => setNewPairs(p)}
                title="Additional Paired Boxes"
                description="Metadata pairs for this media (Model, Year, Client). Click button to turn into JSON."
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSizedMedia}
                  className="px-5 py-2.5 rounded-xl bg-[#2CE3C0] text-black font-semibold text-xs hover:bg-[#2CE3C0]/90 disabled:opacity-40 shadow-[0_0_15px_rgba(44,227,192,0.3)] cursor-pointer"
                >
                  Save Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Individual Media Card Component
// -------------------------------------------------------------

interface MediaCardProps {
  item: VaultMediaItem;
  pages: VaultPageItem[];
  fieldPages: VaultPageItem[];
  onToggleHide: (item: VaultMediaItem) => void;
  onUpdateMedia: (item: VaultMediaItem, updates: Partial<VaultMediaItem>) => void;
  onDeleteMedia: (item: VaultMediaItem) => void;
  onCopyCode: (code: string) => void;
  isCopied: boolean;
}

function MediaCard({
  item,
  pages,
  fieldPages,
  onToggleHide,
  onUpdateMedia,
  onDeleteMedia,
  onCopyCode,
  isCopied,
}: MediaCardProps) {
  // Cascading options derived from Pages:
  // Categories under selected field
  const categoryOptions = useMemo(() => {
    if (!item.field) return [];
    const targetParent = `/${item.field}`.toLowerCase().replace(/\/+$/, "");
    return pages.filter(
      (p) => (p.parentRoute || "").toLowerCase().trim().replace(/\/+$/, "") === targetParent,
    );
  }, [pages, item.field]);

  // Projects under selected category
  const projectOptions = useMemo(() => {
    if (!item.field || !item.category) return [];
    const targetParent = `/${item.field}/${item.category}`.toLowerCase().replace(/\/+$/, "");
    return pages.filter(
      (p) => (p.parentRoute || "").toLowerCase().trim().replace(/\/+$/, "") === targetParent,
    );
  }, [pages, item.field, item.category]);

  const resolvedSrc = resolveInventoryImage(item.thumbSrc || item.imgSrc) || item.imgSrc;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-[#121212]/90 backdrop-blur-md overflow-hidden flex flex-col justify-between ${
        item.isHidden
          ? "border-amber-500/30 opacity-80"
          : "border-white/10 hover:border-white/20 shadow-xl"
      }`}
    >
      <div>
        {/* Card Header Strip: Unique Code, Dynamic Code, Copy, Show/Hide */}
        <div className="bg-[#181818] border-b border-white/5 px-4 py-3 flex items-center justify-between gap-2">
          {/* Static Unique Code (4-digit number) */}
          <span className="font-mono text-xs font-bold text-black bg-[#2CE3C0] px-2 py-0.5 rounded shadow-[0_0_8px_rgba(44,227,192,0.3)]">
            #{item.uniqueCode}
          </span>

          <div className="flex items-center gap-2">
            {/* Show / Hide Toggle Button */}
            <button
              type="button"
              onClick={() => onToggleHide(item)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
                item.isHidden
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-[#2CE3C0]/15 border-[#2CE3C0]/40 text-[#2CE3C0]"
              }`}
              title={item.isHidden ? "Hidden from dedicated route & parent gallery" : "Visible"}
            >
              {item.isHidden ? (
                <>
                  <EyeOff className="w-3 h-3 text-amber-300" />
                  <span>Hidden</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 text-[#2CE3C0]" />
                  <span>Visible</span>
                </>
              )}
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDeleteMedia(item)}
              className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Delete media and free unique code"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Code Strip with Copy */}
        <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between gap-2">
          <span
            className="font-mono text-[11px] text-[#2CE3C0] truncate select-all"
            title={item.dynamicCode}
          >
            {item.dynamicCode}
          </span>
          <button
            type="button"
            onClick={() => onCopyCode(item.dynamicCode)}
            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copy dynamic code"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-[#2CE3C0]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Media Preview Box */}
        <div className="relative aspect-[16/10] bg-black overflow-hidden flex items-center justify-center">
          {item.isVideo ? (
            <video
              src={item.imgSrc}
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          ) : (
            <img
              src={resolvedSrc}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}

          {item.isVideo && (
            <div className="pointer-events-none absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-[#2CE3C0]">
              <Play className="w-3.5 h-3.5 fill-[#2CE3C0]" />
            </div>
          )}

          {/* Dedicated Media Route View link */}
          <a
            href={`${item.assignedRoute}/${item.dynamicCode}`}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 hover:bg-black text-[10px] font-mono text-neutral-300 hover:text-white flex items-center gap-1 border border-white/10 backdrop-blur-sm transition-colors"
          >
            <span>Live Detail</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Card Body: 3 Cascading Dropdown Boxes */}
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Title / Name
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdateMedia(item, { title: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
            />
          </div>

          {/* 3 Cascading Project Assigning Dropdowns */}
          <div className="space-y-2 p-3 rounded-xl bg-black/50 border border-white/10">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Project Assignment Dropdowns
            </span>

            <div className="grid grid-cols-3 gap-2">
              {/* Dropdown 1: Field */}
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 mb-0.5">Field</label>
                <select
                  value={item.field}
                  onChange={(e) => {
                    const nextField = e.target.value;
                    onUpdateMedia(item, {
                      field: nextField,
                      category: "",
                      project: "",
                    });
                  }}
                  className="w-full bg-black/80 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
                >
                  {fieldPages.map((f) => (
                    <option key={f.id} value={f.route.replace(/^\//, "")}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Category (swaps based on Field) */}
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 mb-0.5">Category</label>
                <select
                  value={item.category}
                  onChange={(e) => {
                    const nextCat = e.target.value;
                    onUpdateMedia(item, {
                      category: nextCat,
                      project: "",
                    });
                  }}
                  className="w-full bg-black/80 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
                >
                  <option value="">None / Top</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.route.split("/").pop()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 3: Project (swaps based on Category) */}
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 mb-0.5">Project</label>
                <select
                  value={item.project}
                  onChange={(e) => {
                    onUpdateMedia(item, { project: e.target.value });
                  }}
                  className="w-full bg-black/80 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
                >
                  <option value="">None / General</option>
                  {projectOptions.map((proj) => (
                    <option key={proj.id} value={proj.route.split("/").pop()}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-1 text-[10px] font-mono text-neutral-500 truncate">
              Route: <span className="text-neutral-400">{item.assignedRoute}</span>
            </div>
          </div>

          {/* Paired Boxes with JSON Switch */}
          <PairedBoxesEditor
            pairs={item.pairedBoxes || []}
            onChange={(pairs) => onUpdateMedia(item, { pairedBoxes: pairs })}
            title="Metadata Paired Boxes"
            description="e.g. Model : Sara | Year : 2024"
          />
        </div>
      </div>
    </div>
  );
}
