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
  Upload,
} from "lucide-react";
import {
  getMergedPhotoInventory,
  savePhotoInventoryItem,
  saveBulkPhotoInventory,
  getStudioProjects,
  saveStudioProject,
  getTaxonomyDisciplines,
  getTaxonomySpecialties,
  addCustomDiscipline,
  addCustomSpecialty,
  saveCustomPhotoAsset,
  type StudioProjectItem,
  type TaxonomyDiscipline,
  type TaxonomySpecialty,
} from "@/lib/studio-store";
import {
  PHOTO_INVENTORY,
  computeItemSeoSlug,
  type PhotoInventoryItem,
} from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { optimizeImageFile } from "@/lib/image-optimizer";
import {
  DISCIPLINE_ROLE_MATRIX,
  DISCIPLINE_QUICK_TAGS,
  type CreditEntry,
  type DisciplineSlug,
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
  component: AdminAssetVaultView,
});

const DISCIPLINES_LIST = [
  { slug: "all", label: "All Disciplines" },
  { slug: "photography", label: "Photography", code: "PHOT" },
  { slug: "graphic-design", label: "Graphic Design", code: "DSGN" },
  { slug: "video", label: "Video", code: "VIDO" },
];

function AdminAssetVaultView() {
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

  // Bulk Edit Modal / Bar State
  const [bulkProject, setBulkProject] = useState("");
  const [bulkYear, setBulkYear] = useState("");
  const [bulkSubDiscipline, setBulkSubDiscipline] = useState("");
  const [bulkClient, setBulkClient] = useState("");

  // Taxonomy states
  const [taxDisciplines, setTaxDisciplines] = useState<TaxonomyDiscipline[]>([]);
  const [taxSpecialties, setTaxSpecialties] = useState<TaxonomySpecialty[]>([]);

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
    setTaxDisciplines(getTaxonomyDisciplines());
    setTaxSpecialties(getTaxonomySpecialties());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (routeSearch?.query) {
      setSearchQuery(routeSearch.query);
    }
  }, [routeSearch?.query]);

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
        (item.standardCode && item.standardCode.toLowerCase().includes(q)) ||
        item.project.toLowerCase().includes(q) ||
        (item.subdiscipline && item.subdiscipline.toLowerCase().includes(q)) ||
        (item.client && item.client.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q));

      const matchDisc =
        selectedDiscipline === "all" ||
        normalizeDisciplineSlug(item.disciplineSlug) === normalizeDisciplineSlug(selectedDiscipline);

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
      });

      const patch: Partial<PhotoInventoryItem> = {
        seoSlug: computeItemSeoSlug(item),
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

  // File upload for import modal
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSaveImportedPhotos = () => {
    if (importFiles.length === 0 || !importProj.trim()) {
      alert("Please enter a project name and select at least one photo.");
      return;
    }

    const dSlug = normalizeDisciplineSlug(importDisc);
    const sSlug = normalizeSpecialtySlug(importSpec);
    const pSlug = normalizeProjectSlug(importProj);
    const pCode = getProject4Code(importProj);

    // Save project
    const existing = getStudioProjects().find((p) => normalizeProjectSlug(p.title) === pSlug);
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
        canonicalPath: buildPhotoUrl(dSlug, sSlug, pSlug, code),
      });
    });

    loadData();
    setShowImportModal(false);
    setImportFiles([]);
    setImportProj("");
    triggerSaveNotification(`Imported ${importFiles.length} photos with standard codes`);
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
      <datalist id="project-suggestions">
        {uniqueProjects.map((name) => (
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
            auto-generated SKU codes (`PHOT-FASH-...`), and semantic permalinks.
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

          <button
            onClick={() => {
              if (window.confirm("Regenerate SEO & Alt Text for all assets in the vault?")) {
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
                triggerSaveNotification("Successfully regenerated SEO for assets!");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#2CE3C0] hover:text-black border border-white/10 hover:border-transparent text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2CE3C0] group-hover:text-black" />
            <span>⚡ Bulk Auto-SEO</span>
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
              placeholder="Search by code (PHOT-FASH-...), title, model, client, or sub-discipline..."
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
          const discSlug = normalizeDisciplineSlug(item.disciplineSlug || item.discipline || "photography");
          const specSlug = normalizeSpecialtySlug(item.specialtySlug || item.subdiscipline || "fashion");
          const projSlug = normalizeProjectSlug(item.projectSlug || item.project || "project");
          const codeVal = item.standardCode || item.code;
          const publicUrl = item.canonicalPath || buildPhotoUrl(discSlug, specSlug, projSlug, codeVal);

          // Check if credits are inherited from project
          const parentProject = projects.find(
            (p) => p.title.toLowerCase() === item.project.toLowerCase(),
          );

          // Get discipline quick tags
          const discTags =
            DISCIPLINE_QUICK_TAGS[discSlug] ||
            DISCIPLINE_QUICK_TAGS["photography"] || [];

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
                  {/* Row 1: Project Assignment & Year */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        Project / Series
                      </label>
                      <input
                        type="text"
                        list="project-suggestions"
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
                        value={item.date || "2026"}
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
                          placeholder={parentProject?.models || "Name"}
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
                  </div>

                  {/* Row 4: SEO Slug & One-Click SEO Generator */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400">Canonical Path</span>
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

      {/* Import Photos Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#2CE3C0]" />
                <span>Import Photos to Project</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-neutral-400 hover:text-white">
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
                    placeholder="e.g. Fashion, Food"
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
                  placeholder="e.g. Sepidar"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Client</label>
                  <input
                    type="text"
                    value={importClientName}
                    onChange={(e) => setImportClientName(e.target.value)}
                    placeholder="Client"
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

              <label className="border border-dashed border-white/20 hover:border-[#2CE3C0] rounded-xl p-6 flex flex-col items-center justify-center gap-1 cursor-pointer bg-white/[0.02]">
                <Upload className="w-5 h-5 text-[#2CE3C0]" />
                <span className="text-white font-medium">Select Images to Import</span>
                <span className="text-neutral-500 text-[10px]">Auto-optimizes to standard portfolio resolution</span>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>

              {isImporting && <div className="text-center text-[#2CE3C0]">Optimizing images...</div>}

              {importFiles.length > 0 && (
                <div className="text-neutral-400 text-xs">
                  {importFiles.length} photos ready. Formula:{" "}
                  <code className="text-[#FFD166]">
                    {generate4PartPhotoCode(importDisc, importSpec, importProj || "PROJ", 1)}
                  </code>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button onClick={() => setShowImportModal(false)} className="px-3 py-1.5 text-neutral-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleSaveImportedPhotos}
                disabled={importFiles.length === 0 || !importProj.trim()}
                className="px-4 py-1.5 bg-[#2CE3C0] text-black font-bold rounded-lg cursor-pointer disabled:opacity-50"
              >
                Save & Register Photos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
