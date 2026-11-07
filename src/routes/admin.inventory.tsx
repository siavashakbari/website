import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Layers,
  Search,
  Filter,
  Sparkles,
  Lock,
  Unlock,
  Check,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
} from "lucide-react";
import {
  getMergedPhotoInventory,
  savePhotoInventoryItem,
  saveBulkPhotoInventory,
  getStudioProjects,
  type StudioProjectItem,
} from "@/lib/studio-store";
import {
  PHOTO_INVENTORY,
  computeItemSeoSlug,
  type PhotoInventoryItem,
} from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import {
  DISCIPLINE_ROLE_MATRIX,
  DISCIPLINE_QUICK_TAGS,
  type CreditEntry,
  type DisciplineSlug,
} from "@/types/portfolio-schema";
import {
  generateAssetCode,
  generateSeoSlug,
  generateAltText,
  generateAssetMetadata,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminAssetVaultView,
});

const DISCIPLINES_LIST = [
  { slug: "all", label: "All Disciplines" },
  { slug: "fashion-photography", label: "Fashion Photography", code: "FASH" },
  { slug: "food-photography", label: "Food Photography", code: "FOOD" },
  { slug: "portrait-photography", label: "Portrait Photography", code: "PORT" },
  { slug: "product-photography", label: "Product Photography", code: "PROD" },
  { slug: "visual-identity", label: "Visual Identity", code: "VIDN" },
  { slug: "book-covers", label: "Book Covers", code: "BOOK" },
  { slug: "posters", label: "Posters", code: "POST" },
  { slug: "videos", label: "Videos", code: "VIDO" },
];

