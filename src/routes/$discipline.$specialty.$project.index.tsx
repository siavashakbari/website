import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, redirect, rootRouteId } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { projects } from "@/data/projects";
import {
  getStudioProjects,
  getPhotosByProject,
  subscribeToStudioStore,
  type StudioProjectItem,
} from "@/lib/studio-store";
import type { PhotoInventoryItem } from "@/data/photo-inventory";
import { pageHead, jsonLdScript, projectJsonLd } from "@/lib/seo";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
} from "@/lib/taxonomy";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { assetStemFromSrc } from "@/lib/adaptive-image";

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

    // Posters & Book Covers project-dedicated pages do not exist per specification
    if (normDisc === "graphic-design" && (normSpec === "posters" || normSpec === "book-covers")) {
      throw notFound({ routeId: rootRouteId });
    }

    // Video project page routes to /video/[project] (2 segments)
    if (normDisc === "video") {
      throw redirect({
        to: "/$discipline/$specialty",
        params: { discipline: "video", specialty: normProj },
      });
    }

    // Product Design project page routes to /product-design/[project] (2 segments)
    if (normDisc === "product-design") {
      throw redirect({
        to: "/$discipline/$specialty",
        params: { discipline: "product-design", specialty: normProj },
      });
    }

    // Find in studio projects or default static projects
    const allStudio = getStudioProjects();
    const studioFound = allStudio.find((p) => {
      const pSlug = normalizeProjectSlug(p.title);
      const pId = (p.id || "").toLowerCase();
      const pIdSlug = normalizeProjectSlug(p.id);
      return (
        pSlug === normProj ||
        p.id === normProj ||
        pIdSlug === normProj ||
        pId.endsWith(`-${normProj}`) ||
        pId.includes(normProj)
      );
    });
    const staticFound = projects.find((p) => {
      const pSlug = normalizeProjectSlug(p.title);
      const pId = (p.id || "").toLowerCase();
      const pIdSlug = normalizeProjectSlug(p.id);
      return (
        pSlug === normProj ||
        p.id === normProj ||
        pIdSlug === normProj ||
        pId.endsWith(`-${normProj}`) ||
        pId.includes(normProj)
      );
    });

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
  const loaderData = Route.useLoaderData();
  const [data, setData] = useState(loaderData);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  const refreshProjectData = () => {
    const allStudio = getStudioProjects();
    const found = allStudio.find((p) => {
      const pSlug = normalizeProjectSlug(p.title);
      const pId = (p.id || "").toLowerCase();
      const pIdSlug = normalizeProjectSlug(p.id);
      return (
        pSlug === loaderData.projectSlug ||
        p.id === loaderData.projectSlug ||
        pIdSlug === loaderData.projectSlug ||
        pId.endsWith(`-${loaderData.projectSlug}`) ||
        pId.includes(loaderData.projectSlug)
      );
    });
    const projectPhotos = getPhotosByProject(loaderData.projectSlug);

    if (found || projectPhotos.length > 0) {
      const updatedImages: string[] =
        found?.images && found.images.length > 0
          ? found.images.map((im) => im.url)
          : projectPhotos.length > 0
            ? projectPhotos.map((p) => p.imgSrc)
            : found?.gallery && found.gallery.length > 0
              ? found.gallery
              : found?.image
                ? [found.image]
                : loaderData.images;

      setData({
        ...loaderData,
        title: found?.title || loaderData.title,
        year: found?.year ? String(found.year) : loaderData.year,
        category: found?.subDiscipline || found?.category || loaderData.category,
        description: found?.description || loaderData.description,
        client: found?.client !== undefined ? found.client : loaderData.client,
        models: found?.models !== undefined ? found.models : loaderData.models,
        makeupArtist: found?.makeupArtist !== undefined ? found.makeupArtist : loaderData.makeupArtist,
        assistant: found?.assistant !== undefined ? found.assistant : loaderData.assistant,
        stylist: found?.stylist !== undefined ? found.stylist : loaderData.stylist,
        location: found?.location !== undefined ? found.location : loaderData.location,
        caption: found?.caption !== undefined ? found.caption : loaderData.caption,
        images: updatedImages.length > 0 ? updatedImages : loaderData.images,
        coverImage: updatedImages[0] || loaderData.coverImage,
      });
    }
  };

  // Client hydration for project updates saved in localStorage/admin
  useEffect(() => {
    refreshProjectData();
  }, [loaderData.projectSlug]);

  // Real-time listener: updates view as soon as admin edits anything
  useEffect(() => {
    return subscribeToStudioStore(() => {
      refreshProjectData();
    });
  }, [loaderData.projectSlug]);

  const images = data.images;

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
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isDesktop]);

  const getPhotoUrlForIndex = (src: string, i: number) => {
    const projectPhotos = getPhotosByProject(data.projectSlug);
    const cleanSrc = src.replace(/^file:/, "").toLowerCase();
    const filename = cleanSrc.split("/").pop() || "";
    const stem = assetStemFromSrc(cleanSrc).toLowerCase();

    const matched = projectPhotos.find((p) => {
      const pSrc = (p.imgSrc || "").replace(/^file:/, "").toLowerCase();
      const pStem = assetStemFromSrc(pSrc).toLowerCase();
      return (
        pStem === stem ||
        pSrc === cleanSrc ||
        pSrc.endsWith(filename) ||
        cleanSrc.endsWith(pSrc.split("/").pop() || "")
      );
    });

    const photoIdentifier =
      matched?.standardCode ||
      matched?.code ||
      projectPhotos[i]?.standardCode ||
      projectPhotos[i]?.code ||
      matched?.seoSlug ||
      `${data.projectSlug}-${i + 1}`;

    return buildPhotoUrl(data.disciplineSlug, data.specialtySlug, data.projectSlug, photoIdentifier);
  };

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
      className={isDesktop ? "flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden" : "flex flex-col pb-16"}
    >
      <div className="mx-auto grid w-full max-w-6xl shrink-0 grid-cols-[minmax(0,48rem)_auto] gap-x-4 px-4 pt-4 pb-2 md:pt-6 md:pb-3">
        <p className="col-start-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          {data.category} · {data.year}
        </p>
        <h1 className="col-start-1 mt-2 font-display text-4xl font-medium text-foreground md:text-6xl">
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

        <p className="col-start-1 mt-2 text-sm md:text-base leading-relaxed text-muted-foreground max-w-3xl">
          {data.description}
        </p>

        {/* METADATA CREDITS MATRIX */}
        {hasCredits && (
          <div className="col-start-1 mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 pt-2 border-t border-white/10 text-xs">
            {data.client && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary mr-1">
                  Client:
                </span>
                <span className="text-white font-medium">{data.client}</span>
              </div>
            )}
            {data.models && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary mr-1">
                  Model:
                </span>
                <span className="text-white font-medium">
                  {Array.isArray(data.models) ? data.models.join(", ") : data.models}
                </span>
              </div>
            )}
            {data.makeupArtist && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary mr-1">
                  MUA:
                </span>
                <span className="text-white font-medium">{data.makeupArtist}</span>
              </div>
            )}
            {data.assistant && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary mr-1">
                  Assistant:
                </span>
                <span className="text-white font-medium">{data.assistant}</span>
              </div>
            )}
            {data.stylist && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary mr-1">
                  Stylist:
                </span>
                <span className="text-white font-medium">{data.stylist}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Presentation */}
      {images.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-24 px-4 text-center">
          <p className="text-sm font-light text-muted-foreground">
            Photos for <span className="font-medium text-foreground">{data.title}</span> will appear here once linked in Assets.
          </p>
        </div>
      ) : isDesktop ? (
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="scrollbar-hide flex min-h-0 flex-1 items-center gap-6 overflow-x-auto overflow-y-hidden px-6 pb-4 pt-1"
        >
          {images.map((src: string, i: number) => {
            const isVideo = src.endsWith(".mp4");
            const photoUrl = getPhotoUrlForIndex(src, i);
            const resolvedSrc = resolveInventoryImage(src) || src;
            return (
              <Link
                key={src}
                to={photoUrl as any}
                className="group flex h-full max-h-full shrink-0 cursor-pointer items-center justify-center py-1 transition-transform duration-300 hover:scale-[1.01]"
                title={`${data.title} — Photo ${i + 1}`}
              >
                {isVideo ? (
                  <video
                    src={resolvedSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    draggable={false}
                    className="h-full w-auto max-h-full max-w-none select-none bg-card object-contain group-hover:brightness-105 transition-all"
                  />
                ) : (
                  <img
                    src={resolvedSrc}
                    alt={`${data.title} — image ${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    draggable={false}
                    className="h-full w-auto max-h-full max-w-none select-none bg-card object-contain group-hover:brightness-105 transition-all"
                  />
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-3 pt-6">
          {images.map((src: string, i: number) => {
            const isVideo = src.endsWith(".mp4");
            const photoUrl = getPhotoUrlForIndex(src, i);
            const resolvedSrc = resolveInventoryImage(src) || src;
            return (
              <Link
                key={src}
                to={photoUrl as any}
                className="w-full cursor-pointer overflow-hidden bg-card transition-opacity hover:opacity-95"
                title={`${data.title} — Photo ${i + 1}`}
              >
                {isVideo ? (
                  <video
                    src={resolvedSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full object-contain"
                  />
                ) : (
                  <img
                    src={resolvedSrc}
                    alt={`${data.title} — image ${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="w-full object-contain"
                  />
                )}
              </Link>
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
    </article>
  );
}
