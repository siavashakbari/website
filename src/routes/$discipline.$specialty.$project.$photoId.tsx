import { useEffect, useState, useMemo } from "react";
import { createFileRoute, notFound, rootRouteId, useRouter, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  ExternalLink,
  Edit,
  Share2,
  Check,
  Calendar,
  Layers,
  Camera,
  User,
} from "lucide-react";
import {
  getPhotoItemBySlugOrCode,
  getPhotosByProject,
  getStudioProjects,
  type PhotoInventoryItem,
} from "@/lib/studio-store";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { pageHead, jsonLdScript, visualAssetJsonLd, absoluteUrl } from "@/lib/seo";
import { projects } from "@/data/projects";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
  buildProjectUrl,
  buildSpecialtyUrl,
  buildDisciplineUrl,
} from "@/lib/taxonomy";
import type { VisualAsset } from "@/types/portfolio-schema";

export const Route = createFileRoute("/$discipline/$specialty/$project/$photoId")({
  loader: ({ params }) => {
    const disciplineSlug = normalizeDisciplineSlug(params.discipline);
    const specialtySlug = normalizeSpecialtySlug(params.specialty);
    const projectSlug = normalizeProjectSlug(params.project);
    const rawPhotoId = params.photoId.trim();

    // Find photo in merged inventory
    const photo = getPhotoItemBySlugOrCode(
      rawPhotoId,
      disciplineSlug,
      specialtySlug,
      projectSlug,
    );

    if (!photo) {
      throw notFound({ routeId: rootRouteId });
    }

    // Resolve project details from Studio Projects or default projects
    const allProjects = getStudioProjects();
    const parentProject =
      allProjects.find((p) => normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug) ||
      projects.find((p) => normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug);

    // Merge metadata
    const client = photo.client || parentProject?.client || "";
    const model =
      photo.model ||
      (parentProject
        ? Array.isArray(parentProject.models)
          ? parentProject.models.join(", ")
          : parentProject.models
        : "") ||
      "";
    const makeupArtist = photo.makeupArtist || parentProject?.makeupArtist || "";
    const assistant = photo.assistant || parentProject?.assistant || "";
    const stylist = parentProject?.stylist || "";
    const location = parentProject?.location || "";
    const year = photo.date || parentProject?.year || "2024";

    const resolvedPhoto: PhotoInventoryItem = {
      ...photo,
      client,
      model,
      makeupArtist,
      assistant,
      date: String(year),
      subdiscipline: photo.subdiscipline || parentProject?.subDiscipline || parentProject?.category || "",
      caption: photo.caption || parentProject?.caption || parentProject?.description || "",
    };

    // Resolve high-res image
    const resolvedImage = resolveInventoryImage(resolvedPhoto.imgSrc);

    // Get sibling photos in this project for next/previous navigation
    const projectPhotos = getPhotosByProject(projectSlug);
    const currentIndex = projectPhotos.findIndex(
      (p) =>
        p.code.toUpperCase() === resolvedPhoto.code.toUpperCase() ||
        (p.standardCode && p.standardCode.toUpperCase() === resolvedPhoto.code.toUpperCase()),
    );

    const prevPhoto = currentIndex > 0 ? projectPhotos[currentIndex - 1] : null;
    const nextPhoto =
      currentIndex >= 0 && currentIndex < projectPhotos.length - 1
        ? projectPhotos[currentIndex + 1]
        : null;

    return {
      disciplineSlug,
      specialtySlug,
      projectSlug,
      photo: resolvedPhoto,
      resolvedImage,
      parentProject,
      prevPhoto,
      nextPhoto,
      currentIndex: currentIndex >= 0 ? currentIndex + 1 : 1,
      totalPhotos: projectPhotos.length || 1,
    };
  },
  head: ({ loaderData }) => {
    const photo = loaderData?.photo;
    const photoCode = photo?.code || "PHOTO";
    const projectTitle = photo?.project || "Project";
    const title = `${photoCode} — ${projectTitle} | Siavash Akbari`;
    const description =
      photo?.caption ||
      `Explore photo ${photoCode} from ${projectTitle} (${photo?.date || "2024"}), creative showcase by multidisciplinary designer & photographer Siavash Akbari.`;

    const canonicalPath = loaderData?.photo.canonicalPath || `/${loaderData?.disciplineSlug}/${loaderData?.specialtySlug}/${loaderData?.projectSlug}/${photoCode}`;

    return pageHead({
      title,
      description,
      path: canonicalPath,
      image: loaderData?.resolvedImage,
      type: "article",
    });
  },
  component: DedicatedPhotoPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Photo Not Found</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  ),
});

