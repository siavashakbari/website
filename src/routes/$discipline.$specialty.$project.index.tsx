import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { projectBackButtonClass, projectBackButtonMobileClass } from "@/components/ui-types/project-navigation";
import { projects } from "@/data/projects";
import {
  getStudioProjects,
  subscribeToStudioStore,
} from "@/lib/studio-store";
import {
  buildMediaLiveDetailUrl,
  FLAT_FIELDS,
  getDeletedVaultPageKeys,
  getGalleryMediaForRoute,
  getPageByRoute,
  isRouteOrAncestorHidden,
  subscribeToVaultStore,
  type VaultMediaItem,
  type VaultPageItem,
} from "@/lib/vault-store";
import { useResolvedMediaSrc } from "@/lib/local-media-db";
import {
  UI01_VerticalScroll,
  UI03_EqualCardsGrid,
  UI04_VideoShowcase,
  PageHeader,
  HiddenPageNotice,
  type UITypeCode,
} from "@/components/ui-types";
import {
  DedicatedPhotoView,
  dedicatedPhotoHead,
  looksLikeMediaCode,
  redirectToCanonicalPath,
  resolveDedicatedPhotoLoader,
  type DedicatedPhotoLoaderData,
} from "@/components/DedicatedPhotoView";
import { NotFoundPage } from "@/components/NotFoundPage";
import { pageHead } from "@/lib/seo";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
} from "@/lib/taxonomy";
import { resolveInventoryImage } from "@/lib/inventory-assets";

interface ResolvedGalleryItem {
  id: string;
  src: string;
  title: string;
  href: string;
  isVideo: boolean;
}

interface ProjectRouteLoaderData {
  kind: "project";
  disciplineSlug: string;
  specialtySlug: string;
  projectSlug: string;
  canonicalRoute: string;
  serverFound: boolean;
  title: string;
  year: string;
  category: string;
  parentName: string;
  description: string;
  client?: string;
  models?: string;
  makeupArtist?: string;
  assistant?: string;
  stylist?: string;
  location?: string;
  caption?: string;
  items: ResolvedGalleryItem[];
  coverImage: string;
  initialVaultPage?: VaultPageItem;
  initialIsHidden?: boolean;
}

type CombinedLoaderData =
  | { kind: "photo"; photoLoaderData: DedicatedPhotoLoaderData }
  | ProjectRouteLoaderData;

