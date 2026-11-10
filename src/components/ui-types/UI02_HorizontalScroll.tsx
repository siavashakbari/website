import React, { useRef, useState, useEffect } from "react";
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
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY === 0) return;
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
    <div className="relative w-full overflow-hidden">
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="scrollbar-hide flex h-[calc(100svh-4.5rem)] min-h-0 items-center gap-6 overflow-x-auto overflow-y-hidden px-[20px] py-4"
      >
        {items.map((item, i) => (
          <figure
            key={item.id || i}
            className="shrink-0 h-full max-h-full cursor-zoom-in py-2 group select-none"
            onClick={() => setActiveIndex(i)}
          >
            <img
              src={item.src}
              alt={item.alt || item.title || `${label} — item ${i + 1}`}
              loading={i < 3 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-auto max-w-none rounded-[4px] bg-[#121212] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </figure>
        ))}
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
