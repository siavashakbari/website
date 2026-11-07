import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, rootRouteId } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { projects } from "@/data/projects";
import { getStudioProjects, getPhotosByProject, type StudioProjectItem } from "@/lib/studio-store";
import { pageHead, jsonLdScript, projectJsonLd } from "@/lib/seo";
import { normalizeDisciplineSlug, normalizeSpecialtySlug, normalizeProjectSlug } from "@/lib/taxonomy";

// Desktop: outline by default, green + glow on hover.
const backBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-5 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]";

// Phones have no hover, so show the green + glow state permanently, at 80% size.
const backBtnMobileClass =
  "inline-flex h-11 shrink-0 scale-[0.8] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent bg-secondary px-5 text-sm font-medium text-secondary-foreground shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export const Route = createFileRoute("/$discipline/$specialty/$project/")({
  loader: ({ params }) => {
    const normDisc = normalizeDisciplineSlug(params.discipline);
    const normSpec = normalizeSpecialtySlug(params.specialty);
    const normProj = normalizeProjectSlug(params.project);

    // Find in studio projects or default static projects
    const allStudio = getStudioProjects();
    const studioFound = allStudio.find(
      (p) => normalizeProjectSlug(p.title) === normProj || p.id === normProj,
    );
    const staticFound = projects.find(
      (p) => normalizeProjectSlug(p.title) === normProj || p.id === normProj,
    );

    const project = studioFound || staticFound;

    // Also look up all photos in this project from merged inventory
    const projectPhotos = getPhotosByProject(normProj);
    const images: string[] =
      project?.images && project.images.length > 0
        ? project.images.map((im) => im.url)
        : projectPhotos.length > 0
          ? projectPhotos.map((p) => p.imgSrc)
          : project?.gallery && project.gallery.length > 0
            ? project.gallery
            : project?.image
              ? [project.image]
              : [];

    const title = project?.title || params.project;
    const year = project?.year ? String(project.year) : "2026";
    const category = project?.subDiscipline || project?.category || normSpec;
    const description = project?.description || `${title} creative showcase.`;
    const client = project?.client;
    const models = project?.models;
    const makeupArtist = project?.makeupArtist;
    const assistant = project?.assistant;
    const stylist = project?.stylist;
    const location = project?.location;
    const caption = project?.caption;

    return {
      disciplineSlug: normDisc,
      specialtySlug: normSpec,
      projectSlug: normProj,
      title,
      year,
      category,
      description,
      client,
      models,
      makeupArtist,
      assistant,
      stylist,
      location,
      caption,
      images,
      coverImage: images[0] || "",
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Project";
    const desc = loaderData?.description ?? "Case study by Siavash Akbari";
    const path = `/${loaderData?.disciplineSlug}/${loaderData?.specialtySlug}/${loaderData?.projectSlug}`;
    return pageHead({
      title: `${title} — Siavash Akbari`,
      description: desc,
      path,
      image: loaderData?.coverImage,
      type: "article",
    });
  },
  component: ProjectCaseStudyPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function ProjectCaseStudyPage() {
  const data = Route.useLoaderData();
  const images = data.images;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isDesktop = useIsDesktop();

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY === 0) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  };

  useEffect(() => {
    if (!isDesktop) return;
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (activeIndex !== null) return;
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isDesktop, activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

  const hasCredits =
    Boolean(data.client) ||
    Boolean(data.models) ||
    Boolean(data.makeupArtist) ||
    Boolean(data.assistant) ||
    Boolean(data.stylist) ||
    Boolean(data.location);

  const backUrl = `/${data.disciplineSlug}/${data.specialtySlug}`;

  return (
    <article
      className={isDesktop ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "flex flex-col pb-16"}
    >
      <div className="mx-auto grid w-full max-w-6xl shrink-0 grid-cols-[minmax(0,48rem)_auto] gap-x-4 px-3 pt-8 pb-4">
        <p className="col-start-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          {data.category} · {data.year}
        </p>
        <h1 className="col-start-1 mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
          {data.title}
        </h1>

        {isDesktop && (
          <Link
            to={backUrl as any}
            className={`${backBtnClass} col-start-2 row-start-2 self-center justify-self-end translate-y-[5px]`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="capitalize">Back to {data.specialtySlug.replace("-", " ")}</span>
          </Link>
        )}

        <p className="col-start-1 mt-4 text-base leading-relaxed text-muted-foreground">
          {data.description}
        </p>

        {/* METADATA CREDITS MATRIX */}
        {hasCredits && (
          <div className="col-start-1 mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#141414] border border-white/10 text-xs">
            {data.client && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Client
                </span>
                <span className="text-white font-medium">{data.client}</span>
              </div>
            )}
            {data.models && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Model(s)
                </span>
                <span className="text-white font-medium">
                  {Array.isArray(data.models) ? data.models.join(", ") : data.models}
                </span>
              </div>
            )}
            {data.makeupArtist && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Makeup Artist
                </span>
                <span className="text-white font-medium">{data.makeupArtist}</span>
              </div>
            )}
            {data.stylist && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Stylist
                </span>
                <span className="text-white font-medium">{data.stylist}</span>
              </div>
            )}
            {data.assistant && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Assistant
                </span>
                <span className="text-white font-medium">{data.assistant}</span>
              </div>
            )}
            {data.location && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Location
                </span>
                <span className="text-white font-medium">{data.location}</span>
              </div>
            )}
          </div>
        )}

        {/* LONG-FORM STORY BOX */}
        {data.caption?.trim() && (
          <div className="col-start-1 mt-6 p-6 rounded-2xl bg-[#141414] border border-white/10 text-neutral-300">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#2CE3C0] block mb-2 font-bold">
              Project Story & Curatorial Notes
            </span>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-neutral-300">
              {data.caption}
            </div>
          </div>
        )}
      </div>

      {/* Media Presentation */}
      {isDesktop ? (
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="scrollbar-hide flex min-h-0 flex-1 gap-6 overflow-x-auto overflow-y-hidden px-6 pb-4"
        >
          {images.map((src: string, i: number) => {
            const isVideo = src.endsWith(".mp4");
            return (
              <figure
                key={src}
                className="flex h-full shrink-0 cursor-zoom-in items-center justify-center"
                onClick={() => setActiveIndex(i)}
              >
                {isVideo ? (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    draggable={false}
                    className="h-full w-auto max-w-none select-none bg-card object-contain"
                  />
                ) : (
                  <img
                    src={src}
                    alt={`${data.title} — image ${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    draggable={false}
                    className="h-full w-auto max-w-none select-none bg-card object-contain"
                  />
                )}
              </figure>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-3 pt-6">
          {images.map((src: string, i: number) => {
            const isVideo = src.endsWith(".mp4");
            return (
              <figure
                key={src}
                className="w-full cursor-zoom-in overflow-hidden bg-card"
                onClick={() => setActiveIndex(i)}
              >
                {isVideo ? (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full object-contain"
                  />
                ) : (
                  <img
                    src={src}
                    alt={`${data.title} — image ${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="w-full object-contain"
                  />
                )}
              </figure>
            );
          })}
        </div>
      )}

      {!isDesktop && (
        <div className="mx-auto mt-6 flex w-full max-w-6xl justify-center px-3">
          <Link to={backUrl as any} className={backBtnMobileClass}>
            <ArrowLeft className="h-4 w-4" />
            <span className="capitalize">Back to {data.specialtySlug.replace("-", " ")}</span>
          </Link>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute top-6 right-6 z-10 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close image preview"
          >
            ✕
          </button>
          {images[activeIndex]?.endsWith(".mp4") ? (
            <video
              src={images[activeIndex]}
              autoPlay
              controls
              loop
              playsInline
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
            />
          ) : (
            <img
              src={images[activeIndex]}
              alt={`${data.title} — enlarged preview`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
            />
          )}
        </div>
      )}
    </article>
  );
}