function buildGalleryItemsForProject(
  canonicalRoute: string,
  projectSlug: string,
  displayTitle: string,
): ResolvedGalleryItem[] {
  const vaultItems: VaultMediaItem[] = getGalleryMediaForRoute(canonicalRoute);
  return vaultItems.map((m, i) => ({
    id: m.id || `${projectSlug}-${i}`,
    src: resolveInventoryImage(m.imgSrc) || m.imgSrc,
    title: m.title || `${displayTitle} — ${i + 1}`,
    href: buildMediaLiveDetailUrl(m),
    isVideo:
      Boolean(m.isVideo) ||
      /\.(mp4|webm|mov)(\?|#|$)|^data:video\//i.test(m.imgSrc || ""),
  }));
}

function findMatchingProject(normProj: string) {
  const allStudio = getStudioProjects();
  const studioFound = allStudio.find((p) => {
    const pSlug = normalizeProjectSlug(p.title);
    const pId = (p.id || "").toLowerCase();
    const pIdSlug = normalizeProjectSlug(p.id);
    return (
      pSlug === normProj ||
      p.id === normProj ||
      pIdSlug === normProj ||
      pId.endsWith(`-${normProj}`)
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
      pId.endsWith(`-${normProj}`)
    );
  });
  return studioFound || staticFound;
}

export const Route = createFileRoute("/$discipline/$specialty/$project/")({
  loader: ({ params }): CombinedLoaderData => {
    const normDisc = normalizeDisciplineSlug(params.discipline);
    const normSpec = normalizeSpecialtySlug(params.specialty);
    const rawThird = params.project.trim();
    const currentRawPath = `/${params.discipline}/${params.specialty}/${params.project}`;

    // 1. Check if the 3rd segment is a photo/media code (e.g. /graphic-design/posters/1306-... or /product-design/chair/5001-...)
    const resolvedPhoto = resolveDedicatedPhotoLoader({
      rawDiscipline: params.discipline,
      rawSpecialty: FLAT_FIELDS.has(normDisc) ? "" : params.specialty,
      rawProject: FLAT_FIELDS.has(normDisc) ? params.specialty : "",
      rawPhotoId: rawThird,
      currentRawPath,
      allowMissingReturnNull: true,
    });
    if (resolvedPhoto) {
      return { kind: "photo", photoLoaderData: resolvedPhoto };
    }

    if (typeof window === "undefined" && looksLikeMediaCode(rawThird)) {
      return {
        kind: "photo",
        photoLoaderData: {
          pendingClientLookup: true,
          rawPhotoId: rawThird,
          currentRawPath,
          disciplineSlug: normDisc,
          specialtySlug: FLAT_FIELDS.has(normDisc) ? "" : normSpec,
          projectSlug: FLAT_FIELDS.has(normDisc) ? normalizeProjectSlug(params.specialty) : "",
          galleryRoute: `/${normDisc}/${params.specialty}`,
          photo: null,
          projectDescription: "",
          resolvedImage: "",
          prevTarget: null,
          nextTarget: null,
          currentIndex: 1,
          totalPhotos: 1,
          isHidden: false,
        },
      };
    }

    const normProj = normalizeProjectSlug(rawThird);

    // 2. Posters legacy 3-segment sub-routes redirect to /graphic-design/posters unless custom Vault page exists
    if (
      normDisc === "graphic-design" &&
      normSpec === "posters" &&
      (normProj === "posters" || normProj === "nozad-publications")
    ) {
      throw redirect({
        to: "/$discipline/$specialty",
        params: { discipline: "graphic-design", specialty: "posters" },
        replace: true,
      });
    }

    // 3. Flat disciplines (Video & Product Design) normalize legacy 3-segment URLs -> 2-segment routes
    if (FLAT_FIELDS.has(normDisc)) {
      const targetProj =
        normProj === "videos" || normProj === "products" || normProj === normDisc
          ? normalizeProjectSlug(params.specialty)
          : normProj;
      redirectToCanonicalPath(`/${normDisc}/${targetProj}`, true);
    }

    // 4. Redirect if slug/casing aliases differ from canonical 3-segment route
    const canonicalRoute = `/${normDisc}/${normSpec}/${normProj}`;
    if (
      params.discipline !== normDisc ||
      params.specialty !== normSpec ||
      params.project !== normProj
    ) {
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

    const vaultPage = getPageByRoute(canonicalRoute);
    const project = findMatchingProject(normProj);
    const pAny = project as any;
    const sameStaticProject =
      project &&
      normalizeProjectSlug(project.title || project.id || "") === normProj;

    const title =
      vaultPage?.name ||
      (sameStaticProject ? project?.title : "") ||
      normProj
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    const items = buildGalleryItemsForProject(canonicalRoute, normProj, title);
    const serverFound = Boolean(vaultPage || (sameStaticProject && project) || items.length > 0);
    const coverImage =
      (vaultPage?.coverPhoto ? resolveInventoryImage(vaultPage.coverPhoto) || vaultPage.coverPhoto : "") ||
      items[0]?.src ||
      "";

    const parentRoute = vaultPage?.parentRoute || `/${normDisc}/${normSpec}`;
    const parentPage = getPageByRoute(parentRoute);
    const parentName =
      parentPage?.name ||
      normSpec
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
      kind: "project",
      disciplineSlug: normDisc,
      specialtySlug: normSpec,
      projectSlug: normProj,
      canonicalRoute,
      serverFound,
      title,
      year: sameStaticProject && project?.year ? String(project.year) : "2026",
      category:
        (sameStaticProject ? project?.subDiscipline || project?.category : "") ||
        normSpec,
      parentName,
      description:
        vaultPage?.descriptionEn ||
        (sameStaticProject ? project?.description : "") ||
        `${title} creative showcase.`,
      client: sameStaticProject ? project?.client : undefined,
      models:
        sameStaticProject && pAny?.models
          ? Array.isArray(pAny.models)
            ? pAny.models.join(", ")
            : pAny.models
          : undefined,
      makeupArtist: sameStaticProject ? project?.makeupArtist : undefined,
      assistant: sameStaticProject ? project?.assistant : undefined,
      stylist: sameStaticProject ? project?.stylist : undefined,
      location: sameStaticProject ? project?.location : undefined,
      caption: sameStaticProject ? project?.caption : undefined,
      items,
      coverImage,
      initialVaultPage: vaultPage,
      initialIsHidden: isRouteOrAncestorHidden(canonicalRoute),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return pageHead({ title: "Siavash Akbari", description: "", path: "/" });
    }
    if (loaderData.kind === "photo") {
      return dedicatedPhotoHead(loaderData.photoLoaderData);
    }
    const vaultPage =
      typeof window !== "undefined" ? getPageByRoute(loaderData.canonicalRoute) : null;
    const pageName = vaultPage?.name || loaderData.title || "Project";
    const desc =
      vaultPage?.descriptionEn ||
      loaderData.description ||
      "Case study by Siavash Akbari";
    return pageHead({
      title: `Siavash Akbari - ${pageName}`,
      description: desc,
      path: loaderData.canonicalRoute,
      image: loaderData.coverImage,
      type: "article",
    });
  },
  component: ProjectOrPhotoRouteComponent,
  errorComponent: ({ error }: { error: any }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error?.message || String(error)}</p>
    </div>
  ),
});

