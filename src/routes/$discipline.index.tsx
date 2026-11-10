import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { createFileRoute } from "@tanstack/react-router";
import { BackToTop } from "@/components/BackToTop";
import {
  getDeletedProjectIds,
  getStudioProjects,
  subscribeToStudioStore,
} from "@/lib/studio-store";
import {
  buildMediaLiveDetailUrl,
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
  resolveDedicatedPhotoLoader,
} from "@/components/DedicatedPhotoView";
import { NotFoundPage } from "@/components/NotFoundPage";
import { pageHead } from "@/lib/seo";
import {
  normalizeDisciplineSlug,
  normalizeProjectSlug,
} from "@/lib/taxonomy";
import { resolveInventoryImage } from "@/lib/inventory-assets";

interface DisciplineMediaItem {
  id: string;
  key: string;
  src: string;
  code: string;
  canonicalPath: string;
  href: string;
  alt: string;
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

interface DisciplineRouteData {
  slug: string;
  canonicalRoute: string;
  serverFound: boolean;
  pendingMediaLookup?: string;
  label: string;
  blurb: string;
  defaultUiType: UITypeCode;
  items: DisciplineMediaItem[];
  projectCards: ProjectCardItem[];
  initialVaultPage?: VaultPageItem;
  initialIsHidden?: boolean;
}

const ROOT_DISCIPLINE_META: Record<
  string,
  { label: string; blurb: string; defaultUiType: UITypeCode }
> = {
  photography: {
    label: "Photography",
    blurb: "Studio photography, fashion editorials, culinary stories, and portraiture.",
    defaultUiType: "UI01",
  },
  "graphic-design": {
    label: "Graphic Design",
    blurb: "Visual identity systems, typography, editorial book design, and posters.",
    defaultUiType: "UI03",
  },
  "product-design": {
    label: "Product Design",
    blurb: "Objects shaped by purpose, material, and quiet detail.",
    defaultUiType: "UI03",
  },
  video: {
    label: "Video & Motion",
    blurb: "Moving image work — rhythm, atmosphere, and story in time.",
    defaultUiType: "UI04",
  },
};

const LEGACY_SINGLE_SEGMENT_REDIRECTS: Record<string, string> = {
  fashion: "/photography/fashion-photography",
  "fashion-photography": "/photography/fashion-photography",
  food: "/photography/food-photography",
  "food-photography": "/photography/food-photography",
  portrait: "/photography/portrait-photography",
  "portrait-photography": "/photography/portrait-photography",
  "product-photography": "/photography/product-photography",
  "visual-identity": "/graphic-design/visual-identity",
  "book-covers": "/graphic-design/book-covers",
  posters: "/graphic-design/posters",
  videos: "/video",
  products: "/product-design",
};

function computeDisciplineChildCards(slug: string): ProjectCardItem[] {
  const parentRoute = `/${slug}`.toLowerCase();
  const cardMap = new Map<string, ProjectCardItem>();
  const allVault = getVaultPages();
  const deletedSet = getDeletedProjectIds();

  if (slug === "product-design") {
    const allStudio = getStudioProjects();
    allStudio
      .filter((p) => normalizeDisciplineSlug(p.discipline || "") === "product-design")
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
          href: `/product-design/${projSlug}`,
        });
      });
  }

  allVault
    .filter((p) => (p.parentRoute || "").toLowerCase().replace(/\/+$/, "") === parentRoute)
    .forEach((vp) => {
      const childSlug = normalizeProjectSlug(vp.route.split("/").pop() || vp.name);
      if (isRouteOrAncestorHidden(vp.route, allVault) || deletedSet.has(childSlug)) {
        cardMap.delete(childSlug);
        return;
      }
      const existing = cardMap.get(childSlug);
      cardMap.set(childSlug, {
        id: vp.id,
        title: vp.name || existing?.title || childSlug,
        image: resolveInventoryImage(vp.coverPhoto) || vp.coverPhoto || existing?.image || "",
        year: vp.pairedBoxes?.find((b) => b.key.toLowerCase() === "year")?.value || existing?.year || "2026",
        href: vp.route,
      });
    });

  return Array.from(cardMap.values());
}

