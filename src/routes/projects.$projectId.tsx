import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, rootRouteId } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DISCIPLINES } from "@/data/disciplines";
import { projects } from "@/data/projects";
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

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.projectId);
    if (!project) throw notFound({ routeId: rootRouteId });
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    const title = p ? `${p.title} — Siavash Akbari` : "Project — Siavash Akbari";
    const description =
      p?.description ??
      "Project from the portfolio of Siavash Akbari.";
    const seo = pageHead({
      title,
      description,
      path: p ? `/projects/${p.id}` : "/projects",
      image: p?.image,
      type: "article",
    });
    return {
      ...seo,
      scripts: p ? [jsonLdScript(projectJsonLd(p))] : [],
    };
  },
  component: ProjectDetail,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const images = project.gallery ?? [project.image];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isDesktop = useIsDesktop();

  const backDiscipline = DISCIPLINES.find(
    (d) =>
      d.browseByProject &&
      (!d.disciplines || d.disciplines.includes(project.discipline)) &&
      d.match(project.category),
  );

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
        <p className="col-start-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          {project.category} · {project.year}
        </p>
        <h1 className="col-start-1 mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
          {project.title}
        </h1>
        {isDesktop && backDiscipline && (
          <Link
            to="/$discipline"
            params={{ discipline: backDiscipline.slug }}
            className={`${backBtnClass} col-start-2 row-start-2 self-center justify-self-end translate-y-[5px]`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {backDiscipline.label}
          </Link>
        )}
        <p className="col-start-1 mt-4 text-base leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      </div>

      {isDesktop ? (
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="scrollbar-hide flex min-h-0 flex-1 gap-6 overflow-x-auto overflow-y-hidden px-6 pb-4"
        >
          {images.map((src: string, i: number) => (
            <figure
              key={src}
              className="h-full shrink-0 cursor-zoom-in"
              onClick={() => setActiveIndex(i)}
            >
              <img
                src={src}
                alt={`${project.title} — image ${i + 1}`}
                loading={i < 2 ? "eager" : "lazy"}
                className="h-full w-auto max-w-none bg-card object-contain"
              />
            </figure>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-[13px] pb-8">
          {images.map((src: string, i: number) => (
            <figure key={src} className="w-full overflow-hidden bg-card">
              <img
                src={src}
                alt={`${project.title} — image ${i + 1}`}
                loading={i < 2 ? "eager" : "lazy"}
                className="h-auto w-full object-contain"
              />
            </figure>
          ))}
        </div>
      )}

      {!isDesktop && backDiscipline && (
        <Link
          to="/$discipline"
          params={{ discipline: backDiscipline.slug }}
          className={`${backBtnMobileClass} fixed bottom-[44px] left-1/2 z-40 -translate-x-1/2`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {backDiscipline.label}
        </Link>
      )}

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-[#0F0F0F]"
          onClick={() => setActiveIndex(null)}
        >
          <img
            src={images[activeIndex]}
            alt={`${project.title} — full view`}
            className="max-h-screen max-w-screen object-contain"
          />
        </div>
      )}
    </article>
  );
}
