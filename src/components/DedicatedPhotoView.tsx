import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { Link, notFound, redirect, rootRouteId, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { currentLocale, localizedText, withLocale } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";
import { projectBackButtonClass } from "@/components/ui-types/project-navigation";
import {
  getPhotoItemBySlugOrCode,
  getPhotosByProject,
  getStudioProjects,
  getMergedPhotoInventory,
  subscribeToStudioStore,
} from "@/lib/studio-store";
import type { PhotoInventoryItem } from "@/data/photo-inventory";
import {
  buildMediaLiveDetailUrl,
  FLAT_FIELDS,
  getDeletedVaultMediaKeys,
  getGalleryMediaForRoute,
  getMediaByCode,
  getPageByRoute,
  isRouteOrAncestorHidden,
  subscribeToVaultStore,
  type VaultMediaItem,
} from "@/lib/vault-store";
import { HiddenPageNotice } from "@/components/ui-types";
import { isContentReady } from "@/lib/published-store";
import { NotFoundPage } from "@/components/NotFoundPage";
import { PublishedPageLoading } from "@/components/PublishedPageLoading";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { useResolvedMediaSrc } from "@/lib/local-media-db";
import { pageHead } from "@/lib/seo";
import { projects } from "@/data/projects";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
} from "@/lib/taxonomy";
import {
  trackPortfolioAssetView,
  trackCreditClick,
  trackCommissionInquiryFromAsset,
} from "@/lib/analytics";

export interface SiblingNavTarget {
  code: string;
  url: string;
}

export interface DedicatedPhotoLoaderData {
  pendingClientLookup?: boolean;
  rawPhotoId: string;
  currentRawPath: string;
  disciplineSlug: string;
  specialtySlug: string;
  projectSlug: string;
  galleryRoute: string;
  photo: PhotoInventoryItem | null;
  projectDescription: string;
  resolvedImage: string;
  prevTarget: SiblingNavTarget | null;
  nextTarget: SiblingNavTarget | null;
  currentIndex: number;
  totalPhotos: number;
  isHidden: boolean;
  vaultMedia?: VaultMediaItem;
}

export function looksLikeMediaCode(raw?: string): boolean {
  const s = (raw || "").trim();
  if (!s) return false;
  return (
    /^\d{4}$/.test(s) ||
    /^\d{4}-[A-Z0-9-]+$/i.test(s) ||
    /^(?:PHOT|DSGN|VIDO|PROD)-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/i.test(s) ||
    /^SA-[A-Z0-9-]+$/i.test(s) ||
    /^(?:custom-)?media-\d{4}$/i.test(s)
  );
}