function buildDisciplineData(normSlug: string): DisciplineRouteData {
  const canonicalRoute = `/${normSlug}`;
  const vaultPage = getPageByRoute(canonicalRoute);
  const rootMeta = ROOT_DISCIPLINE_META[normSlug];

  const label =
    vaultPage?.name ||
    rootMeta?.label ||
    normSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const blurb =
    vaultPage?.descriptionEn ||
    rootMeta?.blurb ||
    `${label} portfolio by Siavash Akbari.`;
  const defaultUiType: UITypeCode =
    vaultPage?.uiType || rootMeta?.defaultUiType || "UI03";

  const projectCards = computeDisciplineChildCards(normSlug);
  const mediaItems = getGalleryMediaForRoute(canonicalRoute, {
    includeDescendants: true,
  });

  const items: DisciplineMediaItem[] = mediaItems.map((m, idx) => {
    const liveUrl = buildMediaLiveDetailUrl(m);
    return {
      id: m.id || m.uniqueCode || `${normSlug}-${idx}`,
      key: `${m.uniqueCode}-${idx}`,
      src: resolveInventoryImage(m.imgSrc) || m.imgSrc,
      code: m.dynamicCode,
      canonicalPath: liveUrl,
      href: liveUrl,
      alt: m.title || m.dynamicCode,
      title: m.title || m.project || m.dynamicCode,
      year: m.year || "2026",
      category: m.category || label,
    };
  });

  const serverFound = Boolean(
    vaultPage || rootMeta || projectCards.length > 0 || items.length > 0,
  );

  return {
    slug: normSlug,
    canonicalRoute,
    serverFound,
    label,
    blurb,
    defaultUiType,
    items,
    projectCards,
    initialVaultPage: vaultPage,
    initialIsHidden: isRouteOrAncestorHidden(canonicalRoute),
  };
}

export const Route = createFileRoute("/$discipline/")({
  loader: ({ params }): DisciplineRouteData => {
    const rawTrimmed = params.discipline.trim();
    const rawSlug = rawTrimmed.toLowerCase();

    // 0. 1-segment short code / dynamic code shortcut (e.g. /1211, /1221, /SA-VI-SHEK-01)
    if (looksLikeMediaCode(rawTrimmed)) {
      const resolved = resolveDedicatedPhotoLoader({
        rawDiscipline: "photography",
        rawSpecialty: "",
        rawProject: "",
        rawPhotoId: rawTrimmed,
        currentRawPath: `/${rawTrimmed}`,
      });
      if (resolved?.pendingClientLookup) {
        return {
          ...buildDisciplineData(rawSlug),
          serverFound: true,
          pendingMediaLookup: rawTrimmed,
        };
      }
    }

    // 1. Legacy 1-segment shortcuts redirect cleanly to their hierarchical 2-segment / 1-segment routes
    const legacyTarget = LEGACY_SINGLE_SEGMENT_REDIRECTS[rawSlug];
    if (legacyTarget) {
      redirectToCanonicalPath(legacyTarget, true);
    }

    const normSlug = normalizeDisciplineSlug(rawSlug);
    if (params.discipline !== normSlug && ROOT_DISCIPLINE_META[normSlug]) {
      redirectToCanonicalPath(`/${normSlug}`, true);
    }

    return buildDisciplineData(normSlug);
  },
  head: ({ loaderData }) => {
    const routePath = loaderData?.canonicalRoute || `/${loaderData?.slug || "photography"}`;
    const vaultPage = typeof window !== "undefined" ? getPageByRoute(routePath) : null;
    const label = vaultPage?.name || loaderData?.label || "Discipline";
    const blurb =
      vaultPage?.descriptionEn ||
      loaderData?.blurb ||
      `${label} work by Siavash Akbari.`;
    return pageHead({
      title: `Siavash Akbari - ${label}`,
      description: `${blurb} Browse the ${label.toLowerCase()} portfolio of Siavash Akbari.`,
      path: routePath,
    });
  },
  component: DisciplinePage,
  errorComponent: ({ error }: { error: any }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error?.message || String(error)}</p>
    </div>
  ),
});