function DedicatedPhotoPage() {
  const {
    disciplineSlug,
    specialtySlug,
    projectSlug,
    photo,
    resolvedImage,
    parentProject,
    prevPhoto,
    nextPhoto,
    currentIndex,
    totalPhotos,
  } = Route.useLoaderData();

  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);

  // Keyboard navigation (ArrowLeft = prev, ArrowRight = next, Escape = back to project)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevPhoto) {
        router.navigate({
          to: buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, prevPhoto.code) as any,
        });
      } else if (e.key === "ArrowRight" && nextPhoto) {
        router.navigate({
          to: buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, nextPhoto.code) as any,
        });
      } else if (e.key === "Escape") {
        router.navigate({
          to: buildProjectUrl(disciplineSlug, specialtySlug, projectSlug) as any,
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPhoto, nextPhoto, disciplineSlug, specialtySlug, projectSlug, router]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const projectUrl = buildProjectUrl(disciplineSlug, specialtySlug, projectSlug);
  const specialtyUrl = buildSpecialtyUrl(disciplineSlug, specialtySlug);
  const disciplineUrl = buildDisciplineUrl(disciplineSlug);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-secondary selection:text-secondary-foreground pb-24">
      {/* Top Header & Breadcrumb Bar */}
      <div className="sticky top-14 z-30 border-b border-foreground/10 bg-[#0A0A0A]/90 backdrop-blur-md px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider overflow-x-auto whitespace-nowrap">
            <Link
              to={projectUrl as any}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mr-2 pr-3 border-r border-foreground/15"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Project</span>
            </Link>

            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Link
              to={disciplineUrl as any}
              className="capitalize text-muted-foreground hover:text-foreground transition-colors"
            >
              {disciplineSlug.replace("-", " ")}
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Link
              to={specialtyUrl as any}
              className="capitalize text-muted-foreground hover:text-foreground transition-colors"
            >
              {specialtySlug.replace("-", " ")}
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Link
              to={projectUrl as any}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {photo.project}
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-secondary font-bold">{photo.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-white/5 px-3 py-1.5 text-xs font-mono text-foreground hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy canonical share link"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>

            <Link
              to="/admin/inventory"
              search={{ query: photo.code } as any}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#2CE3C0]/40 bg-[#2CE3C0]/10 px-3 py-1.5 text-xs font-mono text-[#2CE3C0] hover:bg-[#2CE3C0]/20 transition-colors"
              title="Edit asset details in Admin Studio"
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit in Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Showcase Layout */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left / Center Column: Image & Navigation */}
          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="relative group w-full flex justify-center items-center overflow-hidden rounded-md bg-[#111] border border-white/5 shadow-2xl">
              <img
                src={resolvedImage}
                alt={photo.altText || `${photo.project} — ${photo.code}`}
                className="max-h-[82vh] w-auto max-w-full object-contain rounded-md"
                loading="eager"
              />

              {/* Prev Overlay Button */}
              {prevPhoto && (
                <Link
                  to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, prevPhoto.code) as any}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Link>
              )}

              {/* Next Overlay Button */}
              {nextPhoto && (
                <Link
                  to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, nextPhoto.code) as any}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
              )}
            </div>

            {/* Photo Counter & Navigation Bar Below Image */}
            <div className="w-full flex items-center justify-between mt-4 px-2 text-xs font-mono text-muted-foreground">
              <div>
                <span>Frame </span>
                <span className="text-foreground font-bold">{currentIndex}</span>
                <span> of </span>
                <span className="text-foreground font-bold">{totalPhotos}</span>
              </div>

              <div className="flex items-center gap-2">
                {prevPhoto ? (
                  <Link
                    to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, prevPhoto.code) as any}
                    className="flex items-center gap-1 hover:text-foreground transition-colors px-2 py-1 rounded bg-white/5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Link>
                ) : (
                  <span className="opacity-30 flex items-center gap-1 px-2 py-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </span>
                )}

                {nextPhoto ? (
                  <Link
                    to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, nextPhoto.code) as any}
                    className="flex items-center gap-1 hover:text-foreground transition-colors px-2 py-1 rounded bg-white/5"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="opacity-30 flex items-center gap-1 px-2 py-1">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Studio Info */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Title & Code Badge */}
            <div className="border-b border-white/10 pb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded border border-secondary/20">
                  {photo.code}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {photo.date || "2024"}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {photo.title || `${photo.project} — ${photo.code.split("-").pop() || "01"}`}
              </h1>
              {parentProject?.titleFa && (
                <p className="mt-1 text-sm font-sans text-muted-foreground" dir="rtl">
                  {parentProject.titleFa}
                </p>
              )}
            </div>

            {/* Hierarchical Routing Taxonomy Details */}
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3 text-xs">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                Taxonomy & Hierarchy
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-muted-foreground">Discipline:</span>
                <Link
                  to={disciplineUrl as any}
                  className="font-medium text-foreground hover:text-secondary transition-colors uppercase font-mono"
                >
                  {photo.discipline || disciplineSlug}
                </Link>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-muted-foreground">Specialty:</span>
                <Link
                  to={specialtyUrl as any}
                  className="font-medium text-foreground hover:text-secondary transition-colors uppercase font-mono"
                >
                  {photo.subdiscipline || specialtySlug}
                </Link>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Project:</span>
                <Link
                  to={projectUrl as any}
                  className="font-bold text-secondary hover:underline transition-all font-mono"
                >
                  {photo.project}
                </Link>
              </div>
            </div>

            {/* Production & Editorial Credits */}
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3 text-xs">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                Production Credits
              </div>

              {photo.client && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium text-foreground">{photo.client}</span>
                </div>
              )}

              {photo.model && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Model(s):</span>
                  <span className="font-medium text-foreground">{photo.model}</span>
                </div>
              )}

              {photo.makeupArtist && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Makeup Artist:</span>
                  <span className="font-medium text-foreground">{photo.makeupArtist}</span>
                </div>
              )}

              {photo.assistant && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Assistant:</span>
                  <span className="font-medium text-foreground">{photo.assistant}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Creative Direction:</span>
                <span className="font-medium text-foreground">Siavash Akbari</span>
              </div>
            </div>

            {/* Editorial Caption / Story */}
            {photo.caption && (
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-xs leading-relaxed text-muted-foreground">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                  Editorial Context
                </div>
                <p>{photo.caption}</p>
              </div>
            )}

            {/* Keywords / Tags */}
            {photo.keywords && (
              <div className="flex flex-wrap gap-1.5">
                {photo.keywords.split(",").map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                  >
                    <Tag className="w-2.5 h-2.5 opacity-60" />
                    {kw.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