function computeInitialProjectState(loaderData: ProjectRouteLoaderData) {
  return {
    notFound: false,
    data: loaderData,
    vaultPage: loaderData.initialVaultPage,
    isHidden: Boolean(loaderData.initialIsHidden),
  };
}

function computeClientProjectState(loaderData: ProjectRouteLoaderData) {
  if (typeof window === "undefined") {
    return computeInitialProjectState(loaderData);
  }

  const currentVaultPage = getPageByRoute(loaderData.canonicalRoute);
  const isDeleted = getDeletedVaultPageKeys().has(loaderData.canonicalRoute.toLowerCase());
  const project = findMatchingProject(loaderData.projectSlug);
  const pAny = project as any;
  const sameStaticProject =
    project &&
    normalizeProjectSlug(project.title || project.id || "") === loaderData.projectSlug;

  const title =
    currentVaultPage?.name ||
    (sameStaticProject ? project?.title : "") ||
    loaderData.projectSlug
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const items = buildGalleryItemsForProject(
    loaderData.canonicalRoute,
    loaderData.projectSlug,
    title,
  );
  const isHidden = isRouteOrAncestorHidden(loaderData.canonicalRoute);
  const existsOnClient = !isDeleted && Boolean(currentVaultPage || items.length > 0);
  const parentRoute =
    currentVaultPage?.parentRoute || `/${loaderData.disciplineSlug}/${loaderData.specialtySlug}`;
  const parentPage = getPageByRoute(parentRoute);
  const parentName =
    parentPage?.name ||
    loaderData.parentName ||
    loaderData.specialtySlug.replace(/-/g, " ");

  return {
    notFound: !existsOnClient,
    vaultPage: currentVaultPage,
    isHidden,
    data: {
      ...loaderData,
      title,
      year: sameStaticProject && project?.year ? String(project.year) : loaderData.year,
      category:
        (sameStaticProject ? project?.subDiscipline || project?.category : "") ||
        loaderData.category,
      parentName,
      description:
        currentVaultPage?.descriptionEn ||
        (sameStaticProject ? project?.description : "") ||
        loaderData.description,
      client:
        sameStaticProject && project?.client !== undefined ? project.client : loaderData.client,
      models:
        sameStaticProject && pAny?.models !== undefined
          ? Array.isArray(pAny.models)
            ? pAny.models.join(", ")
            : pAny.models
          : loaderData.models,
      makeupArtist:
        sameStaticProject && project?.makeupArtist !== undefined
          ? project.makeupArtist
          : loaderData.makeupArtist,
      assistant:
        sameStaticProject && project?.assistant !== undefined
          ? project.assistant
          : loaderData.assistant,
      stylist:
        sameStaticProject && project?.stylist !== undefined
          ? project.stylist
          : loaderData.stylist,
      location:
        sameStaticProject && project?.location !== undefined
          ? project.location
          : loaderData.location,
      caption:
        sameStaticProject && project?.caption !== undefined
          ? project.caption
          : loaderData.caption,
      items,
      coverImage: items[0]?.src || loaderData.coverImage,
    },
  };
}

