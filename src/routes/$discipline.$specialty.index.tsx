import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { createFileRoute } from "@tanstack/react-router";
import { BackToTop } from "@/components/BackToTop";
import { DISCIPLINES } from "@/data/disciplines";
import { projects } from "@/data/projects";
import {
  getDeletedProjectIds,
  getPhotoItemBySlugOrCode,
  getStudioProjects,
  subscribeToStudioStore,
} from "@/lib/studio-store";
import {
  buildMediaLiveDetailUrl,
  FLAT_FIELDS,
  getGalleryMediaForRoute,
  getMediaByCode,
  getPageByRoute,
  getVaultPages,
  isRouteOrAncestorHidden,
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
import {
  looksLikeMediaCode,
  redirectToCanonicalPath,
} from "@/components/DedicatedPhotoView";
import { NotFoundPage } from "@/components/NotFoundPage";
import { pageHead } from "@/lib/seo";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
} from "@/lib/taxonomy";

interface SpecialtyMediaItem {
  id: string;
  key: string;
  src: string;
  code: string;
  canonicalPath: string;
  title: string;
  year: string;
  category: string;
}

interface ProjectCardItem {
  id: string;
  title: string;
  image: string;
  year: string;
  href: string;
}

interface SpecialtyRouteData {
  pendingPhotoRedirect?: boolean;
  rawPhotoCode?: string;
  disciplineSlug: string;
  specialtySlug: string;
  canonicalRoute: string;
  serverFound: boolean;
  label: string;
  blurb: string;
  isVisualIdentity: boolean;
  isVideo: boolean;
  defaultLayout: "scroll" | null;
  items: SpecialtyMediaItem[];
  projectCards: ProjectCardItem[];
  initialVaultPage?: VaultPageItem;
  initialIsHidden?: boolean;
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

function computeSpecialtyProjectCards(normDisc: string, normSpec: string): ProjectCardItem[] {
  const specRoute = `/${normDisc}/${normSpec}`.toLowerCase();
  const cardMap = new Map<string, ProjectCardItem>();
  const deletedSet = getDeletedProjectIds();

  // 1. Pull studio projects strictly belonging to this discipline & specialty
  const allStudio = getStudioProjects();
  allStudio
    .filter((p) => {
      const pDisc = normalizeDisciplineSlug(p.discipline || "");
      const pSpec = normalizeSpecialtySlug(p.subDiscipline || p.category || "");
      return pDisc === normDisc && pSpec === normSpec;
    })
    .forEach((project) => {
      const projSlug = normalizeProjectSlug(project.title || project.id);
      if (!projSlug || deletedSet.has(projSlug)) return;
      const rawCover =
        (project as any).coverImage ||
        (project as any).image ||
        (project.images && project.images[0]?.url) ||
        "";
      cardMap.set(projSlug, {
        id: project.id,
        title: project.title,
        image: resolveInventoryImage(rawCover) || rawCover,
        year: String(project.year || "2026"),
        href: `/${normDisc}/${normSpec}/${projSlug}`,
      });
    });

  // 2. Overlay all Vault Pages whose parentRoute strictly matches specRoute
  const allVault = getVaultPages();
  allVault
    .filter((p) => (p.parentRoute || "").toLowerCase().replace(/\/+$/, "") === specRoute)
    .forEach((vp) => {
      const slug = normalizeProjectSlug(vp.route.split("/").pop() || vp.name);
      if (isRouteOrAncestorHidden(vp.route, allVault) || deletedSet.has(slug)) {
        cardMap.delete(slug);
        return;
      }
      const existing = cardMap.get(slug);
      cardMap.set(slug, {
        id: vp.id,
        title: vp.name || existing?.title || slug,
        image: resolveInventoryImage(vp.coverPhoto) || vp.coverPhoto || existing?.image || "",
        year: existing?.year || "2026",
        href: vp.route,
      });
    });

  return Array.from(cardMap.values());
}

function computeChildCardsForRoute(parentRoute: string, allVault?: VaultPageItem[]): ProjectCardItem[] {
  const pages = allVault || getVaultPages();
  const parentNorm = parentRoute.toLowerCase().replace(/\/+$/, "");
  return pages
    .filter((p) => (p.parentRoute || "").toLowerCase().replace(/\/+$/, "") === parentNorm)
    .filter((p) => !isRouteOrAncestorHidden(p.route, pages))
    .map((vp) => ({
      id: vp.id,
      title: vp.name,
      image: resolveInventoryImage(vp.coverPhoto) || vp.coverPhoto,
      year: vp.pairedBoxes?.find((b) => b.key.toLowerCase() === "year")?.value || "2026",
      href: vp.route,
    }));
}

function buildSpecialtyData(normDisc: string, normSpec: string): SpecialtyRouteData {
  const canonicalRoute = `/${normDisc}/${normSpec}`;
  const vaultPage = getPageByRoute(canonicalRoute);
  const allVault = getVaultPages();

  // Flat disciplines: /video/[project] and /product-design/[project]
  if (FLAT_FIELDS.has(normDisc)) {
    const allStudio = getStudioProjects();
    const parentProject =
      allStudio.find((p) => normalizeProjectSlug(p.title) === normSpec || p.id === normSpec) ||
      projects.find((p) => normalizeProjectSlug(p.title) === normSpec || p.id === normSpec);

    const mediaItems = getGalleryMediaForRoute(canonicalRoute, { includeDescendants: true });
    const items: SpecialtyMediaItem[] = mediaItems.map((m, idx) => ({
      id: m.id || `${m.uniqueCode}-${idx}`,
      key: `${m.uniqueCode}-${idx}`,
      src: resolveInventoryImage(m.imgSrc) || m.imgSrc,
      code: m.dynamicCode,
      canonicalPath: buildMediaLiveDetailUrl(m),
      title: m.title || m.dynamicCode,
      year: m.year || "2026",
      category:
        m.category ||
        (normDisc === "video" ? "Video" : "Product Design"),
    }));

    const projectCards = computeChildCardsForRoute(canonicalRoute, allVault);
    const label =
      vaultPage?.name ||
      parentProject?.title ||
      normSpec
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
      disciplineSlug: normDisc,
      specialtySlug: normSpec,
      canonicalRoute,
      serverFound: Boolean(vaultPage || parentProject || items.length > 0 || projectCards.length > 0),
      label,
      blurb:
        vaultPage?.descriptionEn ||
        parentProject?.description ||
        `${label} ${normDisc === "video" ? "video showcase" : "product design showcase"}.`,
      isVisualIdentity: false,
      isVideo: normDisc === "video",
      defaultLayout: normDisc === "product-design" ? "scroll" : null,
      items,
      projectCards,
      initialVaultPage: vaultPage,
      initialIsHidden: isRouteOrAncestorHidden(canonicalRoute, allVault),
    };
  }

