import React, { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { GalleryMediaItem } from "./UI01_VerticalScroll";

interface UI02_HorizontalScrollProps {
  items: GalleryMediaItem[];
  emptyMessage?: string;
  label?: string;
}

/**
 * UI02: Horizontal Scroll Strip
 * When scrolled on desktop/windows, the photos scroll horizontally.
 * Approved from: https://www.siavashakbari.ir/graphic-design/posters
 */
export function UI02_HorizontalScroll({
  items,
  emptyMessage = "No media available in this section.",
  label = "Gallery",
}: UI02_HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY === 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

  if (!items || items.length === 0) {
    return (
      <p className="mx-auto max-w-3xl py-20 px-6 text-center text-sm text-neutral-500 font-mono">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="relative w-full lg:overflow-hidden">
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex flex-col gap-4 px-3 pt-4 pb-16 lg:scrollbar-hide lg:flex-row lg:h-[calc(100svh-4.5rem)] lg:min-h-0 lg:items-center lg:gap-6 lg:overflow-x-auto lg:overflow-y-hidden lg:px-[20px] lg:py-4"
      >
        {items.map((item, i) => {
          const isVideo = /\.(mp4|webm|mov)(\?|#|$)|^data:video\//i.test(item.src);
          const mediaEl = isVideo ? (
            <video
              src={item.src}
              autoPlay
              muted
              loop
              playsInline
              draggable={false}
              className="w-full h-auto rounded-[4px] bg-[#121212] object-contain transition-transform duration-300 group-hover:scale-[1.01] lg:h-full lg:w-auto lg:max-w-none"
            />
          ) : (
            <img
              src={item.src}
              alt={item.alt || item.title || `${label} — item ${i + 1}`}
              loading={i < 4 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className="w-full h-auto rounded-[4px] bg-[#121212] object-contain transition-transform duration-300 group-hover:scale-[1.01] lg:h-full lg:w-auto lg:max-w-none"
            />
          );

          if (item.href) {
            return (
              <Link
                key={item.id || i}
                to={item.href as any}
                className="w-full cursor-pointer overflow-hidden bg-card transition-opacity hover:opacity-95 group select-none lg:w-auto lg:shrink-0 lg:h-full lg:max-h-full lg:overflow-visible lg:bg-transparent lg:py-2 lg:hover:opacity-100"
                title={item.alt || item.title || `${label} — item ${i + 1}`}
              >
                {mediaEl}
              </Link>
            );
          }

          return (
            <figure
              key={item.id || i}
              className="w-full cursor-zoom-in overflow-hidden group select-none lg:w-auto lg:shrink-0 lg:h-full lg:max-h-full lg:overflow-visible lg:py-2"
              onClick={() => setActiveIndex(i)}
            >
              {mediaEl}
            </figure>
          );
        })}
      </div>

      {/* Fullscreen Lightbox View */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-black/95 p-6 backdrop-blur-md"
          onClick={() => setActiveIndex(null)}
        >
          <img
            src={items[activeIndex].src}
            alt={items[activeIndex].alt || items[activeIndex].title || `${label} — full view`}
            className="max-h-full max-w-full object-contain select-none"
          />
        </div>
      )}
    </div>
  );
}
