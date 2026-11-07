import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, rootRouteId } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AdaptiveThumb, GalleryLoadProvider } from "@/components/AdaptiveThumb";
import { BackToTop } from "@/components/BackToTop";
import { CoverTile } from "@/components/CoverTile";
import { DISCIPLINES } from "@/data/disciplines";
import { projects, type Project } from "@/data/projects";
import { getPhotosBySpecialty } from "@/lib/studio-store";
import { pageHead } from "@/lib/seo";
import { VideoPlayer } from "@/components/ui/video-player";
import { metaFromSrc } from "@/lib/adaptive-image";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  buildPhotoUrl,
} from "@/lib/taxonomy";

interface SpecialtyPhoto {
  key: string;
  src: string;
  code: string;
  canonicalPath: string;
  disciplineSlug: string;
  specialtySlug: string;
  projectSlug: string;
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
  href?: string;
}

function photoCaption(title: string, index: number, total: number): string {
  if (total <= 1) return title;
  return `${title} — ${String(index + 1).padStart(2, "0")}`;
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

export const Route = createFileRoute("/$discipline/$specialty/")({
  loader: ({ params }) => {
    const normDisc = normalizeDisciplineSlug(params.discipline);
    const normSpec = normalizeSpecialtySlug(params.specialty);

    const disciplineDef = DISCIPLINES.find(
      (d) =>
        normalizeDisciplineSlug(d.slug) === normDisc &&
        normalizeSpecialtySlug(d.slug) === normSpec,
    ) || DISCIPLINES.find((d) => d.slug.includes(normSpec));

    const label =
      disciplineDef?.label ||
      `${normSpec.charAt(0).toUpperCase() + normSpec.slice(1).replace("-", " ")} ${normDisc.charAt(0).toUpperCase() + normDisc.slice(1)}`;

    const isVisualIdentity = normSpec === "visual-identity";
    const isVideo = normSpec === "videos" || normSpec === "video";

    if (isVisualIdentity) {
      const matching = projects.filter(
        (p) =>
          p.category.toLowerCase().includes("identity") ||
          p.discipline === "graphic-design",
      );
      const projectCards: ProjectCardItem[] = matching.map((project) => ({
        id: project.id,
        title: project.title,
        image: project.image,
        year: project.year,
        href: `/${normDisc}/${normSpec}/${project.id}`,
      }));
      return {
        disciplineSlug: normDisc,
        specialtySlug: normSpec,
        label,
        blurb: disciplineDef?.blurb || `${label} showcase by Siavash Akbari.`,
        isVisualIdentity: true,
        isVideo: false,
        layout: disciplineDef?.layout ?? null,
        items: [] as SpecialtyPhoto[],
        projectCards,
      };
    }

    // Get all photos in this specialty
    const photos = getPhotosBySpecialty(normSpec, normDisc);
    const items: SpecialtyPhoto[] = photos.map((p, idx) => ({
      key: `${p.code}-${idx}`,
      src: resolveInventoryImage(p.imgSrc) || p.imgSrc,
      code: p.standardCode || p.code,
      canonicalPath:
        p.canonicalPath ||
        buildPhotoUrl(normDisc, normSpec, p.projectSlug || "project", p.standardCode || p.code),
      disciplineSlug: normDisc,
      specialtySlug: normSpec,
      projectSlug: p.projectSlug || "project",
      imageName: p.title || photoCaption(p.project, idx, photos.length),
      title: p.project,
      year: p.date || "2026",
      category: p.subdiscipline || label,
      description: p.caption || "",
      client: p.client,
      photoIndex: idx + 1,
      photoTotal: photos.length,
    }));

    return {
      disciplineSlug: normDisc,
      specialtySlug: normSpec,
      label,
      blurb: disciplineDef?.blurb || `${label} photography by Siavash Akbari.`,
      isVisualIdentity: false,
      isVideo,
      layout: disciplineDef?.layout ?? null,
      items,
      projectCards: [] as ProjectCardItem[],
    };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.label ?? "Specialty";
    const blurb = loaderData?.blurb ?? `${label} work by Siavash Akbari.`;
    const disc = loaderData?.disciplineSlug ?? "photography";
    const spec = loaderData?.specialtySlug ?? "fashion";
    return pageHead({
      title: `${label} — Siavash Akbari`,
      description: `${blurb} Explore ${label.toLowerCase()} stories and visual works.`,
      path: `/${disc}/${spec}`,
    });
  },
  component: SpecialtyPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function SpecialtyPage() {
  const data = Route.useLoaderData();
  const isDesktop = useIsDesktop();
  const isEmpty = data.isVisualIdentity
    ? data.projectCards.length === 0
    : data.items.length === 0;

  const useSideScroll = data.layout === "scroll" && isDesktop;

  return (
    <section
      className={`relative w-full bg-background ${
        useSideScroll ? "overflow-hidden pt-3 md:pt-3.5" : "pb-40 pt-3 md:pt-3.5"
      }`}
      aria-labelledby="specialty-heading"
    >
      <h1 id="specialty-heading" className="sr-only">
        {data.label} — Siavash Akbari
      </h1>

      {isEmpty ? (
        <p className="mx-auto max-w-3xl px-6 text-center text-muted-foreground">
          More coming soon.
        </p>
      ) : useSideScroll ? (
        <ScrollGallery items={data.items} label={data.label} />
      ) : data.isVisualIdentity ? (
        <div className="w-full px-[20px]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {data.projectCards.map((project) => (
              <CoverTile
                key={project.id}
                to={project.href || `/${data.disciplineSlug}/${data.specialtySlug}/${project.id}`}
                label={project.title}
                image={project.image}
                ariaLabel={`View ${project.title}`}
              />
            ))}
          </div>
        </div>
      ) : data.isVideo ? (
        <VideoGallery items={data.items} />
      ) : (
        <PhotoMasonry items={data.items} />
      )}
      <BackToTop />
    </section>
  );
}

function PhotoMasonry({ items }: { items: SpecialtyPhoto[] }) {
  return (
    <GalleryLoadProvider total={items.length}>
      <div className="columns-1 gap-x-[4px] px-[13px] sm:columns-2 lg:columns-3">
        {items.map((item, index) => (
          <div key={item.key} className="relative mb-[4px] break-inside-avoid">
            <Link
              to={item.canonicalPath as any}
              className="group relative block w-full overflow-hidden bg-[#0F0F0F] transition-opacity hover:opacity-90 cursor-pointer"
            >
              <AdaptiveThumb
                src={item.src}
                index={index}
                alt={item.imageName}
                className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            </Link>
          </div>
        ))}
      </div>
    </GalleryLoadProvider>
  );
}

function VideoGallery({ items }: { items: SpecialtyPhoto[] }) {
  const [activeVideo, setActiveVideo] = useState<SpecialtyPhoto | null>(null);
  const [videoRatio, setVideoRatio] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectVideo = (item: SpecialtyPhoto) => {
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
              className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-[#141414] transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl border border-white/5 flex items-center justify-center"
            >
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-40 transition-opacity duration-300 group-hover:opacity-20" />
              <div className="pointer-events-none absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110">
                <Play className="h-4 w-4 fill-white translate-x-[1px]" />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD166] block">
                  {item.category}
                </span>
                <span className="text-sm font-medium text-white truncate block">
                  {item.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeVideo && (
              <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
                onClick={() => setActiveVideo(null)}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />
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
          document.body,
        )}
    </div>
  );
}

function ScrollGallery({ items, label }: { items: SpecialtyPhoto[]; label: string }) {
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