  // Standard 2-segment Discipline / Specialty (e.g. /photography/fashion-photography, /graphic-design/visual-identity, /graphic-design/posters)
  const disciplineDef =
    DISCIPLINES.find(
      (d) =>
        normalizeDisciplineSlug(d.disciplineSlug || d.slug) === normDisc &&
        normalizeSpecialtySlug(d.specialtySlug || d.slug) === normSpec,
    );

  const label =
    vaultPage?.name ||
    disciplineDef?.label ||
    normSpec
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const isVisualIdentity = normSpec === "visual-identity";
  const isVideo = normSpec === "videos" || normSpec === "video";

  const projectCards = computeSpecialtyProjectCards(normDisc, normSpec);
  const mediaItems = getGalleryMediaForRoute(canonicalRoute, { includeDescendants: true });
  const items: SpecialtyMediaItem[] = mediaItems.map((m, idx) => ({
    id: m.id || `${m.uniqueCode}-${idx}`,
    key: `${m.uniqueCode}-${idx}`,
    src: resolveInventoryImage(m.imgSrc) || m.imgSrc,
    code: m.dynamicCode,
    canonicalPath: buildMediaLiveDetailUrl(m),
    title: m.title || m.dynamicCode,
    year: m.year || "2026",
    category: m.category || label,
  }));

  return {
    disciplineSlug: normDisc,
    specialtySlug: normSpec,
    canonicalRoute,
    serverFound: Boolean(
      vaultPage || disciplineDef || projectCards.length > 0 || items.length > 0,
    ),
    label,
    blurb:
      vaultPage?.descriptionEn ||
      disciplineDef?.blurb ||
      `${label} portfolio by Siavash Akbari.`,
    isVisualIdentity,
    isVideo,
    defaultLayout: disciplineDef?.layout ?? null,
    items,
    projectCards,
    initialVaultPage: vaultPage,
    initialIsHidden: isRouteOrAncestorHidden(canonicalRoute, allVault),
  };
}

