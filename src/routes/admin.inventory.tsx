import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  Upload,
  ArrowUp,
  ArrowDown,
  Tag,
  Sliders,
  FolderPlus,
} from "lucide-react";
import {
  getMergedPhotoInventory,
  savePhotoInventoryItem,
  saveBulkPhotoInventory,
  getStudioProjects,
  saveStudioProject,
  getTaxonomyDisciplines,
  getTaxonomySpecialties,
  saveCustomPhotoAsset,
  type StudioProjectItem,
  type TaxonomyDiscipline,
  type TaxonomySpecialty,
} from "@/lib/studio-store";
import {
  PHOTO_INVENTORY,
  computeItemSeoSlug,
  type PhotoInventoryItem,
  type CustomCreditField,
} from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { optimizeImageFile } from "@/lib/image-optimizer";
import {
  DISCIPLINE_ROLE_MATRIX,
  DISCIPLINE_QUICK_TAGS,
} from "@/types/portfolio-schema";
import {
  generate4PartPhotoCode,
  generateAltText,
  generateAssetMetadata,
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
  to4LetterCode,
  getProject4Code,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/admin/inventory")({
  validateSearch: (search: Record<string, unknown>) => ({
    query: (search.query as string) || "",
  }),
  component: AdminAssetsManagementView,
});

const CARDS_PER_PAGE = 32;

const DISCIPLINE_FILTER_OPTIONS = [
  { slug: "all", label: "All Disciplines" },
  { slug: "visual-identity", label: "Visual Identity" },
  { slug: "fashion-photography", label: "Fashion Photography" },
  { slug: "food-photography", label: "Food Photography" },
  { slug: "portrait-photography", label: "Portrait Photography" },
  { slug: "product-photography", label: "Product Photography" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "book-covers", label: "Book Covers" },
  { slug: "posters", label: "Posters" },
  { slug: "video", label: "Video & Motion" },
];

const CARD_DISCIPLINE_OPTIONS = [
  { slug: "visual-identity", label: "Visual Identity", disciplineSlug: "graphic-design", specialtySlug: "visual-identity" },
  { slug: "fashion-photography", label: "Fashion Photography", disciplineSlug: "photography", specialtySlug: "fashion" },
  { slug: "food-photography", label: "Food Photography", disciplineSlug: "photography", specialtySlug: "food" },
  { slug: "portrait-photography", label: "Portrait Photography", disciplineSlug: "photography", specialtySlug: "portrait" },
  { slug: "product-photography", label: "Product Photography", disciplineSlug: "photography", specialtySlug: "product" },
  { slug: "graphic-design", label: "Graphic Design", disciplineSlug: "graphic-design", specialtySlug: "visual-identity" },
  { slug: "book-covers", label: "Book Covers", disciplineSlug: "graphic-design", specialtySlug: "book-covers" },
  { slug: "posters", label: "Posters", disciplineSlug: "graphic-design", specialtySlug: "posters" },
  { slug: "video", label: "Video & Motion", disciplineSlug: "video", specialtySlug: "videos" },
];

const COMMON_CUSTOM_LABELS = [
  "Collaborator",
  "Art Director",
  "Stylist",
  "Fabric / Material",
  "Location / Studio",
  "Lighting",
  "Retoucher",
  "Set Designer",
  "Producer",
  "Agency",
];

