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
} from "lucide-react";
import {
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
import { resolveInventoryImage } from "@/lib/inventory-assets";

export const Route = createFileRoute("/vault/pages")({
  component: VaultPagesView,
});

function VaultPagesView() {
  const [pages, setPages] = useState<VaultPageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [mediaPickerPageId, setMediaPickerPageId] = useState<string | null>(null);

  // New page form state
  const [newRoute, setNewRoute] = useState("");
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newUiType, setNewUiType] = useState<UITypeCode>("UI01");
  const [newDescEn, setNewDescEn] = useState("");
  const [newDescFa, setNewDescFa] = useState("");
  const [newCover, setNewCover] = useState("");

  const refreshPages = () => {
    setPages(getVaultPages());
  };

  useEffect(() => {
    refreshPages();
    return subscribeToVaultStore(() => {
      refreshPages();
    });
  }, []);

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
    saveVaultPage(updated);
  };

  const handleDeletePage = (pageId: string, pageName: string) => {
    if (window.confirm(`Are you sure you want to delete "${pageName}"?`)) {
      deleteVaultPage(pageId);
    }
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanRoute = newRoute.trim();
    if (!cleanRoute.startsWith("/")) cleanRoute = `/${cleanRoute}`;
    cleanRoute = cleanRoute.replace(/\/+$/, "");

    const newPage: VaultPageItem = {
      id: `page-${cleanRoute.replace(/[^a-zA-Z0-9]/g, "-").replace(/^-+|-+$/g, "")}`,
      route: cleanRoute,
      name: newName.trim() || cleanRoute.split("/").pop() || "Page",
      parentRoute: newParent,
      coverPhoto: newCover || "src/assets/fashion/atlasi/fashion-atlasi-01.jpg",
      descriptionEn: newDescEn.trim(),
      descriptionFa: newDescFa.trim(),
      uiType: newUiType,
      isHidden: false,
      pairedBoxes: [],
      order: pages.length + 1,
    };

    saveVaultPage(newPage);
    setShowAddModal(false);
    // Reset form
    setNewRoute("");
    setNewName("");
    setNewParent("");
    setNewDescEn("");
    setNewDescFa("");
    setNewCover("");
  };

  // Build hierarchical tree
  // Level 0: pages with parentRoute === "" or not matching any existing route
  const allRoutesSet = useMemo(() => new Set(pages.map((p) => p.route)), [pages]);

  const rootPages = useMemo(() => {
    return pages
      .filter((p) => !p.parentRoute || !allRoutesSet.has(p.parentRoute))
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.route.toLowerCase().includes(q) ||
          p.descriptionEn.toLowerCase().includes(q) ||
          p.descriptionFa.includes(q)
        );
      });
  }, [pages, allRoutesSet, searchQuery]);

  const getChildrenOf = (parentRoute: string) => {
    return pages.filter((p) => p.parentRoute === parentRoute);
  };

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
              getChildrenOf={getChildrenOf}
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
            handleUpdatePage(mediaPickerPageId, { coverPhoto: url });
            setMediaPickerPageId(null);
          }}
        />
      )}

      {/* Add New Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Add New Route / Page</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Define route path, tab name, parent page, and initial UI type.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                  Route Address *
                </label>
                <input
                  type="text"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  placeholder="/photography/fashion-photography/new-project"
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                  Page Name (Tab Title) *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sepidar or Visual Identity"
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                  Renders in browser tab as: Siavash Akbari - {newName || "[Name]"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                  Parent Route (for hierarchy & collapsible group)
                </label>
                <select
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] font-mono"
                >
                  <option value="">None (Root Field)</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.route}>
                      {p.name} ({p.route})
                    </option>
                  ))}
                </select>
              </div>

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
  getChildrenOf: (route: string) => VaultPageItem[];
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
  getChildrenOf,
  depth,
}: PageNodeCardProps) {
  const children = getChildrenOf(page.route);
  const hasChildren = children.length > 0;
  const isCollapsed = collapsedSet.has(page.route);

  // File upload for cover photo
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const sized = await processMediaUpload(file);
      onUpdatePage(page.id, { coverPhoto: sized.fullUrl });
    } catch (err: any) {
      alert(`Error uploading cover: ${err.message}`);
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

        {/* Card Body - All 7 Required Fields */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Row 1: Address & Name (Editable) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                1. Address (Route Path)
              </label>
              <input
                type="text"
                value={page.route}
                onChange={(e) => onUpdatePage(page.id, { route: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#2CE3C0] focus:outline-none focus:border-[#2CE3C0]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                <span>2. Name (Browser Tab Title)</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  Tab: Siavash Akbari - {page.name}
                </span>
              </label>
              <input
                type="text"
                value={page.name}
                onChange={(e) => onUpdatePage(page.id, { name: e.target.value })}
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
                value={page.parentRoute}
                onChange={(e) => onUpdatePage(page.id, { parentRoute: e.target.value })}
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
                value={page.uiType}
                onChange={(e) => onUpdatePage(page.id, { uiType: e.target.value as UITypeCode })}
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
                {page.coverPhoto ? (
                  <img
                    src={resolveInventoryImage(page.coverPhoto) || page.coverPhoto}
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
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
                      accept="image/*"
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
                    value={page.descriptionEn}
                    onChange={(e) => onUpdatePage(page.id, { descriptionEn: e.target.value })}
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
                    value={page.descriptionFa}
                    onChange={(e) => onUpdatePage(page.id, { descriptionFa: e.target.value })}
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
              pairs={page.pairedBoxes || []}
              onChange={(newPairs) => onUpdatePage(page.id, { pairedBoxes: newPairs })}
            />
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
              getChildrenOf={getChildrenOf}
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
            <div
              key={item.id}
              onClick={() => onSelectCover(item.imgSrc)}
              className="group aspect-square rounded-lg overflow-hidden bg-black border border-white/10 hover:border-[#2CE3C0] cursor-pointer transition-all relative"
            >
              <img
                src={resolveInventoryImage(item.thumbSrc || item.imgSrc) || item.imgSrc}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Check className="w-5 h-5 text-[#2CE3C0]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
