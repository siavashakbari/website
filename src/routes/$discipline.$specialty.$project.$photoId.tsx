import { useEffect, useState } from "react";
import { createFileRoute, notFound, rootRouteId, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import {
  getPhotoItemBySlugOrCode,
  getPhotosByProject,
  getStudioProjects,
  type PhotoInventoryItem,
} from "@/lib/studio-store";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { pageHead } from "@/lib/seo";
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
    const projectDescription = parentProject?.description || "";

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
      projectDescription,
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
    const displayHeading = photo?.displayName || photo?.title || photoCode;
    const title = `${displayHeading} — ${projectTitle} | Siavash Akbari`;
    const description =
      photo?.caption ||
      loaderData?.projectDescription ||
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
  const loaderData = Route.useLoaderData();
  const {
    disciplineSlug,
    specialtySlug,
    projectSlug,
    prevPhoto,
    nextPhoto,
  } = loaderData;

  const [photo, setPhoto] = useState(loaderData.photo);
  const [projectDescription, setProjectDescription] = useState(loaderData.projectDescription);
  const [resolvedImage, setResolvedImage] = useState(loaderData.resolvedImage);

  // Client hydration from localStorage / studio store
  useEffect(() => {
    const currentPhoto =
      getPhotoItemBySlugOrCode(
        loaderData.photo.code,
        loaderData.disciplineSlug,
        loaderData.specialtySlug,
        loaderData.projectSlug,
      ) ||
      getPhotoItemBySlugOrCode(
        loaderData.photo.standardCode || "",
        loaderData.disciplineSlug,
        loaderData.specialtySlug,
        loaderData.projectSlug,
      );

    const allProjects = getStudioProjects();
    const parentProject =
      allProjects.find(
        (p) => normalizeProjectSlug(p.title) === loaderData.projectSlug || p.id === loaderData.projectSlug,
      ) ||
      projects.find(
        (p) => normalizeProjectSlug(p.title) === loaderData.projectSlug || p.id === loaderData.projectSlug,
      );

    if (parentProject?.description) {
      setProjectDescription(parentProject.description);
    }

    if (currentPhoto) {
      const client = currentPhoto.client || parentProject?.client || "";
      const model =
        currentPhoto.model ||
        (parentProject
          ? Array.isArray(parentProject.models)
            ? parentProject.models.join(", ")
            : parentProject.models
          : "") ||
        "";
      const makeupArtist = currentPhoto.makeupArtist || parentProject?.makeupArtist || "";
      const assistant = currentPhoto.assistant || parentProject?.assistant || "";
      const year = currentPhoto.date || parentProject?.year || "2024";

      const resolved: PhotoInventoryItem = {
        ...currentPhoto,
        client,
        model,
        makeupArtist,
        assistant,
        date: String(year),
        subdiscipline:
          currentPhoto.subdiscipline ||
          parentProject?.subDiscipline ||
          parentProject?.category ||
          loaderData.specialtySlug,
        caption: currentPhoto.caption || parentProject?.caption || parentProject?.description || "",
      };
      setPhoto(resolved);
      setResolvedImage(resolveInventoryImage(resolved.imgSrc));
    }
  }, [loaderData.photo.code, loaderData.projectSlug]);

  const backUrl = `/${disciplineSlug}/${specialtySlug}/${projectSlug}`;

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

  const handleCreditClick = (role: string, name: string) => {
    trackCreditClick(role, name, photo.code, photo.project);
  };

  const handleCommissionClick = () => {
    trackCommissionInquiryFromAsset(photo.code, photo.project);
  };

  return (
    <div className="flex h-full md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)] flex-col bg-[#0F0F0F] text-foreground overflow-hidden">
      {/* Top Header Bar */}
      <div className="shrink-0 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#0F0F0F]">
        <Link
          to={backUrl as any}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2CE3C0] hover:text-white transition-colors px-3 py-1.5 rounded-full border border-[#2CE3C0]/30 hover:border-white bg-[#2CE3C0]/10 hover:bg-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="capitalize">Back to {photo.project || projectSlug.replace(/-/g, " ")}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#2CE3C0] font-semibold">
            {photo.code}
          </span>
        </div>
      </div>

      {/* Main Split: Photo on Left, Info on Right */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Photo showcase with navigation */}
        <div className="flex-1 h-full min-h-0 relative flex items-center justify-center p-4 md:p-8 bg-black/40 group overflow-hidden">
          <img
            src={resolvedImage}
            alt={photo.caption || `${photo.project} — ${photo.code}`}
            className="max-h-full max-w-full w-auto h-auto object-contain rounded-sm shadow-2xl select-none"
            loading="eager"
            draggable={false}
          />

          {/* Sibling navigation */}
          {prevPhoto && (
            <Link
              to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, prevPhoto.code) as any}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10 cursor-pointer shadow-lg"
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}

          {nextPhoto && (
            <Link
              to={buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, nextPhoto.code) as any}
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
              <div className="flex items-center justify-between">
                <Link
                  to={`/${disciplineSlug}/${specialtySlug}/${projectSlug}` as any}
                  className="group inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#2CE3C0] hover:text-white transition-colors"
                >
                  <span className="font-semibold">{photo.project}</span>
                  <ExternalLink className="w-3 h-3 text-[#2CE3C0] group-hover:text-white" />
                </Link>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  {photo.discipline}
                </span>
              </div>
              {projectDescription && (
                <p className="text-xs text-neutral-300 leading-relaxed bg-white/[0.03] border border-white/5 p-3 rounded-xl mt-1.5">
                  {projectDescription}
                </p>
              )}
            </div>

            <div>
              <h1 className="font-display text-xl md:text-2xl font-normal leading-snug tracking-tight text-white">
                {photo.displayName || photo.caption?.trim() || `${photo.project} — Frame ${photo.code.split("-").pop() || "01"}`}
              </h1>
            </div>

            <div className="border-t border-white/10 divide-y divide-white/10 text-xs md:text-sm">
              {/* Services */}
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] py-3.5 gap-2 sm:gap-4 items-baseline">
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
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] py-3.5 gap-2 sm:gap-4 items-baseline">
                <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                  Details
                </div>
                <div className="space-y-1.5 text-neutral-200 font-sans">
                  <div>
                    Asset Code: <span className="font-mono text-[#2CE3C0] font-semibold">{photo.code}</span>
                  </div>
                  {photo.date && <div>Year / Date: {photo.date}</div>}
                  {photo.keywords && (
                    <div className="text-xs text-neutral-400">Keywords: {photo.keywords}</div>
                  )}
                </div>
              </div>

              {/* Credits */}
              {(photo.client ||
                photo.model ||
                photo.makeupArtist ||
                photo.assistant ||
                (photo.customFields && photo.customFields.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] py-3.5 gap-2 sm:gap-4 items-baseline">
                  <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                    Credits
                  </div>
                  <div className="text-neutral-200 font-sans flex flex-wrap gap-x-4 gap-y-2">
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
                    {photo.customFields &&
                      photo.customFields.map((cf) => (
                        <div key={cf.id || cf.label}>
                          {cf.label}: <strong className="text-white font-medium">{cf.value}</strong>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-start">
            <a
              href="/contact"
              onClick={handleCommissionClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[#2CE3C0] hover:text-black border border-white/10 hover:border-transparent text-xs font-semibold tracking-wider uppercase transition-all duration-300"
            >
              <span>Commission Work</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