function computeInitialDisciplineState(loaderData: DisciplineRouteData) {
  return {
    notFound: false,
    data: loaderData,
    vaultPage: loaderData.initialVaultPage,
    isHidden: Boolean(loaderData.initialIsHidden),
  };
}

function computeClientDisciplineState(loaderData: DisciplineRouteData) {
  if (typeof window === "undefined") {
    return computeInitialDisciplineState(loaderData);
  }
  if (loaderData.pendingMediaLookup) {
    const matched = getMediaByCode(loaderData.pendingMediaLookup);
    if (!matched) {
      return {
        notFound: true,
        data: loaderData,
        vaultPage: undefined,
        isHidden: false,
      };
    }
  }
  const fresh = buildDisciplineData(loaderData.slug);
  const vaultPage = getPageByRoute(fresh.canonicalRoute);
  const isHidden = isRouteOrAncestorHidden(fresh.canonicalRoute);
  const exists = fresh.serverFound || loaderData.serverFound || Boolean(vaultPage);

  return {
    notFound: !exists,
    data: fresh,
    vaultPage,
    isHidden,
  };
}

function DisciplinePage() {
  const loaderData = Route.useLoaderData();
  const [state, setState] = useState(() => computeInitialDisciplineState(loaderData));

  useEffect(() => {
    if (!loaderData.pendingMediaLookup || typeof window === "undefined") return;
    const matched = getMediaByCode(loaderData.pendingMediaLookup);
    if (matched) {
      const target = buildMediaLiveDetailUrl(matched);
      window.location.replace(target);
    }
  }, [loaderData.pendingMediaLookup]);

  const refreshData = () => {
    setState(computeClientDisciplineState(loaderData));
  };

  useIsomorphicLayoutEffect(() => {
    refreshData();
  }, [loaderData.canonicalRoute]);

  useEffect(() => {
    const unsubStudio = subscribeToStudioStore(() => refreshData());
    const unsubVault = subscribeToVaultStore(() => refreshData());
    return () => {
      unsubStudio();
      unsubVault();
    };
  }, [loaderData.canonicalRoute]);

  const { data, vaultPage, isHidden, notFound: notFoundOnClient } = state;

  useEffect(() => {
    const pageTitle = vaultPage?.name || data.label;
    if (pageTitle && typeof document !== "undefined") {
      document.title = `Siavash Akbari - ${pageTitle}`;
    }
  }, [vaultPage?.name, data.label]);

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

  const activeUiType: UITypeCode =
    vaultPage?.uiType ||
    data.defaultUiType ||
    (data.slug === "video" ? "UI04" : visibleItems.length > 0 ? "UI01" : "UI03");

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
      aria-labelledby="discipline-heading"
    >
      <h1 id="discipline-heading" className="sr-only">
        {vaultPage?.name || data.label} — Siavash Akbari
      </h1>

      <PageHeader
        title={vaultPage?.name || data.label}
        descriptionEn={vaultPage?.descriptionEn || data.blurb}
        descriptionFa={vaultPage?.descriptionFa}
        pairedBoxes={vaultPage?.pairedBoxes}
      />

      {isEmpty ? (
        <p className="mx-auto max-w-3xl px-6 text-center text-muted-foreground py-16">
          More coming soon.
        </p>
      ) : activeUiType === "UI02" ? (
        <UI02_HorizontalScroll
          items={visibleItems}
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
                href: it.href,
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
          items={visibleItems.map((v) => ({
            id: v.id,
            src: v.src,
            title: v.title,
            category: v.category,
            year: v.year,
          }))}
        />
      ) : (
        <UI01_VerticalScroll items={visibleItems} />
      )}
      <BackToTop />
    </section>
  );
}
