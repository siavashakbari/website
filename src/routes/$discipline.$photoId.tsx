import { useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, rootRouteId, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DISCIPLINES } from "@/data/disciplines";
import { getPhotoItemByCode } from "@/lib/studio-store";
import { getPhotoByCode, getPhotoByStem, PHOTO_INVENTORY, type PhotoInventoryItem } from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { pageHead } from "@/lib/seo";
import { projects } from "@/data/projects";

export const Route = createFileRoute("/$discipline/$photoId")({
  loader: ({ params }) => {
    const discipline = DISCIPLINES.find((d) => d.slug === params.discipline);
    if (!discipline) throw notFound({ routeId: rootRouteId });

    // 1. Primary lookup: by exact code in studio store or PHOTO_INVENTORY
    let photo: PhotoInventoryItem | undefined =
      getPhotoItemByCode(params.photoId) || getPhotoByCode(params.photoId);

    // 2. Fallback: by stem
    if (!photo) {
      photo = getPhotoByStem(params.photoId);
    }

    // 3. Fallback: case-insensitive code or filename search in inventory
    if (!photo) {
      const q = params.photoId.toLowerCase();
      photo = PHOTO_INVENTORY.find(
        (i) =>
          i.code.toLowerCase() === q ||
          i.imgSrc.toLowerCase().includes(q)
      );
    }

    // 4. Fallback: if it was a project-based code like "gastronomie-01"
    if (!photo) {
      const match = params.photoId.match(/^(.*)-(\d+)$/);
      if (match) {
        const [, projId, idxStr] = match;
        const proj = projects.find((p) => p.id === projId);
        if (proj) {
          const idx = parseInt(idxStr, 10) - 1;
          const gallery = proj.gallery ?? [proj.image];
          const src = gallery[idx] || proj.image;
          const stem = src.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
          photo = getPhotoByStem(stem) || {
            code: params.photoId.toUpperCase(),
            project: proj.title,
            discipline: discipline.label,
            disciplineSlug: discipline.slug,
            imgSrc: src,
            subdiscipline: proj.subDiscipline || proj.category || "",
            model: Array.isArray(proj.models) ? proj.models.join(", ") : (proj.models || ""),
            client: proj.client || "",
            makeupArtist: proj.makeupArtist || "",
            assistant: proj.assistant || "",
            date: proj.year || "2024",
            keywords: `${proj.title}, ${discipline.label}, Siavash Akbari`,
            caption: proj.caption || proj.description || "",
          };
        }
      }
    }

    if (!photo) {
      throw notFound({ routeId: rootRouteId });
    }

    const resolvedImage = resolveInventoryImage(photo.imgSrc);

    return {
      discipline,
      photo,
      resolvedImage,
    };
  },
  head: ({ loaderData }) => {
    const photo = loaderData?.photo;
    const discipline = loaderData?.discipline;
    const title = photo
      ? `${photo.code} — ${photo.project} — ${photo.discipline} — Siavash Akbari`
      : "Photography — Siavash Akbari";
    const description =
      photo?.caption ||
      `Dedicated showcase photograph ${photo?.code} by Siavash Akbari. Project: ${photo?.project}. ${photo?.subdiscipline ? `Sub-discipline: ${photo?.subdiscipline}.` : ""}`;
    const slug = discipline?.slug ?? "photography";

    return pageHead({
      title,
      description,
      path: `/${slug}/${photo?.code}`,
      image: loaderData?.resolvedImage,
      type: "article",
    });
  },
  component: DedicatedPhotoPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Photo Not Found</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function DedicatedPhotoPage() {
  const { discipline, photo, resolvedImage } = Route.useLoaderData();
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/$discipline", params: { discipline: discipline.slug } });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-[#EFEFEF] pb-24 pt-6 md:pt-10 px-6 md:px-16 lg:px-24">
      <div className="mx-auto max-w-6xl">
        {/* Back navigation pill indicator */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#2CE3C0] hover:text-white uppercase transition-colors px-3 py-1.5 rounded-full border border-[#2CE3C0]/30 hover:border-white bg-[#2CE3C0]/10 hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {discipline.label}</span>
          </button>
          <div className="text-xs font-mono text-neutral-400">
            {discipline.label} · {photo.code}
          </div>
        </div>

        {/* Top Hero Section: Photo on Left (or stacked on mobile), Narrative on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Photo on Left */}
          <div className="relative w-full rounded-sm overflow-hidden bg-black/40 border border-white/10 shadow-2xl flex items-center justify-center">
            <img
              src={resolvedImage}
              alt={`${photo.project} — ${photo.code}`}
              className="w-full h-auto max-h-[78vh] object-contain"
              loading="eager"
            />
          </div>

          {/* Right Column: Metadata & Details Matrix (Brought up next to image) */}
          <div className="flex flex-col justify-start space-y-6">
            {photo.caption?.trim() && (
              <div className="pb-2">
                <h1 className="font-display text-xl md:text-2xl font-normal leading-snug tracking-tight text-white">
                  {photo.caption}
                </h1>
              </div>
            )}

            <div className="border-t border-white/10 divide-y divide-white/10 text-xs md:text-sm">
              {/* Row 1: Services / Discipline */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
                <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                  Services
                </div>
                <div className="text-neutral-200 font-sans">
                  {photo.discipline}
                  {photo.subdiscipline ? ` / ${photo.subdiscipline}` : ""}
                  {photo.project ? ` / ${photo.project}` : ""}
                </div>
              </div>

              {/* Row 2: Statistics / Details */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
                <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                  Details
                </div>
                <div className="space-y-1 text-neutral-200 font-sans">
                  <div>Asset Code: <span className="font-mono text-[#2CE3C0] font-semibold">{photo.code}</span></div>
                  {photo.date && <div>Year / Date: {photo.date}</div>}
                  {photo.keywords && <div className="text-xs text-neutral-400">Keywords: {photo.keywords}</div>}
                </div>
              </div>

              {/* Row 3: Clients & Credits */}
              {(photo.client || photo.model || photo.makeupArtist || photo.assistant) && (
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] py-4 gap-2 sm:gap-4 items-baseline">
                  <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                    Credits
                  </div>
                  <div className="text-neutral-200 font-sans flex flex-wrap gap-x-6 gap-y-1.5">
                    {photo.client && <div>Client: <strong className="text-white font-medium">{photo.client}</strong></div>}
                    {photo.model && <div>Model: <strong className="text-white font-medium">{photo.model}</strong></div>}
                    {photo.makeupArtist && <div>MUA: <strong className="text-white font-medium">{photo.makeupArtist}</strong></div>}
                    {photo.assistant && <div>Assistant: <strong className="text-white font-medium">{photo.assistant}</strong></div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
