import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, notFound, redirect, rootRouteId } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { projects } from "@/data/projects";
import {
  getStudioProjects,
  getPhotosByProject,
  subscribeToStudioStore,
  type StudioProjectItem,
} from "@/lib/studio-store";
import {
  getPageByRoute,
  getVaultMedia,
  subscribeToVaultStore,
  type VaultPageItem,
} from "@/lib/vault-store";
import {
  UI01_VerticalScroll,
  UI02_HorizontalScroll,
  UI03_EqualCardsGrid,
  UI04_VideoShowcase,
  PageHeader,
  HiddenPageNotice,
  type UITypeCode,
} from "@/components/ui-types";
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

    // Auto-redirect if URL project slug, discipline, or specialty differs from normalized canonical slug
    if (params.project !== normProj || params.discipline !== normDisc || params.specialty !== normSpec) {
      throw redirect({
        to: "/$discipline/$specialty/$project",
        params: {
          discipline: normDisc,
          specialty: normSpec,
          project: normProj,
        },
        replace: true,
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
    const pAny = project as any;
    const images: string[] =
      pAny?.images && pAny.images.length > 0
        ? pAny.images.map((im: any) => im.url)
        : projectPhotos.length > 0
          ? projectPhotos.map((p) => p.imgSrc)
          : pAny?.gallery && pAny.gallery.length > 0
            ? pAny.gallery
            : pAny?.image
              ? [pAny.image]
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
    const normDisc = normalizeDisciplineSlug(loaderData?.disciplineSlug || "");
    const normSpec = normalizeSpecialtySlug(loaderData?.specialtySlug || "");
    const normProj = normalizeProjectSlug(loaderData?.projectSlug || "");
    const routePath = `/${normDisc}/${normSpec}/${normProj}`;
    const vaultPage = typeof window !== "undefined" ? getPageByRoute(routePath) : null;
    const pageName = vaultPage?.name || loaderData?.title || "Project";
    const desc = vaultPage?.descriptionEn || loaderData?.description || "Case study by Siavash Akbari";
    return pageHead({
      title: `Siavash Akbari - ${pageName}`,
      description: desc,
      path: routePath,
      image: loaderData?.coverImage,
      type: "article",
    });
  },
  component: ProjectCaseStudyPage,
  errorComponent: ({ error }: { error: any }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error?.message || String(error)}</p>
    </div>
  ),
});

function computeProjectData(loaderData: any) {
  if (typeof window === "undefined") {
    return { data: loaderData, vaultPage: undefined as VaultPageItem | undefined };
  }
  const currentRoute = `/${loaderData.disciplineSlug}/${loaderData.specialtySlug}/${loaderData.projectSlug}`;
  const currentVaultPage = getPageByRoute(currentRoute);

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
    const fAny = found as any;
    const updatedImages: string[] =
      fAny?.images && fAny.images.length > 0
        ? fAny.images.map((im: any) => im.url)
        : projectPhotos.length > 0
          ? projectPhotos.map((p) => p.imgSrc)
          : fAny?.gallery && fAny.gallery.length > 0
            ? fAny.gallery
            : fAny?.image
              ? [fAny.image]
              : loaderData.images;

    return {
      data: {
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
      },
      vaultPage: currentVaultPage,
    };
  } else if (currentVaultPage) {
    return {
      data: {
        ...loaderData,
        title: currentVaultPage.name || loaderData.title,
        description: currentVaultPage.descriptionEn || loaderData.description,
        coverImage: currentVaultPage.coverPhoto || loaderData.coverImage,
      },
      vaultPage: currentVaultPage,
    };
  }
  return { data: loaderData, vaultPage: currentVaultPage };
}