function AdminAssetVaultView() {
  const [items, setItems] = useState<PhotoInventoryItem[]>([]);
  const [projects, setProjects] = useState<StudioProjectItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [lockedCodes, setLockedCodes] = useState<Set<string>>(new Set());
  const [showAllTags, setShowAllTags] = useState<Record<string, boolean>>({});
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Bulk Edit Modal / Bar State
  const [bulkProject, setBulkProject] = useState("");
  const [bulkYear, setBulkYear] = useState("");
  const [bulkSubDiscipline, setBulkSubDiscipline] = useState("");
  const [bulkClient, setBulkClient] = useState("");

  useEffect(() => {
    setItems(getMergedPhotoInventory());
    setProjects(getStudioProjects());
  }, []);

  const triggerSaveNotification = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 2500);
  };

  // Collect all known names for autocomplete datalist (Model, Client, MUA, Assistant, Author, etc.)
  const autocompleteSuggestions = useMemo(() => {
    const clients = new Set<string>();
    const models = new Set<string>();
    const muas = new Set<string>();
    const assistants = new Set<string>();

    items.forEach((item) => {
      if (item.client?.trim()) clients.add(item.client.trim());
      if (item.model?.trim()) models.add(item.model.trim());
      if (item.makeupArtist?.trim()) muas.add(item.makeupArtist.trim());
      if (item.assistant?.trim()) assistants.add(item.assistant.trim());
    });

    projects.forEach((proj) => {
      if (proj.client?.trim()) clients.add(proj.client.trim());
      if (proj.models?.trim()) models.add(proj.models.trim());
      if (proj.makeupArtist?.trim()) muas.add(proj.makeupArtist.trim());
      if (proj.assistant?.trim()) assistants.add(proj.assistant.trim());
    });

    return {
      clients: Array.from(clients).sort(),
      models: Array.from(models).sort(),
      muas: Array.from(muas).sort(),
      assistants: Array.from(assistants).sort(),
    };
  }, [items, projects]);

  // Unique project names for filter dropdown
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.project?.trim()) set.add(i.project.trim());
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.project.toLowerCase().includes(q) ||
        (item.subdiscipline && item.subdiscipline.toLowerCase().includes(q)) ||
        (item.client && item.client.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q));

      const matchDisc =
        selectedDiscipline === "all" ||
        item.disciplineSlug === selectedDiscipline ||
        (selectedDiscipline === "videos" && item.disciplineSlug === "video");

      const matchProj = selectedProject === "all" || item.project === selectedProject;

      return matchSearch && matchDisc && matchProj;
    });
  }, [items, searchQuery, selectedDiscipline, selectedProject]);

  // Selection toggle
  const toggleSelectCode = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedCodes.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(filteredItems.map((i) => i.code)));
    }
  };

  // Toggle code lock
  const toggleLock = (code: string) => {
    setLockedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Handle single item field update
  const handleItemChange = (code: string, updates: Partial<PhotoInventoryItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.code !== code) return i;
        const updated = { ...i, ...updates };

        // Auto-recalculate SEO Slug if not locked
        if (!lockedCodes.has(code) && (updates.project || updates.subdiscipline)) {
          updated.seoSlug = computeItemSeoSlug(updated);
        }

        return updated;
      })
    );

    savePhotoInventoryItem({ code, ...updates });
  };

  // One-Click Auto-Generate SEO & Alt Text for a single item
  const handleAutoGenerateItemSeo = (item: PhotoInventoryItem) => {
    const seqMatch = item.code.match(/(\d+)$/);
    const seq = seqMatch ? seqMatch[1] : "01";

    const altText = generateAltText({
      projectTitle: item.project,
      subDiscipline: item.subdiscipline,
      disciplineLabel: item.discipline,
      client: item.client,
      model: item.model,
      year: item.date,
      assetCode: item.code,
    });

    const meta = generateAssetMetadata({
      projectTitle: item.project,
      sequenceNumber: seq,
      subDiscipline: item.subdiscipline,
      disciplineLabel: item.discipline,
      year: item.date,
      assetCode: item.code,
      client: item.client,
      creditsSummary: [item.model && `Model: ${item.model}`, item.makeupArtist && `MUA: ${item.makeupArtist}`]
        .filter(Boolean)
        .join(", "),
    });

    const seoSlug = computeItemSeoSlug(item);

    const updates: Partial<PhotoInventoryItem> = {
      seoSlug,
      altText,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      keywords: meta.keywords.join(", "),
    };

    handleItemChange(item.code, updates);
    triggerSaveNotification(`Generated SEO metadata for ${item.code}`);
  };

  // Bulk Apply Actions
  const handleBulkApply = () => {
    if (selectedCodes.size === 0) return;

    const updatesMap: Record<string, Partial<PhotoInventoryItem>> = {};
    const updatedItems = items.map((item) => {
      if (!selectedCodes.has(item.code)) return item;

      const patch: Partial<PhotoInventoryItem> = {};
      if (bulkProject.trim()) patch.project = bulkProject.trim();
      if (bulkYear.trim()) patch.date = bulkYear.trim();
      if (bulkSubDiscipline.trim()) patch.subdiscipline = bulkSubDiscipline.trim();
      if (bulkClient.trim()) patch.client = bulkClient.trim();

      const updated = { ...item, ...patch };
      if (patch.project || patch.subdiscipline) {
        updated.seoSlug = computeItemSeoSlug(updated);
      }

      updatesMap[item.code] = patch;
      return updated;
    });

    setItems(updatedItems);
    saveBulkPhotoInventory(updatesMap);
    triggerSaveNotification(`Bulk updated ${selectedCodes.size} assets`);
    setSelectedCodes(new Set());
  };

  // Bulk Regenerate SEO for all selected
  const handleBulkRegenerateSeo = () => {
    if (selectedCodes.size === 0) return;

    const updatesMap: Record<string, Partial<PhotoInventoryItem>> = {};
    const updatedItems = items.map((item) => {
      if (!selectedCodes.has(item.code)) return item;

      const seqMatch = item.code.match(/(\d+)$/);
      const seq = seqMatch ? seqMatch[1] : "01";

      const altText = generateAltText({
        projectTitle: item.project,
        subDiscipline: item.subdiscipline,
        disciplineLabel: item.discipline,
        client: item.client,
        model: item.model,
        year: item.date,
        assetCode: item.code,
      });

      const meta = generateAssetMetadata({
        projectTitle: item.project,
        sequenceNumber: seq,
        subDiscipline: item.subdiscipline,
        disciplineLabel: item.discipline,
        year: item.date,
        assetCode: item.code,
        client: item.client,
        creditsSummary: [item.model && `Model: ${item.model}`, item.makeupArtist && `MUA: ${item.makeupArtist}`]
          .filter(Boolean)
          .join(", "),
      });

      const seoSlug = computeItemSeoSlug(item);

      const patch: Partial<PhotoInventoryItem> = {
        seoSlug,
        altText,
        metaTitle: meta.metaTitle,
        metaDescription: meta.metaDescription,
        keywords: meta.keywords.join(", "),
      };

      updatesMap[item.code] = patch;
      return { ...item, ...patch };
    });

    setItems(updatedItems);
    saveBulkPhotoInventory(updatesMap);
    triggerSaveNotification(`Generated SEO & Alt-text for ${selectedCodes.size} assets`);
    setSelectedCodes(new Set());
  };

  // Quick-tag selection helper
  const handleToggleSubdisciplineTag = (item: PhotoInventoryItem, tag: string) => {
    let currentTags = (item.subdiscipline || "")
      .split(/[,/]/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (currentTags.includes(tag)) {
      currentTags = currentTags.filter((t) => t !== tag);
    } else {
      currentTags.push(tag);
    }

    const newSub = currentTags.join(", ");
    handleItemChange(item.code, { subdiscipline: newSub });
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Autocomplete Datalists */}
      <datalist id="client-suggestions">
        {autocompleteSuggestions.clients.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="model-suggestions">
        {autocompleteSuggestions.models.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="mua-suggestions">
        {autocompleteSuggestions.muas.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="assistant-suggestions">
        {autocompleteSuggestions.assistants.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Save Notification Banner */}
      {saveBanner && (
        <div className="fixed top-20 right-8 z-[200] bg-[#2CE3C0] text-black font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#2CE3C0] bg-[#2CE3C0]/10 border border-[#2CE3C0]/20 px-2 py-0.5 rounded">
              ARCHIVAL DAM
            </span>
            <span className="text-xs text-neutral-500">·</span>
            <Link
              to="/admin/projects"
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Switch to Case Study Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Asset Vault</span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full">
              {items.length} VISUAL ASSETS
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
            Manage granular visual assets, discipline-aware credits, project inheritance,
            auto-generated SKU codes (`SA-...`), and semantic SEO permalinks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm("Regenerate SEO & Alt Text for all 314+ assets in the vault?")) {
                const updatesMap: Record<string, Partial<PhotoInventoryItem>> = {};
                items.forEach((item) => {
                  const seqMatch = item.code.match(/(\d+)$/);
                  const seq = seqMatch ? seqMatch[1] : "01";
                  const altText = generateAltText({
                    projectTitle: item.project,
                    subDiscipline: item.subdiscipline,
                    disciplineLabel: item.discipline,
                    client: item.client,
                    model: item.model,
                    year: item.date,
                    assetCode: item.code,
                  });
                  const meta = generateAssetMetadata({
                    projectTitle: item.project,
                    sequenceNumber: seq,
                    subDiscipline: item.subdiscipline,
                    disciplineLabel: item.discipline,
                    year: item.date,
                    assetCode: item.code,
                    client: item.client,
                  });
                  updatesMap[item.code] = {
                    seoSlug: computeItemSeoSlug(item),
                    altText,
                    metaTitle: meta.metaTitle,
                    metaDescription: meta.metaDescription,
                    keywords: meta.keywords.join(", "),
                  };
                });
                saveBulkPhotoInventory(updatesMap);
                setItems(getMergedPhotoInventory());
                triggerSaveNotification("Successfully regenerated SEO for all 314+ assets!");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#2CE3C0] hover:text-black border border-white/10 hover:border-transparent text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2CE3C0] group-hover:text-black" />
            <span>⚡ Bulk Auto-SEO All 314+ Assets</span>
          </button>
        </div>
      </div>

      {/* Filters & Control Bar */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (SA-...), title, model, client, or sub-discipline..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#2CE3C0] transition-colors"
            />
          </div>

          {/* Discipline Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] transition-colors"
            >
              {DISCIPLINES_LIST.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] transition-colors"
            >
              <option value="all">All Projects ({uniqueProjects.length})</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter and Select All */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAllFiltered}
              className="text-[#2CE3C0] hover:underline flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <span>
                {selectedCodes.size === filteredItems.length && filteredItems.length > 0
                  ? "Deselect All"
                  : "Select All Filtered"}
              </span>
            </button>
            <span>·</span>
            <span>
              Showing <strong>{filteredItems.length}</strong> of {items.length} assets
            </span>
          </div>

          {selectedCodes.size > 0 && (
            <span className="text-[#2CE3C0] font-mono font-semibold">
              {selectedCodes.size} Selected
            </span>
          )}
        </div>
      </div>

      {/* Floating Bulk Actions Bar (Sticky at bottom when items are selected) */}
      {selectedCodes.size >= 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] bg-[#161616] border border-[#2CE3C0]/40 rounded-2xl p-4 shadow-2xl max-w-4xl w-[94%] flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-[#2CE3C0] text-black font-bold px-2.5 py-1 rounded-md">
              {selectedCodes.size} SELECTED
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="Assign Project"
                value={bulkProject}
                onChange={(e) => setBulkProject(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs w-28"
              />
              <input
                type="text"
                placeholder="Set Year"
                value={bulkYear}
                onChange={(e) => setBulkYear(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs w-20"
              />
              <input
                type="text"
                placeholder="Set Sub-Discipline"
                value={bulkSubDiscipline}
                onChange={(e) => setBulkSubDiscipline(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs w-32"
              />
              <input
                type="text"
                placeholder="Apply Client"
                value={bulkClient}
                onChange={(e) => setBulkClient(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs w-28"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApply}
              className="bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(44,227,192,0.3)]"
            >
              Apply to Selected
            </button>
            <button
              onClick={handleBulkRegenerateSeo}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2CE3C0]" />
              <span>Regenerate SEO</span>
            </button>
            <button
              onClick={() => setSelectedCodes(new Set())}
              className="p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Visual Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isSelected = selectedCodes.has(item.code);
          const isLocked = lockedCodes.has(item.code);
          const resolvedSrc = resolveInventoryImage(item.imgSrc);
          const seoSlug = item.seoSlug || computeItemSeoSlug(item);
          const publicUrl = `/${item.disciplineSlug}/${seoSlug}`;

          // Check if credits are inherited from project
          const parentProject = projects.find(
            (p) => p.title.toLowerCase() === item.project.toLowerCase()
          );

          // Get discipline quick tags
          const discTags =
            DISCIPLINE_QUICK_TAGS[item.disciplineSlug] ||
            DISCIPLINE_QUICK_TAGS["fashion-photography"];

          // Get role inputs for discipline
          const roleDef =
            DISCIPLINE_ROLE_MATRIX[item.disciplineSlug] ||
            DISCIPLINE_ROLE_MATRIX["fashion-photography"];

          const currentSubTags = (item.subdiscipline || "")
            .split(/[,/]/)
            .map((t) => t.trim())
            .filter(Boolean);

          const isShowingAllTags = showAllTags[item.code] || false;
          const displayTags = isShowingAllTags ? discTags : discTags.slice(0, 6);

          return (
            <div
              key={item.code}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-[#121212] ${
                isSelected
                  ? "border-[#2CE3C0] ring-1 ring-[#2CE3C0]/40 shadow-[0_0_20px_rgba(44,227,192,0.15)]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Card Header & Media Preview */}
              <div>
                <div className="relative aspect-[4/3] bg-black/60 overflow-hidden group flex items-center justify-center border-b border-white/10">
                  <img
                    src={resolvedSrc}
                    alt={item.code}
                    loading="lazy"
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Overlay Bar */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleSelectCode(item.code)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#2CE3C0] text-black shadow-[0_0_8px_rgba(44,227,192,0.4)]"
                          : "bg-black/60 text-white/40 border border-white/20 hover:border-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleLock(item.code)}
                        className={`p-1.5 rounded-md backdrop-blur-md transition-colors cursor-pointer ${
                          isLocked
                            ? "bg-[#FFD166] text-black"
                            : "bg-black/60 text-neutral-400 hover:text-white border border-white/20"
                        }`}
                        title={isLocked ? "Code & Slug are locked" : "Lock Code & Slug"}
                      >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-md bg-black/60 text-neutral-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors"
                        title="View Live Public Page"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Bottom Image Badge */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md text-[#2CE3C0] px-2 py-0.5 rounded border border-[#2CE3C0]/30 font-bold">
                      {item.code}
                    </span>
                    <span className="text-[10px] font-sans bg-black/80 backdrop-blur-md text-white/80 px-2 py-0.5 rounded border border-white/10">
                      {item.discipline}
                    </span>
                  </div>
                </div>

                {/* Form Inputs Inside Card */}
                <div className="p-4 space-y-4 text-xs">
                  {/* Row 1: Project Assignment & Year */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        Project / Series
                      </label>
                      <input
                        type="text"
                        value={item.project}
                        onChange={(e) => handleItemChange(item.code, { project: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={item.date || "2024"}
                        onChange={(e) => handleItemChange(item.code, { date: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                      />
                    </div>
                  </div>

                  {/* Project Inheritance Badge */}
                  {parentProject && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#2CE3C0]/10 border border-[#2CE3C0]/20 flex items-center justify-between text-[11px]">
                      <span className="text-[#2CE3C0] font-sans">
                        Inheriting from <strong>{parentProject.title}</strong>
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">Project Linked</span>
                    </div>
                  )}

                  {/* Row 2: Sub-Discipline Pills */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#FFD166]">
                        Sub-Discipline / Specialty
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowAllTags((prev) => ({ ...prev, [item.code]: !prev[item.code] }))
                        }
                        className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-0.5"
                      >
                        <span>{isShowingAllTags ? "Less" : "All"}</span>
                        {isShowingAllTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.subdiscipline || ""}
                      onChange={(e) =>
                        handleItemChange(item.code, { subdiscipline: e.target.value })
                      }
                      placeholder="e.g. Editorial, Furniture..."
                      className="w-full bg-black/50 border border-[#FFD166]/30 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FFD166] text-xs"
                    />

                    {/* Filtered Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {displayTags.map((tag) => {
                        const active = currentSubTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleSubdisciplineTag(item, tag)}
                            className={`text-[9.5px] px-2 py-0.5 rounded transition-all cursor-pointer ${
                              active
                                ? "bg-[#FFD166] text-black font-bold border border-[#FFD166]"
                                : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 3: Discipline-Specific Credit Roles */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Credits Matrix ({item.discipline})
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Client / Brand */}
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          {roleDef.primary[0] || "Client / Brand"}
                        </label>
                        <input
                          type="text"
                          list="client-suggestions"
                          value={item.client || ""}
                          onChange={(e) => handleItemChange(item.code, { client: e.target.value })}
                          placeholder={parentProject?.client || "Client Name"}
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>

                      {/* Primary Subject / Model */}
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          {roleDef.primary[1] || "Model(s) / Subject"}
                        </label>
                        <input
                          type="text"
                          list="model-suggestions"
                          value={item.model || ""}
                          onChange={(e) => handleItemChange(item.code, { model: e.target.value })}
                          placeholder={parentProject?.models || "Name"}
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>

                      {/* Role 3: Stylist / MUA */}
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          {roleDef.primary[2] || "MUA / Stylist"}
                        </label>
                        <input
                          type="text"
                          list="mua-suggestions"
                          value={item.makeupArtist || ""}
                          onChange={(e) =>
                            handleItemChange(item.code, { makeupArtist: e.target.value })
                          }
                          placeholder={parentProject?.makeupArtist || "Collaborator"}
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>

                      {/* Role 4: Assistant */}
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          {roleDef.primary[3] || "Assistant / Crew"}
                        </label>
                        <input
                          type="text"
                          list="assistant-suggestions"
                          value={item.assistant || ""}
                          onChange={(e) =>
                            handleItemChange(item.code, { assistant: e.target.value })
                          }
                          placeholder={parentProject?.assistant || "Assistant"}
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: SEO Slug & One-Click SEO Generator */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400">SEO Permaslug</span>
                      <button
                        type="button"
                        onClick={() => handleAutoGenerateItemSeo(item)}
                        className="text-[10px] text-[#2CE3C0] hover:underline flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-SEO</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10.5px] text-neutral-300 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 truncate">
                      /{item.disciplineSlug}/{seoSlug}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
