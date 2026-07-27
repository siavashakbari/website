import { useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { ExpandableCard, ExpandableCardGrid } from "@/components/ui/expandable-card";
import { GalleryLoadProvider } from "@/components/AdaptiveThumb";
import { BackToTop } from "@/components/BackToTop";
import { CoverTile } from "@/components/CoverTile";
import { DISCIPLINES } from "@/data/disciplines";
import { projects, type Project } from "@/data/projects";
import { pageHead } from "@/lib/seo";

interface DisciplinePhoto {
  key: string;
  src: string;
  /** Clean caption: project title plus photo number, e.g. "Atlasi — 08" */
  imageName: string;
  title: string;
  year: string;
  category: string;
  description: string;
  client?: string;
  credits?: string[];
  photoIndex: number;
  photoTotal: number;
}

interface ProjectCardItem {
  id: string;
  title: string;
  image: string;
  year: string;
}

/** "Atlasi — 08" for multi-photo projects, just the title for single photos. */
function photoCaption(title: string, index: number, total: number): string {
  if (total <= 1) return title;
  return `${title} — ${String(index + 1).padStart(2, "0")}`;
}

function matchingProjects(discipline: (typeof DISCIPLINES)[number]): Project[] {
  const matching = projects.filter(
    (p) =>
      (!discipline.disciplines || discipline.disciplines.includes(p.discipline)) &&
      discipline.match(p.category),
  );

  if (discipline.slug !== "visual-identity") return matching;

  const leadOrder = [
    "echo-supplements",
    "ahura-cctv",
    "femiq",
    "awli",
    "cichon",
    "goats-coffee",
    "zeee-products",
  ];
  const endOrder = ["polarity", "dodareh"];

  return matching
    .map((project, index) => ({ project, index }))
    .sort((a, b) => {
      const aLead = leadOrder.indexOf(a.project.id);
      const bLead = leadOrder.indexOf(b.project.id);
      const aEnd = endOrder.indexOf(a.project.id);
      const bEnd = endOrder.indexOf(b.project.id);

      const aPos =
        aLead !== -1
          ? aLead
          : aEnd !== -1
            ? leadOrder.length + 1000 + aEnd
            : leadOrder.length + a.index;
      const bPos =
        bLead !== -1
          ? bLead
          : bEnd !== -1
            ? leadOrder.length + 1000 + bEnd
            : leadOrder.length + b.index;

      return aPos - bPos;
    })
    .map(({ project }) => project);
}

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

export const Route = createFileRoute("/$discipline")({
  loader: ({ params }) => {
    const discipline = DISCIPLINES.find((d) => d.slug === params.discipline);
    if (!discipline) throw notFound({ routeId: rootRouteId });

    const matching = matchingProjects(discipline);
    const meta = {
      slug: discipline.slug,
      label: discipline.label,
      blurb: discipline.blurb,
      browseByProject: Boolean(discipline.browseByProject),
      layout: discipline.layout ?? null,
    };

    if (discipline.browseByProject) {
      const projectCards: ProjectCardItem[] = matching.map((project) => ({
        id: project.id,
        title: project.title,
        image: project.image,
        year: project.year,
      }));
      return { discipline: meta, items: [] as DisciplinePhoto[], projectCards };
    }

    const items: DisciplinePhoto[] = [];
    matching.forEach((project: Project) => {
      const gallery = project.gallery ?? [project.image];
      gallery.forEach((src, idx) => {
        items.push({
          key: `${project.id}-${idx}`,
          src,
          imageName: photoCaption(project.title, idx, gallery.length),
          title: project.title,
          year: project.year,
          category: project.category,
          description: project.description,
          client: project.client,
          credits: project.credits,
          photoIndex: idx + 1,
          photoTotal: gallery.length,
        });
      });
    });

    return { discipline: meta, items, projectCards: [] as ProjectCardItem[] };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.discipline.label ?? "Discipline";
    const blurb =
      loaderData?.discipline.blurb ??
      `${label} work by Siavash Akbari.`;
    const slug = loaderData?.discipline.slug ?? "";
    return pageHead({
      title: `${label} — Siavash Akbari`,
      description: `${blurb} Browse the ${label.toLowerCase()} portfolio of Siavash Akbari.`,
      path: slug ? `/${slug}` : "/",
    });
  },
  component: DisciplinePage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function PhotoMasonry({ items }: { items: DisciplinePhoto[] }) {
  return (
    <GalleryLoadProvider total={items.length}>
      <ExpandableCardGrid className="columns-1 gap-x-[4px] px-[13px] sm:columns-2 lg:columns-3">
        {items.map((item, index) => (
          <ExpandableCard
            key={item.key}
            cardId={item.key}
            index={index}
            title={item.imageName}
            src={item.src}
            classNameExpanded="[&_h4]:font-medium [&_h4]:text-[#0F0F0F] dark:[&_h4]:text-[#EFEFEF]"
          >
            <h4>Name</h4>
            <p>{item.imageName}</p>
            <h4>Project</h4>
            <p>{item.title}</p>
            <h4>Date</h4>
            <p>{item.year}</p>
          </ExpandableCard>
        ))}
      </ExpandableCardGrid>
    </GalleryLoadProvider>
  );
}

function DisciplinePage() {
  const { discipline, items, projectCards } = Route.useLoaderData();
  const isDesktop = useIsDesktop();
  const isEmpty = discipline.browseByProject
    ? projectCards.length === 0
    : items.length === 0;

  // Side-scroll only on desktop / large screens; phones get the masonry gallery.
  const useSideScroll = discipline.layout === "scroll" && isDesktop;

  return (
    <section
      className={`relative w-full bg-background ${
        useSideScroll ? "overflow-hidden pt-3 md:pt-3.5" : "pb-40 pt-3 md:pt-3.5"
      }`}
      aria-labelledby="discipline-heading"
    >
      <h1 id="discipline-heading" className="sr-only">
        {discipline.label} — Siavash Akbari
      </h1>
      {isEmpty ? (
        <p className="mx-auto max-w-3xl px-6 text-center text-muted-foreground">
          More coming soon.
        </p>
      ) : useSideScroll ? (
        <ScrollGallery items={items} label={discipline.label} />
      ) : discipline.browseByProject ? (
        <div className="w-full px-[20px]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {projectCards.map((project) => (
              <CoverTile
                key={project.id}
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                label={project.title}
                image={project.image}
                ariaLabel={`View ${project.title}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <PhotoMasonry items={items} />
      )}
      <BackToTop />
    </section>
  );
}

/** Full-height horizontal side-scrolling strip with wheel-to-scroll and click-to-zoom. */
function ScrollGallery({ items, label }: { items: DisciplinePhoto[]; label: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    <>
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="scrollbar-hide flex h-[calc(100svh-3.5rem-1.5rem)] min-h-0 items-center gap-6 overflow-x-auto overflow-y-hidden px-[20px]"
      >
        {items.map((item, i) => (
          <figure
            key={item.key}
            className="shrink-0 h-full max-h-full cursor-zoom-in py-4"
            onClick={() => setActiveIndex(i)}
          >
            <img
              src={item.src}
              alt={item.imageName || `${label} — image ${i + 1}`}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-auto max-w-none rounded-[3px] bg-card object-contain"
            />
          </figure>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-[#0F0F0F] p-6"
          onClick={() => setActiveIndex(null)}
        >
          <img
            src={items[activeIndex].src}
            alt={items[activeIndex].imageName || `${label} — full view`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
