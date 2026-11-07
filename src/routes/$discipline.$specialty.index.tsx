import { useState, useMemo } from "react";
import { createFileRoute, notFound, rootRouteId, Link } from "@tanstack/react-router";
import { ArrowLeft, Filter, Tag, Layers, Sparkles } from "lucide-react";
import { DISCIPLINES } from "@/data/disciplines";
import { getPhotosBySpecialty, type PhotoInventoryItem } from "@/lib/studio-store";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
  buildProjectUrl,
  buildDisciplineUrl,
} from "@/lib/taxonomy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$discipline/$specialty/")({
  loader: ({ params }) => {
    const disciplineSlug = normalizeDisciplineSlug(params.discipline);
    const specialtySlug = normalizeSpecialtySlug(params.specialty);

    const photos = getPhotosBySpecialty(specialtySlug, disciplineSlug);

    // Get matching discipline metadata card if exists
    const discCard = DISCIPLINES.find(
      (d) => d.specialtySlug === specialtySlug || d.slug === specialtySlug,
    );

    const specialtyLabel =
      discCard?.label ||
      specialtySlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
      disciplineSlug,
      specialtySlug,
      specialtyLabel,
      blurb: discCard?.blurb || `Curated ${specialtyLabel} portfolio by multidisciplinary creative Siavash Akbari.`,
      photos,
    };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.specialtyLabel ?? "Specialty";
    const desc = loaderData?.blurb ?? `Explore ${label} work by Siavash Akbari.`;
    const canonicalPath = `/${loaderData?.disciplineSlug}/${loaderData?.specialtySlug}`;

    return pageHead({
      title: `${label} — Siavash Akbari`,
      description: desc,
      path: canonicalPath,
      type: "article",
    });
  },
  component: SpecialtyGalleryPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Specialty Not Found</h1>
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

function SpecialtyGalleryPage() {
  const { disciplineSlug, specialtySlug, specialtyLabel, blurb, photos } = Route.useLoaderData();
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");

  // Collect unique projects for filtering
  const availableProjects = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.project) set.add(p.project);
    });
    return Array.from(set).sort();
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (selectedProjectFilter === "all") return photos;
    return photos.filter((p) => p.project === selectedProjectFilter);
  }, [photos, selectedProjectFilter]);

  const disciplineUrl = buildDisciplineUrl(disciplineSlug);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-secondary selection:text-secondary-foreground pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="sticky top-14 z-30 border-b border-foreground/10 bg-[#0A0A0A]/90 backdrop-blur-md px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider overflow-x-auto whitespace-nowrap">
            <Link
              to={disciplineUrl as any}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mr-2 pr-3 border-r border-foreground/15"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All {disciplineSlug.replace("-", " ")}</span>
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
            <span className="text-secondary font-bold">{specialtyLabel}</span>
          </div>

          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-bold">{filteredPhotos.length}</span> images
          </div>
        </div>
      </div>

      {/* Specialty Header Section */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-secondary bg-secondary/10 px-2.5 py-1 rounded border border-secondary/20">
            {disciplineSlug.replace("-", " ")}
          </span>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Specialty Gallery
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground">
          {specialtyLabel}
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
          {blurb}
        </p>

        {/* Project Filter Pills */}
        {availableProjects.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center gap-2 pt-6 border-t border-white/5">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60 mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter Project:
            </span>

            <button
              onClick={() => setSelectedProjectFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                selectedProjectFilter === "all"
                  ? "bg-secondary text-secondary-foreground font-bold shadow-[0_0_12px_rgba(44,227,192,0.3)]"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              All Projects ({photos.length})
            </button>

            {availableProjects.map((proj) => {
              const count = photos.filter((p) => p.project === proj).length;
              const active = selectedProjectFilter === proj;
              return (
                <button
                  key={proj}
                  onClick={() => setSelectedProjectFilter(proj)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    active
                      ? "bg-secondary text-secondary-foreground font-bold shadow-[0_0_12px_rgba(44,227,192,0.3)]"
                      : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  {proj} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Specialty Images Grid (Shows all images inside specialty) */}
      <div className="mx-auto max-w-7xl px-6 pt-4">
        {filteredPhotos.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground font-mono text-sm">
            No photos found in this specialty yet. Add photos via the Admin Studio!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredPhotos.map((photo, idx) => {
              const resolvedSrc = resolveInventoryImage(photo.imgSrc);
              const projSlug = normalizeProjectSlug(photo.projectSlug || photo.project);
              const photoUrl = buildPhotoUrl(disciplineSlug, specialtySlug, projSlug, photo.code);

              return (
                <Link
                  key={photo.code || idx}
                  to={photoUrl as any}
                  className="group relative flex flex-col rounded-md overflow-hidden bg-[#111] border border-white/5 hover:border-secondary/40 transition-all duration-300 shadow-md hover:shadow-secondary/10"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-black/40">
                    <img
                      src={resolvedSrc}
                      alt={photo.altText || `${photo.project} — ${photo.code}`}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-3 bg-[#111]/90 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-foreground group-hover:text-secondary transition-colors">
                      {photo.code}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {photo.project}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