function ProjectOrPhotoRouteComponent() {
  const loaderData = Route.useLoaderData();
  if (loaderData.kind === "photo") {
    return <DedicatedPhotoView loaderData={loaderData.photoLoaderData} />;
  }
  return <ProjectCaseStudyPage loaderData={loaderData} />;
}

function ProjectCaseStudyPage({ loaderData }: { loaderData: ProjectRouteLoaderData }) {
  const [state, setState] = useState(() => computeInitialProjectState(loaderData));
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshProjectData = () => {
    setState(computeClientProjectState(loaderData));
  };

  useIsomorphicLayoutEffect(() => {
    refreshProjectData();
  }, [loaderData.canonicalRoute]);

  useEffect(() => {
    const unsub1 = subscribeToStudioStore(() => refreshProjectData());
    const unsub2 = subscribeToVaultStore(() => refreshProjectData());
    return () => {
      unsub1();
      unsub2();
    };
  }, [loaderData.canonicalRoute]);

  const { data, vaultPage, isHidden, notFound: notFoundOnClient } = state;

  useEffect(() => {
    const pageTitle = vaultPage?.name || data.title;
    if (pageTitle && typeof document !== "undefined") {
      document.title = `Siavash Akbari - ${pageTitle}`;
    }
  }, [vaultPage?.name, data.title]);

  const activeUiType: UITypeCode =
    vaultPage?.uiType || (data.disciplineSlug === "video" ? "UI04" : "UI02");

  const isHorizontalMode = activeUiType === "UI02";

  useEffect(() => {
    if (!isHorizontalMode) return;
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 1024) return;
      if (e.deltaY !== 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isHorizontalMode]);

  const mergedPairedBoxes = useMemo(() => {
    if (vaultPage && Array.isArray(vaultPage.pairedBoxes) && vaultPage.pairedBoxes.length > 0) {
      return vaultPage.pairedBoxes;
    }
    const list: { key: string; value: string }[] = [];
    if (data.client) list.push({ key: "Client", value: data.client });
    if (data.year) list.push({ key: "Year", value: String(data.year) });
    if (data.models) list.push({ key: "Model", value: data.models });
    if (data.makeupArtist) list.push({ key: "MUA", value: data.makeupArtist });
    if (data.assistant) list.push({ key: "Assistant", value: data.assistant });
    if (data.stylist) list.push({ key: "Stylist", value: data.stylist });
    return list;
  }, [vaultPage, data.client, data.models, data.makeupArtist, data.assistant, data.stylist, data.year]);

  if (notFoundOnClient) {
    return <NotFoundPage />;
  }

  if (isHidden) {
    return (
      <HiddenPageNotice
        title={vaultPage?.name || data.title}
        routePath={data.canonicalRoute}
      />
    );
  }

  const defaultBackUrl = `/${data.disciplineSlug}/${data.specialtySlug}`;
  const backUrl = vaultPage?.parentRoute || defaultBackUrl;
  const backLabelName = data.parentName || data.specialtySlug.replace(/-/g, " ");
  const visibleItems = data.items;

  return (
    <article
      className={
        isHorizontalMode
          ? "flex min-h-screen flex-col pb-24 lg:h-[calc(100dvh-3.5rem)] lg:max-h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:pb-0 lg:overflow-hidden"
          : "flex flex-col min-h-screen pb-24"
      }
    >
      <div className="mx-auto grid w-full max-w-6xl shrink-0 grid-cols-[minmax(0,48rem)_auto] gap-x-4 px-4 pt-4 pb-2 md:pt-6 md:pb-3">
        <p className="col-start-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          {data.parentName || data.category} · {data.year}
        </p>
        <h1 className="col-start-1 mt-2 font-display text-lg font-medium text-foreground md:text-3xl">
          {vaultPage?.name || data.title}
        </h1>

        <Link
          to={backUrl as any}
          className={`${projectBackButtonClass} hidden lg:inline-flex col-start-2 row-start-2 self-center justify-self-end translate-y-[5px]`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="capitalize">Back to {backLabelName}</span>
        </Link>

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

      {visibleItems.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-24 px-4 text-center">
          <p className="text-sm font-light text-muted-foreground">
            Photos for <span className="font-medium text-foreground">{vaultPage?.name || data.title}</span> will appear here once linked in Media.
          </p>
        </div>
      ) : activeUiType === "UI01" ? (
        <div className="w-full max-w-6xl mx-auto px-4 pt-4">
          <UI01_VerticalScroll
            items={visibleItems.map((item) => ({
              id: item.id,
              src: item.src,
              alt: item.title,
              title: item.title,
              href: item.href,
            }))}
          />
        </div>
      ) : activeUiType === "UI03" ? (
        <div className="w-full max-w-6xl mx-auto px-4 pt-4">
          <UI03_EqualCardsGrid
            cards={visibleItems.map((item) => ({
              id: item.id,
              title: item.title,
              image: item.src,
              href: item.href || data.canonicalRoute,
            }))}
          />
        </div>
      ) : activeUiType === "UI04" ? (
        <div className="w-full max-w-6xl mx-auto px-4 pt-4">
          <UI04_VideoShowcase
            items={visibleItems.map((item) => ({
              id: item.id,
              src: item.src,
              title: item.title,
              category: data.category,
              year: data.year,
            }))}
          />
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex flex-col gap-4 px-3 pt-4 lg:scrollbar-hide lg:flex-row lg:min-h-0 lg:flex-1 lg:items-center lg:gap-6 lg:overflow-x-auto lg:overflow-y-hidden lg:px-6 lg:pb-4 lg:pt-1"
        >
          {visibleItems.map((item, i) => (
            <ProjectStripItem
              key={item.id || i}
              item={item}
              index={i}
              fallbackRoute={data.canonicalRoute}
            />
          ))}
        </div>
      )}

      <div className="mx-auto mt-6 flex lg:hidden w-full max-w-6xl justify-center px-3">
        <Link to={backUrl as any} className={projectBackButtonMobileClass}>
          <ArrowLeft className="h-4 w-4" />
          <span className="capitalize">Back to {backLabelName}</span>
        </Link>
      </div>
    </article>
  );
}

