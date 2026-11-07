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
  FolderPlus,
  Copy,
  Tag,
  Camera,
} from "lucide-react";
import {
  getMergedPhotoInventory,
  savePhotoInventoryItem,
  saveBulkPhotoInventory,
  deletePhotoInventoryItem,
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
  getDiscipline4Code,
  getSpecialty4Code,
  getProject4Code,
  to4LetterCode,
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
  buildProjectUrl,
  buildSpecialtyUrl,
  buildDisciplineUrl,
  generateAltText,
  generateAssetMetadata,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/admin/inventory")({
  validateSearch: (search: Record<string, unknown>) => ({
    query: (search.query as string) || "",
  }),
  component: AdminAssetVaultView,
});

function AdminAssetVaultView() {
  const routeSearch = Route.useSearch();
  const [items, setItems] = useState<PhotoInventoryItem[]>([]);
  const [projects, setProjects] = useState<StudioProjectItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(routeSearch?.query || "");
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [lockedCodes, setLockedCodes] = useState<Set<string>>(new Set());
  const [showAllTags, setShowAllTags] = useState<Record<string, boolean>>({});
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dynamic taxonomy state
  const [taxonomyDisciplines, setTaxonomyDisciplines] = useState<TaxonomyDiscipline[]>([]);
  const [taxonomySpecialties, setTaxonomySpecialties] = useState<TaxonomySpecialty[]>([]);

  // Modals for adding new taxonomy items
  const [showAddDiscModal, setShowAddDiscModal] = useState(false);
  const [newDiscName, setNewDiscName] = useState("");
  const [newDiscCode, setNewDiscCode] = useState("");

  const [showAddSpecModal, setShowAddSpecModal] = useState(false);
  const [newSpecDiscSlug, setNewSpecDiscSlug] = useState("photography");
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecCode, setNewSpecCode] = useState("");

  // Bulk Edit Modal / Bar State
  const [bulkProject, setBulkProject] = useState("");
  const [bulkYear, setBulkYear] = useState("");
  const [bulkSubDiscipline, setBulkSubDiscipline] = useState("");
  const [bulkClient, setBulkClient] = useState("");

  // Direct Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDiscipline, setImportDiscipline] = useState("photography");
  const [importSpecialty, setImportSpecialty] = useState("fashion");
  const [importProjectTitle, setImportProjectTitle] = useState("");
  const [importProjectCode, setImportProjectCode] = useState("");
  const [importClient, setImportClient] = useState("");
  const [importYear, setImportYear] = useState("2026");
  const [importModel, setImportModel] = useState("");
  const [importMua, setImportMua] = useState("");
  const [importAssistant, setImportAssistant] = useState("");
  const [importCaption, setImportCaption] = useState("");
  const [importFiles, setImportFiles] = useState<{ url: string; name: string }[]>([]);
  const [isImportOptimizing, setIsImportOptimizing] = useState(false);

  const loadData = () => {
    setItems(getMergedPhotoInventory());
    setProjects(getStudioProjects());
    setTaxonomyDisciplines(getTaxonomyDisciplines());
    setTaxonomySpecialties(getTaxonomySpecialties());
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
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Collect all known names for autocomplete datalist
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

  // Unique projects list
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.project?.trim()) set.add(i.project.trim());
    });
    projects.forEach((p) => {
      if (p.title?.trim()) set.add(p.title.trim());
    });
    return Array.from(set).sort();
  }, [items, projects]);

  // Specialties available for currently selected discipline filter
  const filteredSpecialtiesForFilter = useMemo(() => {
    if (selectedDiscipline === "all") return taxonomySpecialties;
    return taxonomySpecialties.filter(
      (s) => normalizeDisciplineSlug(s.disciplineSlug) === normalizeDisciplineSlug(selectedDiscipline),
    );
  }, [taxonomySpecialties, selectedDiscipline]);

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

      const discSlug = normalizeDisciplineSlug(item.disciplineSlug || item.discipline);
      const matchDisc =
        selectedDiscipline === "all" ||
        discSlug === normalizeDisciplineSlug(selectedDiscipline);

      const specSlug = normalizeSpecialtySlug(item.specialtySlug || item.subdiscipline || "");
      const matchSpec =
        selectedSpecialty === "all" ||
        specSlug === normalizeSpecialtySlug(selectedSpecialty);

      const matchProj = selectedProject === "all" || item.project === selectedProject;

      return matchSearch && matchDisc && matchSpec && matchProj;
    });
  }, [items, searchQuery, selectedDiscipline, selectedSpecialty, selectedProject]);

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
  const handleItemChange = (
    currentCode: string,
    updates: Partial<PhotoInventoryItem>,
    newCode?: string,
  ) => {
    const targetCode = newCode || updates.standardCode || currentCode;

    setItems((prev) =>
      prev.map((i) => {
        if (i.code !== currentCode && i.standardCode !== currentCode) return i;
        const updated = {
          ...i,
          ...updates,
          code: targetCode,
          standardCode: targetCode,
        };

        const disc = normalizeDisciplineSlug(updated.disciplineSlug || updated.discipline);
        const spec = normalizeSpecialtySlug(updated.specialtySlug || updated.subdiscipline || "fashion");
        const proj = normalizeProjectSlug(updated.projectSlug || updated.project || "project");
        updated.canonicalPath = buildPhotoUrl(disc, spec, proj, targetCode);

        return updated;
      }),
    );

    savePhotoInventoryItem(
      {
        ...updates,
        code: targetCode,
        standardCode: targetCode,
      },
      currentCode,
    );
  };

  // Regenerate standard 4-part code for an item
  const handleRegenerateItemCode = (item: PhotoInventoryItem) => {
    const discSlug = normalizeDisciplineSlug(item.disciplineSlug || item.discipline || "photography");
    const specSlug = normalizeSpecialtySlug(item.specialtySlug || item.subdiscipline || "fashion");
    const pCode = getProject4Code(item.project || "PROJ");

    // Extract sequence number from existing code if available
    const matchNum = item.code.match(/[-_](\d+)$/);
    const seq = matchNum ? parseInt(matchNum[1], 10) : 1;

    const newCode = generate4PartPhotoCode(discSlug, specSlug, pCode, seq);
    const projSlug = normalizeProjectSlug(item.project);
    const newPath = buildPhotoUrl(discSlug, specSlug, projSlug, newCode);

    handleItemChange(
      item.code,
      {
        code: newCode,
        standardCode: newCode,
        disciplineSlug: discSlug,
        specialtySlug: specSlug,
        projectSlug: projSlug,
        canonicalPath: newPath,
      },
      newCode,
    );

    triggerSaveNotification(`Updated code to ${newCode}`);
  };

  // Delete item from inventory
  const handleDeleteItem = (code: string, project: string) => {
    if (window.confirm(`Remove photo ${code} (${project}) from your portfolio inventory?`)) {
      deletePhotoInventoryItem(code);
      setItems(getMergedPhotoInventory());
      triggerSaveNotification(`Removed ${code}`);
    }
  };

  // Add new custom discipline
  const handleCreateDiscipline = () => {
    if (!newDiscName.trim()) return;
    const created = addCustomDiscipline(newDiscName.trim(), newDiscCode.trim() || undefined);
    setTaxonomyDisciplines(getTaxonomyDisciplines());
    setNewDiscName("");
    setNewDiscCode("");
    setShowAddDiscModal(false);
    triggerSaveNotification(`Created discipline: ${created.label} [${created.code}]`);
  };

  // Add new custom specialty
  const handleCreateSpecialty = () => {
    if (!newSpecName.trim()) return;
    const created = addCustomSpecialty(
      newSpecDiscSlug,
      newSpecName.trim(),
      newSpecCode.trim() || undefined,
    );
    setTaxonomySpecialties(getTaxonomySpecialties());
    setNewSpecName("");
    setNewSpecCode("");
    setShowAddSpecModal(false);
    triggerSaveNotification(`Created specialty: ${created.label} [${created.code}] under ${newSpecDiscSlug}`);
  };

  // Handle Photo Import File Selection
  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsImportOptimizing(true);
    const uploaded: { url: string; name: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const optimized = await optimizeImageFile(file);
        uploaded.push({ url: optimized.url, name: file.name });
      } catch (err) {
        console.error("Optimization failed for file", file.name, err);
      }
    }

    setImportFiles((prev) => [...prev, ...uploaded]);
    setIsImportOptimizing(false);
  };

  // Save imported photos to custom inventory
  const handleExecuteImport = () => {
    if (importFiles.length === 0) {
      alert("Please choose at least one photo to import.");
      return;
    }
    if (!importProjectTitle.trim()) {
      alert("Please provide a project name.");
      return;
    }

    const discSlug = normalizeDisciplineSlug(importDiscipline);
    const specSlug = normalizeSpecialtySlug(importSpecialty);
    const projSlug = normalizeProjectSlug(importProjectTitle);
    const pCode = importProjectCode ? to4LetterCode(importProjectCode) : getProject4Code(importProjectTitle);

    // 1. Ensure project exists in StudioProjects so the project page immediately exists
    const existingProjects = getStudioProjects();
    let currentProj = existingProjects.find(
      (p) => normalizeProjectSlug(p.title) === projSlug || p.id === projSlug,
    );

    if (!currentProj) {
      currentProj = {
        id: `proj-${Date.now()}-${projSlug}`,
        title: importProjectTitle.trim(),
        year: importYear.trim() || "2026",
        discipline: discSlug,
        category: importSpecialty,
        subDiscipline: importSpecialty,
        client: importClient.trim() || undefined,
        models: importModel.trim() || undefined,
        makeupArtist: importMua.trim() || undefined,
        assistant: importAssistant.trim() || undefined,
        coverImage: importFiles[0]?.url || "",
        description: importCaption.trim() || `${importProjectTitle} portfolio collection.`,
        caption: importCaption.trim() || undefined,
        images: importFiles.map((f, i) => ({
          id: `img-${Date.now()}-${i}`,
          url: f.url,
          alt: `${importProjectTitle} — Photo ${i + 1}`,
        })),
        createdAt: new Date().toISOString(),
      };
      saveStudioProject(currentProj);
    } else {
      // Append images to existing project
      const newImgs = importFiles.map((f, i) => ({
        id: `img-${Date.now()}-${i}`,
        url: f.url,
        alt: `${importProjectTitle} — Photo ${i + 1}`,
      }));
      currentProj.images = [...(currentProj.images || []), ...newImgs];
      saveStudioProject(currentProj);
    }

    // 2. Register every image into custom photo assets with the 4-part naming code PHOT-FASH-SEPI-0001
    importFiles.forEach((file, idx) => {
      const code = generate4PartPhotoCode(discSlug, specSlug, pCode, idx + 1);
      const canonicalPath = buildPhotoUrl(discSlug, specSlug, projSlug, code);

      const asset: PhotoInventoryItem = {
        code,
        standardCode: code,
        project: importProjectTitle.trim(),
        projectSlug: projSlug,
        discipline: importDiscipline,
        disciplineSlug: discSlug,
        specialtySlug: specSlug,
        subdiscipline: importSpecialty,
        imgSrc: file.url,
        model: importModel.trim(),
        client: importClient.trim(),
        makeupArtist: importMua.trim(),
        assistant: importAssistant.trim(),
        date: importYear.trim() || "2026",
        caption: importCaption.trim() || `${importProjectTitle} photo series`,
        title: `${importProjectTitle} — ${code}`,
        canonicalPath,
      };

      saveCustomPhotoAsset(asset);
    });

    // Refresh UI
    loadData();
    setIsImportModalOpen(false);
    setImportFiles([]);
    setImportProjectTitle("");
    setImportProjectCode("");
    triggerSaveNotification(
      `Successfully imported ${importFiles.length} photos with 4-part naming code [${to4LetterCode(discSlug)}-${to4LetterCode(specSlug)}-${pCode}-0001]!`,
    );
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
      updatesMap[item.code] = patch;
      return updated;
    });

    setItems(updatedItems);
    saveBulkPhotoInventory(updatesMap);
    triggerSaveNotification(`Bulk updated ${selectedCodes.size} assets`);
    setSelectedCodes(new Set());
  };

  // Bulk Regenerate 4-Part Standard Codes for all selected
  const handleBulkRegenerateCodes = () => {
    if (selectedCodes.size === 0) return;

    const projectCounter: Record<string, number> = {};
    const updatesMap: Record<string, Partial<PhotoInventoryItem>> = {};

    const updatedItems = items.map((item) => {
      if (!selectedCodes.has(item.code)) return item;

      const discSlug = normalizeDisciplineSlug(item.disciplineSlug || item.discipline || "photography");
      const specSlug = normalizeSpecialtySlug(item.specialtySlug || item.subdiscipline || "fashion");
      const projSlug = normalizeProjectSlug(item.project || "project");
      const pCode = getProject4Code(item.project);

      if (!projectCounter[projSlug]) projectCounter[projSlug] = 0;
      projectCounter[projSlug] += 1;
      const seq = projectCounter[projSlug];

      const newCode = generate4PartPhotoCode(discSlug, specSlug, pCode, seq);
      const canonicalPath = buildPhotoUrl(discSlug, specSlug, projSlug, newCode);

      const patch: Partial<PhotoInventoryItem> = {
        code: newCode,
        standardCode: newCode,
        disciplineSlug: discSlug,
        specialtySlug: specSlug,
        projectSlug: projSlug,
        canonicalPath,
      };

      updatesMap[item.code] = patch;
      return { ...item, ...patch };
    });

    setItems(updatedItems);
    saveBulkPhotoInventory(updatesMap);
    triggerSaveNotification(`Regenerated 4-part codes for ${selectedCodes.size} assets!`);
    setSelectedCodes(new Set());
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
        <div className="fixed top-20 right-8 z-[300] bg-[#2CE3C0] text-black font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Top Header & Actions */}
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
              <span>Manage Projects & Case Studies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Asset Vault</span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2.5 py-0.5 rounded-full font-bold">
              {items.length} VISUAL ASSETS
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
            Full control over the 4-part routing architecture:{" "}
            <code className="text-[#2CE3C0] font-mono font-bold">
              siavashakbari.ir/:discipline/:specialty/:project/:photoId
            </code>
            . Change disciplines, specialties, projects, or import new photos with automatic 4-letter formula code generation.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(44,227,192,0.3)]"
          >
            <Upload className="w-4 h-4" />
            <span>+ Import Photos to Vault</span>
          </button>

          <button
            onClick={() => setShowAddDiscModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#2CE3C0]" />
            <span>New Discipline</span>
          </button>

          <button
            onClick={() => setShowAddSpecModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>New Specialty</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code (PHOT-FASH-...), project, model, client..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#2CE3C0] transition-colors"
            />
          </div>

          {/* Discipline Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedDiscipline}
              onChange={(e) => {
                setSelectedDiscipline(e.target.value);
                setSelectedSpecialty("all");
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0] transition-colors"
            >
              <option value="all">All Disciplines ({taxonomyDisciplines.length})</option>
              {taxonomyDisciplines.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label} [{d.code}]
                </option>
              ))}
            </select>
          </div>

          {/* Specialty Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD166] transition-colors"
            >
              <option value="all">All Specialties ({filteredSpecialtiesForFilter.length})</option>
              {filteredSpecialtiesForFilter.map((s) => (
                <option key={`${s.disciplineSlug}-${s.slug}`} value={s.slug}>
                  {s.label} [{s.code}]
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0] transition-colors"
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
            <div className="flex items-center gap-2">
              <span className="text-[#2CE3C0] font-mono font-semibold">
                {selectedCodes.size} Selected
              </span>
            </div>
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
              Apply Updates
            </button>
            <button
              onClick={handleBulkRegenerateCodes}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 font-mono"
              title="Apply 4-part standard code [DISC]-[SPEC]-[PROJ]-[NUM] to selected"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>Regenerate 4-Part Codes</span>
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
          const liveUrl = buildPhotoUrl(discSlug, specSlug, projSlug, codeVal);

          // Find parent project for autocomplete / hints
          const parentProject = projects.find(
            (p) => normalizeProjectSlug(p.title) === projSlug,
          );

          // Get discipline quick tags
          const discTags =
            DISCIPLINE_QUICK_TAGS[discSlug] || DISCIPLINE_QUICK_TAGS["photography"] || [];
          const isShowingAllTags = showAllTags[item.code] || false;
          const displayTags = isShowingAllTags ? discTags : discTags.slice(0, 5);

          // Available specialties for this item's discipline
          const itemSpecialties = taxonomySpecialties.filter(
            (s) => normalizeDisciplineSlug(s.disciplineSlug) === discSlug,
          );

          return (
            <div
              key={item.code}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-[#121212] ${
                isSelected
                  ? "border-[#2CE3C0] ring-1 ring-[#2CE3C0]/40 shadow-[0_0_20px_rgba(44,227,192,0.15)]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Media Preview & Top Action Bar */}
              <div>
                <div className="relative aspect-[4/3] bg-black/60 overflow-hidden group flex items-center justify-center border-b border-white/10">
                  <img
                    src={resolvedSrc}
                    alt={codeVal}
                    loading="lazy"
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Bar inside preview */}
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
                        title={isLocked ? "Code is locked" : "Lock Code"}
                      >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-md bg-black/60 text-[#2CE3C0] hover:text-white hover:bg-[#2CE3C0]/30 border border-white/20 backdrop-blur-md transition-colors flex items-center gap-1 text-[10px] font-mono px-2"
                        title="Open Dedicated Live Photo Page"
                      >
                        <span>Live Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Bottom Image Badge with 4-Part Code */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono uppercase bg-black/85 backdrop-blur-md text-[#2CE3C0] px-2 py-0.5 rounded border border-[#2CE3C0]/40 font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {codeVal}
                    </span>
                    <span className="text-[10px] font-mono bg-black/85 backdrop-blur-md text-[#FFD166] px-2 py-0.5 rounded border border-[#FFD166]/30">
                      /{discSlug}/{specSlug}
                    </span>
                  </div>
                </div>

                {/* Form Inputs Inside Card */}
                <div className="p-4 space-y-4 text-xs">
                  {/* Taxonomy Block: Discipline, Specialty & Project */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Hierarchy (Discipline / Specialty / Project)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRegenerateItemCode(item)}
                        className="text-[10px] text-[#FFD166] hover:underline flex items-center gap-0.5 font-mono cursor-pointer"
                        title="Regenerate 4-part code based on chosen discipline, specialty, and project"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Sync Code</span>
                      </button>
                    </div>

                    {/* 1. Discipline Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                          1. Discipline
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddDiscModal(true);
                          }}
                          className="text-[9px] text-[#2CE3C0] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" /> + New
                        </button>
                      </div>
                      <select
                        value={discSlug}
                        onChange={(e) => {
                          const newD = e.target.value;
                          const relatedSpecs = taxonomySpecialties.filter(
                            (s) => normalizeDisciplineSlug(s.disciplineSlug) === newD,
                          );
                          const newS = relatedSpecs[0]?.slug || "general";
                          handleItemChange(item.code, {
                            disciplineSlug: newD,
                            discipline: newD,
                            specialtySlug: newS,
                          });
                        }}
                        className="w-full bg-[#181818] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                      >
                        {taxonomyDisciplines.map((d) => (
                          <option key={d.slug} value={d.slug}>
                            {d.label} [{d.code}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Specialty Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                          2. Specialty (under {discSlug})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewSpecDiscSlug(discSlug);
                            setShowAddSpecModal(true);
                          }}
                          className="text-[9px] text-[#FFD166] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" /> + New
                        </button>
                      </div>
                      <select
                        value={specSlug}
                        onChange={(e) => {
                          const newS = e.target.value;
                          handleItemChange(item.code, {
                            specialtySlug: newS,
                            subdiscipline: newS,
                          });
                        }}
                        className="w-full bg-[#181818] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD166]"
                      >
                        {itemSpecialties.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.label} [{s.code}]
                          </option>
                        ))}
                        {/* Fallback option if custom text */}
                        {!itemSpecialties.some((s) => s.slug === specSlug) && (
                          <option value={specSlug}>{specSlug} (custom)</option>
                        )}
                      </select>
                    </div>

                    {/* 3. Project Name & Code */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                          3. Project Name
                        </label>
                        <input
                          type="text"
                          list="project-suggestions"
                          value={item.project}
                          onChange={(e) => {
                            const newP = e.target.value;
                            handleItemChange(item.code, {
                              project: newP,
                              projectSlug: normalizeProjectSlug(newP),
                            });
                          }}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#2CE3C0]"
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
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#2CE3C0]"
                        />
                      </div>
                    </div>

                    {/* Live Canonical Path & Code formula */}
                    <div className="p-2 rounded bg-black/60 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">Formula Code:</span>
                        <span className="text-[#2CE3C0] font-bold">{codeVal}</span>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 truncate flex items-center justify-between">
                        <span className="truncate">{liveUrl}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(liveUrl)}
                          className="ml-1 text-neutral-400 hover:text-white"
                          title="Copy canonical path"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Credits Section */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Production Credits
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          Client / Brand
                        </label>
                        <input
                          type="text"
                          list="client-suggestions"
                          value={item.client || ""}
                          onChange={(e) => handleItemChange(item.code, { client: e.target.value })}
                          placeholder="Client Name"
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          Model(s) / Subject
                        </label>
                        <input
                          type="text"
                          list="model-suggestions"
                          value={item.model || ""}
                          onChange={(e) => handleItemChange(item.code, { model: e.target.value })}
                          placeholder="Model Name"
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          Makeup / Stylist
                        </label>
                        <input
                          type="text"
                          list="mua-suggestions"
                          value={item.makeupArtist || ""}
                          onChange={(e) =>
                            handleItemChange(item.code, { makeupArtist: e.target.value })
                          }
                          placeholder="MUA / Stylist"
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 truncate">
                          Assistant / Crew
                        </label>
                        <input
                          type="text"
                          list="assistant-suggestions"
                          value={item.assistant || ""}
                          onChange={(e) =>
                            handleItemChange(item.code, { assistant: e.target.value })
                          }
                          placeholder="Assistant"
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Caption / Context */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">
                      Editorial Caption / Story
                    </label>
                    <textarea
                      rows={2}
                      value={item.caption || ""}
                      onChange={(e) => handleItemChange(item.code, { caption: e.target.value })}
                      placeholder="Story behind this photo..."
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs leading-relaxed"
                    />
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleRegenerateItemCode(item)}
                      className="text-[10px] font-mono text-[#2CE3C0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Re-apply 4-Part Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.code, item.project)}
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer p-1"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* DIRECT PHOTO IMPORT MODAL                                           */}
      {/* =================================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[320] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Import Photos to Vault</span>
                  <span className="text-[10px] font-mono bg-[#2CE3C0]/15 text-[#2CE3C0] border border-[#2CE3C0]/30 px-2 py-0.5 rounded-full uppercase">
                    4-Part Routing Generator
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Select or create Discipline, Specialty, and Project. Uploaded photos will automatically receive sequential 4-letter naming codes.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Step 1: Discipline & Specialty */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                  Step 1 · Choose Routing Architecture
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Discipline */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-neutral-300 font-medium">Discipline *</label>
                      <button
                        type="button"
                        onClick={() => setShowAddDiscModal(true)}
                        className="text-[10px] text-[#2CE3C0] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> + New Discipline
                      </button>
                    </div>
                    <select
                      value={importDiscipline}
                      onChange={(e) => {
                        setImportDiscipline(e.target.value);
                        const specs = taxonomySpecialties.filter(
                          (s) => normalizeDisciplineSlug(s.disciplineSlug) === e.target.value,
                        );
                        if (specs[0]) setImportSpecialty(specs[0].slug);
                      }}
                      className="w-full bg-[#181818] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CE3C0]"
                    >
                      {taxonomyDisciplines.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.label} [{d.code}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specialty */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-neutral-300 font-medium">Specialty *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewSpecDiscSlug(importDiscipline);
                          setShowAddSpecModal(true);
                        }}
                        className="text-[10px] text-[#FFD166] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> + New Specialty
                      </button>
                    </div>
                    <select
                      value={importSpecialty}
                      onChange={(e) => setImportSpecialty(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD166]"
                    >
                      {taxonomySpecialties
                        .filter(
                          (s) =>
                            normalizeDisciplineSlug(s.disciplineSlug) ===
                            normalizeDisciplineSlug(importDiscipline),
                        )
                        .map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.label} [{s.code}]
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Project Title & 4-Letter Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-neutral-300 font-medium mb-1">
                      Project Title (e.g. Sepidar, Lookbook 2026) *
                    </label>
                    <input
                      type="text"
                      list="project-suggestions"
                      value={importProjectTitle}
                      onChange={(e) => setImportProjectTitle(e.target.value)}
                      placeholder="Project Name..."
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      4-Letter Code
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={importProjectCode}
                      onChange={(e) => setImportProjectCode(e.target.value.toUpperCase())}
                      placeholder={
                        importProjectTitle ? getProject4Code(importProjectTitle) : "SEPI"
                      }
                      className="w-full bg-black/50 border border-[#2CE3C0]/40 rounded-lg px-3 py-2 text-[#2CE3C0] font-mono text-xs uppercase font-bold focus:outline-none focus:border-[#2CE3C0]"
                    />
                  </div>
                </div>

                {/* Live Formula Preview */}
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 text-xs font-mono space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">
                    Formula Preview:
                  </div>
                  <div className="text-[#FFD166] font-bold">
                    {generate4PartPhotoCode(
                      importDiscipline,
                      importSpecialty,
                      importProjectCode || importProjectTitle || "PROJ",
                      1,
                    )}
                  </div>
                  <div className="text-neutral-400 text-[10px]">
                    URL: siavashakbari.ir/{normalizeDisciplineSlug(importDiscipline)}/{normalizeSpecialtySlug(importSpecialty)}/{normalizeProjectSlug(importProjectTitle || "project")}/[photoId]
                  </div>
                </div>
              </div>

              {/* Step 2: Shared Credits */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 font-bold">
                  Step 2 · Shared Credits & Metadata
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1">Year</label>
                    <input
                      type="text"
                      value={importYear}
                      onChange={(e) => setImportYear(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1">Client</label>
                    <input
                      type="text"
                      list="client-suggestions"
                      value={importClient}
                      onChange={(e) => setImportClient(e.target.value)}
                      placeholder="Brand / Client"
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1">Model(s)</label>
                    <input
                      type="text"
                      list="model-suggestions"
                      value={importModel}
                      onChange={(e) => setImportModel(e.target.value)}
                      placeholder="Model Name"
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1">Makeup Artist</label>
                    <input
                      type="text"
                      list="mua-suggestions"
                      value={importMua}
                      onChange={(e) => setImportMua(e.target.value)}
                      placeholder="MUA"
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">Caption / Story</label>
                  <input
                    type="text"
                    value={importCaption}
                    onChange={(e) => setImportCaption(e.target.value)}
                    placeholder="Editorial concept or project description..."
                    className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
              </div>

              {/* Step 3: Photo Upload & Previews */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#2CE3C0] font-bold">
                  Step 3 · Upload Photos ({importFiles.length} selected)
                </div>

                <label className="border-2 border-dashed border-white/20 hover:border-[#2CE3C0] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/[0.02]">
                  <Upload className="w-7 h-7 text-[#2CE3C0]" />
                  <div className="text-center">
                    <span className="font-semibold text-white">Click to select photos for import</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Photos will be optimized to 2000px max edge and assigned sequential 4-part codes.
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImportFiles}
                    className="hidden"
                  />
                </label>

                {isImportOptimizing && (
                  <div className="p-2.5 rounded-lg bg-[#2CE3C0]/10 border border-[#2CE3C0]/30 text-[#2CE3C0] text-center text-xs animate-pulse">
                    ⚡ Auto-optimizing photo sizes...
                  </div>
                )}

                {/* Preview of Imported Files */}
                {importFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {importFiles.map((f, i) => {
                      const pCode = importProjectCode
                        ? to4LetterCode(importProjectCode)
                        : getProject4Code(importProjectTitle || "PROJ");
                      const photoCode = generate4PartPhotoCode(
                        importDiscipline,
                        importSpecialty,
                        pCode,
                        i + 1,
                      );
                      return (
                        <div
                          key={i}
                          className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black group"
                        >
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1.5 inset-x-1.5 bg-black/85 backdrop-blur-md text-[#2CE3C0] font-mono text-[9px] px-1 py-0.5 rounded text-center font-bold border border-[#2CE3C0]/30 truncate">
                            {photoCode}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setImportFiles((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="absolute top-1.5 right-1.5 p-1 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#161616]">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importFiles.length === 0 || !importProjectTitle.trim()}
                className="px-6 py-2 rounded-xl bg-[#2CE3C0] hover:bg-[#2CE3C0]/90 text-black font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(44,227,192,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save to Vault & Register ({importFiles.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* QUICK ADD DISCIPLINE MODAL                                          */}
      {/* =================================================================== */}
      {showAddDiscModal && (
        <div className="fixed inset-0 z-[330] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/20 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#2CE3C0]" />
                <span>Create New Discipline</span>
              </h3>
              <button
                onClick={() => setShowAddDiscModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Discipline Title (e.g. Architecture) *
                </label>
                <input
                  type="text"
                  value={newDiscName}
                  onChange={(e) => setNewDiscName(e.target.value)}
                  placeholder="e.g. Architecture"
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  4-Letter Code *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newDiscCode}
                  onChange={(e) => setNewDiscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ARCH"
                  className="w-full bg-black/60 border border-[#2CE3C0]/40 rounded-lg px-3 py-2 text-[#2CE3C0] font-mono text-xs uppercase font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowAddDiscModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDiscipline}
                className="px-4 py-1.5 bg-[#2CE3C0] text-black font-bold text-xs rounded-lg cursor-pointer"
              >
                Create Discipline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* QUICK ADD SPECIALTY MODAL                                           */}
      {/* =================================================================== */}
      {showAddSpecModal && (
        <div className="fixed inset-0 z-[330] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/20 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#FFD166]" />
                <span>Create New Specialty</span>
              </h3>
              <button
                onClick={() => setShowAddSpecModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Under Discipline *
                </label>
                <select
                  value={newSpecDiscSlug}
                  onChange={(e) => setNewSpecDiscSlug(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  {taxonomyDisciplines.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.label} [{d.code}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Specialty Title (e.g. Lookbook, Packaging) *
                </label>
                <input
                  type="text"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  placeholder="e.g. Lookbook"
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  4-Letter Code *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newSpecCode}
                  onChange={(e) => setNewSpecCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LOOK"
                  className="w-full bg-black/60 border border-[#FFD166]/40 rounded-lg px-3 py-2 text-[#FFD166] font-mono text-xs uppercase font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowAddSpecModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpecialty}
                className="px-4 py-1.5 bg-[#FFD166] text-black font-bold text-xs rounded-lg cursor-pointer"
              >
                Create Specialty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
