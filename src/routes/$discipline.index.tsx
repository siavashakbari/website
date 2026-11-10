import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, redirect, rootRouteId } from "@tanstack/react-router";
import { BackToTop } from "@/components/BackToTop";
import { DISCIPLINES } from "@/data/disciplines";
import { projects, type Project } from "@/data/projects";
import {
  getMergedPhotoInventory,
  getPhotosByDiscipline,
  getPhotosBySpecialty,
  getStudioProjects,
  subscribeToStudioStore,
} from "@/lib/studio-store";
import {
  getPageByRoute,
  getVaultMedia,
  getVaultPages,
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
import { pageHead } from "@/lib/seo";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
} from "@/lib/taxonomy";
import { resolveInventoryImage } from "@/lib/inventory-assets";

interface DisciplinePhoto {
  id: string;
  key: string;
  src: string;
  code: string;
  canonicalPath: string;
  href?: string;
  alt?: string;
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

export const Route = createFileRoute("/$discipline/")({
  loader: ({ params }) => {
    // Graphic Design top route does not exist per specification
    if (params.discipline === "graphic-design") {
      throw notFound({ routeId: rootRouteId });
    }

    const normSlug = normalizeDisciplineSlug(params.discipline);

    // 1. Product Design: shows all products as cards (same UI as Visual Identity)
    if (normSlug === "product-design" || params.discipline === "product-design") {
      const allStudio = getStudioProjects();
      const matching = allStudio.filter((p) => {
        const disc = (p.discipline || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const sub = ((p as any).subDiscipline || "").toLowerCase();
        return (
          disc === "product-design" ||
          cat.includes("product design") ||
          sub.includes("product design") ||
          cat.includes("object")
        );
      });
      const projectCards: ProjectCardItem[] = matching.map((project) => {
        const projSlug = normalizeProjectSlug(project.title || project.id);
        const rawCover =
          (project as any).coverImage ||
          (project as any).image ||
          (project.images && project.images[0]?.url) ||
          "";
        return {
          id: project.id,
          title: project.title,
          image: resolveInventoryImage(rawCover) || rawCover,
          year: String(project.year || "2026"),
          href: `/product-design/${projSlug}`,
        };
      });
      return {
        discipline: {
          slug: "product-design",
          label: "Product Design",
          blurb: "Objects shaped by purpose, material, and quiet detail.",
          browseByProject: true,
          layout: null,
        },
        items: [] as DisciplinePhoto[],
        projectCards,
      };
    }

    // 2. Photography / Video / Specialty Handling
    const discipline =
      DISCIPLINES.find((d) => d.slug === params.discipline) ||
      DISCIPLINES.find((d) => normalizeDisciplineSlug(d.slug) === normSlug) ||
      {
        slug: normSlug,
        label: normSlug.charAt(0).toUpperCase() + normSlug.slice(1).replace("-", " "),
        blurb: `${normSlug} portfolio by Siavash Akbari.`,
        browseByProject: false,
        layout: null,
      };

    const meta = {
      slug: normSlug,
      label: discipline.label,
      blurb: discipline.blurb,
      browseByProject: Boolean(discipline.browseByProject),
      layout: discipline.layout ?? null,
    };

    // If param is a specialty (e.g. book-covers, posters, videos), load only that specialty
    const dAny = discipline as any;
    const isSpecialty = Boolean(
      dAny.specialtySlug &&
      (discipline.slug === params.discipline || params.discipline === dAny.specialtySlug)
    );

    const photos = isSpecialty
      ? getPhotosBySpecialty(dAny.specialtySlug!, dAny.disciplineSlug)
      : getPhotosByDiscipline(normSlug);

    const items: DisciplinePhoto[] = photos.map((p, idx) => {
      const canonical =
        p.canonicalPath ||
        buildPhotoUrl(
          dAny.disciplineSlug || normSlug,
          p.specialtySlug || dAny.specialtySlug || "fashion-photography",
          p.projectSlug || "project",
          p.standardCode || p.code,
        );
      return {
        id: p.standardCode || p.code || `${normSlug}-${idx}`,
        key: `${p.code}-${idx}`,
        src: resolveInventoryImage(p.imgSrc) || p.imgSrc,
        code: p.standardCode || p.code,
        canonicalPath: canonical,
        href: canonical,
        alt: p.title || photoCaption(p.project, idx, photos.length),
        disciplineSlug: dAny.disciplineSlug || normSlug,
        specialtySlug: p.specialtySlug || dAny.specialtySlug || "fashion-photography",
        projectSlug: p.projectSlug || "project",
        imageName: p.title || photoCaption(p.project, idx, photos.length),
        title: p.project,
        year: p.date || "2026",
        category: p.subdiscipline || p.discipline,
        description: p.caption || "",
        client: p.client,
        photoIndex: idx + 1,
        photoTotal: photos.length,
      };
    });

    return { discipline: meta, items, projectCards: [] as ProjectCardItem[] };
  },
  head: ({ loaderData }) => {
    const slug = loaderData?.discipline.slug ?? "";
    const routePath = `/${normalizeDisciplineSlug(slug)}`;
    const pageItem = typeof window !== "undefined" ? getPageByRoute(routePath) : undefined;
    const label = pageItem?.name || loaderData?.discipline.label || "Discipline";
    const blurb =
      pageItem?.descriptionEn ||
      loaderData?.discipline.blurb ||
      `${label} work by Siavash Akbari.`;
    return pageHead({
      title: `Siavash Akbari - ${label}`,
      description: `${blurb} Browse the ${label.toLowerCase()} portfolio of Siavash Akbari.`,
      path: slug ? `/${slug}` : "/",
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

function computeDisciplineProjectCards(slug: string): ProjectCardItem[] {
  if (slug === "product-design") {
    const allStudio = getStudioProjects();
    const matching = allStudio.filter((p) => {
      const disc = (p.discipline || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const sub = ((p as any).subDiscipline || "").toLowerCase();
      return (
        disc === "product-design" ||
        cat.includes("product design") ||
        sub.includes("product design") ||
        cat.includes("object")
      );
    });
    const cardMap = new Map<string, ProjectCardItem>();
    matching.forEach((project) => {
      const projSlug = normalizeProjectSlug(project.title || project.id);
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
    // Overlay Vault pages under /product-design
    const allVault = getVaultPages();
    allVault
      .filter((p) => (p.parentRoute || "").toLowerCase() === "/product-design" && !p.isHidden)
      .forEach((vp) => {
        const pSlug = normalizeProjectSlug(vp.route.split("/").pop() || vp.name);
        const existing = cardMap.get(pSlug);
        cardMap.set(pSlug, {
          id: vp.id,
          title: vp.name || existing?.title || pSlug,
          image: resolveInventoryImage(vp.coverPhoto) || vp.coverPhoto || existing?.image || "",
          year: existing?.year || "2026",
          href: vp.route,
        });
      });
    return Array.from(cardMap.values());
  }

  const allStudio = getStudioProjects();
  const matching = allStudio.filter((p) => {
    const disc = (p.discipline || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const sub = ((p as any).subDiscipline || "").toLowerCase();
    return (
      disc === "visual-identity" ||
      disc === "graphic-design" ||
      cat.includes("identity") ||
      cat.includes("visual") ||
      sub.includes("identity")
    );
  });
  const cardMap = new Map<string, ProjectCardItem>();
  matching.forEach((project) => {
    const projSlug = normalizeProjectSlug(project.title || project.id);
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
      href: `/graphic-design/visual-identity/${projSlug}`,
    });
  });
  const allVault = getVaultPages();
  allVault
    .filter(
      (p) =>
        ((p.parentRoute || "").toLowerCase() === "/graphic-design/visual-identity" ||
          (p.parentRoute || "").toLowerCase() === "/graphic-design") &&
        !p.isHidden,
    )
    .forEach((vp) => {
      const pSlug = normalizeProjectSlug(vp.route.split("/").pop() || vp.name);
      const existing = cardMap.get(pSlug);
      cardMap.set(pSlug, {
        id: vp.id,
        title: vp.name || existing?.title || pSlug,
        image: resolveInventoryImage(vp.coverPhoto) || vp.coverPhoto || existing?.image || "",
        year: existing?.year || "2026",
        href: vp.route,
      });
    });
  return Array.from(cardMap.values());
}

function DisciplinePage() {
  const loaderData = Route.useLoaderData();
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return loaderData;
    if (loaderData.discipline.slug === "product-design" || loaderData.discipline.browseByProject) {
      return {
        ...loaderData,
        projectCards: computeDisciplineProjectCards(loaderData.discipline.slug),
      };
    }
    return loaderData;
  });
  const [vaultPage, setVaultPage] = useState<VaultPageItem | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return getPageByRoute(`/${normalizeDisciplineSlug(loaderData.discipline.slug)}`);
  });
  const isDesktop = useIsDesktop();

  const refreshData = () => {
    const routePath = `/${normalizeDisciplineSlug(loaderData.discipline.slug)}`;
    const currentVaultPage = getPageByRoute(routePath);
    setVaultPage(currentVaultPage);

    if (loaderData.discipline.slug === "product-design" || loaderData.discipline.browseByProject) {
      const projectCards = computeDisciplineProjectCards(loaderData.discipline.slug);
      setData((prev) => ({ ...prev, projectCards }));
      return;
    } else {
      // Re-hydrate photo items dynamically
      const photos = getPhotosByDiscipline(loaderData.discipline.slug);
      if (photos.length > 0) {
        const items: DisciplinePhoto[] = photos.map((p, idx) => {
          const canonical =
            p.canonicalPath ||
            buildPhotoUrl(
              loaderData.discipline.slug,
              p.specialtySlug || "fashion-photography",
              p.projectSlug || "project",
              p.standardCode || p.code,
            );
          return {
            id: p.standardCode || p.code || `${loaderData.discipline.slug}-${idx}`,
            key: `${p.code}-${idx}`,
            src: resolveInventoryImage(p.imgSrc) || p.imgSrc,
            code: p.standardCode || p.code,
            canonicalPath: canonical,
            href: canonical,
            alt: p.title || photoCaption(p.project, idx, photos.length),
            disciplineSlug: loaderData.discipline.slug,
            specialtySlug: p.specialtySlug || "fashion-photography",
            projectSlug: p.projectSlug || "project",
            imageName: p.title || photoCaption(p.project, idx, photos.length),
            title: p.project,
            year: p.date || "2026",
            category: p.subdiscipline || p.discipline,
            description: p.caption || "",
            client: p.client,
            photoIndex: idx + 1,
            photoTotal: photos.length,
          };
        });
        setData((prev) => ({ ...prev, items }));
      }
    }
  };

  useEffect(() => {
    setData(loaderData);
    refreshData();
  }, [loaderData]);

  // Keep browser tab title synchronized with vault page name or custom label
  useEffect(() => {
    const pageTitle = vaultPage?.name || data.discipline.label;
    if (pageTitle && typeof document !== "undefined") {
      document.title = `Siavash Akbari - ${pageTitle}`;
    }
  }, [vaultPage?.name, data.discipline.label]);

  // Real-time listener: updates view as soon as vault edits anything
  useEffect(() => {
    const unsubStudio = subscribeToStudioStore(() => refreshData());
    const unsubVault = subscribeToVaultStore(() => refreshData());
    return () => {
      unsubStudio();
      unsubVault();
    };
  }, [loaderData.discipline.slug]);

  // Check if page is hidden
  if (vaultPage?.isHidden) {
    return (
      <HiddenPageNotice
        title={vaultPage.name}
        routePath={`/${loaderData.discipline.slug}`}
      />
    );
  }

  // Filter out any hidden media from display
  const allVaultMedia = typeof window !== "undefined" ? getVaultMedia() : [];
  const hiddenCodeSet = new Set(
    allVaultMedia.filter((m) => m.isHidden).map((m) => m.uniqueCode.toUpperCase()),
  );

  const visibleItems = (data.items || []).filter((it) => {
    const code = (it.code || "").toUpperCase();
    return !hiddenCodeSet.has(code);
  });

  // Filter out hidden project cards
  const allVaultPages = typeof window !== "undefined" ? getVaultPages() : [];
  const hiddenRoutes = new Set(
    allVaultPages.filter((p) => p.isHidden).map((p) => p.route.toLowerCase().replace(/\/+$/, ""))
  );

  const { discipline, projectCards } = data;
  const visibleProjectCards = (projectCards || []).filter((card) => {
    const cardHref = (card.href || "").toLowerCase().replace(/\/+$/, "");
    return !hiddenRoutes.has(cardHref);
  });

  const isEmpty = discipline.browseByProject
    ? visibleProjectCards.length === 0
    : visibleItems.length === 0;

  const useSideScroll = discipline.layout === "scroll" && isDesktop;

  // Determine active UI type: explicit vault assignment or natural default
  const activeUiType: UITypeCode =
    vaultPage?.uiType ||
    (discipline.browseByProject
      ? "UI03"
      : discipline.slug === "videos" || discipline.slug === "video" || visibleItems.some((i) => i.src.endsWith(".mp4"))
        ? "UI04"
        : useSideScroll
          ? "UI02"
          : "UI01");

  return (
    <section
      className={`relative w-full bg-background ${
        activeUiType === "UI02"
          ? "overflow-hidden pt-3 md:pt-3.5"
          : "min-h-screen pb-40 pt-3 md:pt-3.5"
      }`}
      aria-labelledby="discipline-heading"
    >
      <h1 id="discipline-heading" className="sr-only">
        {vaultPage?.name || discipline.label} — Siavash Akbari
      </h1>

      {/* Page Header (English & Farsi Descriptions, Paired Boxes) */}
      <PageHeader
        title={vaultPage?.name || discipline.label}
        descriptionEn={vaultPage?.descriptionEn || discipline.blurb}
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
          label={vaultPage?.name || discipline.label}
        />
      ) : activeUiType === "UI03" ? (
        <UI03_EqualCardsGrid
          cards={visibleProjectCards.map((p) => ({
            id: p.id,
            title: p.title,
            image: p.image,
            href: p.href || `/projects/${p.id}`,
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
