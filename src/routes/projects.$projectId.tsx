import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { projects } from "@/data/projects";

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
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    const title = p ? `${p.title} — Siavash Akbari` : "Project — Siavash Akbari";
    const description = p?.description ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(p ? [{ property: "og:image", content: p.image }] : []),
      ],
    };
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Project not found</h1>
      <Link to="/work" className="mt-6 inline-block text-primary underline">
        Back to work
      </Link>
    </div>
  ),
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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
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
    <article className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="mx-auto w-full max-w-6xl shrink-0 px-6 pt-8 pb-4">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            {project.category} · {project.year}
          </p>
          <h1 className="mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
            {project.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </header>
      </div>

      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="scrollbar-hide flex flex-1 min-h-0 gap-6 overflow-x-auto overflow-y-hidden px-6 pb-4"
      >
        {images.map((src: string, i: number) => (
          <figure
            key={src}
            className={`shrink-0 h-full ${isDesktop ? "cursor-zoom-in" : ""}`}
            onClick={() => isDesktop && setActiveIndex(i)}
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

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black"
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