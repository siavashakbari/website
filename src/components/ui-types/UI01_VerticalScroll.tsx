import React from "react";
import { Link } from "@tanstack/react-router";
import { AdaptiveThumb, GalleryLoadProvider } from "@/components/AdaptiveThumb";

export interface GalleryMediaItem {
  id: string;
  src: string;
  alt?: string;
  href?: string;
  title?: string;
  aspectRatio?: number;
}

interface UI01_VerticalScrollProps {
  items: GalleryMediaItem[];
  emptyMessage?: string;
}

/**
 * UI01: Simple Vertical Scrolling Responsive Masonry
 * Approved from: https://www.siavashakbari.ir/photography/fashion-photography
 */
export function UI01_VerticalScroll({
  items,
  emptyMessage = "No media available in this section.",
}: UI01_VerticalScrollProps) {
  if (!items || items.length === 0) {
    return (
      <p className="mx-auto max-w-3xl py-20 px-6 text-center text-sm text-neutral-500 font-mono">
        {emptyMessage}
      </p>
    );
  }

  return (
    <GalleryLoadProvider total={items.length}>
      <div className="columns-1 gap-x-[4px] px-[13px] sm:columns-2 lg:columns-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="relative mb-[4px] break-inside-avoid">
            {item.href ? (
              <Link
                to={item.href as any}
                className="group relative block w-full overflow-hidden bg-[#0F0F0F] transition-opacity hover:opacity-90 cursor-pointer"
              >
                <AdaptiveThumb
                  src={item.src}
                  index={index}
                  alt={item.alt || item.title || `Media item ${index + 1}`}
                  className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              </Link>
            ) : (
              <div className="group relative block w-full overflow-hidden bg-[#0F0F0F]">
                <AdaptiveThumb
                  src={item.src}
                  index={index}
                  alt={item.alt || item.title || `Media item ${index + 1}`}
                  className="block h-auto w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </GalleryLoadProvider>
  );
}
