import { useState, useMemo } from "react";
import { createFileRoute, notFound, redirect, rootRouteId, Link } from "@tanstack/react-router";
import { ArrowLeft, Filter, Tag, Layers, Sparkles } from "lucide-react";
import { DISCIPLINES } from "@/data/disciplines";
import {
  getPhotosByDiscipline,
  getTaxonomySpecialties,
  type PhotoInventoryItem,
} from "@/lib/studio-store";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
  buildSpecialtyUrl,
  buildDisciplineUrl,
} from "@/lib/taxonomy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$discipline/")({
  loader: ({ params }) => {
    const raw = (params.discipline || "").toLowerCase().trim();

    // 1. Handle legacy specialty slugs that were previously at the root
    if (raw === "fashion-photography" || raw === "fashion") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "photography", specialty: "fashion" } });
    }
    if (raw === "food-photography" || raw === "food") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "photography", specialty: "food" } });
    }
    if (raw === "portrait-photography" || raw === "portrait") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "photography", specialty: "portrait" } });
    }
    if (raw === "product-photography" || raw === "product" || raw === "product-design") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "photography", specialty: "product" } });
    }
    if (raw === "visual-identity") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "graphic-design", specialty: "visual-identity" } });
    }
    if (raw === "book-covers") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "graphic-design", specialty: "book-covers" } });
    }
    if (raw === "posters") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "graphic-design", specialty: "posters" } });
    }
    if (raw === "videos") {
      throw redirect({ to: "/$discipline/$specialty", params: { discipline: "video", specialty: "videos" } });
    }

    const disciplineSlug = normalizeDisciplineSlug(raw);
    const photos = getPhotosByDiscipline(disciplineSlug);

    const specialties = getTaxonomySpecialties(disciplineSlug);

    const labels: Record<string, { title: string; blurb: string }> = {
      photography: {
        title: "Photography",
        blurb: "Editorial photography across fashion, food, portrait, and product stories — shaped by light, texture, and quiet gesture.",
      },
      "graphic-design": {
        title: "Graphic Design",
        blurb: "Visual identity, book covers, and poster systems built from typographic precision and lasting visual hierarchy.",
      },
      video: {
        title: "Video & Motion",
        blurb: "Moving image work, brand films, and motion sequences — rhythm, atmosphere, and story in time.",
      },
    };

    const info = labels[disciplineSlug] || {
      title: disciplineSlug.charAt(0).toUpperCase() + disciplineSlug.slice(1).replace("-", " "),
      blurb: `Creative work across ${disciplineSlug} by Siavash Akbari.`,
    };

    return {
      disciplineSlug,
      title: info.title,
      blurb: info.blurb,
      specialties,
      photos,
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Photography";
    const desc = loaderData?.blurb ?? `Explore ${title} portfolio by Siavash Akbari.`;
    const canonicalPath = `/${loaderData?.disciplineSlug}`;

    return pageHead({
      title: `${title} — Siavash Akbari`,
      description: desc,
      path: canonicalPath,
      type: "article",
    });
  },
  component: DisciplineAllPhotosPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Discipline Not Found</h1>
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

function DisciplineAllPhotosPage() {
  const { disciplineSlug, title, blurb, specialties, photos } = Route.useLoaderData();
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState("all");

  const filteredPhotos = useMemo(() => {
    if (activeSpecialtyFilter === "all") return photos;
    return photos.filter(
      (p) => normalizeSpecialtySlug(p.specialtySlug || p.subdiscipline || "") === activeSpecialtyFilter,
    );
  }, [photos, activeSpecialtyFilter]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-secondary selection:text-secondary-foreground pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="sticky top-14 z-30 border-b border-foreground/10 bg-[#0A0A0A]/90 backdrop-blur-md px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider overflow-x-auto whitespace-nowrap">
            <Link to="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mr-2 pr-3 border-r border-foreground/15">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back Home</span>
            </Link>

            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-secondary font-bold capitalize">{disciplineSlug.replace("-", " ")}</span>
          </div>

          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-bold">{filteredPhotos.length}</span> images across discipline
          </div>
        </div>
      </div>

      {/* Discipline Header Section */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-secondary bg-secondary/10 px-2.5 py-1 rounded border border-secondary/20">
            Discipline Archive
          </span>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            All Works
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
          {blurb}
        </p>

        {/* Specialty Navigation Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 pt-6 border-t border-white/5">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Specialties:
          </span>

          <button
            onClick={() => setActiveSpecialtyFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeSpecialtyFilter === "all"
                ? "bg-secondary text-secondary-foreground font-bold shadow-[0_0_12px_rgba(44,227,192,0.3)]"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            All Images ({photos.length})
          </button>

          {specialties.map((spec) => {
            const count = photos.filter(
              (p) => normalizeSpecialtySlug(p.specialtySlug || p.subdiscipline || "") === spec.slug,
            ).length;
            const active = activeSpecialtyFilter === spec.slug;
            const specialtyUrl = buildSpecialtyUrl(disciplineSlug, spec.slug);

            return (
              <div key={spec.slug} className="flex items-center">
                <button
                  onClick={() => setActiveSpecialtyFilter(spec.slug)}
                  className={`px-3 py-1.5 rounded-l-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    active
                      ? "bg-secondary text-secondary-foreground font-bold shadow-[0_0_12px_rgba(44,227,192,0.3)]"
                      : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  {spec.label} {count > 0 ? `(${count})` : ""}
                </button>
                <Link
                  to={specialtyUrl as any}
                  className="px-2 py-1.5 rounded-r-full bg-white/10 text-muted-foreground hover:text-secondary text-[10px] font-mono border-l border-white/10 transition-colors"
                  title={`Open dedicated ${spec.label} page`}
                >
                  Go &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discipline All Images Grid */}
      <div className="mx-auto max-w-7xl px-6 pt-4">
        {filteredPhotos.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground font-mono text-sm">
            No photos found in this discipline yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredPhotos.map((photo, idx) => {
              const resolvedSrc = resolveInventoryImage(photo.imgSrc);
              const specSlug = normalizeSpecialtySlug(photo.specialtySlug || photo.subdiscipline || "fashion");
              const projSlug = normalizeProjectSlug(photo.projectSlug || photo.project);
              const photoUrl = buildPhotoUrl(disciplineSlug, specSlug, projSlug, photo.code);

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