function ProjectCaseStudyPage() {
  const loaderData = Route.useLoaderData();
  const currentRoute = `/${loaderData.disciplineSlug}/${loaderData.specialtySlug}/${loaderData.projectSlug}`;
  const [data, setData] = useState(() => computeProjectData(loaderData).data);
  const [vaultPage, setVaultPage] = useState<VaultPageItem | undefined>(
    () => computeProjectData(loaderData).vaultPage,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  const refreshProjectData = () => {
    const computed = computeProjectData(loaderData);
    setData(computed.data);
    setVaultPage(computed.vaultPage);
  };

  // Client hydration for project updates saved in localStorage/vault
  useEffect(() => {
    refreshProjectData();
  }, [loaderData.projectSlug]);

  // Keep browser tab title synchronized with vault page name or custom title
  useEffect(() => {
    const pageTitle = vaultPage?.name || data.title;
    if (pageTitle && typeof document !== "undefined") {
      document.title = `Siavash Akbari - ${pageTitle}`;
    }
  }, [vaultPage?.name, data.title]);

  // Real-time listener: updates view as soon as vault edits anything
  useEffect(() => {
    const unsub1 = subscribeToStudioStore(() => refreshProjectData());
    const unsub2 = subscribeToVaultStore(() => refreshProjectData());
    return () => {
      unsub1();
      unsub2();
    };
  }, [loaderData.projectSlug]);

  // Check if page is hidden in vault
  if (vaultPage?.isHidden) {
    return <HiddenPageNotice title={vaultPage.name} routePath={currentRoute} />;
  }

  // Filter out any hidden media from display
  const allVaultMedia = getVaultMedia();
  const hiddenCodeSet = new Set(
    allVaultMedia.filter((m) => m.isHidden).map((m) => m.uniqueCode.toUpperCase()),
  );

  const visibleImages = (data.images || []).filter((src: string, i: number) => {
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

    const photoCode = (
      matched?.standardCode ||
      matched?.code ||
      projectPhotos[i]?.standardCode ||
      projectPhotos[i]?.code ||
      ""
    ).toUpperCase();

    if (photoCode && hiddenCodeSet.has(photoCode)) {
      return false;
    }
    return true;
  });

  // Determine active UI type: explicit Vault selection or natural default
  const activeUiType: UITypeCode =
    vaultPage?.uiType ||
    (data.disciplineSlug === "video" ? "UI04" : isDesktop ? "UI02" : "UI01");

  const isHorizontalMode = activeUiType === "UI02" && isDesktop;

  useEffect(() => {
    if (!isHorizontalMode) return;
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isHorizontalMode]);

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

    const vMedia = allVaultMedia.find((m) => {
      const mSrc = (m.imgSrc || "").toLowerCase();
      return (
        mSrc === cleanSrc ||
        mSrc.endsWith(filename) ||
        cleanSrc.endsWith(mSrc.split("/").pop() || "") ||
        (matched && (m.uniqueCode === matched.code || m.dynamicCode.toUpperCase() === matched.code.toUpperCase()))
      );
    });

    const photoIdentifier =
      vMedia?.dynamicCode ||
      matched?.standardCode ||
      matched?.code ||
      projectPhotos[i]?.standardCode ||
      projectPhotos[i]?.code ||
      matched?.seoSlug ||
      `${data.projectSlug}-${i + 1}`;

    return buildPhotoUrl(data.disciplineSlug, data.specialtySlug, data.projectSlug, photoIdentifier);
  };

  const galleryMediaItems = visibleImages.map((src: string, i: number) => {
    const photoUrl = getPhotoUrlForIndex(src, i);
    const resolvedSrc = resolveInventoryImage(src) || src;
    return {
      id: `${data.projectSlug}-${i}`,
      src: resolvedSrc,
      alt: `${vaultPage?.name || data.title} — ${i + 1}`,
      title: `${vaultPage?.name || data.title} — ${i + 1}`,
      href: photoUrl,
    };
  });

  // Unified metadata paired boxes: Vault Page paired boxes take precedence as single source of truth
  const mergedPairedBoxes = useMemo(() => {
    if (vaultPage && Array.isArray(vaultPage.pairedBoxes) && vaultPage.pairedBoxes.length > 0) {
      return vaultPage.pairedBoxes;
    }
    const list: any[] = [];
    if (data.client) {
      list.push({ key: "Client", value: data.client });
    }
    if (data.year) {
      list.push({ key: "Year", value: String(data.year) });
    }
    if (data.models) {
      list.push({ key: "Model", value: Array.isArray(data.models) ? data.models.join(", ") : data.models });
    }
    if (data.makeupArtist) {
      list.push({ key: "MUA", value: data.makeupArtist });
    }
    if (data.assistant) {
      list.push({ key: "Assistant", value: data.assistant });
    }
    if (data.stylist) {
      list.push({ key: "Stylist", value: data.stylist });
    }
    return list;
  }, [vaultPage, data.client, data.models, data.makeupArtist, data.assistant, data.stylist, data.year]);

  const backUrl = `/${data.disciplineSlug}/${data.specialtySlug}`;

  return (
    <article
      className={
        isHorizontalMode
          ? "flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden"
          : "flex flex-col min-h-screen pb-24"
      }
    >
      <div className="mx-auto grid w-full max-w-6xl shrink-0 grid-cols-[minmax(0,48rem)_auto] gap-x-4 px-4 pt-4 pb-2 md:pt-6 md:pb-3">
        <p className="col-start-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          {data.category} · {data.year}
        </p>
        <h1 className="col-start-1 mt-2 font-display text-4xl font-medium text-foreground md:text-6xl">
          {vaultPage?.name || data.title}
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

        {/* Vault Page Header (English & Farsi Descriptions, Paired Boxes) */}
        <div className="col-start-1 col-span-full">
          <PageHeader
            title={vaultPage?.name || data.title}
            descriptionEn={vaultPage?.descriptionEn || (vaultPage?.descriptionFa ? undefined : data.description)}
            descriptionFa={vaultPage?.descriptionFa}
            pairedBoxes={mergedPairedBoxes}
            className="px-0 py-2"
          />
        </div>
      </div>

      {/* Media Presentation dynamically driven by activeUiType */}
      {visibleImages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-24 px-4 text-center">
          <p className="text-sm font-light text-muted-foreground">
            Photos for <span className="font-medium text-foreground">{vaultPage?.name || data.title}</span> will appear here once linked in Media.
          </p>
        </div>
      ) : activeUiType === "UI01" ? (
        <div className="w-full max-w-6xl mx-auto px-4 pt-4">
          <UI01_VerticalScroll items={galleryMediaItems} />
        </div>
      ) : activeUiType === "UI03" ? (
        <div className="w-full max-w-6xl mx-auto px-4 pt-4">
          <UI03_EqualCardsGrid
            cards={galleryMediaItems.map((item: { id: string; src: string; title?: string; href?: string }) => ({
              id: item.id,
              title: item.title || "",
              image: item.src,
              href: item.href || "",
            }))}
          />
        </div>
      ) : activeUiType === "UI04" ? (
        <div className="w-full max-w-6xl mx-auto px-4 pt-4">
          <UI04_VideoShowcase
            items={galleryMediaItems.map((item: { id: string; src: string; title?: string }) => ({
              id: item.id,
              src: item.src,
              title: item.title || "",
              category: data.category,
              year: data.year,
            }))}
          />
        </div>
      ) : isDesktop ? (
        /* UI02 Horizontal Strip on Desktop */
        <div
          ref={scrollRef}
          className="scrollbar-hide flex min-h-0 flex-1 items-center gap-6 overflow-x-auto overflow-y-hidden px-6 pb-4 pt-1"
        >
          {visibleImages.map((src: string, i: number) => {
            const isVideo = src.endsWith(".mp4");
            const photoUrl = getPhotoUrlForIndex(src, i);
            const resolvedSrc = resolveInventoryImage(src) || src;
            return (
              <Link
                key={src}
                to={photoUrl as any}
                className="group flex h-full max-h-full shrink-0 cursor-pointer items-center justify-center py-1 transition-transform duration-300 hover:scale-[1.01]"
                title={`${vaultPage?.name || data.title} — Photo ${i + 1}`}
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
                    alt={`${vaultPage?.name || data.title} — image ${i + 1}`}
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
        /* Mobile fallback for UI02 */
        <div className="flex flex-col gap-4 px-3 pt-6">
          {visibleImages.map((src: string, i: number) => {
            const isVideo = src.endsWith(".mp4");
            const photoUrl = getPhotoUrlForIndex(src, i);
            const resolvedSrc = resolveInventoryImage(src) || src;
            return (
              <Link
                key={src}
                to={photoUrl as any}
                className="w-full cursor-pointer overflow-hidden bg-card transition-opacity hover:opacity-95"
                title={`${vaultPage?.name || data.title} — Photo ${i + 1}`}
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
                    alt={`${vaultPage?.name || data.title} — image ${i + 1}`}
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