function AdminAssetsManagementView() {
  const routeSearch = Route.useSearch();
  const [items, setItems] = useState<PhotoInventoryItem[]>([]);
  const [projects, setProjects] = useState<StudioProjectItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(routeSearch?.query || "");
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [lockedCodes, setLockedCodes] = useState<Set<string>>(new Set());
  const [showAllTags, setShowAllTags] = useState<Record<string, boolean>>({});
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);

  // Pagination State (32 items per page)
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk Edit Modal / Bar State
  const [bulkProject, setBulkProject] = useState("");
  const [bulkYear, setBulkYear] = useState("");
  const [bulkSubDiscipline, setBulkSubDiscipline] = useState("");
  const [bulkClient, setBulkClient] = useState("");

  // Direct Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDisc, setImportDisc] = useState("photography");
  const [importSpec, setImportSpec] = useState("fashion");
  const [importProj, setImportProj] = useState("");
  const [importClientName, setImportClientName] = useState("");
  const [importYearVal, setImportYearVal] = useState("2026");
  const [importModelName, setImportModelName] = useState("");
  const [importFiles, setImportFiles] = useState<{ url: string; name: string }[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const loadData = () => {
    setItems(getMergedPhotoInventory());
    setProjects(getStudioProjects());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (routeSearch?.query) {
      setSearchQuery(routeSearch.query);
    }
  }, [routeSearch?.query]);

  // Reset pagination to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDiscipline, selectedProject]);

  const triggerSaveNotification = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 2500);
  };

  // Autocomplete Suggestions for credits
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

  // Unique project names for project dropdown (deduplicated & alphabetized)
  const allProjectNames = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.title?.trim()) set.add(p.title.trim());
    });
    items.forEach((i) => {
      if (i.project?.trim()) set.add(i.project.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects, items]);

  // Reliable, high-performance Filtered Items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      // 1. Text Search query
      if (q) {
        const matchesQuery =
          item.code.toLowerCase().includes(q) ||
          (item.standardCode && item.standardCode.toLowerCase().includes(q)) ||
          item.project.toLowerCase().includes(q) ||
          (item.displayName && item.displayName.toLowerCase().includes(q)) ||
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.subdiscipline && item.subdiscipline.toLowerCase().includes(q)) ||
          (item.client && item.client.toLowerCase().includes(q)) ||
          (item.model && item.model.toLowerCase().includes(q)) ||
          (item.customFields &&
            item.customFields.some(
              (cf) =>
                cf.label.toLowerCase().includes(q) || cf.value.toLowerCase().includes(q),
            ));
        if (!matchesQuery) return false;
      }

      // 2. Discipline Filter
      if (selectedDiscipline !== "all") {
        const dSlug = normalizeDisciplineSlug(item.disciplineSlug || item.discipline || "").toLowerCase();
        const sSlug = normalizeSpecialtySlug(item.specialtySlug || item.subdiscipline || "").toLowerCase();
        const discRaw = (item.discipline || "").toLowerCase();
        const subRaw = (item.subdiscipline || "").toLowerCase();
        const target = selectedDiscipline.toLowerCase();

        let discMatch = false;
        if (target === "visual-identity") {
          discMatch =
            sSlug === "visual-identity" ||
            discRaw.includes("visual identity") ||
            subRaw.includes("identity") ||
            subRaw.includes("branding");
        } else if (target === "fashion-photography") {
          discMatch = sSlug === "fashion" || discRaw.includes("fashion") || subRaw.includes("fashion");
        } else if (target === "food-photography") {
          discMatch = sSlug === "food" || discRaw.includes("food") || subRaw.includes("food");
        } else if (target === "portrait-photography") {
          discMatch = sSlug === "portrait" || discRaw.includes("portrait") || subRaw.includes("portrait");
        } else if (target === "product-photography") {
          discMatch = sSlug === "product" || discRaw.includes("product") || subRaw.includes("product");
        } else if (target === "book-covers") {
          discMatch = sSlug === "book-covers" || discRaw.includes("book") || subRaw.includes("book");
        } else if (target === "posters") {
          discMatch = sSlug === "posters" || discRaw.includes("poster") || subRaw.includes("poster");
        } else if (target === "video") {
          discMatch =
            dSlug === "video" || sSlug === "videos" || discRaw.includes("video") || discRaw.includes("motion");
        } else if (target === "graphic-design") {
          discMatch = dSlug === "graphic-design" || discRaw.includes("graphic");
        } else {
          discMatch = dSlug === target || sSlug === target;
        }

        if (!discMatch) return false;
      }

      // 3. Project Filter
      if (selectedProject !== "all") {
        const itemProjSlug = normalizeProjectSlug(item.projectSlug || item.project || "");
        const targetProjSlug = normalizeProjectSlug(selectedProject);
        if (item.project !== selectedProject && itemProjSlug !== targetProjSlug) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedDiscipline, selectedProject]);

  // Total pages and Paginated Items (Strictly 32 cards per page)
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / CARDS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * CARDS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [filteredItems, safeCurrentPage]);

  const goToPage = (pageNumber: number) => {
    const target = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(target);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

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

  const selectAllOnCurrentPage = () => {
    const currentCodes = paginatedItems.map((i) => i.code);
    const allSelected = currentCodes.every((c) => selectedCodes.has(c));

    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        currentCodes.forEach((c) => next.delete(c));
      } else {
        currentCodes.forEach((c) => next.add(c));
      }
      return next;
    });
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
        if (i.code !== code && i.standardCode !== code) return i;
        const updated = { ...i, ...updates };
        if (!lockedCodes.has(code) && (updates.project || updates.subdiscipline)) {
          updated.seoSlug = computeItemSeoSlug(updated);
        }
        return updated;
      }),
    );

    savePhotoInventoryItem({ code, ...updates });
  };

  // Handle linking to a project
  const handleLinkProject = (code: string, projectName: string) => {
    const pSlug = normalizeProjectSlug(projectName);
    const matchedProject = projects.find(
      (p) => normalizeProjectSlug(p.title) === pSlug || p.id === pSlug,
    );

    const patch: Partial<PhotoInventoryItem> = {
      project: projectName.trim(),
      projectSlug: pSlug,
    };

    if (matchedProject) {
      if (matchedProject.client) patch.client = matchedProject.client;
      if (matchedProject.year) patch.date = String(matchedProject.year);
      if (matchedProject.models) {
        patch.model = Array.isArray(matchedProject.models)
          ? matchedProject.models.join(", ")
          : matchedProject.models;
      }
      if (matchedProject.makeupArtist) patch.makeupArtist = matchedProject.makeupArtist;
      if (matchedProject.assistant) patch.assistant = matchedProject.assistant;
    }

    handleItemChange(code, patch);
    triggerSaveNotification(`Linked ${code} to ${projectName}`);
  };

  // Handle changing discipline on a card
  const handleSelectDiscipline = (code: string, discSlug: string) => {
    const opt = CARD_DISCIPLINE_OPTIONS.find((o) => o.slug === discSlug);
    if (!opt) return;

    const patch: Partial<PhotoInventoryItem> = {
      discipline: opt.label,
      disciplineSlug: opt.disciplineSlug,
      specialtySlug: opt.specialtySlug,
    };
    handleItemChange(code, patch);
    triggerSaveNotification(`Updated ${code} discipline to ${opt.label}`);
  };

  // Add custom card data field
  const handleAddCustomField = (code: string) => {
    const item = items.find((i) => i.code === code || i.standardCode === code);
    const existing = item?.customFields || [];
    const newField: CustomCreditField = {
      id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "Collaborator",
      value: "",
    };
    const updated = [...existing, newField];
    handleItemChange(code, { customFields: updated });
  };

  const handleUpdateCustomField = (
    code: string,
    fieldId: string,
    updates: Partial<CustomCreditField>,
  ) => {
    const item = items.find((i) => i.code === code || i.standardCode === code);
    const existing = item?.customFields || [];
    const updated = existing.map((f) => (f.id === fieldId ? { ...f, ...updates } : f));
    handleItemChange(code, { customFields: updated });
  };

  const handleRemoveCustomField = (code: string, fieldId: string) => {
    const item = items.find((i) => i.code === code || i.standardCode === code);
    const existing = item?.customFields || [];
    const updated = existing.filter((f) => f.id !== fieldId);
    handleItemChange(code, { customFields: updated });
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
      creditsSummary: [
        item.model && `Model: ${item.model}`,
        item.makeupArtist && `MUA: ${item.makeupArtist}`,
        ...(item.customFields || []).map((cf) => `${cf.label}: ${cf.value}`),
      ]
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
      if (bulkProject.trim()) {
        patch.project = bulkProject.trim();
        patch.projectSlug = normalizeProjectSlug(bulkProject.trim());
      }
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

  // Smooth scroll to card
  const scrollToCard = (code: string) => {
    setHighlightedCode(code);
    const element = document.getElementById(`asset-card-${code}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightedCode(null), 3000);
  };

  return (
    <div className="space-y-8 pb-32 relative">
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
      <datalist id="project-suggestions">
        {allProjectNames.map((name) => (
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

      {/* Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FFD166] bg-[#FFD166]/10 border border-[#FFD166]/20 px-2 py-0.5 rounded">
              ASSETS REPOSITORY
            </span>
            <span className="text-xs text-neutral-500">·</span>
            <Link
              to="/admin/projects"
              className="text-xs text-neutral-400 hover:text-[#2CE3C0] flex items-center gap-1 transition-colors"
            >
              <span>Switch to Projects Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Assets Management</span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full">
              {items.length} TOTAL ASSETS
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
            Manage all assets on your website: link assets to showcase projects, assign custom display
            names, configure disciplines (e.g. Visual Identity), and add card-specific custom metadata.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(44,227,192,0.3)]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Import Photos</span>
          </button>

          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#2CE3C0]" />
            <span>Projects Page</span>
          </Link>
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
              placeholder="Search by display name, code (PHOT-FASH-...), project, model, client, or custom data..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#2CE3C0] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Discipline Filter Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] transition-colors"
            >
              {DISCIPLINE_FILTER_OPTIONS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0] transition-colors"
            >
              <option value="all">All Projects ({allProjectNames.length})</option>
              {allProjectNames.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Bar, Selection & Pagination Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={selectAllOnCurrentPage}
              className="text-[#2CE3C0] hover:underline flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <span>
                {paginatedItems.every((i) => selectedCodes.has(i.code)) && paginatedItems.length > 0
                  ? "Deselect Page"
                  : "Select Page (32)"}
              </span>
            </button>
            <span>·</span>
            <span>
              Showing{" "}
              <strong className="text-white">
                {filteredItems.length === 0 ? 0 : (safeCurrentPage - 1) * CARDS_PER_PAGE + 1}–
                {Math.min(safeCurrentPage * CARDS_PER_PAGE, filteredItems.length)}
              </strong>{" "}
              of <strong className="text-white">{filteredItems.length}</strong> filtered assets (32
              per page)
            </span>
          </div>

          {/* Quick Page Jump Controls */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-400">
              Page <strong className="text-[#2CE3C0]">{safeCurrentPage}</strong> of {totalPages}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => goToPage(safeCurrentPage - 1)}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => goToPage(safeCurrentPage + 1)}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
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
                list="project-suggestions"
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
              onClick={() => setSelectedCodes(new Set())}
              className="p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Visual Asset Cards Grid (Exactly 32 per page) */}
      {paginatedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center bg-[#141414]/50">
          <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-sm">No assets match your filter</h3>
          <p className="text-neutral-400 text-xs mt-1">
            Try resetting your search query, discipline, or project filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDiscipline("all");
              setSelectedProject("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item) => {
            const isSelected = selectedCodes.has(item.code);
            const isLocked = lockedCodes.has(item.code);
            const isHighlighted = highlightedCode === item.code;
            const resolvedSrc = resolveInventoryImage(item.imgSrc);
            const discSlug = normalizeDisciplineSlug(item.disciplineSlug || item.discipline || "photography");
            const specSlug = normalizeSpecialtySlug(item.specialtySlug || item.subdiscipline || "fashion");
            const projSlug = normalizeProjectSlug(item.projectSlug || item.project || "project");
            const codeVal = item.standardCode || item.code;
            const publicUrl = item.canonicalPath || buildPhotoUrl(discSlug, specSlug, projSlug, codeVal);

            // Check if linked to an existing Studio Project
            const parentProject = projects.find(
              (p) =>
                normalizeProjectSlug(p.title) === projSlug ||
                p.title.toLowerCase() === item.project.toLowerCase(),
            );

            // Get discipline quick tags
            const discTags =
              DISCIPLINE_QUICK_TAGS[discSlug] ||
              DISCIPLINE_QUICK_TAGS["fashion-photography"] ||
              [];

            // Get role inputs for discipline
            const roleDef =
              DISCIPLINE_ROLE_MATRIX[discSlug] ||
              DISCIPLINE_ROLE_MATRIX["fashion-photography"] || {
                primary: ["Client / Brand", "Model(s) / Subject", "MUA / Stylist", "Assistant / Crew"],
              };

            const currentSubTags = (item.subdiscipline || "")
              .split(/[,/]/)
              .map((t) => t.trim())
              .filter(Boolean);

            const isShowingAllTags = showAllTags[item.code] || false;
            const displayTags = isShowingAllTags ? discTags : discTags.slice(0, 6);

            return (
              <div
                key={item.code}
                id={`asset-card-${item.code}`}
                className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-[#121212] ${
                  isHighlighted
                    ? "border-[#2CE3C0] ring-2 ring-[#2CE3C0] shadow-[0_0_25px_rgba(44,227,192,0.3)] scale-[1.01]"
                    : isSelected
                      ? "border-[#2CE3C0] ring-1 ring-[#2CE3C0]/40 shadow-[0_0_20px_rgba(44,227,192,0.15)]"
                      : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Card Header & Media Preview */}
                <div>
                  <div className="relative aspect-[4/3] bg-black/60 overflow-hidden group flex items-center justify-center border-b border-white/10">
                    <img
                      src={resolvedSrc}
                      alt={item.displayName || item.code}
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
                          title="View Live Dedicated Photo Page"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Bottom Image Badge */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md text-[#2CE3C0] px-2 py-0.5 rounded border border-[#2CE3C0]/30 font-bold">
                        {codeVal}
                      </span>
                      <span className="text-[10px] font-sans bg-black/80 backdrop-blur-md text-white/80 px-2 py-0.5 rounded border border-white/10">
                        {item.discipline}
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs Inside Card */}
                  <div className="p-4 space-y-4 text-xs">
                    {/* FIELD 1: Photo Display Name (Separate from routing system) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                          Photo Display Name
                        </label>
                        <span className="text-[9.5px] text-neutral-500 font-mono">Public Title</span>
                      </div>
                      <input
                        type="text"
                        value={item.displayName ?? item.title ?? ""}
                        onChange={(e) => handleItemChange(item.code, { displayName: e.target.value })}
                        placeholder="e.g. Silk Movement Study — Frame 01"
                        className="w-full bg-black/50 border border-[#2CE3C0]/40 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-[#2CE3C0]"
                      />
                    </div>

                    {/* FIELD 2: Link to Project & Year */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-semibold mb-1">
                          Linked Project / Page
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            list="project-suggestions"
                            value={item.project}
                            onChange={(e) => handleLinkProject(item.code, e.target.value)}
                            placeholder="Select or type project..."
                            className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          value={item.date || "2026"}
                          onChange={(e) => handleItemChange(item.code, { date: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>
                    </div>

                    {/* Project Inheritance Badge */}
                    {parentProject && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#2CE3C0]/10 border border-[#2CE3C0]/20 flex items-center justify-between text-[11px]">
                        <span className="text-[#2CE3C0] font-sans truncate">
                          Linked to Project: <strong>{parentProject.title}</strong>
                        </span>
                        <a
                          href={`/${normalizeDisciplineSlug(parentProject.discipline)}/${normalizeSpecialtySlug(parentProject.subDiscipline || parentProject.category || "general")}/${normalizeProjectSlug(parentProject.title)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 shrink-0 ml-1"
                        >
                          <span>Route</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}

                    {/* FIELD 3: Discipline Box (Informs backend & routing: Visual Identity, Fashion, etc.) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#FFD166] font-bold">
                          Discipline (Visual Identity / Photography / Video)
                        </label>
                      </div>
                      <select
                        value={
                          CARD_DISCIPLINE_OPTIONS.find(
                            (o) =>
                              o.label.toLowerCase() === item.discipline.toLowerCase() ||
                              o.slug === item.disciplineSlug,
                          )?.slug || "fashion-photography"
                        }
                        onChange={(e) => handleSelectDiscipline(item.code, e.target.value)}
                        className="w-full bg-[#181818] border border-[#FFD166]/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD166]"
                      >
                        {CARD_DISCIPLINE_OPTIONS.map((opt) => (
                          <option key={opt.slug} value={opt.slug}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-Discipline Pills */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                          Specialty / Tags
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setShowAllTags((prev) => ({ ...prev, [item.code]: !prev[item.code] }))
                          }
                          className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-0.5"
                        >
                          <span>{isShowingAllTags ? "Less" : "All"}</span>
                          {isShowingAllTags ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.subdiscipline || ""}
                        onChange={(e) =>
                          handleItemChange(item.code, { subdiscipline: e.target.value })
                        }
                        placeholder="e.g. Editorial, Packaging, Brand System..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FFD166] text-xs"
                      />

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

                    {/* FIELD 4: Credits Matrix & Custom Card-Specific Data */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                          Credits Matrix
                        </span>
                        <span className="text-[9.5px] text-neutral-500 font-mono">
                          {item.discipline}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
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

                        <div>
                          <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                            {roleDef.primary[1] || "Model(s) / Subject"}
                          </label>
                          <input
                            type="text"
                            list="model-suggestions"
                            value={item.model || ""}
                            onChange={(e) => handleItemChange(item.code, { model: e.target.value })}
                            placeholder={
                              Array.isArray(parentProject?.models)
                                ? parentProject?.models.join(", ")
                                : parentProject?.models || "Name"
                            }
                            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                          />
                        </div>

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

                      {/* FIELD 5: Custom Card-Specific Metadata ("+ Add Data") */}
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                            Card-Specific Custom Fields
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddCustomField(item.code)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#2CE3C0] hover:underline bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 px-2 py-0.5 rounded cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Data</span>
                          </button>
                        </div>

                        {item.customFields && item.customFields.length > 0 ? (
                          <div className="space-y-1.5">
                            {item.customFields.map((cf) => (
                              <div key={cf.id} className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={cf.label}
                                  onChange={(e) =>
                                    handleUpdateCustomField(item.code, cf.id, {
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="Role / Label (e.g. Collaborator)"
                                  className="w-2/5 bg-black/60 border border-white/15 rounded px-2 py-1 text-[11px] text-[#2CE3C0]"
                                />
                                <input
                                  type="text"
                                  value={cf.value}
                                  onChange={(e) =>
                                    handleUpdateCustomField(item.code, cf.id, {
                                      value: e.target.value,
                                    })
                                  }
                                  placeholder="Name or details..."
                                  className="flex-1 bg-black/60 border border-white/15 rounded px-2 py-1 text-[11px] text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomField(item.code, cf.id)}
                                  className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Remove custom field"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-neutral-500 italic">
                            No custom metadata added yet. Click "+ Add Data" to add a collaborator,
                            specific fabric, location, or equipment note for this asset.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Canonical Path & SEO */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-400">Canonical Route</span>
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
                        {publicUrl}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM PAGINATION BAR */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div className="text-xs text-neutral-400 font-mono">
            Showing Page <strong className="text-white">{safeCurrentPage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong> ({filteredItems.length} assets total,
            32 per page)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={safeCurrentPage <= 1}
              onClick={() => goToPage(1)}
              className="p-2 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              disabled={safeCurrentPage <= 1}
              onClick={() => goToPage(safeCurrentPage - 1)}
              className="px-3 py-2 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  return Math.abs(p - safeCurrentPage) <= 2;
                })
                .map((p, idx, arr) => {
                  const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="text-neutral-600 px-1 font-mono text-xs">...</span>
                      )}
                      <button
                        onClick={() => goToPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-mono transition-all ${
                          safeCurrentPage === p
                            ? "bg-[#2CE3C0] text-black font-bold shadow-[0_0_10px_rgba(44,227,192,0.3)]"
                            : "text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              disabled={safeCurrentPage >= totalPages}
              onClick={() => goToPage(safeCurrentPage + 1)}
              className="px-3 py-2 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none text-xs flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={safeCurrentPage >= totalPages}
              onClick={() => goToPage(totalPages)}
              className="p-2 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Import Photos Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#2CE3C0]" />
                <span>Import Photos to Project</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Discipline</label>
                  <select
                    value={importDisc}
                    onChange={(e) => setImportDisc(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="photography">Photography</option>
                    <option value="visual-identity">Visual Identity</option>
                    <option value="graphic-design">Graphic Design</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={importSpec}
                    onChange={(e) => setImportSpec(e.target.value)}
                    placeholder="e.g. Fashion, Food, Visual Identity"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Project Name *</label>
                <input
                  type="text"
                  list="project-suggestions"
                  value={importProj}
                  onChange={(e) => setImportProj(e.target.value)}
                  placeholder="Select or enter project name (e.g. Atlasi)"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-neutral-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={importClientName}
                    onChange={(e) => setImportClientName(e.target.value)}
                    placeholder="Client or brand"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Year</label>
                  <input
                    type="text"
                    value={importYearVal}
                    onChange={(e) => setImportYearVal(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Select Images to Upload</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files) return;
                    setIsImporting(true);
                    const uploaded: { url: string; name: string }[] = [];
                    for (let i = 0; i < files.length; i++) {
                      try {
                        const opt = await optimizeImageFile(files[i]);
                        uploaded.push({ url: opt.url, name: files[i].name });
                      } catch (err) {
                        console.error(err);
                      }
                    }
                    setImportFiles((prev) => [...prev, ...uploaded]);
                    setIsImporting(false);
                  }}
                  className="w-full text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs hover:file:bg-[#2CE3C0] hover:file:text-black cursor-pointer"
                />
              </div>

              {importFiles.length > 0 && (
                <div className="text-[11px] text-neutral-300">
                  {importFiles.length} photos ready for import with auto 4-part SKU codes.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isImporting || importFiles.length === 0 || !importProj.trim()}
                onClick={() => {
                  if (importFiles.length === 0 || !importProj.trim()) return;
                  const dSlug = normalizeDisciplineSlug(importDisc);
                  const sSlug = normalizeSpecialtySlug(importSpec);
                  const pSlug = normalizeProjectSlug(importProj);
                  const pCode = getProject4Code(importProj);

                  // Create project if not exists
                  const existing = getStudioProjects().find(
                    (p) => normalizeProjectSlug(p.title) === pSlug,
                  );
                  if (!existing) {
                    saveStudioProject({
                      id: `proj-${Date.now()}-${pSlug}`,
                      title: importProj.trim(),
                      year: importYearVal.trim() || "2026",
                      discipline: dSlug,
                      category: importSpec,
                      subDiscipline: importSpec,
                      client: importClientName.trim() || undefined,
                      models: importModelName.trim() || undefined,
                      coverImage: importFiles[0]?.url || "",
                      description: `${importProj} portfolio gallery.`,
                      images: importFiles.map((f, i) => ({
                        id: `img-${Date.now()}-${i}`,
                        url: f.url,
                        alt: `${importProj} — ${i + 1}`,
                      })),
                      createdAt: new Date().toISOString(),
                    });
                  }

                  // Save photos
                  importFiles.forEach((file, idx) => {
                    const code = generate4PartPhotoCode(dSlug, sSlug, pCode, idx + 1);
                    saveCustomPhotoAsset({
                      code,
                      standardCode: code,
                      project: importProj.trim(),
                      projectSlug: pSlug,
                      discipline: importDisc,
                      disciplineSlug: dSlug,
                      specialtySlug: sSlug,
                      subdiscipline: importSpec,
                      imgSrc: file.url,
                      model: importModelName.trim(),
                      client: importClientName.trim(),
                      date: importYearVal.trim() || "2026",
                      caption: `${importProj} — photo series`,
                      title: `${importProj} — ${code}`,
                      displayName: `${importProj} — Frame ${String(idx + 1).padStart(2, "0")}`,
                      canonicalPath: buildPhotoUrl(dSlug, sSlug, pSlug, code),
                    });
                  });

                  loadData();
                  setShowImportModal(false);
                  setImportFiles([]);
                  setImportProj("");
                  triggerSaveNotification(
                    `Imported ${importFiles.length} photos into ${importProj}`,
                  );
                }}
                className="px-4 py-2 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black font-bold text-xs disabled:opacity-40"
              >
                {isImporting ? "Processing..." : "Complete Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
