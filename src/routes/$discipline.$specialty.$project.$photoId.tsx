import { useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, rootRouteId, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, Check, ExternalLink } from "lucide-react";
import {
  getPhotoItemBySlugOrCode,
  getPhotosByProject,
  getStudioProjects,
  type PhotoInventoryItem,
} from "@/lib/studio-store";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { pageHead, jsonLdScript, visualAssetJsonLd, absoluteUrl } from "@/lib/seo";
import { projects } from "@/data/projects";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
} from "@/lib/taxonomy";
import { trackPortfolioAssetView, trackCreditClick, trackCommissionInquiryFromAsset } from "@/lib/analytics";
import type { VisualAsset } from "@/types/portfolio-schema";

export const Route = createFileRoute("/$discipline/$specialty/$project/$photoId")({
  loader: ({ params }) => {
    const disciplineSlug = normalizeDisciplineSlug(params.discipline);
    const specialtySlug = normalizeSpecialtySlug(params.specialty);
    const projectSlug = normalizeProjectSlug(params.project);
    const rawPhotoId = params.photoId.trim();

    const photo = getPhotoItemBySlugOrCode(
      rawPhotoId,
      disciplineSlug,
      specialtySlug,
      projectSlug,
    );

    if (!photo) {
      throw notFound({ routeId: rootRouteId });
    }

    // Inherit credits from studio project or default projects if missing
    const allProjects = getStudioProjects();
    const parentProject =
      allProjects.find((p) => normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug) ||
      projects.find((p) => normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug);

    const client = photo.client || parentProject?.client || "";
    const model =
      photo.model ||
      (parentProject
        ? Array.isArray(parentProject.models)
          ? parentProject.models.join(", ")
          : parentProject.models
        : "") ||
      "";
    const makeupArtist = photo.makeupArtist || parentProject?.makeupArtist || "";
    const assistant = photo.assistant || parentProject?.assistant || "";
    const year = photo.date || parentProject?.year || "2024";

    const resolvedPhoto: PhotoInventoryItem = {
      ...photo,
      client,
      model,
      makeupArtist,
      assistant,
      date: String(year),
      subdiscipline: photo.subdiscipline || parentProject?.subDiscipline || parentProject?.category || specialtySlug,
      caption: photo.caption || parentProject?.caption || parentProject?.description || "",
    };

    const resolvedImage = resolveInventoryImage(resolvedPhoto.imgSrc);

    // Sibling photos for navigation
    const projectPhotos = getPhotosByProject(projectSlug);
    const currentIndex = projectPhotos.findIndex(
      (p) =>
        p.code.toUpperCase() === resolvedPhoto.code.toUpperCase() ||
        (p.standardCode && p.standardCode.toUpperCase() === resolvedPhoto.code.toUpperCase()),
    );
    const prevPhoto = currentIndex > 0 ? projectPhotos[currentIndex - 1] : null;
    const nextPhoto =
      currentIndex >= 0 && currentIndex < projectPhotos.length - 1
        ? projectPhotos[currentIndex + 1]
        : null;

    return {
      disciplineSlug,
      specialtySlug,
      projectSlug,
      photo: resolvedPhoto,
      resolvedImage,
      prevPhoto,
      nextPhoto,
      currentIndex: currentIndex >= 0 ? currentIndex + 1 : 1,
      totalPhotos: projectPhotos.length || 1,
    };
  },
  head: ({ loaderData }) => {
    const photo = loaderData?.photo;
    const photoCode = photo?.code || "PHOTO";
    const projectTitle = photo?.project || "Project";
    const title = `${photoCode} — ${projectTitle} | Siavash Akbari`;
    const description =
      photo?.caption ||
      `Explore photo ${photoCode} from ${projectTitle} (${photo?.date || "2024"}), creative showcase by multidisciplinary designer & photographer Siavash Akbari.`;

    const canonicalPath =
      photo?.canonicalPath ||
      `/${loaderData?.disciplineSlug}/${loaderData?.specialtySlug}/${loaderData?.projectSlug}/${photoCode}`;

    return pageHead({
      title,
      description,
      path: canonicalPath,
      image: loaderData?.resolvedImage,
      type: "article",
    });
  },
  component: DedicatedPhotoView,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function DedicatedPhotoView() {
  const {
    disciplineSlug,
    specialtySlug,
    projectSlug,
    photo,
    resolvedImage,
    prevPhoto,
    nextPhoto,
  } = Route.useLoaderData();

  const [copiedLink, setCopiedLink] = useState(false);

  const canonicalPath =
    photo.canonicalPath ||
    `/${disciplineSlug}/${specialtySlug}/${projectSlug}/${photo.code}`;
  const backUrl = `/${disciplineSlug}/${specialtySlug}`;

  // Track GA4 event
  useEffect(() => {
    const assetMeta: VisualAsset = {
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
      seoSlug: photo.seoSlug,
    };

    trackPortfolioAssetView(assetMeta);
  }, [photo]);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${photo.code} — ${photo.project}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCreditClick = (role: string, name: string) => {
    trackCreditClick(role, name, photo.code, photo.project);
  };

  const handleCommissionClick = () => {
    trackCommissionInquiryFromAsset(photo.code, photo.project);
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-foreground">
      {/* Top Header Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex items-center justify-between border-b border-white/5">
        <Link
          to={backUrl as any}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="capitalize">Back to {specialtySlug.replace("-", " ")}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#2CE3C0] font-semibold">
            {photo.code}
          </span>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Share or Copy Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#2CE3C0]" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Image Showcase */}
      <div className="relative w-full flex items-center justify-center py-6 sm:py-10 px-4 group">
        <div className="relative max-h-[82vh] flex items-center justify-center">
          <img
            src={resolvedImage}
            alt={photo.caption || `${photo.project} — ${photo.code}`}
            className="max-h-[82vh] w-auto max-w-full object-contain rounded-md shadow-2xl"
            loading="eager"
          />

          {/* Sibling navigation */}
          {prevPhoto && (
            <Link
              to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, prevPhoto.code) as any}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}

          {nextPhoto && (
            <Link
              to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, nextPhoto.code) as any}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
              title="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Editorial Details Section */}
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-normal leading-snug tracking-tight text-white">
            {photo.caption?.trim() || `${photo.project} — Frame ${photo.code.split("-").pop() || "01"}`}
          </h1>
        </div>

        <div className="border-t border-white/10 divide-y divide-white/10 text-xs md:text-sm">
          {/* Services */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
            <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
              Services
            </div>
            <div className="text-neutral-200 font-sans">
              <Link to={`/${disciplineSlug}` as any} className="hover:text-[#2CE3C0] transition-colors">
                {photo.discipline || disciplineSlug}
              </Link>
              {photo.subdiscipline && (
                <>
                  {" / "}
                  <Link to={backUrl as any} className="hover:text-[#2CE3C0] transition-colors">
                    {photo.subdiscipline}
                  </Link>
                </>
              )}
              {photo.project && (
                <>
                  {" / "}
                  <Link
                    to={`/${disciplineSlug}/${specialtySlug}/${projectSlug}` as any}
                    className="hover:text-[#2CE3C0] transition-colors"
                  >
                    {photo.project}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
            <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
              Details
            </div>
            <div className="space-y-1.5 text-neutral-200 font-sans">
              <div>
                Asset Code: <span className="font-mono text-[#2CE3C0] font-semibold">{photo.code}</span>
              </div>
              <div>
                Canonical URL:{" "}
                <span className="font-mono text-xs text-neutral-400">{canonicalPath}</span>
              </div>
              {photo.date && <div>Year / Date: {photo.date}</div>}
              {photo.keywords && (
                <div className="text-xs text-neutral-400">Keywords: {photo.keywords}</div>
              )}
            </div>
          </div>

          {/* Credits */}
          {(photo.client || photo.model || photo.makeupArtist || photo.assistant) && (
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
              <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                Credits
              </div>
              <div className="text-neutral-200 font-sans flex flex-wrap gap-x-6 gap-y-2">
                {photo.client && (
                  <div
                    onClick={() => handleCreditClick("Client", photo.client)}
                    className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                  >
                    Client: <strong className="text-white font-medium">{photo.client}</strong>
                  </div>
                )}
                {photo.model && (
                  <div
                    onClick={() => handleCreditClick("Model", photo.model)}
                    className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                  >
                    Model: <strong className="text-white font-medium">{photo.model}</strong>
                  </div>
                )}
                {photo.makeupArtist && (
                  <div
                    onClick={() => handleCreditClick("Makeup Artist", photo.makeupArtist)}
                    className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                  >
                    MUA: <strong className="text-white font-medium">{photo.makeupArtist}</strong>
                  </div>
                )}
                {photo.assistant && (
                  <div
                    onClick={() => handleCreditClick("Assistant", photo.assistant)}
                    className="cursor-pointer hover:text-[#2CE3C0] transition-colors"
                  >
                    Assistant: <strong className="text-white font-medium">{photo.assistant}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Commission Button */}
        <div className="pt-4 flex items-center justify-between">
          <a
            href="/contact"
            onClick={handleCommissionClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[#2CE3C0] hover:text-black border border-white/10 hover:border-transparent text-xs font-semibold tracking-wider uppercase transition-all duration-300"
          >
            <span>Commission / License This Work</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Link
            to="/admin/inventory"
            search={{ query: photo.code } as any}
            className="text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Edit in Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
