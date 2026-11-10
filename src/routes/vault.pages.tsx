import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  FolderTree,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Check,
  Search,
  Sparkles,
  Layout,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import {
  FLAT_FIELDS,
  getVaultPages,
  saveVaultPage,
  deleteVaultPage,
  getVaultMedia,
  subscribeToVaultStore,
  type VaultPageItem,
} from "@/lib/vault-store";
import { UI_TYPE_LIST, type UITypeCode } from "@/components/ui-types";
import { PairedBoxesEditor, type KeyValuePair } from "@/components/vault/PairedBoxesEditor";
import { processMediaUpload } from "@/lib/media-sizing";
import { putMediaBlob, resolveVideoPoster, useResolvedMediaSrc } from "@/lib/local-media-db";
import { normalizeProjectSlug } from "@/lib/taxonomy";

function isVideoAssetUrl(url?: string): boolean {
  return Boolean(url && /\.(mp4|webm|mov)(\?|#|$)|^data:video\//i.test(url));
}

export const Route = createFileRoute("/vault/pages")({
  component: VaultPagesView,
});

function VaultPagesView() {
  const [pages, setPages] = useState<VaultPageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [mediaPickerPageId, setMediaPickerPageId] = useState<string | null>(null);
  const [pendingCoverPatches, setPendingCoverPatches] = useState<
    Record<string, { url: string; nonce: number }>
  >({});

  // Top-to-bottom hierarchical creation form state
  const [createTarget, setCreateTarget] = useState<"project" | "category" | "discipline">("project");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("/photography");
  const [customDisciplineName, setCustomDisciplineName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("/photography/fashion-photography");
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const [pageTitle, setPageTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [newUiType, setNewUiType] = useState<UITypeCode>("UI01");
  const [newDescEn, setNewDescEn] = useState("");
  const [newDescFa, setNewDescFa] = useState("");
  const [newCover, setNewCover] = useState("");
  const [newPairs, setNewPairs] = useState<KeyValuePair[]>([
    { key: "Client", value: "" },
    { key: "Year", value: "2026" },
  ]);

  const refreshPages = () => {
    setPages(getVaultPages());
  };

  useEffect(() => {
    refreshPages();
    return subscribeToVaultStore(() => {
      refreshPages();
    });
  }, []);

  // Available root disciplines: pages with !parentRoute or standard roots
  const availableDisciplines = useMemo(() => {
    const defaultRoots = [
      { route: "/photography", name: "Photography" },
      { route: "/graphic-design", name: "Graphic Design" },
      { route: "/product-design", name: "Product Design" },
      { route: "/video", name: "Video" },
    ];
    const customRoots = pages
      .filter((p) => !p.parentRoute && !defaultRoots.some((dr) => dr.route === p.route))
      .map((p) => ({ route: p.route, name: p.name }));
    return [...defaultRoots, ...customRoots];
  }, [pages]);

  const isFlatDiscipline = useMemo(
    () => FLAT_FIELDS.has(selectedDiscipline.replace(/^\//, "").toLowerCase()),
    [selectedDiscipline]
  );

  // Available categories under selected discipline (none for flat disciplines)
  const availableCategories = useMemo(() => {
    if (isFlatDiscipline) return [];
    return pages.filter(
      (p) => (p.parentRoute || "").toLowerCase() === selectedDiscipline.toLowerCase()
    );
  }, [pages, selectedDiscipline, isFlatDiscipline]);

  // When selectedDiscipline changes, update category selection
  useEffect(() => {
    if (isFlatDiscipline) {
      setSelectedCategory("");
      return;
    }
    const cats = pages.filter(
      (p) => (p.parentRoute || "").toLowerCase() === selectedDiscipline.toLowerCase()
    );
    if (cats.length > 0) {
      setSelectedCategory(cats[0].route);
    } else {
      setSelectedCategory("");
    }
  }, [selectedDiscipline, isFlatDiscipline, pages]);

  // Derived slug and locked route computed top-to-bottom
  const computedSlug = customSlug.trim()
    ? normalizeProjectSlug(customSlug.trim())
    : normalizeProjectSlug(pageTitle) || "new-page";

  const computedRoute = useMemo(() => {
    if (createTarget === "discipline") {
      const discSlug = customDisciplineName.trim()
        ? normalizeProjectSlug(customDisciplineName)
        : computedSlug;
      return `/${discSlug}`;
    }
    if (createTarget === "category" && !isFlatDiscipline) {
      const catSlug = customCategoryName.trim()
        ? normalizeProjectSlug(customCategoryName)
        : computedSlug;
      return `${selectedDiscipline.replace(/\/+$/, "")}/${catSlug}`;
    }
    // project (attaches directly under flat disciplines, or under category when present)
    const baseParent = isFlatDiscipline
      ? selectedDiscipline
      : selectedCategory || selectedDiscipline;
    return `${baseParent.replace(/\/+$/, "")}/${computedSlug}`;
  }, [
    createTarget,
    isFlatDiscipline,
    selectedDiscipline,
    customDisciplineName,
    selectedCategory,
    customCategoryName,
    computedSlug,
  ]);

  const computedParentRoute = useMemo(() => {
    if (createTarget === "discipline") return "";
    if (createTarget === "category" || isFlatDiscipline) return selectedDiscipline;
    return selectedCategory || selectedDiscipline;
  }, [createTarget, isFlatDiscipline, selectedDiscipline, selectedCategory]);

  const toggleCollapse = (route: string) => {
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      if (next.has(route)) next.delete(route);
      else next.add(route);
      return next;
    });
  };

  const expandAll = () => setCollapsedSet(new Set());
  const collapseAll = () => {
    const allParents = pages
      .filter((p) => pages.some((child) => child.parentRoute === p.route))
      .map((p) => p.route);
    setCollapsedSet(new Set(allParents));
  };

  const handleToggleHide = (page: VaultPageItem) => {
    const updated: VaultPageItem = { ...page, isHidden: !page.isHidden };
    saveVaultPage(updated);
  };

  const handleUpdatePage = (pageId: string, updates: Partial<VaultPageItem>) => {
    const target = pages.find((p) => p.id === pageId);
    if (!target) return;
    const updated: VaultPageItem = { ...target, ...updates };
    try {
      saveVaultPage(updated);
    } catch (err: any) {
      alert(err?.message || "Failed to update page.");
      throw err;
    }
  };

  const handleDeletePage = (pageId: string, pageName: string) => {
    if (window.confirm(`Are you sure you want to delete "${pageName}"?`)) {
      deleteVaultPage(pageId);
    }
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoute = computedRoute;
    const finalName =
      (createTarget === "discipline"
        ? customDisciplineName
        : createTarget === "category"
        ? customCategoryName
        : pageTitle
      ).trim() || computedSlug;

    const newPage: VaultPageItem = {
      id: `page-${finalRoute.replace(/[^a-zA-Z0-9]/g, "-").replace(/^-+|-+$/g, "")}`,
      route: finalRoute,
      name: finalName,
      parentRoute: computedParentRoute,
      coverPhoto: newCover || "src/assets/fashion/atlasi/fashion-atlasi-01.jpg",
      coverModifiedByUser: Boolean(newCover),
      descriptionEn: newDescEn.trim(),
      descriptionFa: newDescFa.trim(),
      uiType: newUiType,
      uiTypeModifiedByUser: true,
      isHidden: false,
      pairedBoxes: newPairs.filter((p) => p.key.trim() || p.value.trim()),
      order: pages.length + 1,
    };

    saveVaultPage(newPage);
    setShowAddModal(false);

    // Reset form
    setPageTitle("");
    setCustomSlug("");
    setCustomDisciplineName("");
    setCustomCategoryName("");
    setNewDescEn("");
    setNewDescFa("");
    setNewCover("");
    setNewPairs([
      { key: "Client", value: "" },
      { key: "Year", value: "2026" },
    ]);
  };

  const pageMatchesQuery = (p: VaultPageItem, qLower: string): boolean => {
    if (!qLower) return true;
    return (
      p.name.toLowerCase().includes(qLower) ||
      p.route.toLowerCase().includes(qLower) ||
      p.descriptionEn.toLowerCase().includes(qLower) ||
      p.descriptionFa.includes(qLower) ||
      (p.pairedBoxes || []).some(
        (b) =>
          (b.key || "").toLowerCase().includes(qLower) ||
          (b.value || "").toLowerCase().includes(qLower),
      )
    );
  };

  const getChildrenOf = (parentRoute: string) => {
    const prLower = (parentRoute || "").toLowerCase();
    return pages.filter((p) => (p.parentRoute || "").toLowerCase() === prLower);
  };

  const subtreeMatchesQuery = (page: VaultPageItem, qLower: string, visited = new Set<string>()): boolean => {
    if (!qLower) return true;
    if (pageMatchesQuery(page, qLower)) return true;
    const key = page.route.toLowerCase();
    if (visited.has(key)) return false;
    visited.add(key);
    return getChildrenOf(page.route).some((child) => subtreeMatchesQuery(child, qLower, visited));
  };

  // Build hierarchical tree
  // Level 0: pages with parentRoute === "" or not matching any existing route
  const allRoutesLowerSet = useMemo(
    () => new Set(pages.map((p) => (p.route || "").toLowerCase())),
    [pages]
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const rootPages = useMemo(() => {
    return pages
      .filter((p) => !p.parentRoute || !allRoutesLowerSet.has(p.parentRoute.toLowerCase()))
      .filter((p) => subtreeMatchesQuery(p, normalizedSearch));
  }, [pages, allRoutesLowerSet, normalizedSearch]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 text-[#2CE3C0] text-xs font-mono mb-2">
            <FolderTree className="w-3.5 h-3.5" />
            <span>PAGES & ROUTES ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Site Pages ({pages.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Manage all scanned showcase routes. Configure addresses, browser tab titles, English and
            Farsi descriptions, hierarchical parent collapse, show/hide switches, and UI layout styles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Collapse All
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2CE3C0] text-black font-semibold text-xs transition-all hover:bg-[#2CE3C0]/90 shadow-[0_0_15px_rgba(44,227,192,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Page</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5">
        <Search className="w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages by route, name, description..."
          className="bg-transparent border-none text-xs text-white placeholder:text-neutral-500 focus:outline-none w-full"
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

      {/* Pages Hierarchy Tree */}
      <div className="space-y-6">
        {rootPages.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-[#0F0F0F]">
            <FolderTree className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white">No pages match your filter</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try searching with another keyword or create a new page above.
            </p>
          </div>
        ) : (
          rootPages.map((rootPage) => (
            <PageNodeCard
              key={rootPage.id}
              page={rootPage}
              allPages={pages}
              collapsedSet={collapsedSet}
              onToggleCollapse={toggleCollapse}
              onToggleHide={handleToggleHide}
              onUpdatePage={handleUpdatePage}
              onDeletePage={handleDeletePage}
              onOpenMediaPicker={(id) => setMediaPickerPageId(id)}
              pendingCoverPatches={pendingCoverPatches}
              getChildrenOf={getChildrenOf}
              searchQuery={normalizedSearch}
              pageMatchesQuery={pageMatchesQuery}
              subtreeMatchesQuery={subtreeMatchesQuery}
              depth={0}
            />
          ))
        )}
      </div>

      {/* Media Picker Modal */}
      {mediaPickerPageId && (
        <MediaCoverPickerModal
          pageId={mediaPickerPageId}
          onClose={() => setMediaPickerPageId(null)}
          onSelectCover={(url) => {
            setPendingCoverPatches((prev) => ({
              ...prev,
              [mediaPickerPageId]: { url, nonce: Date.now() },
            }));
            setMediaPickerPageId(null);
          }}
        />
      )}

      {/* Add New Page Modal with Hierarchical Top-to-Bottom Creation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-[#2CE3C0]" />
                  <span>Add New Page (Top-to-Bottom Routing)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Choose discipline and category to hierarchically lock the route prefix.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4">
              {/* Creation Level Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Hierarchy Level
                </label>
                <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 gap-1 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setCreateTarget("project")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      createTarget === "project"
                        ? "bg-[#2CE3C0] text-black font-semibold shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Project / Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTarget("category")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      createTarget === "category"
                        ? "bg-[#2CE3C0] text-black font-semibold shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTarget("discipline")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      createTarget === "discipline"
                        ? "bg-[#2CE3C0] text-black font-semibold shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Root Field
                  </button>
                </div>
              </div>

              {/* Step 1: Discipline (Locks Prefix 1) */}
              {(createTarget === "project" || createTarget === "category") && (
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 flex items-center justify-between">
                    <span>1. Discipline (Locks Route Prefix)</span>
                    <span className="text-[10px] text-[#2CE3C0] font-mono">{selectedDiscipline}</span>
                  </label>
                  <select
                    value={selectedDiscipline}
                    onChange={(e) => {
                      const nextDisc = e.target.value;
                      setSelectedDiscipline(nextDisc);
                      if (
                        createTarget === "category" &&
                        FLAT_FIELDS.has(nextDisc.replace(/^\//, "").toLowerCase())
                      ) {
                        setCreateTarget("project");
                      }
                    }}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
                  >
                    {availableDisciplines.map((d) => (
                      <option key={d.route} value={d.route}>
                        {d.name} ({d.route})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 2: Category (Locks Prefix 2 for Projects) */}
              {createTarget === "project" && (
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 flex items-center justify-between">
                    <span>2. Category / Specialty (Locks Parent)</span>
                    <span className="text-[10px] text-[#2CE3C0] font-mono">
                      {selectedCategory || "Direct"}
                    </span>
                  </label>
                  {availableCategories.length > 0 ? (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
                    >
                      {availableCategories.map((c) => (
                        <option key={c.route} value={c.route}>
                          {c.name} ({c.route})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-neutral-500 font-mono italic p-2.5 bg-black/40 border border-white/5 rounded-xl">
                      No sub-categories under {selectedDiscipline}. The project will attach directly to this discipline.
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Project / Category Name */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                  {createTarget === "discipline"
                    ? "Discipline Name *"
                    : createTarget === "category"
                    ? "Category Name *"
                    : "Project Name *"}
                </label>
                <input
                  type="text"
                  value={
                    createTarget === "discipline"
                      ? customDisciplineName
                      : createTarget === "category"
                      ? customCategoryName
                      : pageTitle
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (createTarget === "discipline") setCustomDisciplineName(val);
                    else if (createTarget === "category") setCustomCategoryName(val);
                    else setPageTitle(val);
                  }}
                  placeholder={
                    createTarget === "discipline"
                      ? "e.g. Architecture"
                      : createTarget === "category"
                      ? "e.g. Street Photography"
                      : "e.g. Meatlab, Sepidar, Samanwood"
                  }
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                />
              </div>

              {/* Live Locked Route Banner */}
              <div className="p-3 rounded-xl bg-black/80 border border-[#2CE3C0]/40 font-mono text-xs flex items-center gap-3 shadow-inner">
                <div className="p-1.5 rounded-lg bg-[#2CE3C0]/10 border border-[#2CE3C0]/20 text-[#2CE3C0]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">
                    Hierarchically Locked Route
                  </span>
                  <span className="text-[#2CE3C0] font-semibold truncate block">
                    {computedRoute}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Parent: {computedParentRoute || "None (Root)"}
                </span>
              </div>

              {/* UI Layout Type */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                  UI Layout Type
                </label>
                <select
                  value={newUiType}
                  onChange={(e) => setNewUiType(e.target.value as UITypeCode)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                >
                  {UI_TYPE_LIST.map((ui) => (
                    <option key={ui.code} value={ui.code}>
                      {ui.name} — {ui.tagline}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descriptions: English & Farsi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                    English Description
                  </label>
                  <textarea
                    value={newDescEn}
                    onChange={(e) => setNewDescEn(e.target.value)}
                    rows={3}
                    placeholder="Appears on top of the page..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 text-right">
                    توضیحات فارسی
                  </label>
                  <textarea
                    value={newDescFa}
                    onChange={(e) => setNewDescFa(e.target.value)}
                    rows={3}
                    dir="rtl"
                    placeholder="در بالای صفحه نمایش داده می‌شود..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                  />
                </div>
              </div>

              {/* Additional Paired Boxes */}
              <div className="pt-1">
                <PairedBoxesEditor
                  pairs={newPairs}
                  onChange={setNewPairs}
                  title="Initial Metadata Paired Boxes"
                  description="Add attributes like Client: Meatlab, Year: 2025"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2CE3C0] text-black font-semibold text-xs hover:bg-[#2CE3C0]/90 shadow-[0_0_15px_rgba(44,227,192,0.3)] cursor-pointer"
                >
                  Create Page
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
// Recursive Hierarchical Page Card Component
// -------------------------------------------------------------

interface PageNodeCardProps {
  page: VaultPageItem;
  allPages: VaultPageItem[];
  collapsedSet: Set<string>;
  onToggleCollapse: (route: string) => void;
  onToggleHide: (page: VaultPageItem) => void;
  onUpdatePage: (pageId: string, updates: Partial<VaultPageItem>) => void;
  onDeletePage: (pageId: string, pageName: string) => void;
  onOpenMediaPicker: (pageId: string) => void;
  pendingCoverPatches?: Record<string, { url: string; nonce: number }>;
  getChildrenOf: (route: string) => VaultPageItem[];
  searchQuery: string;
  pageMatchesQuery: (page: VaultPageItem, q: string) => boolean;
  subtreeMatchesQuery: (page: VaultPageItem, q: string) => boolean;
  depth: number;
}

function PageNodeCard({
  page,
  allPages,
  collapsedSet,
  onToggleCollapse,
  onToggleHide,
  onUpdatePage,
  onDeletePage,
  onOpenMediaPicker,
  pendingCoverPatches,
  getChildrenOf,
  searchQuery,
  pageMatchesQuery,
  subtreeMatchesQuery,
  depth,
}: PageNodeCardProps) {
  const rawChildren = getChildrenOf(page.route);
  const directMatch = searchQuery ? pageMatchesQuery(page, searchQuery) : false;
  const children =
    searchQuery && !directMatch
      ? rawChildren.filter((c) => subtreeMatchesQuery(c, searchQuery))
      : rawChildren;
  const hasChildren = children.length > 0;
  const isCollapsed = searchQuery ? false : collapsedSet.has(page.route);

  const [draft, setDraft] = useState<VaultPageItem>(page);
  const [justSaved, setJustSaved] = useState(false);

  const pageContentSig = [
    page.id,
    page.route,
    page.name,
    page.parentRoute,
    page.uiType,
    page.coverPhoto,
    page.descriptionEn,
    page.descriptionFa,
    JSON.stringify(page.pairedBoxes || []),
  ].join("|");

  useEffect(() => {
    setDraft(page);
  }, [pageContentSig]);

  const coverPatch = pendingCoverPatches?.[page.id];
  useEffect(() => {
    if (!coverPatch) return;
    setDraft((prev) => ({
      ...prev,
      coverPhoto: coverPatch.url,
      coverModifiedByUser: true,
    }));
    setJustSaved(false);
  }, [coverPatch?.nonce]);

  const isDirty = useMemo(() => {
    return (
      draft.route.trim() !== page.route ||
      draft.name.trim() !== page.name ||
      draft.parentRoute !== page.parentRoute ||
      draft.uiType !== page.uiType ||
      draft.coverPhoto !== page.coverPhoto ||
      draft.descriptionEn !== page.descriptionEn ||
      draft.descriptionFa !== page.descriptionFa ||
      JSON.stringify(draft.pairedBoxes || []) !== JSON.stringify(page.pairedBoxes || [])
    );
  }, [draft, page]);

  const handleSubmitChanges = () => {
    const cleanedRoute = draft.route.trim();
    const cleanedName = draft.name.trim();
    if (!cleanedRoute) {
      alert("Address (route) cannot be empty.");
      return;
    }
    if (!cleanedName) {
      alert("Page name cannot be empty.");
      return;
    }
    try {
      onUpdatePage(page.id, {
        route: cleanedRoute,
        name: cleanedName,
        parentRoute: draft.parentRoute,
        uiType: draft.uiType,
        uiTypeModifiedByUser:
          draft.uiType !== page.uiType ? true : draft.uiTypeModifiedByUser,
        coverPhoto: draft.coverPhoto,
        coverModifiedByUser:
          draft.coverPhoto !== page.coverPhoto ? true : draft.coverModifiedByUser,
        descriptionEn: draft.descriptionEn,
        descriptionFa: draft.descriptionFa,
        pairedBoxes: draft.pairedBoxes || [],
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch {
      /* alert already surfaced */
    }
  };

  const handleDiscardChanges = () => {
    setDraft(page);
    setJustSaved(false);
  };

  // File upload for cover photo (updates card draft only; applied on Submit)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const sized = await processMediaUpload(file);
      let finalCover = sized.fullUrl;
      if (sized.blob) {
        const extLower = (sized.rawExt || (sized.isVideo ? ".mp4" : ".jpg")).toLowerCase();
        const idbKey = `idb://page-cover-${page.id}-${Date.now()}${extLower}`;
        await putMediaBlob(idbKey, sized.blob);
        if (sized.fullUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(sized.fullUrl);
          } catch {
            /* ignore */
          }
        }
        finalCover = idbKey;
      }
      setDraft((prev) => ({
        ...prev,
        coverPhoto: finalCover,
        coverModifiedByUser: true,
      }));
      setJustSaved(false);
    } catch (err: any) {
      alert(`Error uploading cover: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  };

  // Indentation for nested sub-routes: 5% shorter on left side as requested
  const indentStyle = depth > 0 ? { marginLeft: "5%" } : {};

  return (
    <div style={indentStyle} className="space-y-3 transition-all duration-200">
      {/* Long Vertical Card */}
      <div
        className={`rounded-2xl border transition-all duration-200 bg-[#121212]/90 backdrop-blur-md overflow-hidden ${
          page.isHidden
            ? "border-amber-500/30 opacity-75"
            : "border-white/10 hover:border-white/20 shadow-xl"
        }`}
      >
        {/* Card Header Strip */}
        <div className="bg-[#181818] border-b border-white/5 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Collapse toggle button */}
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleCollapse(page.route)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-[#2CE3C0] transition-colors cursor-pointer"
                title={isCollapsed ? "Expand sub-routes" : "Collapse sub-routes"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center text-neutral-600 font-mono text-xs">
                •
              </div>
            )}

            {/* Address Pill */}
            <span className="font-mono text-xs font-semibold text-[#2CE3C0] bg-[#2CE3C0]/10 px-2.5 py-1 rounded-md border border-[#2CE3C0]/20 truncate">
              {page.route}
            </span>

            {/* Name */}
            <span className="text-sm font-medium text-white truncate">{page.name}</span>

            {/* Sub-routes count badge */}
            {hasChildren && (
              <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {children.length} sub-{children.length === 1 ? "route" : "routes"}
              </span>
            )}
          </div>

          {/* Quick Header Actions: Show/Hide Toggle & Live View */}
          <div className="flex items-center gap-2">
            {/* Show / Hide Toggle Button */}
            <button
              type="button"
              onClick={() => onToggleHide(page)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer ${
                page.isHidden
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                  : "bg-[#2CE3C0]/15 border-[#2CE3C0]/40 text-[#2CE3C0] hover:bg-[#2CE3C0]/25"
              }`}
              title={page.isHidden ? "Page is hidden (shows 'Nothing here to see')" : "Page is visible"}
            >
              {page.isHidden ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-300" />
                  <span>Hidden</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#2CE3C0]" />
                  <span>Visible</span>
                </>
              )}
            </button>

            {/* Live Route Link */}
            <a
              href={page.route}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Open route in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Delete Page */}
            <button
              type="button"
              onClick={() => onDeletePage(page.id, page.name)}
              className="p-1.5 rounded-lg border border-white/10 text-neutral-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Delete this page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Body - All 7 Required Fields (Buffered in draft until Submit Changes) */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Row 1: Address & Name (Editable) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                1. Address (Route Path)
              </label>
              <input
                type="text"
                value={draft.route}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, route: e.target.value }));
                  setJustSaved(false);
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#2CE3C0] focus:outline-none focus:border-[#2CE3C0]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                <span>2. Name (Browser Tab Title)</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  Tab: Siavash Akbari - {draft.name || page.name}
                </span>
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, name: e.target.value }));
                  setJustSaved(false);
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
              />
            </div>
          </div>

          {/* Row 2: Parent & UI Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                4. Parent Route (Collapsible Nesting)
              </label>
              <select
                value={draft.parentRoute}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, parentRoute: e.target.value }));
                  setJustSaved(false);
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
              >
                <option value="">None (Top-Level Root Field)</option>
                {allPages
                  .filter((p) => p.route !== page.route)
                  .map((p) => (
                    <option key={p.id} value={p.route}>
                      {p.name} ({p.route})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                5. UI Layout Type
              </label>
              <select
                value={draft.uiType}
                onChange={(e) => {
                  setDraft((prev) => ({
                    ...prev,
                    uiType: e.target.value as UITypeCode,
                    uiTypeModifiedByUser: true,
                  }));
                  setJustSaved(false);
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
              >
                {UI_TYPE_LIST.map((ui) => (
                  <option key={ui.code} value={ui.code}>
                    {ui.name} — {ui.tagline}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Cover Photo & Descriptions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 3.1 Cover Photo */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                3.1 Cover Photo
              </label>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 border border-white/10 group flex items-center justify-center">
                {draft.coverPhoto ? (
                  <VaultCoverPreview src={draft.coverPhoto} alt={draft.name || page.name} />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-neutral-500">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px]">No cover assigned</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => onOpenMediaPicker(page.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    Select Media
                  </button>
                  <label className="px-2.5 py-1.5 rounded-lg bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-[11px] font-mono font-medium transition-colors cursor-pointer">
                    Upload
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 3.2 Descriptions: English & Farsi */}
            <div className="lg:col-span-2 space-y-3">
              <span className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                3.2 Description (Appears at top of page)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* English Box */}
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 mb-1">
                    English Description (LTR)
                  </label>
                  <textarea
                    rows={4}
                    value={draft.descriptionEn}
                    onChange={(e) => {
                      setDraft((prev) => ({ ...prev, descriptionEn: e.target.value }));
                      setJustSaved(false);
                    }}
                    placeholder="Write English introductory blurb..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0] leading-relaxed resize-y"
                  />
                </div>

                {/* Farsi Box */}
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 mb-1 text-right">
                    توضیحات فارسی (RTL)
                  </label>
                  <textarea
                    rows={4}
                    dir="rtl"
                    value={draft.descriptionFa}
                    onChange={(e) => {
                      setDraft((prev) => ({ ...prev, descriptionFa: e.target.value }));
                      setJustSaved(false);
                    }}
                    placeholder="توضیحات مقدماتی فارسی را بنویسید..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0] leading-relaxed resize-y font-sans"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Additional Paired Boxes (with JSON Switch) */}
          <div>
            <PairedBoxesEditor
              title="7. Additional Paired Boxes"
              description="Metadata pairs for this page (e.g. Model : Sara, Year : 2020). Click button to turn into JSON code."
              pairs={draft.pairedBoxes || []}
              onChange={(newPairs) => {
                setDraft((prev) => ({ ...prev, pairedBoxes: newPairs }));
                setJustSaved(false);
              }}
            />
          </div>

          {/* Card Footer Submit Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="text-[11px] font-mono">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved changes — click Submit Changes to apply
                </span>
              ) : justSaved ? (
                <span className="inline-flex items-center gap-1.5 text-[#2CE3C0]">
                  <Check className="w-3.5 h-3.5" />
                  Changes submitted &amp; live
                </span>
              ) : (
                <span className="text-neutral-500">All changes saved</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Discard
                </button>
              )}
              <button
                type="button"
                disabled={!isDirty}
                onClick={handleSubmitChanges}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                  isDirty
                    ? "bg-[#2CE3C0] text-black hover:bg-[#2CE3C0]/90 shadow-[0_0_15px_rgba(44,227,192,0.3)] cursor-pointer"
                    : "bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Nested Children if Not Collapsed */}
      {!isCollapsed && hasChildren && (
        <div className="space-y-3 pt-1">
          {children.map((child) => (
            <PageNodeCard
              key={child.id}
              page={child}
              allPages={allPages}
              collapsedSet={collapsedSet}
              onToggleCollapse={onToggleCollapse}
              onToggleHide={onToggleHide}
              onUpdatePage={onUpdatePage}
              onDeletePage={onDeletePage}
              onOpenMediaPicker={onOpenMediaPicker}
              pendingCoverPatches={pendingCoverPatches}
              getChildrenOf={getChildrenOf}
              searchQuery={searchQuery}
              pageMatchesQuery={pageMatchesQuery}
              subtreeMatchesQuery={subtreeMatchesQuery}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Media Cover Picker Dialog
// -------------------------------------------------------------

function MediaCoverPickerModal({
  pageId,
  onClose,
  onSelectCover,
}: {
  pageId: string;
  onClose: () => void;
  onSelectCover: (url: string) => void;
}) {
  const [mediaList, setMediaList] = useState(getVaultMedia());
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return mediaList.slice(0, 36);
    const q = filter.toLowerCase();
    return mediaList
      .filter((m) => m.title.toLowerCase().includes(q) || m.dynamicCode.toLowerCase().includes(q))
      .slice(0, 36);
  }, [mediaList, filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Choose Cover Photo from Media</h3>
            <p className="text-xs text-neutral-400">Click any media item to assign as page cover.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white font-mono"
          >
            Close
          </button>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter media items..."
          className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
        />

        <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 p-1">
          {filtered.map((item) => (
            <PickerMediaCell
              key={item.id}
              item={item}
              onSelect={() => onSelectCover(item.imgSrc)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VaultCoverPreview({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedMediaSrc(src);
  return isVideoAssetUrl(src) || isVideoAssetUrl(resolved) ? (
    <video
      src={resolved || undefined}
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full h-full object-cover"
    />
  ) : (
    <img src={resolved || undefined} alt={alt} className="w-full h-full object-cover" />
  );
}

function PickerMediaCell({ item, onSelect }: { item: any; onSelect: () => void }) {
  const resolvedThumb = useResolvedMediaSrc(item.thumbSrc || item.imgSrc);
  const resolvedVideo = useResolvedMediaSrc(item.imgSrc);
  const itemIsVideo = item.isVideo || isVideoAssetUrl(item.imgSrc);
  return (
    <div
      onClick={onSelect}
      className="group aspect-square rounded-lg overflow-hidden bg-black border border-white/10 hover:border-[#2CE3C0] cursor-pointer transition-all relative"
    >
      {itemIsVideo ? (
        <video
          src={resolvedVideo || undefined}
          poster={resolveVideoPoster(item.thumbSrc)}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={resolvedThumb || undefined}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      )}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Check className="w-5 h-5 text-[#2CE3C0]" />
      </div>
    </div>
  );
}
