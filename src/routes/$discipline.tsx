import { useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ExpandableCard, ExpandableCardGrid } from "@/components/ui/expandable-card";
import { GalleryLoadProvider } from "@/components/AdaptiveThumb";
import { BackToTop } from "@/components/BackToTop";
import { CoverTile } from "@/components/CoverTile";
import { DISCIPLINES } from "@/data/disciplines";
import { projects, type Project } from "@/data/projects";
import { pageHead } from "@/lib/seo";
import { VideoPlayer } from "@/components/ui/video-player";
import { metaFromSrc } from "@/lib/adaptive-image";

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
    "shekarchian",
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

function VideoGallery({ items }: { items: DisciplinePhoto[] }) {
  const [activeVideo, setActiveVideo] = useState<DisciplinePhoto | null>(null);
  const [videoRatio, setVideoRatio] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectVideo = (item: DisciplinePhoto) => {
    const initialRatio = metaFromSrc(item.src).ratio || 0.5625;
    setVideoRatio(initialRatio);
    setActiveVideo(item);
  };

  useEffect(() => {
    if (!activeVideo) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeVideo]);

  const currentRatio =
    videoRatio || (activeVideo ? metaFromSrc(activeVideo.src).ratio : 0.5625) || 0.5625;

  return (
    <div className="w-full px-[13px] sm:px-[20px]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const itemRatio = metaFromSrc(item.src).ratio || 0.5625;
          return (
            <div
              key={item.key}
              onClick={() => handleSelectVideo(item)}
              style={{ aspectRatio: `${itemRatio}` }}
              className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-[#141414] transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl border border-white/5"
            >
              {/* Ambient video thumbnail preview */}
              <video
                src={item.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />

              {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />

              {/* Centered Play Button Hint on hover */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-85 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 backdrop-blur-xl border border-white/15 text-[#EFEFEF] shadow-lg">
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom Title Bar */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 md:p-6 flex items-end justify-between">
                <div>
                  <h3 className="font-display text-xl font-medium text-[#EFEFEF] tracking-wide">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#EFEFEF]/50">
                    {item.year || "2026"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STANDALONE POPUP MODAL VIDEO PLAYER (Exactly matching the video's intrinsic ratio) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeVideo && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-8">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-black/85 backdrop-blur-2xl cursor-pointer"
                  onClick={() => setActiveVideo(null)}
                />

                {/* Sized to the exact ratio of the video */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 15 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  style={{
                    aspectRatio: `${currentRatio}`,
                    maxWidth: `min(90vw, calc(86vh * ${currentRatio}))`,
                    maxHeight: "86vh",
                  }}
                  className="relative z-10 w-full rounded-[34px] overflow-hidden bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border border-white/10 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <VideoPlayer
                    src={activeVideo.src}
                    title={activeVideo.title}
                    autoPlay
                    loop
                    onClose={() => setActiveVideo(null)}
                    onRatioChange={(r) => setVideoRatio(r)}
                    className="w-full h-full"
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
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
      ) : discipline.slug === "videos" ? (
        <VideoGallery items={items} />
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
