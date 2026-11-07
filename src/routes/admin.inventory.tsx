import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useCallback, memo } from "react";
import {
  Download,
  Search,
  Filter,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  Layers,
  Database,
  RotateCcw,
} from "lucide-react";
import { getMergedPhotoInventory, savePhotoInventoryItem } from "@/lib/studio-store";
import type { PhotoInventoryItem } from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryView,
});

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

const KNOWN_DISCIPLINES = [
  "Fashion Photography",
  "Food Photography",
  "Portrait Photography",
  "Product Photography",
  "Visual Identity",
  "Book Covers",
  "Posters",
];

// Memoized individual item card with isolated local state to eliminate typing lag
const InventoryItemCard = memo(function InventoryItemCard({
  item,
  onSaveField,
}: {
  item: PhotoInventoryItem;
  onSaveField: (code: string, field: keyof PhotoInventoryItem, value: string) => void;
}) {
  const [subdiscipline, setSubdiscipline] = useState(item.subdiscipline || "");
  const [model, setModel] = useState(item.model || "");
  const [client, setClient] = useState(item.client || "");
  const [makeupArtist, setMakeupArtist] = useState(item.makeupArtist || "");
  const [assistant, setAssistant] = useState(item.assistant || "");
  const [date, setDate] = useState(item.date || "");
  const [keywords, setKeywords] = useState(item.keywords || "");
  const [project, setProject] = useState(item.project || "");
  const [savedBadge, setSavedBadge] = useState(false);

  const resolvedUrl = useMemo(() => resolveInventoryImage(item.imgSrc), [item.imgSrc]);

  const discSlug = useMemo(() => {
    switch (item.discipline) {
      case "Fashion Photography":
        return "fashion-photography";
      case "Food Photography":
        return "food-photography";
      case "Portrait Photography":
        return "portrait-photography";
      case "Product Photography":
        return "product-photography";
      case "Visual Identity":
        return "visual-identity";
      default:
        return "graphic-design";
    }
  }, [item.discipline]);

  const isPhotoDiscipline = item.discipline.toLowerCase().includes("photography");

  const handleBlur = (field: keyof PhotoInventoryItem, val: string, originalVal?: string) => {
    if (val !== (originalVal || "")) {
      onSaveField(item.code, field, val);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 1200);
    }
  };

  const applyQuickTag = (tag: string) => {
    setSubdiscipline(tag);
    onSaveField(item.code, "subdiscipline", tag);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1200);
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 p-4 rounded-xl bg-[#141414] border border-white/10 hover:border-[#2CE3C0]/40 transition-colors">
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
        {/* Header Bar */}
        <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-[#2CE3C0]/15 text-[#2CE3C0] font-mono font-bold text-xs">
              {item.code}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#FFD166]/15 text-[#FFD166] text-xs font-semibold">
              {item.project}
            </span>
            <span className="text-neutral-500 text-[11px]">{item.discipline}</span>
          </div>

          <div className="flex items-center gap-3">
            {savedBadge && (
              <span className="text-[10px] text-[#2CE3C0] font-mono flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" />
                <span>Saved</span>
              </span>
            )}
            {isPhotoDiscipline && (
              <Link
                to="/$discipline/$photoId"
                params={{ discipline: discSlug, photoId: item.code }}
                target="_blank"
                className="text-[11px] text-neutral-400 hover:text-[#2CE3C0] flex items-center gap-1 transition-colors"
              >
                <span>
                  /{discSlug}/{item.code}
                </span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Sub-Discipline / Specialty */}
        <div className="sm:col-span-2 lg:col-span-3 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <label className="font-semibold text-[#FFD166] uppercase tracking-wider">
              Sub-Discipline / Specialty
            </label>
            <span className="text-[10px] text-neutral-500">Pick quick tag or type custom</span>
          </div>
          <input
            type="text"
            value={subdiscipline}
            onChange={(e) => setSubdiscipline(e.target.value)}
            onBlur={() => handleBlur("subdiscipline", subdiscipline, item.subdiscipline)}
            placeholder="e.g. Textiles & Fabric, Silhouette & Posture, Lookbook, Furniture..."
            className="w-full bg-[#1C1C1C] border border-[#FFD166]/40 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#FFD166]"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUBDISCIPLINE_QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => applyQuickTag(tag)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  subdiscipline === tag
                    ? "bg-[#FFD166] text-black border-[#FFD166] font-semibold"
                    : "bg-[#222] hover:bg-[#FFD166] hover:text-black text-neutral-400 border-white/5"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Project Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
            Project Assignment
          </label>
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            onBlur={() => handleBlur("project", project, item.project)}
            placeholder="Assigned project name"
            className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
          />
        </div>

        {/* Model(s) */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#2CE3C0]">
            Model(s)
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            onBlur={() => handleBlur("model", model, item.model)}
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
            value={client}
            onChange={(e) => setClient(e.target.value)}
            onBlur={() => handleBlur("client", client, item.client)}
            placeholder="Client or brand"
            className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
          />
        </div>

        {/* Makeup Artist */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Makeup Artist (MUA)
          </label>
          <input
            type="text"
            value={makeupArtist}
            onChange={(e) => setMakeupArtist(e.target.value)}
            onBlur={() => handleBlur("makeupArtist", makeupArtist, item.makeupArtist)}
            placeholder="MUA Name"
            className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
          />
        </div>

        {/* Assistant */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Assistant
          </label>
          <input
            type="text"
            value={assistant}
            onChange={(e) => setAssistant(e.target.value)}
            onBlur={() => handleBlur("assistant", assistant, item.assistant)}
            placeholder="Assistant Name"
            className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
          />
        </div>

        {/* Production Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Date / Year
          </label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => handleBlur("date", date, item.date)}
            placeholder="e.g. 2026 / 1405"
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
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onBlur={() => handleBlur("keywords", keywords, item.keywords)}
            placeholder="Keywords for SEO, search engines, and citability"
            className="w-full bg-[#1C1C1C] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#2CE3C0]"
          />
        </div>
      </div>
    </div>
  );
});

function AdminInventoryView() {
  const [inventory, setInventory] = useState<PhotoInventoryItem[]>(() => getMergedPhotoInventory());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [saveStatus, setSaveStatus] = useState("✓ Auto-saved to live storage");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(24);

  // Precompute project counts once (O(N) single pass instead of O(N^2))
  const { projectCounts, uniqueProjects } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < inventory.length; i++) {
      const p = inventory[i].project;
      if (p) {
        counts[p] = (counts[p] || 0) + 1;
      }
    }
    const unique = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    return { projectCounts: counts, uniqueProjects: unique };
  }, [inventory]);

  // Precompute discipline counts once
  const disciplineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < inventory.length; i++) {
      const d = inventory[i].discipline;
      if (d) {
        counts[d] = (counts[d] || 0) + 1;
      }
    }
    return counts;
  }, [inventory]);

  // Fast memoized filtering
  const filteredInventory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const disc = selectedDiscipline;
    const proj = selectedProject;

    if (!q && !disc && !proj) return inventory;

    return inventory.filter((item) => {
      if (disc && item.discipline !== disc) return false;
      if (proj && item.project !== proj) return false;
      if (!q) return true;

      return (
        item.code.toLowerCase().includes(q) ||
        (item.project && item.project.toLowerCase().includes(q)) ||
        (item.subdiscipline && item.subdiscipline.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q)) ||
        (item.client && item.client.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
      );
    });
  }, [inventory, searchQuery, selectedDiscipline, selectedProject]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedInventory = useMemo(() => {
    if (pageSize >= 9999) return filteredInventory;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [filteredInventory, safeCurrentPage, pageSize]);

  // Reset to page 1 on search or filter change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleDisciplineChange = (val: string) => {
    setSelectedDiscipline(val);
    setCurrentPage(1);
  };

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    setCurrentPage(1);
  };

  const handleUpdateInventoryField = useCallback(
    (code: string, field: keyof PhotoInventoryItem, value: string) => {
      savePhotoInventoryItem({ code, [field]: value });
      setInventory((prev) =>
        prev.map((item) => (item.code === code ? { ...item, [field]: value } : item)),
      );
      setSaveStatus("✓ Auto-saved to live storage");
    },
    [],
  );

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inventory, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `siavash_photo_inventory_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = [
      "code",
      "project",
      "discipline",
      "subdiscipline",
      "model",
      "client",
      "makeupArtist",
      "assistant",
      "date",
      "keywords",
      "imgSrc",
    ];
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
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `siavash_portfolio_inventory_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleResetToSaved = () => {
    setInventory(getMergedPhotoInventory());
    setSaveStatus("✓ Live storage reloaded");
  };

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FFD166] bg-[#FFD166]/10 border border-[#FFD166]/20 px-2 py-0.5 rounded">
              ASSET VAULT
            </span>
            <span className="text-xs text-neutral-500">·</span>
            <Link
              to="/admin/projects"
              className="text-xs text-neutral-400 hover:text-[#2CE3C0] flex items-center gap-1 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Go to Case Study Projects</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Photo & Visual Asset Inventory</span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full">
              {inventory.length} ASSETS
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
            Fast, high-performance database editor for individual photo and graphic assets. Edit
            models, credits, sub-disciplines, and SEO tags with zero typing lag.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(44,227,192,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFD166]/90 text-black text-xs font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(255,209,102,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleResetToSaved}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
            title="Reload from local storage"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141414] p-3.5 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-4 text-neutral-400">
          <div>
            Total Assets:{" "}
            <strong className="text-[#2CE3C0] font-semibold">{inventory.length} items</strong>
          </div>
          <div>·</div>
          <div>
            Filtered:{" "}
            <strong className="text-white font-semibold">{filteredInventory.length}</strong>
          </div>
          {filteredInventory.length > pageSize && (
            <>
              <div>·</div>
              <div className="text-neutral-400">
                Page <strong className="text-[#FFD166]">{safeCurrentPage}</strong> of {totalPages}
              </div>
            </>
          )}
        </div>
        <div className="bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-3 py-1 rounded-full text-[11px] font-mono font-medium">
          {saveStatus}
        </div>
      </div>

      {/* Instant Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by code (e.g. FASH-01), model, project, sub-discipline, keywords..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#2CE3C0] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Discipline Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            value={selectedDiscipline}
            onChange={(e) => handleDisciplineChange(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 text-neutral-200 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-[#2CE3C0] cursor-pointer appearance-none pr-8"
          >
            <option value="">All Disciplines ({inventory.length})</option>
            {KNOWN_DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {d} ({disciplineCounts[d] || 0})
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Project Filter Dropdown - Fast O(1) Precomputed Options */}
        <div className="relative min-w-[220px]">
          <select
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 text-neutral-200 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-[#2CE3C0] cursor-pointer appearance-none pr-8"
          >
            <option value="">All Projects ({uniqueProjects.length})</option>
            {uniqueProjects.map((proj) => (
              <option key={proj} value={proj}>
                {proj} ({projectCounts[proj] || 0})
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Page Size Selector */}
        <div className="relative min-w-[130px]">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full bg-[#181818] border border-white/10 text-neutral-200 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-[#2CE3C0] cursor-pointer appearance-none pr-8 font-mono"
          >
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
            <option value={96}>96 per page</option>
            <option value={9999}>Show all ({filteredInventory.length})</option>
          </select>
        </div>
      </div>

      {/* Cards List */}
      {filteredInventory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center bg-[#141414]/50">
          <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-sm">No visual assets found</h3>
          <p className="text-neutral-400 text-xs mt-1">
            Try adjusting your search terms or clearing your filters.
          </p>
          {(searchQuery || selectedDiscipline || selectedProject) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDiscipline("");
                setSelectedProject("");
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedInventory.map((item) => (
            <InventoryItemCard
              key={item.code}
              item={item}
              onSaveField={handleUpdateInventoryField}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-white/10 text-xs">
          <div className="text-neutral-400">
            Showing{" "}
            <strong className="text-white">
              {(safeCurrentPage - 1) * pageSize + 1}-
              {Math.min(safeCurrentPage * pageSize, filteredInventory.length)}
            </strong>{" "}
            of <strong className="text-[#2CE3C0]">{filteredInventory.length}</strong> assets
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Compact page buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <div key={p} className="flex items-center">
                    {showEllipsis && <span className="px-1 text-neutral-600 font-mono">…</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        safeCurrentPage === p
                          ? "bg-[#2CE3C0] text-black font-bold shadow-[0_0_10px_rgba(44,227,192,0.3)]"
                          : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                );
              })}

            <button
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
