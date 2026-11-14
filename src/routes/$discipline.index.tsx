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
  getDeletedVaultPageKeys,
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
import { currentLocale, localizedText, withLocale } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";
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
  { label: string; labelFa: string; blurb: string; blurbFa: string; defaultUiType: UITypeCode }
> = {
  photography: {
    label: "Photography",
    labelFa: "عکاسی",
    blurb: "Studio photography, fashion editorials, culinary stories, and portraiture.",
    blurbFa: "عکاسی استودیویی، مد، خوراک و پرتره.",
    defaultUiType: "UI01",
  },
  "graphic-design": {
    label: "Graphic Design",
    labelFa: "طراحی گرافیک",
    blurb: "Visual identity systems, typography, editorial book design, and posters.",
    blurbFa: "هویت بصری، تایپوگرافی، طراحی کتاب و پوستر.",
    defaultUiType: "UI03",
  },
  "product-design": {
    label: "Product Design",
    labelFa: "طراحی محصول",
    blurb: "Objects shaped by purpose, material, and quiet detail.",
    blurbFa: "اشیایی شکل‌گرفته از کارکرد، ماده و جزئیات دقیق.",
    defaultUiType: "UI03",
  },
  video: {
    label: "Video & Motion",
    labelFa: "ویدیو و حرکت",
    blurb: "Moving image work — rhythm, atmosphere, and story in time.",
    blurbFa: "تصاویر متحرک با ریتم، فضا و روایت.",
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
  const locale = currentLocale();
  const parentRoute = `/${slug}`.toLowerCase();
  const cardMap = new Map<string, ProjectCardItem>();
  const allVault = getVaultPages();
  const deletedSet = getDeletedProjectIds();
  const studioByRouteOrSlug = new Map<string, any>();
  getStudioProjects().forEach((p) => {
    const pSlug = normalizeProjectSlug(p.title || p.id);
    if ((p as any).route) studioByRouteOrSlug.set(String((p as any).route).toLowerCase(), p);
    if (pSlug) studioByRouteOrSlug.set(pSlug, p);
    if (p.id) studioByRouteOrSlug.set(String(p.id).toLowerCase(), p);
  });

  allVault
    .filter((p) => (p.parentRoute || "").toLowerCase().replace(/\/+$/, "") === parentRoute)
    .forEach((vp) => {
      const childSlug = normalizeProjectSlug(vp.route.split("/").pop() || vp.name);
      if (isRouteOrAncestorHidden(vp.route, allVault) || deletedSet.has(childSlug)) {
        return;
      }
      const meta =
        studioByRouteOrSlug.get(vp.route.toLowerCase()) ||
        studioByRouteOrSlug.get(childSlug) ||
        studioByRouteOrSlug.get(vp.id.toLowerCase());
      const fallbackCover =
        (meta?.coverImage && !String(meta.coverImage).startsWith("blob:") ? meta.coverImage : "") ||
        meta?.image ||
        "";
      cardMap.set(vp.route.toLowerCase(), {
        id: vp.id,
        title: localizedText(vp.name || meta?.title || childSlug, vp.nameFa || meta?.titleFa, locale).text,
        image:
          (vp.coverPhoto ? resolveInventoryImage(vp.coverPhoto) || vp.coverPhoto : "") ||
          (fallbackCover ? resolveInventoryImage(fallbackCover) || fallbackCover : ""),
        year:
          vp.pairedBoxes?.find((b) => b.key.toLowerCase() === "year")?.value ||
          (meta?.year ? String(meta.year) : "2026"),
        href: vp.route,
      });
    });

  return Array.from(cardMap.values());
}

function buildDisciplineData(normSlug: string): DisciplineRouteData {
  const locale = currentLocale();
  const canonicalRoute = `/${normSlug}`;
  const vaultPage = getPageByRoute(canonicalRoute);
  const rootMeta = ROOT_DISCIPLINE_META[normSlug];

  const label =
    localizedText(vaultPage?.name || rootMeta?.label, vaultPage?.nameFa || rootMeta?.labelFa, locale).text ||
    normSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const blurb =
    localizedText(vaultPage?.descriptionEn || rootMeta?.blurb, vaultPage?.descriptionFa || rootMeta?.blurbFa, locale).text ||
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
      alt: localizedText(m.altEn || m.title || m.dynamicCode, m.altFa || m.titleFa, locale).text,
      title: localizedText(m.title || m.project || m.dynamicCode, m.titleFa, locale).text,
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
    const locale = currentLocale();
    const vaultPage = getPageByRoute(routePath);
    const label = localizedText(vaultPage?.name || loaderData?.label || "Discipline", vaultPage?.nameFa, locale).text;
    const blurb =
      localizedText(vaultPage?.descriptionEn, vaultPage?.descriptionFa, locale).text ||
      loaderData?.blurb ||
      `${label} work by Siavash Akbari.`;
    return pageHead({
      title: `${locale === "fa" ? "سیاوش اکبری" : "Siavash Akbari"} - ${label}`,
      description: blurb,
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
  const isDeleted = getDeletedVaultPageKeys().has(fresh.canonicalRoute.toLowerCase());
  const isHidden = isRouteOrAncestorHidden(fresh.canonicalRoute);
  const exists = !isDeleted && Boolean(vaultPage || fresh.projectCards.length > 0 || fresh.items.length > 0);

  return {
    notFound: !exists,
    data: fresh,
    vaultPage,
    isHidden,
  };
}

function DisciplinePage() {
  const locale = useLocale();
  const loaderData = Route.useLoaderData();
  const [state, setState] = useState(() => computeInitialDisciplineState(loaderData));

  useEffect(() => {
    if (!loaderData.pendingMediaLookup || typeof window === "undefined") return;
    const matched = getMediaByCode(loaderData.pendingMediaLookup);
    if (matched) {
      const target = buildMediaLiveDetailUrl(matched);
      window.location.replace(withLocale(target, locale));
    }
  }, [loaderData.pendingMediaLookup, locale]);

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
        {localizedText(vaultPage?.name || data.label, vaultPage?.nameFa, locale).text} — {locale === "fa" ? "سیاوش اکبری" : "Siavash Akbari"}
      </h1>

      <PageHeader
        title={vaultPage?.name || data.label}
        titleFa={vaultPage?.nameFa || (locale === "fa" ? data.label : undefined)}
        descriptionEn={vaultPage?.descriptionEn || (locale === "en" ? data.blurb : undefined)}
        descriptionFa={vaultPage?.descriptionFa || (locale === "fa" ? data.blurb : undefined)}
        pairedBoxes={vaultPage?.pairedBoxes}
      />

      {isEmpty ? (
        <p className="mx-auto max-w-3xl px-6 text-center text-muted-foreground py-16">
          {locale === "fa" ? "به‌زودی آثار بیشتری منتشر می‌شود." : "More coming soon."}
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