export function redirectToCanonicalPath(targetPath: string, replace = true): never {
  const clean = targetPath.split(/[?#]/)[0].replace(/\/+$/, "");
  const segs = clean.split("/").filter(Boolean);
  if (segs.length === 0) {
    throw redirect({ to: "/", replace });
  }
  if (segs.length === 1) {
    throw redirect({
      to: "/$discipline",
      params: { discipline: segs[0] },
      replace,
    });
  }
  if (segs.length === 2) {
    throw redirect({
      to: "/$discipline/$specialty",
      params: { discipline: segs[0], specialty: segs[1] },
      replace,
    });
  }
  if (segs.length === 3) {
    throw redirect({
      to: "/$discipline/$specialty/$project",
      params: { discipline: segs[0], specialty: segs[1], project: segs[2] },
      replace,
    });
  }
  throw redirect({
    to: "/$discipline/$specialty/$project/$photoId",
    params: {
      discipline: segs[0],
      specialty: segs[1],
      project: segs[2],
      photoId: segs.slice(3).join("/"),
    },
    replace,
  });
}

function extFromSrc(imgSrc?: string): string {
  const clean = (imgSrc || "").split(/[?#]/)[0].toLowerCase();
  if (clean.endsWith(".png") || clean.startsWith("data:image/png")) return ".PNG";
  if (clean.endsWith(".webp") || clean.startsWith("data:image/webp")) return ".WEBP";
  if (clean.endsWith(".gif") || clean.startsWith("data:image/gif")) return ".GIF";
  if (clean.endsWith(".mp4") || clean.startsWith("data:video/mp4")) return ".MP4";
  if (clean.endsWith(".webm") || clean.startsWith("data:video/webm")) return ".WEBM";
  if (clean.endsWith(".mov") || clean.startsWith("data:video/quicktime")) return ".MOV";
  return ".JPG";
}

function isVideoAsset(src?: string): boolean {
  return Boolean(src && (/\.(mp4|webm|mov)(\?|#|$)/i.test(src) || src.startsWith("data:video/")));
}

function formatSlugLabel(slug?: string): string {
  return (slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function synthesizePhotoFromVault(vaultMedia: VaultMediaItem): PhotoInventoryItem {
  const all = getMergedPhotoInventory();
  const vmSrc = (vaultMedia.imgSrc || "").toLowerCase();
  const vmFilename = vmSrc.split("/").pop() || "";
  const matched = all.find((p) => {
    if (p.uniqueCode && vaultMedia.uniqueCode && p.uniqueCode === vaultMedia.uniqueCode) return true;
    const pSrc = (p.imgSrc || "").toLowerCase();
    return (
      pSrc === vmSrc ||
      (vmFilename && pSrc.endsWith(vmFilename)) ||
      (vmSrc && vmSrc.endsWith(pSrc.split("/").pop() || "__none__"))
    );
  });

  const liveDiscSlug = vaultMedia.field || "photography";
  const liveSpecSlug = vaultMedia.category || "";
  const liveProjSlug = vaultMedia.project || "";
  const discPage = getPageByRoute(`/${liveDiscSlug}`);
  const specPage = liveSpecSlug ? getPageByRoute(`/${liveDiscSlug}/${liveSpecSlug}`) : undefined;
  const projPage = getPageByRoute(vaultMedia.assignedRoute);

  if (matched) {
    const sameProject =
      normalizeProjectSlug(matched.projectSlug || matched.project || "") ===
      normalizeProjectSlug(liveProjSlug);
    const projectLabel =
      projPage?.name ||
      (sameProject ? matched.project : formatSlugLabel(liveProjSlug)) ||
      formatSlugLabel(liveSpecSlug || liveDiscSlug);
    return {
      ...matched,
      code: vaultMedia.dynamicCode,
      standardCode: vaultMedia.dynamicCode,
      uniqueCode: vaultMedia.uniqueCode,
      discipline: discPage?.name || formatSlugLabel(liveDiscSlug),
      disciplineSlug: liveDiscSlug,
      subdiscipline:
        specPage?.name ||
        (sameProject ? matched.subdiscipline : formatSlugLabel(liveSpecSlug || liveDiscSlug)),
      specialtySlug: liveSpecSlug,
      project: projectLabel,
      projectSlug: liveProjSlug,
      displayName: vaultMedia.title,
      title: vaultMedia.title,
    };
  }

  return {
    code: vaultMedia.dynamicCode,
    standardCode: vaultMedia.dynamicCode,
    uniqueCode: vaultMedia.uniqueCode,
    project:
      projPage?.name ||
      formatSlugLabel(liveProjSlug) ||
      (liveSpecSlug === "posters" ? "Posters" : formatSlugLabel(liveDiscSlug)),
    discipline: discPage?.name || formatSlugLabel(liveDiscSlug),
    disciplineSlug: liveDiscSlug,
    subdiscipline: specPage?.name || formatSlugLabel(liveSpecSlug || liveDiscSlug),
    specialtySlug: liveSpecSlug,
    projectSlug: liveProjSlug,
    imgSrc: vaultMedia.imgSrc,
    client: vaultMedia.client || "",
    model: vaultMedia.model || "",
    makeupArtist: vaultMedia.makeupArtist || "",
    assistant: vaultMedia.assistant || "",
    date: vaultMedia.year,
    caption: vaultMedia.caption,
    displayName: vaultMedia.title,
    title: vaultMedia.title,
    keywords: `${projPage?.name || liveProjSlug || liveSpecSlug}, ${discPage?.name || liveDiscSlug}`,
  };
}

export function resolveDedicatedPhotoLoader(opts: {
  rawDiscipline: string;
  rawSpecialty: string;
  rawProject: string;
  rawPhotoId: string;
  currentRawPath: string;
  allowMissingReturnNull?: boolean;
}): DedicatedPhotoLoaderData | null {
  const disciplineSlug = normalizeDisciplineSlug(opts.rawDiscipline);
  const specialtySlug = FLAT_FIELDS.has(disciplineSlug)
    ? ""
    : normalizeSpecialtySlug(opts.rawSpecialty);
  const projectSlug = FLAT_FIELDS.has(disciplineSlug)
    ? normalizeProjectSlug(opts.rawSpecialty || opts.rawProject)
    : normalizeProjectSlug(opts.rawProject);
  const rawPhotoId = opts.rawPhotoId.trim();

  let vaultMedia = getMediaByCode(rawPhotoId);
  let photo = getPhotoItemBySlugOrCode(
    rawPhotoId,
    disciplineSlug,
    specialtySlug || undefined,
    projectSlug || undefined,
  );

  // Explicit legacy frame pattern fallback only (e.g., frame-01, frame-1-thumb)
  if (!photo && !vaultMedia && projectSlug) {
    const frameMatch = rawPhotoId.match(/^frame-?(\d+)(?:-thumb)?$/i);
    if (frameMatch) {
      const projPhotos = getPhotosByProject(projectSlug);
      const num = parseInt(frameMatch[1], 10);
      if (num >= 1 && num <= projPhotos.length) {
        photo = projPhotos[num - 1];
      }
    }
  }

  if (!photo && vaultMedia) {
    photo = synthesizePhotoFromVault(vaultMedia);
  }

  if (!vaultMedia && photo) {
    vaultMedia =
      getMediaByCode(photo.uniqueCode || photo.code) ||
      (photo.standardCode ? getMediaByCode(photo.standardCode) : undefined);
  }

  // On SSR only: if requested with a valid full dynamic code (e.g. from a renamed/moved Vault route
  // stored in browser localStorage), defer to client lookup instead of redirecting back to old static path.
  const isFullDynamicUrlCode = /^\d{4}-[A-Z0-9-]+$/i.test(rawPhotoId);
  if (
    typeof window === "undefined" &&
    !isContentReady() &&
    isFullDynamicUrlCode &&
    opts.currentRawPath.replace(/\/+$/, "").toLowerCase().endsWith(`/${rawPhotoId.toLowerCase()}`)
  ) {
    const staticCanon = vaultMedia ? buildMediaLiveDetailUrl(vaultMedia) : "";
    if (staticCanon && opts.currentRawPath.replace(/\/+$/, "") !== staticCanon) {
      return {
        pendingClientLookup: true,
        rawPhotoId,
        currentRawPath: opts.currentRawPath,
        disciplineSlug,
        specialtySlug,
        projectSlug,
        galleryRoute:
          FLAT_FIELDS.has(disciplineSlug)
            ? `/${disciplineSlug}/${projectSlug}`
            : projectSlug
              ? `/${disciplineSlug}/${specialtySlug}/${projectSlug}`
              : `/${disciplineSlug}/${specialtySlug}`,
        photo: null,
        projectDescription: "",
        resolvedImage: "",
        prevTarget: null,
        nextTarget: null,
        currentIndex: 1,
        totalPhotos: 1,
        isHidden: false,
      };
    }
  }

  if (!photo && !vaultMedia) {
    if (opts.allowMissingReturnNull) {
      return null;
    }
    if (typeof window === "undefined" && !isContentReady() && looksLikeMediaCode(rawPhotoId)) {
      return {
        pendingClientLookup: true,
        rawPhotoId,
        currentRawPath: opts.currentRawPath,
        disciplineSlug,
        specialtySlug,
        projectSlug,
        galleryRoute: opts.currentRawPath,
        photo: null,
        projectDescription: "",
        resolvedImage: "",
        prevTarget: null,
        nextTarget: null,
        currentIndex: 1,
        totalPhotos: 1,
        isHidden: false,
      };
    }
    throw notFound({ routeId: rootRouteId });
  }

  // Videos do not have individual detail routes — redirect directly to video showcase page
  if (
    vaultMedia?.field === "video" ||
    normalizeDisciplineSlug(photo?.disciplineSlug || photo?.discipline || "") === "video"
  ) {
    const targetVideoUrl = vaultMedia
      ? buildMediaLiveDetailUrl(vaultMedia)
      : `/video/${projectSlug || "echo-prime"}`;
    redirectToCanonicalPath(targetVideoUrl, true);
  }

  const effectiveField = vaultMedia?.field || disciplineSlug;
  const effectiveCategory = vaultMedia ? vaultMedia.category : specialtySlug;
  const effectiveProjectSlug = vaultMedia ? vaultMedia.project : projectSlug;
  const galleryRoute =
    vaultMedia?.assignedRoute ||
    (effectiveProjectSlug
      ? `/${effectiveField}/${effectiveCategory ? `${effectiveCategory}/` : ""}${effectiveProjectSlug}`
      : `/${effectiveField}/${effectiveCategory}`);
  const canonicalPhotoCode =
    vaultMedia?.dynamicCode || photo!.standardCode || photo!.code;

  const expectedCanonicalUrl = vaultMedia
    ? buildMediaLiveDetailUrl(vaultMedia)
    : buildPhotoUrl(
        effectiveField,
        effectiveCategory,
        effectiveProjectSlug,
        canonicalPhotoCode,
      );

  const normalizedCurrent = opts.currentRawPath.replace(/\/+$/, "");
  if (normalizedCurrent !== expectedCanonicalUrl) {
    redirectToCanonicalPath(expectedCanonicalUrl, true);
  }

  const computed = buildLivePhotoViewState({
    photo: photo!,
    vaultMedia,
    disciplineSlug: effectiveField,
    specialtySlug: effectiveCategory,
    projectSlug: effectiveProjectSlug,
    galleryRoute,
    canonicalPhotoCode,
  });

  return {
    pendingClientLookup: false,
    rawPhotoId,
    currentRawPath: normalizedCurrent,
    disciplineSlug: effectiveField,
    specialtySlug: effectiveCategory,
    projectSlug: effectiveProjectSlug,
    galleryRoute,
    photo: computed.photo,
    projectDescription: computed.projectDescription,
    resolvedImage: computed.resolvedImage,
    prevTarget: computed.prevTarget,
    nextTarget: computed.nextTarget,
    currentIndex: computed.currentIndex,
    totalPhotos: computed.totalPhotos,
    isHidden: computed.isHidden,
    vaultMedia,
  };
}

function buildLivePhotoViewState(params: {
  photo: PhotoInventoryItem;
  vaultMedia?: VaultMediaItem;
  disciplineSlug: string;
  specialtySlug: string;
  projectSlug: string;
  galleryRoute: string;
  canonicalPhotoCode: string;
}) {
  const {
    photo,
    vaultMedia,
    disciplineSlug,
    specialtySlug,
    projectSlug,
    galleryRoute,
    canonicalPhotoCode,
  } = params;

  const allProjects = getStudioProjects();
  const parentProject = projectSlug
    ? allProjects.find(
        (p) =>
          normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug,
      ) ||
      projects.find(
        (p) =>
          normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug,
      )
    : undefined;

  const discPage = getPageByRoute(`/${disciplineSlug}`);
  const specPage = specialtySlug ? getPageByRoute(`/${disciplineSlug}/${specialtySlug}`) : undefined;
  const vaultPage = getPageByRoute(galleryRoute);
  const sameStaticProject =
    parentProject &&
    normalizeProjectSlug(parentProject.title || parentProject.id || "") ===
      normalizeProjectSlug(projectSlug);

  const client = photo.client || (sameStaticProject ? (parentProject as any)?.client : "") || "";
  const model =
    photo.model ||
    (sameStaticProject && parentProject
      ? Array.isArray((parentProject as any).models)
        ? (parentProject as any).models.join(", ")
        : (parentProject as any).models
      : "") ||
    "";
  const makeupArtist = photo.makeupArtist || (sameStaticProject ? (parentProject as any)?.makeupArtist : "") || "";
  const assistant = photo.assistant || (sameStaticProject ? (parentProject as any)?.assistant : "") || "";
  const year = vaultMedia?.year || photo.date || (sameStaticProject ? parentProject?.year : "") || "2024";
  const projectDescription =
    vaultPage?.descriptionEn || (sameStaticProject ? parentProject?.description : "") || "";
  const disciplineDisplayTitle =
    discPage?.name || photo.discipline || formatSlugLabel(disciplineSlug);
  const specialtyDisplayTitle =
    specPage?.name ||
    (sameStaticProject ? photo.subdiscipline : "") ||
    formatSlugLabel(specialtySlug);
  const projectDisplayTitle =
    vaultPage?.name ||
    (vaultMedia?.project ? formatSlugLabel(vaultMedia.project) : "") ||
    (sameStaticProject ? parentProject?.title : "") ||
    (specialtySlug === "posters" ? "Posters" : formatSlugLabel(projectSlug));

  const ext = extFromSrc(photo.imgSrc);
  const dynamicImageFileName = vaultMedia?.title || `${canonicalPhotoCode}${ext}`;

  const resolvedPhoto: PhotoInventoryItem = {
    ...photo,
    code: canonicalPhotoCode,
    standardCode: canonicalPhotoCode,
    uniqueCode: vaultMedia?.uniqueCode || photo.uniqueCode,
    canonicalPath: vaultMedia
      ? buildMediaLiveDetailUrl(vaultMedia)
      : buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, canonicalPhotoCode),
    discipline: disciplineDisplayTitle,
    disciplineSlug,
    project: projectDisplayTitle,
    displayName: dynamicImageFileName,
    title: dynamicImageFileName,
    client: vaultMedia?.client ?? client,
    model: vaultMedia?.model ?? model,
    makeupArtist: vaultMedia?.makeupArtist ?? makeupArtist,
    assistant: vaultMedia?.assistant ?? assistant,
    date: String(year),
    subdiscipline: specialtyDisplayTitle,
    caption:
      vaultMedia?.caption ||
      photo.caption ||
      (sameStaticProject ? (parentProject as any)?.caption || parentProject?.description : "") ||
      "",
  };

  const resolvedImage = resolveInventoryImage(resolvedPhoto.imgSrc) || resolvedPhoto.imgSrc;

  // Sibling navigation built cleanly from Vault Media for this gallery route
  let prevTarget: SiblingNavTarget | null = null;
  let nextTarget: SiblingNavTarget | null = null;
  let currentIndex = 1;
  let totalPhotos = 1;

  const vaultSiblings = getGalleryMediaForRoute(galleryRoute);
  if (vaultSiblings.length > 0) {
    totalPhotos = vaultSiblings.length;
    const idx = vaultSiblings.findIndex(
      (m) =>
        m.dynamicCode.toUpperCase() === canonicalPhotoCode.toUpperCase() ||
        (vaultMedia?.uniqueCode && m.uniqueCode === vaultMedia.uniqueCode),
    );
    if (idx >= 0) {
      currentIndex = idx + 1;
      if (idx > 0) {
        prevTarget = {
          code: vaultSiblings[idx - 1].dynamicCode,
          url: buildMediaLiveDetailUrl(vaultSiblings[idx - 1]),
        };
      }
      if (idx < vaultSiblings.length - 1) {
        nextTarget = {
          code: vaultSiblings[idx + 1].dynamicCode,
          url: buildMediaLiveDetailUrl(vaultSiblings[idx + 1]),
        };
      }
    }
  } else if (projectSlug) {
    const projectPhotos = getPhotosByProject(projectSlug);
    totalPhotos = projectPhotos.length || 1;
    const idx = projectPhotos.findIndex(
      (p) =>
        (p.imgSrc && photo.imgSrc && p.imgSrc.toLowerCase() === photo.imgSrc.toLowerCase()) ||
        p.code.toUpperCase() === canonicalPhotoCode.toUpperCase() ||
        (p.standardCode && p.standardCode.toUpperCase() === canonicalPhotoCode.toUpperCase()),
    );
    if (idx >= 0) {
      currentIndex = idx + 1;
      if (idx > 0) {
        const prevItem = projectPhotos[idx - 1];
        const prevCode = prevItem.standardCode || prevItem.code;
        prevTarget = {
          code: prevCode,
          url: buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, prevCode),
        };
      }
      if (idx < projectPhotos.length - 1) {
        const nextItem = projectPhotos[idx + 1];
        const nextCode = nextItem.standardCode || nextItem.code;
        nextTarget = {
          code: nextCode,
          url: buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, nextCode),
        };
      }
    }
  }

  const isHidden = Boolean(vaultMedia?.isHidden) || isRouteOrAncestorHidden(galleryRoute);

  return {
    photo: resolvedPhoto,
    projectDescription,
    resolvedImage,
    prevTarget,
    nextTarget,
    currentIndex,
    totalPhotos,
    isHidden,
    vaultMedia,
  };
}

export function dedicatedPhotoHead(loaderData?: DedicatedPhotoLoaderData | null) {
  const locale = currentLocale();
  const photo = loaderData?.photo;
  if (!photo) {
    return pageHead({
      title: `${locale === "fa" ? "سیاوش اکبری" : "Siavash Akbari"} - ${loaderData?.rawPhotoId || (locale === "fa" ? "اثر" : "Artwork")}`,
      description: locale === "fa" ? "نمایش آثار سیاوش اکبری، طراح و عکاس." : "Artwork showcase by multidisciplinary designer & photographer Siavash Akbari.",
      path: loaderData?.currentRawPath || "/",
      type: "article",
    });
  }
  const photoCode = photo.code || "PHOTO";
  const projectTitle = photo.project || "Project";
  const displayHeading = localizedText(loaderData?.vaultMedia?.title || photo.displayName || photo.title || photoCode, loaderData?.vaultMedia?.titleFa, locale).text;
  const title = `${locale === "fa" ? "سیاوش اکبری" : "Siavash Akbari"} - ${displayHeading}`;
  const description =
    localizedText(loaderData?.vaultMedia?.caption || photo.caption, loaderData?.vaultMedia?.captionFa, locale).text ||
    loaderData?.projectDescription ||
    `Explore photo ${photoCode} from ${projectTitle} (${photo.date || "2024"}), creative showcase by multidisciplinary designer & photographer Siavash Akbari.`;

  return pageHead({
    title,
    description,
    path: photo.canonicalPath || loaderData?.currentRawPath || `/${photoCode}`,
    image: loaderData?.resolvedImage,
    type: "article",
  });
}

function computeInitialPhotoState(loaderData: DedicatedPhotoLoaderData) {
  return {
    notFound: false,
    photo: loaderData.photo,
    projectDescription: loaderData.projectDescription,
    resolvedImage: loaderData.resolvedImage,
    prevTarget: loaderData.prevTarget,
    nextTarget: loaderData.nextTarget,
    galleryRoute: loaderData.galleryRoute,
    disciplineSlug: loaderData.disciplineSlug,
    specialtySlug: loaderData.specialtySlug,
    projectSlug: loaderData.projectSlug,
    isHidden: loaderData.isHidden,
    vaultMedia: loaderData.vaultMedia,
  };
}

function computeClientPhotoState(loaderData: DedicatedPhotoLoaderData) {
  if (typeof window === "undefined") {
    return computeInitialPhotoState(loaderData);
  }

  const vMedia =
    getMediaByCode(loaderData.photo?.code || loaderData.rawPhotoId) ||
    getMediaByCode(loaderData.photo?.standardCode || "") ||
    getMediaByCode(loaderData.photo?.uniqueCode || "");

  const deletedMediaKeys = getDeletedVaultMediaKeys();
  const extractedUnique =
    loaderData.photo?.uniqueCode ||
    loaderData.rawPhotoId.match(/^(\d{4})(?:-|$)/)?.[1] ||
    "";
  const isDeletedMedia = Boolean(
    !vMedia &&
      extractedUnique &&
      (deletedMediaKeys.has(`media-${extractedUnique}`.toLowerCase()) ||
        deletedMediaKeys.has(extractedUnique.toLowerCase())),
  );
  if (isDeletedMedia || (loaderData.pendingClientLookup && !vMedia)) {
    let fallbackPhoto = isDeletedMedia
      ? undefined
      : getPhotoItemBySlugOrCode(
          loaderData.rawPhotoId,
          loaderData.disciplineSlug,
          loaderData.specialtySlug || undefined,
          loaderData.projectSlug || undefined,
        );
    if (
      fallbackPhoto?.uniqueCode &&
      (deletedMediaKeys.has(`media-${fallbackPhoto.uniqueCode}`.toLowerCase()) ||
        deletedMediaKeys.has(fallbackPhoto.uniqueCode.toLowerCase()))
    ) {
      fallbackPhoto = undefined;
    }
    if (!fallbackPhoto) {
      return {
        notFound: true,
        photo: null,
        projectDescription: "",
        resolvedImage: "",
        prevTarget: null,
        nextTarget: null,
        galleryRoute: loaderData.galleryRoute,
        disciplineSlug: loaderData.disciplineSlug,
        specialtySlug: loaderData.specialtySlug,
        projectSlug: loaderData.projectSlug,
        isHidden: false,
        vaultMedia: undefined,
      };
    }
  }

  const effectiveField = vMedia?.field || loaderData.disciplineSlug;
  const effectiveCat = vMedia ? vMedia.category : loaderData.specialtySlug;
  const effectiveProj = vMedia ? vMedia.project : loaderData.projectSlug;
  const galleryRoute = vMedia?.assignedRoute || loaderData.galleryRoute;
  const canonicalCode =
    vMedia?.dynamicCode || loaderData.photo?.standardCode || loaderData.photo?.code || loaderData.rawPhotoId;

  const basePhoto =
    vMedia
      ? synthesizePhotoFromVault(vMedia)
      : getPhotoItemBySlugOrCode(
          canonicalCode,
          effectiveField,
          effectiveCat || undefined,
          effectiveProj || undefined,
        ) || loaderData.photo;

  if (!basePhoto) {
    return {
      notFound: true,
      photo: null,
      projectDescription: "",
      resolvedImage: "",
      prevTarget: null,
      nextTarget: null,
      galleryRoute,
      disciplineSlug: effectiveField,
      specialtySlug: effectiveCat,
      projectSlug: effectiveProj,
      isHidden: false,
      vaultMedia: undefined,
    };
  }

  const state = buildLivePhotoViewState({
    photo: basePhoto,
    vaultMedia: vMedia,
    disciplineSlug: effectiveField,
    specialtySlug: effectiveCat,
    projectSlug: effectiveProj,
    galleryRoute,
    canonicalPhotoCode: canonicalCode,
  });

  return {
    notFound: false,
    ...state,
    galleryRoute,
    disciplineSlug: effectiveField,
    specialtySlug: effectiveCat,
    projectSlug: effectiveProj,
  };
}

export function DedicatedPhotoView({ loaderData }: { loaderData: DedicatedPhotoLoaderData }) {
  const locale = useLocale();
  const navigate = useNavigate();
  const [state, setState] = useState(() => computeInitialPhotoState(loaderData));
  const [clientChecked, setClientChecked] = useState(false);
  const [contentReady, setContentReady] = useState(isContentReady);
  const liveResolvedMedia = useResolvedMediaSrc(state.resolvedImage);

  const refreshPhotoData = () => {
    if (typeof window !== "undefined" && !isContentReady()) return;
    const next = computeClientPhotoState(loaderData);
    setState(next);
    setClientChecked(true);
    setContentReady(true);
    if (typeof window !== "undefined" && !next.notFound && next.vaultMedia) {
      const liveUrl = buildMediaLiveDetailUrl(next.vaultMedia);
      const currentUrl = window.location.pathname.replace(/\/+$/, "");
      if (currentUrl !== liveUrl && (loaderData.pendingClientLookup || loaderData.currentRawPath.replace(/\/+$/, "") !== liveUrl)) {
        navigate({ to: liveUrl as any, replace: true });
      }
    }
  };

  useIsomorphicLayoutEffect(() => {
    refreshPhotoData();
  }, [loaderData.rawPhotoId, loaderData.currentRawPath, loaderData.photo?.code]);

  useEffect(() => {
    const unsub1 = subscribeToStudioStore(() => refreshPhotoData());
    const unsub2 = subscribeToVaultStore(() => refreshPhotoData());
    return () => {
      unsub1();
      unsub2();
    };
  }, [loaderData.rawPhotoId, loaderData.currentRawPath]);

  useEffect(() => {
    if (!state.photo) return;
    const displayHeading = state.photo.displayName || state.photo.title || state.photo.code;
    if (displayHeading && typeof document !== "undefined") {
      document.title = `Siavash Akbari - ${displayHeading}`;
    }
  }, [state.photo?.displayName, state.photo?.title, state.photo?.code]);

  // Arrow-key sibling navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowLeft" && state.prevTarget) {
        navigate({ to: state.prevTarget.url as any });
      } else if (e.key === "ArrowRight" && state.nextTarget) {
        navigate({ to: state.nextTarget.url as any });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.prevTarget?.url, state.nextTarget?.url]);

  useEffect(() => {
    if (!state.photo) return;
    const photo = state.photo;
    const assetMeta: any = {
      assetCode: photo.code,
      title: photo.title || photo.code,
      projectTitle: photo.project,
      disciplineLabel: photo.discipline,
      disciplineSlug: photo.disciplineSlug,
      subDiscipline: photo.subdiscipline,
      year: photo.date,
      client: photo.client,
      credits: [
        photo.model && { role: "Model", name: photo.model },
        photo.makeupArtist && { role: "Makeup Artist", name: photo.makeupArtist },
        photo.assistant && { role: "Assistant", name: photo.assistant },
      ].filter(Boolean) as any,
      imageSrc: photo.imgSrc,
      seoSlug: photo.seoSlug || photo.code,
    };

    trackPortfolioAssetView(assetMeta);
  }, [state.photo]);

  if (!contentReady) return <PublishedPageLoading />;

  if (state.notFound || !state.photo) {
    if (loaderData.pendingClientLookup && !clientChecked) {
      return <div className="min-h-screen bg-[#0F0F0F]" />;
    }
    return <NotFoundPage />;
  }

  const photo = state.photo;
  const {
    disciplineSlug,
    specialtySlug,
    projectSlug,
    galleryRoute,
    projectDescription,
    resolvedImage,
    prevTarget,
    nextTarget,
    isHidden,
    vaultMedia,
  } = state;
  const displayTitle = localizedText(vaultMedia?.title || photo.displayName || photo.title, vaultMedia?.titleFa, locale);
  const displayCaption = localizedText(vaultMedia?.caption || photo.caption, vaultMedia?.captionFa, locale);

  if (isHidden) {
    return (
      <HiddenPageNotice
        title={photo.displayName || photo.title || photo.code}
        routePath={photo.canonicalPath || loaderData.currentRawPath}
      />
    );
  }

  // Resolve navigation labels from the live Vault pages after hydration.
  const backUrl = galleryRoute || `/${disciplineSlug}`;
  const liveBackPage = clientChecked ? getPageByRoute(backUrl) : undefined;
  let backLabel = `To ${liveBackPage?.name || photo.project || formatSlugLabel(projectSlug || disciplineSlug)}`;
  if (disciplineSlug === "graphic-design" && specialtySlug === "posters" && !projectSlug) {
    backLabel = `To ${liveBackPage?.name || "Posters"}`;
  } else if (disciplineSlug === "graphic-design" && specialtySlug === "book-covers" && !projectSlug) {
    backLabel = `To ${liveBackPage?.name || "Book Covers"}`;
  }
  const categoryUrl = projectSlug && specialtySlug
    ? `/${disciplineSlug}/${specialtySlug}`
    : `/${disciplineSlug}`;
  const liveCategoryPage = clientChecked ? getPageByRoute(categoryUrl) : undefined;
  const categoryLabel = liveCategoryPage?.name ||
    (projectSlug && specialtySlug
      ? photo.subdiscipline || formatSlugLabel(specialtySlug)
      : photo.discipline || formatSlugLabel(disciplineSlug));

  const handleCommissionClick = () => {
    trackCommissionInquiryFromAsset(photo.code, photo.project);
  };

  const isVideo = isVideoAsset(resolvedImage) || vaultMedia?.isVideo;

  const list = (vaultMedia?.pairedBoxes || []).filter(
    (pair) => !["year", "date", "year / date"].includes(pair.key?.trim().toLowerCase()),
  );
  const hasKey = (k: string) => list.some((p) => p.key?.toLowerCase() === k.toLowerCase());
  if (photo.client && !hasKey("client")) {
    list.push({ key: "Client", value: photo.client });
  }
  if (photo.model && !hasKey("model")) {
    list.push({ key: "Model", value: photo.model });
  }
  if (photo.makeupArtist && !hasKey("mua") && !hasKey("makeup artist")) {
    list.push({ key: "MUA", value: photo.makeupArtist });
  }
  if (photo.assistant && !hasKey("assistant")) {
    list.push({ key: "Assistant", value: photo.assistant });
  }

  return (
    <div className="flex h-full md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)] flex-col bg-[#0F0F0F] text-foreground overflow-hidden">
      {/* Main Split: Media on Left, Info on Right */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Media showcase with sibling navigation */}
        <div className="flex-1 h-full min-h-0 relative flex items-center justify-center p-4 md:p-8 bg-black/40 group overflow-hidden">
          {isVideo ? (
            <video
              src={liveResolvedMedia || undefined}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-sm shadow-2xl"
            />
          ) : (
            <img
              src={liveResolvedMedia || undefined}
              alt={localizedText(vaultMedia?.altEn || displayCaption.text || `${photo.project} — ${photo.code}`, vaultMedia?.altFa, locale).text}
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-sm shadow-2xl select-none"
              loading="eager"
              draggable={false}
            />
          )}

          {prevTarget && (
            <Link
              to={prevTarget.url as any}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10 cursor-pointer shadow-lg"
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}

          {nextTarget && (
            <Link
              to={nextTarget.url as any}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10 cursor-pointer shadow-lg"
              title="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Right Side: Text & Info Column */}
        <div className="w-full md:w-[380px] lg:w-[440px] shrink-0 h-full overflow-y-auto border-t md:border-t-0 md:border-l border-white/10 p-6 md:p-8 flex flex-col justify-between space-y-6 bg-[#0F0F0F]">
          <div className="space-y-6">
            {/* Top Project Context & Description */}
            <div className="space-y-2 pb-4 border-b border-white/10">
              <div className="flex flex-wrap items-center justify-start gap-2">
                <Link
                  to={backUrl as any}
                  className={projectBackButtonClass}
                >
                  <ArrowLeft />
                  <span className="capitalize">{backLabel}</span>
                </Link>
                <Link to={categoryUrl as any} className={projectBackButtonClass}>
                  <ArrowLeft />
                  <span>To {categoryLabel}</span>
                </Link>
              </div>
              {projectDescription && (
                <p className="text-xs text-neutral-300 leading-relaxed bg-white/[0.03] border border-white/5 p-3 rounded-xl mt-1.5">
                  {projectDescription}
                </p>
              )}
            </div>

            <div>
              <h1 className="font-display text-xl md:text-2xl font-normal leading-snug tracking-tight text-white font-mono break-all">
                <span lang={displayTitle.lang} dir={displayTitle.lang === "fa" ? "rtl" : "ltr"}>{displayTitle.text || `${photo.code}.JPG`}</span>
              </h1>
            </div>

            <div className="border-t border-white/10 divide-y divide-white/10 text-xs md:text-sm">
              {/* Services */}
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] py-3.5 gap-2 sm:gap-4 items-baseline">
                <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                  {locale === "fa" ? "خدمات" : "Services"}
                </div>
                <div className="text-neutral-200 font-sans">
                  <Link to={`/${disciplineSlug}` as any} className="hover:text-[#2CE3C0] transition-colors">
                    {photo.discipline || disciplineSlug}
                  </Link>
                  {specialtySlug && (
                    <>
                      {" / "}
                      <Link
                        to={`/${disciplineSlug}/${specialtySlug}` as any}
                        className="hover:text-[#2CE3C0] transition-colors"
                      >
                        {photo.subdiscipline || specialtySlug.replace(/-/g, " ")}
                      </Link>
                    </>
                  )}
                  {projectSlug && (
                    <>
                      {" / "}
                      <Link
                        to={galleryRoute as any}
                        className="hover:text-[#2CE3C0] transition-colors"
                      >
                        {photo.project || projectSlug.replace(/-/g, " ")}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Unified Credits & Paired Boxes from Vault Media */}
              {list.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] py-3.5 gap-2 sm:gap-4 items-baseline">
                  <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                    {locale === "fa" ? "عوامل" : "Credits"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((pair, idx) => {
                      const label = localizedText(pair.key, pair.keyFa, locale);
                      const value = localizedText(pair.value, pair.valueFa, locale);
                      return (
                      <button
                        type="button"
                        key={pair.id || idx}
                        onClick={() => trackCreditClick(pair.key, pair.value, photo.code)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono transition-colors hover:border-[#2CE3C0]/40"
                      >
                        <span lang={label.lang} dir={label.lang === "fa" ? "rtl" : "ltr"} className="text-neutral-400 font-medium">{label.text}:</span>
                        <span lang={value.lang} dir={value.lang === "fa" ? "rtl" : "ltr"} className="text-[#2CE3C0] font-semibold">{value.text}</span>
                      </button>
                    )})}
                  </div>
                </div>
              )}
              {photo.keywords && (
                <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] py-3.5 gap-2 sm:gap-4 items-baseline">
                  <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                    {locale === "fa" ? "کلیدواژه‌ها" : "Keywords"}
                  </div>
                  <div className="text-xs text-neutral-400 font-sans">{photo.keywords}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-start">
            <a
              href={withLocale("/contact", locale)}
              onClick={handleCommissionClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[#2CE3C0] hover:text-black border border-white/10 hover:border-transparent text-xs font-semibold tracking-wider uppercase transition-all duration-300"
            >
              <span>{locale === "fa" ? "سفارش پروژه" : "Commission Work"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