export const Route = createFileRoute("/$discipline/$specialty/")({
  loader: ({ params }): SpecialtyRouteData => {
    const normDisc = normalizeDisciplineSlug(params.discipline);
    const rawSecond = params.specialty.trim();

    // 1. Handle 2-segment photo short/dynamic code URLs (e.g. /photography/1001 or /photography/SA-FASH-ATL-01)
    const vmByCode = getMediaByCode(rawSecond);
    if (vmByCode) {
      redirectToCanonicalPath(buildMediaLiveDetailUrl(vmByCode), true);
    }
    const knownRouteSlug =
      /^(visual-identity|book-covers|posters|fashion-photography|food-photography|portrait-photography|product-photography|echo-prime|videos|products)$/i.test(
        rawSecond,
      );
    if (!knownRouteSlug) {
      const legacyPhoto = getPhotoItemBySlugOrCode(rawSecond, normDisc);
      if (legacyPhoto) {
        const legacyVm = getMediaByCode(legacyPhoto.uniqueCode || legacyPhoto.code);
        if (legacyVm) {
          redirectToCanonicalPath(buildMediaLiveDetailUrl(legacyVm), true);
        }
        if (legacyPhoto.canonicalPath) {
          redirectToCanonicalPath(legacyPhoto.canonicalPath, true);
        }
      }
      if (typeof window === "undefined" && looksLikeMediaCode(rawSecond)) {
        return {
          pendingPhotoRedirect: true,
          rawPhotoCode: rawSecond,
          disciplineSlug: normDisc,
          specialtySlug: rawSecond,
          canonicalRoute: `/${normDisc}/${rawSecond}`,
          serverFound: true,
          label: rawSecond,
          blurb: "",
          isVisualIdentity: false,
          isVideo: false,
          defaultLayout: null,
          items: [],
          projectCards: [],
        };
      }
    }

    // 2. Flat fields: redirect /video/videos -> /video and /product-design/products -> /product-design
    if (FLAT_FIELDS.has(normDisc)) {
      const normProj = normalizeProjectSlug(rawSecond);
      if (
        (normDisc === "video" && (normProj === "videos" || normProj === "video")) ||
        (normDisc === "product-design" && (normProj === "products" || normProj === "product-design"))
      ) {
        redirectToCanonicalPath(`/${normDisc}`, true);
      }
      if (params.discipline !== normDisc || params.specialty !== normProj) {
        redirectToCanonicalPath(`/${normDisc}/${normProj}`, true);
      }
      return buildSpecialtyData(normDisc, normProj);
    }

    // 3. Standard 2-segment Discipline / Specialty
    const normSpec = normalizeSpecialtySlug(rawSecond);
    if (params.discipline !== normDisc || params.specialty !== normSpec) {
      redirectToCanonicalPath(`/${normDisc}/${normSpec}`, true);
    }

    return buildSpecialtyData(normDisc, normSpec);
  },
  head: ({ loaderData }) => {
    const disc = loaderData?.disciplineSlug ?? "photography";
    const spec = loaderData?.specialtySlug ?? "fashion-photography";
    const routePath = loaderData?.canonicalRoute || `/${disc}/${spec}`;
    const vaultPage = typeof window !== "undefined" ? getPageByRoute(routePath) : null;
    const label = vaultPage?.name || loaderData?.label || "Specialty";
    const blurb =
      vaultPage?.descriptionEn || loaderData?.blurb || `${label} work by Siavash Akbari.`;
    return pageHead({
      title: `Siavash Akbari - ${label}`,
      description: `${blurb} Explore ${label.toLowerCase()} stories and visual works.`,
      path: routePath,
    });
  },
  component: SpecialtyPage,
  errorComponent: ({ error }: { error: any }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error?.message || String(error)}</p>
    </div>
  ),
});

function computeInitialSpecialtyState(loaderData: SpecialtyRouteData) {
  if (loaderData.pendingPhotoRedirect) {
    return {
      notFound: false,
      redirectTarget: null as string | null,
      data: loaderData,
      vaultPage: undefined as VaultPageItem | undefined,
      isHidden: false,
    };
  }
  return {
    notFound: false,
    redirectTarget: null as string | null,
    data: loaderData,
    vaultPage: loaderData.initialVaultPage,
    isHidden: Boolean(loaderData.initialIsHidden),
  };
}

function computeClientSpecialtyState(loaderData: SpecialtyRouteData) {
  if (loaderData.pendingPhotoRedirect || typeof window === "undefined") {
    return computeInitialSpecialtyState(loaderData);
  }

  const fresh = buildSpecialtyData(loaderData.disciplineSlug, loaderData.specialtySlug);
  const vaultPage = getPageByRoute(fresh.canonicalRoute);
  const isHidden = isRouteOrAncestorHidden(fresh.canonicalRoute);
  const exists = fresh.serverFound || loaderData.serverFound || Boolean(vaultPage);

  return {
    notFound: !exists,
    redirectTarget: null as string | null,
    data: fresh,
    vaultPage,
    isHidden,
  };
}

