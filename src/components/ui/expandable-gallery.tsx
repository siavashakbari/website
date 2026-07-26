"use client";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useId, useRef, useState, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  rotation?: number;
  x?: number;
  y?: number;
  zIndex?: number;
};

const STACK_LAYOUT = [
  { rotation: -12, x: -28, y: 6, zIndex: 10 },
  { rotation: 2, x: 0, y: -8, zIndex: 20 },
  { rotation: 10, x: 26, y: 4, zIndex: 30 },
] as const;

/** Compact timeline stack: cards at 150px (md) — half-width overlap → ±75px centers */
const COMPACT_STACK_LAYOUT = [
  { rotation: -10, x: -75, y: 8, zIndex: 10 },
  { rotation: 2, x: 0, y: -10, zIndex: 20 },
  { rotation: 10, x: 75, y: 6, zIndex: 30 },
] as const;

/** Phone compact stack: 20% smaller cards (100px) — half overlap → ±50px */
const COMPACT_STACK_MOBILE = [
  { rotation: -10, x: -50, y: 6, zIndex: 10 },
  { rotation: 2, x: 0, y: -8, zIndex: 20 },
  { rotation: 10, x: 50, y: 4, zIndex: 30 },
] as const;

const transition = {
  type: "spring",
  stiffness: 160,
  damping: 18,
  mass: 1,
} as const;

type ExpandableGalleryProps = {
  photos: GalleryPhoto[];
  className?: string;
  /** Compact stack for timeline year column */
  compact?: boolean;
  /** When false, hover/tap animate only — no expand overlay */
  expandable?: boolean;
};

/**
 * Stacked photo gallery — 3 cards in a fanned stack.
 * Uses plain <img> (Vite). Placeholders welcome until real assets arrive.
 */
export function ExpandableGallery({
  photos,
  className,
  compact = false,
  expandable = true,
}: ExpandableGalleryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const layoutGroupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsMd(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useOutsideClick(containerRef, () => {
    if (expandable && isExpanded) setIsExpanded(false);
  });

  // Compact stacks use half-overlap layout sized for the larger cards
  const layout = compact
    ? isMd
      ? COMPACT_STACK_LAYOUT
      : COMPACT_STACK_MOBILE
    : STACK_LAYOUT;
  const single = photos.length === 1;

  const stackPhotos = photos.slice(0, 3).map((photo, i) => ({
    ...photo,
    rotation: photo.rotation ?? (single ? 0 : layout[i]?.rotation ?? 0),
    x: photo.x ?? (single ? 0 : layout[i]?.x ?? 0),
    y: photo.y ?? (single ? 0 : layout[i]?.y ?? 0),
    zIndex: photo.zIndex ?? layout[i]?.zIndex ?? i + 1,
  }));

  const showExpanded = expandable && isExpanded;
  const visiblePhotos = showExpanded ? photos : stackPhotos;

  return (
    <LayoutGroup id={layoutGroupId}>
      <div
        ref={containerRef}
        className={cn(
          "relative",
          compact
            ? "h-[9.6rem] w-[15rem] shrink-0 md:h-[12rem] md:w-[18.75rem]"
            : "min-h-[280px] w-full",
          className,
        )}
      >
        <div
          className={cn(
            "relative",
            showExpanded
              ? "fixed inset-0 z-[220] flex items-center justify-center bg-background/85 p-6 backdrop-blur-md"
              : "h-full w-full",
          )}
        >
          {showExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute left-6 top-6 z-[230] inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/20 bg-background">
                <ArrowLeft className="h-4 w-4" />
              </span>
              <span className="font-medium">Back</span>
            </button>
          )}

          <motion.div
            layout={expandable}
            className={cn(
              "relative",
              showExpanded
                ? "grid max-h-[min(80vh,52rem)] w-full max-w-5xl grid-cols-2 gap-4 overflow-y-auto p-2 md:grid-cols-3 md:gap-6"
                : "flex h-full w-full items-center justify-center",
            )}
            transition={transition}
          >
            <AnimatePresence>
              {visiblePhotos.map((photo, index) => {
                const stacked = !showExpanded;
                return (
                  <motion.div
                    key={photo.id}
                    layoutId={
                      expandable
                        ? `card-${layoutGroupId}-${photo.id}`
                        : undefined
                    }
                    layout={expandable}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: stacked ? photo.rotation || 0 : 0,
                      x: stacked ? photo.x || 0 : 0,
                      y: stacked ? photo.y || 0 : 0,
                      zIndex: stacked ? photo.zIndex || index : 10,
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={transition}
                    whileHover={
                      stacked
                        ? {
                            scale: 1.06,
                            y: (photo.y || 0) - 10,
                            rotate: (photo.rotation || 0) * 0.75,
                            zIndex: 50,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : { scale: 1.02 }
                    }
                    whileTap={
                      stacked
                        ? {
                            scale: 0.96,
                            y: (photo.y || 0) - 4,
                            rotate: (photo.rotation || 0) * 1.15,
                            transition: {
                              type: "spring",
                              stiffness: 500,
                              damping: 22,
                            },
                          }
                        : undefined
                    }
                    className={cn(
                      "overflow-hidden bg-muted",
                      expandable ? "cursor-pointer" : "cursor-default",
                      showExpanded
                        ? "relative aspect-square rounded-[1.5rem] border-4 border-background shadow-lg md:rounded-[2rem]"
                        : "absolute rounded-[1.25rem] border-[3px] border-background shadow-[0_12px_28px_rgba(0,0,0,0.35)] md:rounded-[1.5rem]",
                      !showExpanded &&
                        (compact
                          ? "h-[6.25rem] w-[6.25rem] md:h-[9.375rem] md:w-[9.375rem]"
                          : "h-20 w-20 md:h-24 md:w-24"),
                    )}
                    onClick={() => {
                      if (expandable && !isExpanded) setIsExpanded(true);
                    }}
                  >
                    <motion.div
                      layoutId={
                        expandable
                          ? `image-${layoutGroupId}-${photo.id}`
                          : undefined
                      }
                      layout={expandable ? "position" : false}
                      className="relative h-full w-full"
                      transition={transition}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="h-full w-full select-none object-cover pointer-events-none"
                        draggable={false}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {showExpanded && (
            <button
              type="button"
              aria-label="Close gallery"
              onClick={() => setIsExpanded(false)}
              className="absolute right-6 top-6 z-[230] inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/20 bg-background text-foreground transition-colors hover:border-secondary hover:text-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </LayoutGroup>
  );
}

export default ExpandableGallery;
