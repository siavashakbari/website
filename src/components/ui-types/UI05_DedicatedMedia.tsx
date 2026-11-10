import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export interface DedicatedMediaDetail {
  code: string;
  dynamicCode?: string;
  imgSrc: string;
  title: string;
  project: string;
  discipline?: string;
  specialty?: string;
  year?: string;
  model?: string;
  client?: string;
  makeupArtist?: string;
  assistant?: string;
  caption?: string;
  customPairs?: Array<{ key: string; value: string }>;
  parentGalleryHref?: string;
  prevHref?: string | null;
  nextHref?: string | null;
  currentIndex?: number;
  totalCount?: number;
}

interface UI05_DedicatedMediaProps {
  media: DedicatedMediaDetail;
}

/**
 * UI05: Dedicated Media Detail Page
 * Approved from: https://www.siavashakbari.ir/photography/fashion-photography/sepidar/PHOT-FASH-SEPI-0003
 */
export function UI05_DedicatedMedia({ media }: UI05_DedicatedMediaProps) {
  const isVideo =
    media.imgSrc.endsWith(".mp4") ||
    media.imgSrc.endsWith(".webm") ||
    media.imgSrc.startsWith("data:video");

  return (
    <article className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top Bar with Navigation */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {media.parentGalleryHref ? (
            <Link
              to={media.parentGalleryHref as any}
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {media.project || "Gallery"}</span>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            {media.currentIndex && media.totalCount && (
              <span className="text-xs font-mono text-neutral-500">
                {media.currentIndex} / {media.totalCount}
              </span>
            )}

            <div className="flex items-center gap-1">
              {media.prevHref && (
                <Link
                  to={media.prevHref as any}
                  className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Previous item"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
              {media.nextHref && (
                <Link
                  to={media.nextHref as any}
                  className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Next item"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Exhibition Media Viewport */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          {isVideo ? (
            <video
              src={media.imgSrc}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[82vh] w-auto max-w-full rounded-lg shadow-2xl object-contain bg-black"
            />
          ) : (
            <img
              src={media.imgSrc}
              alt={media.title || media.code}
              className="max-h-[85vh] w-auto max-w-full rounded-lg shadow-2xl object-contain select-none"
            />
          )}
        </div>

        {/* Metadata Details Card */}
        <section className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#2CE3C0]">
                {media.specialty || media.discipline || "Artwork"}
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-light text-white mt-0.5">
                {media.title || media.project}
              </h1>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs text-neutral-400 block">
                {media.dynamicCode || media.code}
              </span>
              {media.year && (
                <span className="font-mono text-xs text-neutral-500 block">{media.year}</span>
              )}
            </div>
          </div>

          {/* Key-Value Attributes / Paired Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-xs">
            {media.client && (
              <div>
                <span className="text-neutral-500 block">Client</span>
                <span className="text-white font-medium">{media.client}</span>
              </div>
            )}
            {media.model && (
              <div>
                <span className="text-neutral-500 block">Model</span>
                <span className="text-white font-medium">{media.model}</span>
              </div>
            )}
            {media.makeupArtist && (
              <div>
                <span className="text-neutral-500 block">Makeup Artist</span>
                <span className="text-white font-medium">{media.makeupArtist}</span>
              </div>
            )}
            {media.assistant && (
              <div>
                <span className="text-neutral-500 block">Assistant</span>
                <span className="text-white font-medium">{media.assistant}</span>
              </div>
            )}
            {media.customPairs?.map((pair, idx) => (
              <div key={idx}>
                <span className="text-neutral-500 block">{pair.key}</span>
                <span className="text-white font-medium">{pair.value}</span>
              </div>
            ))}
          </div>

          {media.caption && (
            <p className="text-xs text-neutral-400 pt-3 border-t border-white/5 leading-relaxed">
              {media.caption}
            </p>
          )}
        </section>
      </main>
    </article>
  );
}
