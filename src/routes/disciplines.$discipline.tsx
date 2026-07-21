import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MosaicGallery, type MosaicItem } from "@/components/MosaicGallery";
import { DISCIPLINES } from "@/data/disciplines";
import { projects } from "@/data/projects";

export const Route = createFileRoute("/disciplines/$discipline")({
  loader: ({ params }) => {
    const discipline = DISCIPLINES.find((d) => d.slug === params.discipline);
    if (!discipline) throw notFound();
    const matching = projects.filter(
      (p) =>
        (!discipline.disciplines || discipline.disciplines.includes(p.discipline)) &&
        discipline.match(p.category),
    );
    const items: MosaicItem[] = [];
    matching.forEach((project) => {
      const gallery = project.gallery ?? [project.image];
      gallery.forEach((src, idx) => {
        items.push({
          key: `${project.id}-${idx}`,
          src,
          alt: `${project.title} — ${idx + 1}`,
          title: project.title,
          year: project.year,
          discipline: discipline.slug,
          photo: `${project.id}-${idx}`,
        });
      });
    });
    const projectsById: Record<string, (typeof projects)[number]> = {};
    matching.forEach((p) => {
      projectsById[p.id] = p;
    });
    return {
      discipline: { slug: discipline.slug, label: discipline.label, blurb: discipline.blurb },
      items,
      projectsById,
    };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.discipline.label ?? "DISCIPLINE";
    return {
      meta: [
        { title: `${label} — Siavash Akbari` },
        { name: "description", content: loaderData?.discipline.blurb ?? "" },
        { property: "og:title", content: `${label} — Siavash Akbari` },
        { property: "og:description", content: loaderData?.discipline.blurb ?? "" },
      ],
    };
  },
  component: DisciplinePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">DISCIPLINE not found</h1>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Back home
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

function DisciplinePage() {
  const { discipline, items, projectsById } = Route.useLoaderData();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const selected = selectedIdx !== null ? items[selectedIdx] : null;
  const selectedProject = selected
    ? projectsById[selected.photo.replace(/-\d+$/, "")]
    : null;

  useEffect(() => {
    if (selectedIdx === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowRight")
        setSelectedIdx((i) => (i !== null && i < items.length - 1 ? i + 1 : i));
      if (e.key === "ArrowLeft")
        setSelectedIdx((i) => (i !== null && i > 0 ? i - 1 : i));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedIdx, items.length]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const progress = Math.min(1, Math.max(0, scrollY / vh));
  const titleScale = 1 - progress * 0.8;
  const titleOpacity = 1 - progress;

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative flex h-[100vh] w-full items-center justify-center overflow-hidden bg-background"
      >
        <p className="absolute left-1/2 top-6 -translate-x-1/2 text-[10px] font-light uppercase tracking-[0.35em] text-muted-foreground">
          Scroll to explore
        </p>
        <h1
          className="pointer-events-none select-none px-6 text-center font-elle text-foreground/70 will-change-transform"
          style={{
            fontSize: "clamp(4rem, 22vw, 22rem)",
            lineHeight: 0.9,
            letterSpacing: "0.02em",
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            transition: "opacity 0.1s linear",
          }}
        >
          {discipline.label}
        </h1>
        <p className="absolute bottom-10 left-1/2 max-w-xl -translate-x-1/2 px-6 text-center text-sm text-muted-foreground">
          {discipline.blurb}
        </p>
      </section>

      {/* Gallery */}
      <section className="relative w-full bg-background pb-40 pt-16">
        {items.length === 0 ? (
          <p className="mx-auto max-w-3xl px-6 text-center text-muted-foreground">
            More coming soon.
          </p>
        ) : (
          <MosaicGallery
            items={items as MosaicItem[]}
            onSelect={(item) => {
              const idx = items.findIndex((it: MosaicItem) => it.key === item.key);
              if (idx !== -1) setSelectedIdx(idx);
            }}
          />
        )}
      </section>

      {selected && selectedProject ? (
        <PhotoLightbox
          item={selected}
          project={selectedProject}
          disciplineLabel={discipline.label}
          position={selectedIdx! + 1}
          total={items.length}
          onClose={() => setSelectedIdx(null)}
          onPrev={
            selectedIdx! > 0 ? () => setSelectedIdx(selectedIdx! - 1) : undefined
          }
          onNext={
            selectedIdx! < items.length - 1
              ? () => setSelectedIdx(selectedIdx! + 1)
              : undefined
          }
        />
      ) : null}
    </>
  );
}

interface PhotoLightboxProps {
  item: MosaicItem;
  project: (typeof projects)[number];
  disciplineLabel: string;
  position: number;
  total: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function PhotoLightbox({
  item,
  project,
  disciplineLabel,
  position,
  total,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-stretch bg-black/95 backdrop-blur-sm"
      style={{ opacity: mounted ? 1 : 0, transition: "opacity 300ms ease-out" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 z-10 text-[10px] font-light uppercase tracking-[0.3em] text-white/70 hover:text-white"
      >
        Close ✕
      </button>

      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[68%_32%] lg:grid-cols-[70%_30%]">
        <button
          type="button"
          onClick={onClose}
          className="relative flex h-[60vh] w-full cursor-zoom-out items-center justify-center p-4 md:h-screen md:p-10"
          aria-label="Close image"
        >
          <img
            key={item.key}
            src={item.src}
            alt={`${project.title} — ${position}`}
            className="max-h-full max-w-full object-contain"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "scale(1)" : "scale(0.98)",
              transition: "opacity 400ms ease-out, transform 400ms ease-out",
            }}
          />
        </button>

        <aside className="flex h-[40vh] flex-col overflow-y-auto bg-background md:h-screen">
          <div className="flex flex-1 flex-col justify-between gap-10 p-8 md:p-12">
            <div>
              <div className="flex items-center justify-between text-[10px] font-light uppercase tracking-[0.3em] text-muted-foreground">
                <span>{disciplineLabel}</span>
                <span>
                  {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>

              <p className="mt-10 text-[10px] font-light uppercase tracking-[0.3em] text-secondary">
                {project.category}
              </p>
              <h2 className="mt-3 font-elle text-4xl leading-none text-foreground md:text-5xl">
                {project.title}
              </h2>

              <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-xs">
                <dt className="font-light uppercase tracking-[0.25em] text-muted-foreground">
                  Discipline
                </dt>
                <dd className="text-foreground">{disciplineLabel}</dd>
                <dt className="font-light uppercase tracking-[0.25em] text-muted-foreground">Year</dt>
                <dd className="text-foreground">{project.year}</dd>
                {project.client ? (
                  <>
                    <dt className="font-light uppercase tracking-[0.25em] text-muted-foreground">
                      Client
                    </dt>
                    <dd className="text-foreground">{project.client}</dd>
                  </>
                ) : null}
              </dl>

              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>

              {project.credits && project.credits.length > 0 ? (
                <div className="mt-8 border-t border-border/40 pt-6">
                  <p className="text-[10px] font-light uppercase tracking-[0.3em] text-muted-foreground">
                    Credits
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-foreground/80">
                    {project.credits.map((c: string) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <nav className="flex items-center justify-between text-xs font-light uppercase tracking-[0.3em]">
              {onPrev ? (
                <button
                  type="button"
                  onClick={onPrev}
                  className="text-foreground hover:text-secondary"
                >
                  ← Prev
                </button>
              ) : (
                <span className="text-muted-foreground/40">← Prev</span>
              )}
              {onNext ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="text-foreground hover:text-secondary"
                >
                  Next →
                </button>
              ) : (
                <span className="text-muted-foreground/40">Next →</span>
              )}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