function SpecialtyPage() {
  const loaderData = Route.useLoaderData();
  const [state, setState] = useState(() => computeInitialSpecialtyState(loaderData));
  const [photoLookupDone, setPhotoLookupDone] = useState(false);
  const isDesktop = useIsDesktop();

  const refreshSpecialtyData = () => {
    if (loaderData.pendingPhotoRedirect && loaderData.rawPhotoCode) {
      const vm = getMediaByCode(loaderData.rawPhotoCode);
      if (vm && typeof window !== "undefined") {
        window.location.replace(buildMediaLiveDetailUrl(vm));
        return;
      }
      setPhotoLookupDone(true);
      return;
    }
    setState(computeClientSpecialtyState(loaderData));
  };

  useIsomorphicLayoutEffect(() => {
    refreshSpecialtyData();
  }, [loaderData.canonicalRoute, loaderData.pendingPhotoRedirect, loaderData.rawPhotoCode]);

  useEffect(() => {
    const unsub1 = subscribeToStudioStore(() => refreshSpecialtyData());
    const unsub2 = subscribeToVaultStore(() => refreshSpecialtyData());
    return () => {
      unsub1();
      unsub2();
    };
  }, [loaderData.canonicalRoute]);

  const { data, vaultPage, isHidden, notFound: notFoundOnClient } = state;

  useEffect(() => {
    const pageTitle = vaultPage?.name || data.label;
    if (pageTitle && typeof document !== "undefined") {
      document.title = `Siavash Akbari - ${pageTitle}`;
    }
  }, [vaultPage?.name, data.label]);

  if (loaderData.pendingPhotoRedirect) {
    if (!photoLookupDone) {
      return <div className="min-h-screen bg-background" />;
    }
    return <NotFoundPage />;
  }

  if (notFoundOnClient) {
    return <NotFoundPage />;
  }

  if (isHidden) {
    return (
      <HiddenPageNotice
        title={vaultPage?.name || data.label}
        routePath={data.canonicalRoute}
      />
    );
  }

  const visibleItems = data.items;
  const visibleProjectCards = data.projectCards;

  const useSideScroll = data.defaultLayout === "scroll" && isDesktop;
  const activeUiType: UITypeCode =
    vaultPage?.uiType ||
    (data.isVisualIdentity || (!visibleItems.length && visibleProjectCards.length > 0)
      ? "UI03"
      : data.isVideo
        ? "UI04"
        : useSideScroll
          ? "UI02"
          : "UI01");

  const isEmpty =
    activeUiType === "UI03"
      ? visibleProjectCards.length === 0 && visibleItems.length === 0
      : visibleItems.length === 0;

  return (
    <section
      className={`relative w-full bg-background ${
        activeUiType === "UI02"
          ? "min-h-screen pb-24 pt-3 md:pt-3.5 lg:min-h-0 lg:pb-0 lg:overflow-hidden"
          : "min-h-screen pb-40 pt-3 md:pt-3.5"
      }`}
      aria-labelledby="specialty-heading"
    >
      <h1 id="specialty-heading" className="sr-only">
        {vaultPage?.name || data.label} — Siavash Akbari
      </h1>

      <PageHeader
        title={vaultPage?.name || data.label}
        descriptionEn={vaultPage?.descriptionEn || (data.isVisualIdentity ? data.blurb : undefined)}
        descriptionFa={vaultPage?.descriptionFa}
        pairedBoxes={vaultPage?.pairedBoxes}
      />

      {isEmpty ? (
        <p className="mx-auto max-w-3xl px-6 py-20 text-center text-sm font-mono text-muted-foreground">
          More coming soon.
        </p>
      ) : activeUiType === "UI02" ? (
        <UI02_HorizontalScroll
          items={visibleItems.map((item) => ({
            id: item.key,
            src: item.src,
            alt: item.title,
            title: item.title,
            href: item.canonicalPath,
          }))}
          label={vaultPage?.name || data.label}
        />
      ) : activeUiType === "UI03" ? (
        <UI03_EqualCardsGrid
          cards={(visibleProjectCards.length > 0
            ? visibleProjectCards
            : visibleItems.map((it) => ({
                id: it.id,
                title: it.title,
                image: it.src,
                href: it.canonicalPath,
              }))
          ).map((p) => ({
            id: p.id,
            title: p.title,
            image: p.image,
            href: p.href,
          }))}
        />
      ) : activeUiType === "UI04" ? (
        <UI04_VideoShowcase
          items={visibleItems.map((item) => ({
            id: item.key,
            src: item.src,
            title: item.title,
            category: item.category,
            year: item.year,
          }))}
        />
      ) : (
        <UI01_VerticalScroll
          items={visibleItems.map((item) => ({
            id: item.key,
            src: item.src,
            alt: item.title,
            title: item.title,
            href: item.canonicalPath,
          }))}
        />
      )}
      <BackToTop />
    </section>
  );
}
