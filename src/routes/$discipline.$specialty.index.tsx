import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, rootRouteId } from "@tanstack/react-router";
import { BackToTop } from "@/components/BackToTop";
import { DISCIPLINES } from "@/data/disciplines";
import { projects, type Project } from "@/data/projects";
import {
  getPhotosBySpecialty,
  getPhotosByProject,
  getStudioProjects,
  subscribeToStudioStore,
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
import { pageHead } from "@/lib/seo";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
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

    // 1. Video Project Dedicated Page: /video/[project]
    // User request: "Video/Project-Dedicated-Page same UI as Video routed but shows all the videos under the project.
    // Important: Videos don't have a video-dedicated page; only when clicked on the current pop-up shows and plays the video"
    if (normDisc === "video") {
      const normProj = normalizeProjectSlug(params.specialty);
      const projPhotos = getPhotosByProject(normProj);
      const allStudio = getStudioProjects();
      const parentProject =
        allStudio.find((p) => normalizeProjectSlug(p.title) === normProj || p.id === normProj) ||
        projects.find((p) => normalizeProjectSlug(p.title) === normProj || p.id === normProj);

      const items: SpecialtyPhoto[] = projPhotos.map((p, idx) => ({
        key: `${p.code}-${idx}`,
        src: resolveInventoryImage(p.imgSrc) || p.imgSrc,
        code: p.standardCode || p.code,
        canonicalPath: `/video/${normProj}`,
        disciplineSlug: "video",
        specialtySlug: normProj,
        projectSlug: normProj,
        imageName: p.title || photoCaption(p.project, idx, projPhotos.length),
        title: p.project,
        year: p.date || "2026",
        category: p.subdiscipline || "Video",
        description: p.caption || "",
        client: p.client,
        photoIndex: idx + 1,
        photoTotal: projPhotos.length,
      }));

      const projLabel = parentProject?.title || normProj.charAt(0).toUpperCase() + normProj.slice(1);
      return {
        disciplineSlug: "video",
        specialtySlug: normProj,
        label: projLabel,
        blurb: parentProject?.description || `${projLabel} video showcase.`,
        isVisualIdentity: false,
        isVideo: true,
        layout: null,
        items,
        projectCards: [] as ProjectCardItem[],
      };
    }

    // 2. Product Design Project Dedicated Page: /product-design/[project]
    // User request: "Product-Design/Project-Dedicated-Page has the same UI as the Graphic-Design/Book-Covers shows all photos from a specific project"
    if (normDisc === "product-design") {
      const normProj = normalizeProjectSlug(params.specialty);
      const projPhotos = getPhotosByProject(normProj);
      const allStudio = getStudioProjects();
      const parentProject =
        allStudio.find((p) => normalizeProjectSlug(p.title) === normProj || p.id === normProj) ||
        projects.find((p) => normalizeProjectSlug(p.title) === normProj || p.id === normProj);

      const items: SpecialtyPhoto[] = projPhotos.map((p, idx) => ({
        key: `${p.code}-${idx}`,
        src: resolveInventoryImage(p.imgSrc) || p.imgSrc,
        code: p.standardCode || p.code,
        canonicalPath: buildPhotoUrl("product-design", "products", normProj, p.standardCode || p.code),
        disciplineSlug: "product-design",
        specialtySlug: normProj,
        projectSlug: normProj,
        imageName: p.title || photoCaption(p.project, idx, projPhotos.length),
        title: p.project,
        year: p.date || "2026",
        category: p.subdiscipline || "Product Design",
        description: p.caption || "",
        client: p.client,
        photoIndex: idx + 1,
        photoTotal: projPhotos.length,
      }));

      const projLabel = parentProject?.title || normProj.charAt(0).toUpperCase() + normProj.slice(1);
      return {
        disciplineSlug: "product-design",
        specialtySlug: normProj,
        label: projLabel,
        blurb: parentProject?.description || `${projLabel} product design showcase.`,
        isVisualIdentity: false,
        isVideo: false,
        layout: "scroll" as const, // EXACT UI AS BOOK COVERS (Horizontal scroll)
        items,
        projectCards: [] as ProjectCardItem[],
      };
    }

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
          href: `/${normDisc}/${normSpec}/${projSlug}`,
        };
      });
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
    const disc = loaderData?.disciplineSlug ?? "photography";
    const spec = loaderData?.specialtySlug ?? "fashion";
    const vaultPage = typeof window !== "undefined" ? getPageByRoute(`/${disc}/${spec}`) : null;
    const label = vaultPage?.name || loaderData?.label || "Specialty";
    const blurb =
      vaultPage?.descriptionEn || loaderData?.blurb || `${label} work by Siavash Akbari.`;
    return pageHead({
      title: `Siavash Akbari - ${label}`,
      description: `${blurb} Explore ${label.toLowerCase()} stories and visual works.`,
      path: `/${disc}/${spec}`,
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

function SpecialtyPage() {
  const loaderData = Route.useLoaderData();
  const [data, setData] = useState(loaderData);
  const [vaultPage, setVaultPage] = useState<VaultPageItem | undefined>(undefined);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setData(loaderData);
  }, [loaderData]);

  // Client hydration for projectCards & vault page info
  const refreshSpecialtyData = () => {
    const currentVaultPage = getPageByRoute(`/${loaderData.disciplineSlug}/${loaderData.specialtySlug}`);
    setVaultPage(currentVaultPage);

    if (loaderData.isVisualIdentity) {
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
          href: `/${loaderData.disciplineSlug}/${loaderData.specialtySlug}/${projSlug}`,
        };
      });
      setData((prev) => ({
        ...prev,
        projectCards,
      }));
    } else if (loaderData.disciplineSlug === "product-design" || loaderData.disciplineSlug === "video") {
      const projPhotos = getPhotosByProject(loaderData.specialtySlug);
      if (projPhotos.length > 0) {
        const items: SpecialtyPhoto[] = projPhotos.map((p, idx) => ({
          key: `${p.code}-${idx}`,
          src: resolveInventoryImage(p.imgSrc) || p.imgSrc,
          code: p.standardCode || p.code,
          canonicalPath:
            loaderData.disciplineSlug === "video"
              ? `/video/${loaderData.specialtySlug}`
              : buildPhotoUrl("product-design", "products", loaderData.specialtySlug, p.standardCode || p.code),
          disciplineSlug: loaderData.disciplineSlug,
          specialtySlug: loaderData.specialtySlug,
          projectSlug: loaderData.specialtySlug,
          imageName: p.title || photoCaption(p.project, idx, projPhotos.length),
          title: p.project,
          year: p.date || "2026",
          category: p.subdiscipline || loaderData.label,
          description: p.caption || "",
          client: p.client,
          photoIndex: idx + 1,
          photoTotal: projPhotos.length,
        }));
        setData((prev) => ({ ...prev, items }));
      }
    } else {
      const photos = getPhotosBySpecialty(loaderData.specialtySlug, loaderData.disciplineSlug);
      if (photos.length > 0) {
        const items: SpecialtyPhoto[] = photos.map((p, idx) => ({
          key: `${p.code}-${idx}`,
          src: resolveInventoryImage(p.imgSrc) || p.imgSrc,
          code: p.standardCode || p.code,
          canonicalPath:
            p.canonicalPath ||
            buildPhotoUrl(loaderData.disciplineSlug, loaderData.specialtySlug, p.projectSlug || "project", p.standardCode || p.code),
          disciplineSlug: loaderData.disciplineSlug,
          specialtySlug: loaderData.specialtySlug,
          projectSlug: p.projectSlug || "project",
          imageName: p.title || photoCaption(p.project, idx, photos.length),
          title: p.project,
          year: p.date || "2026",
          category: p.subdiscipline || loaderData.label,
          description: p.caption || "",
          client: p.client,
          photoIndex: idx + 1,
          photoTotal: photos.length,
        }));
        setData((prev) => ({ ...prev, items }));
      }
    }
  };

  useEffect(() => {
    refreshSpecialtyData();
  }, [loaderData.isVisualIdentity, loaderData.disciplineSlug, loaderData.specialtySlug]);

  // Real-time listener: updates view as soon as vault edits anything
  useEffect(() => {
    const unsub1 = subscribeToStudioStore(() => refreshSpecialtyData());
    const unsub2 = subscribeToVaultStore(() => refreshSpecialtyData());
    return () => {
      unsub1();
      unsub2();
    };
  }, [loaderData.disciplineSlug, loaderData.specialtySlug]);

  // Check if page is hidden
  if (vaultPage?.isHidden) {
    return (
      <HiddenPageNotice
        title={vaultPage.name}
        routePath={`/${data.disciplineSlug}/${data.specialtySlug}`}
      />
    );
  }

  // Filter out any hidden media from display
  const allVaultMedia = typeof window !== "undefined" ? getVaultMedia() : [];
  const hiddenCodeSet = new Set(
    allVaultMedia.filter((m) => m.isHidden).map((m) => m.uniqueCode.toUpperCase()),
  );

  const visibleItems = data.items.filter((it) => {
    const code = (it.code || "").toUpperCase();
    return !hiddenCodeSet.has(code);
  });

  const isEmpty = data.isVisualIdentity
    ? data.projectCards.length === 0
    : visibleItems.length === 0;

  const useSideScroll = data.layout === "scroll" && isDesktop;

  // Determine UI type: explicit vault assignment or natural default
  const activeUiType: UITypeCode =
    vaultPage?.uiType ||
    (data.isVisualIdentity
      ? "UI03"
      : data.isVideo
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
      aria-labelledby="specialty-heading"
    >
      <h1 id="specialty-heading" className="sr-only">
        {vaultPage?.name || data.label} — Siavash Akbari
      </h1>

      {/* Page Header (English & Farsi Descriptions, Paired Boxes) */}
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
            alt: item.imageName,
            title: item.title,
            href: item.canonicalPath,
          }))}
          label={vaultPage?.name || data.label}
        />
      ) : activeUiType === "UI03" || data.isVisualIdentity ? (
        <UI03_EqualCardsGrid
          cards={data.projectCards.map((p) => ({
            id: p.id,
            title: p.title,
            image: p.image,
            href: p.href || `/${data.disciplineSlug}/${data.specialtySlug}/${p.id}`,
            year: p.year,
          }))}
        />
      ) : activeUiType === "UI04" || data.isVideo ? (
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
            alt: item.imageName,
            title: item.title,
            href: item.canonicalPath,
          }))}
        />
      )}
      <BackToTop />
    </section>
  );
}


