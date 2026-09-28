import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, rootRouteId } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DISCIPLINES } from "@/data/disciplines";
import { projects } from "@/data/projects";
import { getProjectById } from "@/lib/studio-store";
import { jsonLdScript, pageHead, projectJsonLd } from "@/lib/seo";

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

export const Route = createFileRoute("/visual-identity/$projectId")({
  loader: ({ params }) => {
    const project =
      getProjectById(params.projectId) ||
      projects.find((p) => p.id === params.projectId);

    // Only Visual Identity projects are served on this route
    if (!project) throw notFound({ routeId: rootRouteId });

    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    const title = p ? `${p.title} — Visual Identity — Siavash Akbari` : "Visual Identity — Siavash Akbari";
    const description =
      p?.description ??
      "Visual identity case study by Siavash Akbari.";
    const seo = pageHead({
      title,
      description,
      path: p ? `/visual-identity/${p.id}` : "/visual-identity",
      image: p?.image,
      type: "article",
    });
    return {
      ...seo,
      scripts: p ? [jsonLdScript(projectJsonLd(p))] : [],
    };
  },
  component: VisualIdentityProjectDetail,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function VisualIdentityProjectDetail() {
  const { project } = Route.useLoaderData();
  const images = project.gallery ?? [project.image];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isDesktop = useIsDesktop();

  const backDiscipline = DISCIPLINES.find((d) => d.slug === "visual-identity");

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY === 0) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

  return (
    <article
      className={
        isDesktop
          ? "flex min-h-0 flex-1 flex-col overflow-hidden"
          : "flex flex-col pb-16"
      }
    >
      <div className="mx-auto grid w-full max-w-6xl shrink-0 grid-cols-[minmax(0,48rem)_auto] gap-x-4 px-3 pt-8 pb-4">
        <p className="col-start-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary flex items-center gap-2 flex-wrap">
          <span>{project.category || "Visual Identity"}</span>
          {project.subDiscipline?.trim() && (
            <>
              <span className="opacity-50">·</span>
              <span className="text-[#FFD166]">{project.subDiscipline}</span>
            </>
          )}
          {project.year && (
            <>
              <span className="opacity-50">·</span>
              <span>{project.year}</span>
            </>
          )}
        </p>

        <h1 className="col-start-1 mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
          {project.title}
          {project.titleFa?.trim() && (
            <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2 font-fa">
              {project.titleFa}
            </span>
          )}
        </h1>

        {isDesktop && (
          <Link
            to="/$discipline"
            params={{ discipline: "visual-identity" }}
            className={`${backBtnClass} col-start-2 row-start-2 self-center justify-self-end translate-y-[5px]`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Visual Identity
          </Link>
        )}

        <p className="col-start-1 mt-6 text-lg leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* METADATA PILLS: STRICT PROTOCOL — IF LEFT EMPTY, IT IS NOT BROUGHT UP */}
        {(project.client?.trim() ||
          project.models?.trim() ||
          project.makeupArtist?.trim() ||
          project.assistant?.trim() ||
          project.stylist?.trim() ||
          project.location?.trim()) && (
          <div className="col-start-1 mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 border-t border-white/10 text-xs">
            {project.client?.trim() && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Client
                </span>
                <span className="text-white font-medium">{project.client}</span>
              </div>
            )}

            {project.models?.trim() && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Model / Cast
                </span>
                <span className="text-white font-medium">{project.models}</span>
              </div>
            )}

            {project.makeupArtist?.trim() && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Makeup / Hair
                </span>
                <span className="text-white font-medium">{project.makeupArtist}</span>
              </div>
            )}

            {project.assistant?.trim() && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Assistant
                </span>
                <span className="text-white font-medium">{project.assistant}</span>
              </div>
            )}

            {project.stylist?.trim() && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Art Direction / Styling
                </span>
                <span className="text-white font-medium">{project.stylist}</span>
              </div>
            )}

            {project.location?.trim() && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  Location
                </span>
                <span className="text-white font-medium">{project.location}</span>
              </div>
            )}
          </div>
        )}

        {/* CAPTION / LONG-FORM STORY BOX (ONLY BROUGHT UP IF PROVIDED AND NON-EMPTY) */}
        {project.caption?.trim() && (
          <div className="col-start-1 mt-6 p-6 rounded-2xl bg-[#141414] border border-white/10 text-neutral-300">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#2CE3C0] block mb-2 font-bold">
              Project Story & Curatorial Notes
            </span>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-neutral-300">
              {project.caption}
            </div>
          </div>
        )}
      </div>

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
                className="h-full shrink-0 cursor-zoom-in"
                onClick={() => setActiveIndex(i)}
              >
                {isVideo ? (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-auto max-w-none bg-card object-contain"
                  />
                ) : (
                  <img
                    src={src}
                    alt={`${project.title} — image ${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="h-full w-auto max-w-none bg-card object-contain"
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
                    alt={`${project.title} — image ${i + 1}`}
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
          <Link
            to="/$discipline"
            params={{ discipline: "visual-identity" }}
            className={backBtnMobileClass}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Visual Identity
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
            className="absolute top-6 right-6 z-10 text-muted-foreground hover:text-foreground"
            aria-label="Close image preview"
          >
            ✕
          </button>
          {images[activeIndex].endsWith(".mp4") ? (
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
              alt={`${project.title} — enlarged preview`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
            />
          )}
        </div>
      )}
    </article>
  );
}