function ProjectStripItem({
  item,
  index,
  fallbackRoute,
}: {
  item: ResolvedGalleryItem;
  index: number;
  fallbackRoute: string;
}) {
  const resolvedSrc = useResolvedMediaSrc(item.src);
  return (
    <Link
      to={(item.href || fallbackRoute) as any}
      className="group w-full cursor-pointer overflow-hidden bg-card transition-opacity hover:opacity-95 lg:flex lg:h-full lg:max-h-full lg:w-auto lg:shrink-0 lg:items-center lg:justify-center lg:overflow-visible lg:bg-transparent lg:py-1 lg:transition-transform lg:duration-300 lg:hover:scale-[1.01] lg:hover:opacity-100"
      title={item.title}
    >
      {item.isVideo ? (
        <video
          src={resolvedSrc || undefined}
          autoPlay
          muted
          loop
          playsInline
          draggable={false}
          className="w-full h-auto select-none bg-card object-contain transition-all lg:h-full lg:w-auto lg:max-h-full lg:max-w-none lg:group-hover:brightness-105"
        />
      ) : (
        <img
          src={resolvedSrc || undefined}
          alt={item.title}
          loading={index < 2 ? "eager" : "lazy"}
          draggable={false}
          className="w-full h-auto select-none bg-card object-contain transition-all lg:h-full lg:w-auto lg:max-h-full lg:max-w-none lg:group-hover:brightness-105"
        />
      )}
    </Link>
  );
}
