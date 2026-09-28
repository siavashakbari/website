import { useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, rootRouteId, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DISCIPLINES } from "@/data/disciplines";
import { getPhotoItemByCode } from "@/lib/studio-store";
import { getPhotoByCode } from "@/data/photo-inventory";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$discipline/$photoId")({
  loader: ({ params }) => {
    const discipline = DISCIPLINES.find((d) => d.slug === params.discipline);
    if (!discipline) throw notFound({ routeId: rootRouteId });

    // Lookup photo by code (e.g. SA-PORT-PHO-04)
    const photo = getPhotoItemByCode(params.photoId) || getPhotoByCode(params.photoId);
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

  // Clicking anywhere navigates back to the gallery and restores scroll position
  const handlePageClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/$discipline", params: { discipline: discipline.slug } });
    }
  };

  return (
    <div
      onClick={handlePageClick}
      className="min-h-screen w-full bg-[#0F0F0F] text-[#EFEFEF] cursor-pointer select-none pb-24 pt-8 md:pt-12 px-6 md:px-16 lg:px-24 transition-colors"
      title="Click anywhere to return to gallery"
    >
      <div className="mx-auto max-w-6xl">
        {/* Back navigation pill indicator */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#2CE3C0] uppercase">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Click anywhere to go back</span>
          </div>
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

          {/* Right Narrative block */}
          <div className="flex flex-col justify-start space-y-6 pt-2 md:pt-4">
            {/* Bold Headline / Quote */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-normal leading-snug tracking-tight text-white">
              {photo.caption
                ? photo.caption
                : `We believe that great storytelling comes from a blend of technical mastery, emotional depth and knowing your audience.`}
            </h1>

            {/* Paragraph / Context */}
            <div className="space-y-4 text-xs md:text-sm text-neutral-400 leading-relaxed font-sans">
              <p>
                {photo.subdiscipline
                  ? `An exploration in ${photo.subdiscipline.toLowerCase()} — captured as part of the ${photo.project} series. Designed for brands and creators who seek nuanced visual identity and quiet presence.`
                  : `Step into a world where every frame tells a story and design becomes emotion made visible. The showcase celebrates the harmony of crafted imagery and intentional aesthetics.`}
              </p>
              <p>
                Through refined visuals and precise composition, we turn visions into bold narratives that resonate across mediums. Transcending the expected — creating work that moves.
              </p>
            </div>

            {/* Explore Link indicator */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-white tracking-wide border-b border-white/40 pb-0.5 group-hover:border-white">
                <span>Explore {photo.project} collection</span>
                <span>→</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Metadata Matrix (Matching Screenshot Layout) */}
        <div className="mt-16 md:mt-24 border-t border-white/10 divide-y divide-white/10 text-xs md:text-sm">
          {/* Row 1: Services / Discipline */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] py-4 md:py-5 gap-2 md:gap-4 items-baseline">
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
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] py-4 md:py-5 gap-2 md:gap-4 items-baseline">
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
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] py-4 md:py-5 gap-2 md:gap-4 items-baseline">
              <div className="text-neutral-500 font-mono uppercase tracking-wider text-xs">
                Credits
              </div>
              <div className="text-neutral-200 font-sans flex flex-wrap gap-x-6 gap-y-1">
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
  );
}
