import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { setExpandableCardOverlayOpen } from "@/components/ui/glowing-effect";
import { AdaptiveThumb, resolveFullImageSrc } from "@/components/AdaptiveThumb";
import { metaFromSrc } from "@/lib/adaptive-image";

interface ExpandableCardProps {
  title: string;
  src: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  classNameExpanded?: string;
  cardId?: string;
  /** Position in the gallery — used for top-to-bottom adaptive loading */
  index?: number;
}

type HoverContextValue = {
  setHovered: (id: string | null) => void;
  setOpenCard: (id: string | null) => void;
  hoveredId: string | null;
  openCardId: string | null;
};

const HoverContext = React.createContext<HoverContextValue | null>(null);

/**
 * Edge-to-edge masonry hover chrome.
 * No z-index on column children (breaks CSS columns).
 */
export function ExpandableCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [openCardId, setOpenCardId] = React.useState<string | null>(null);

  const setHovered = React.useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const setOpenCard = React.useCallback((id: string | null) => {
    setOpenCardId(id);
    if (id) setHoveredId(null);
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onLeave = () => {
      if (!openCardId) setHoveredId(null);
    };
    root.addEventListener("pointerleave", onLeave);
    return () => root.removeEventListener("pointerleave", onLeave);
  }, [openCardId]);

  const value = React.useMemo(
    () => ({ setHovered, setOpenCard, hoveredId, openCardId }),
    [setHovered, setOpenCard, hoveredId, openCardId],
  );

  return (
    <HoverContext.Provider value={value}>
      <div ref={rootRef} className={cn("relative w-full select-none", className)}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement<{ cardId?: string }>(child)) return child;
          const id = child.props.cardId;
          if (!id) return child;
          return (
            <div key={id} className="relative mb-[4px] break-inside-avoid">
              {child}
            </div>
          );
        })}
      </div>
    </HoverContext.Provider>
  );
}

/** Lock scroll without shifting position or jumping on unlock */
function lockPageScroll() {
  const html = document.documentElement;
  const prev = html.style.overflow;
  html.style.overflow = "hidden";
  return () => {
    html.style.overflow = prev;
  };
}

const plusIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export function ExpandableCard({
  title,
  src,
  children,
  className,
  classNameExpanded,
  cardId,
  index = 0,
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const [ratio, setRatio] = React.useState<number | null>(() => metaFromSrc(src).ratio);
  const [viewport, setViewport] = React.useState({ w: 1200, h: 800 });
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const hover = React.useContext(HoverContext);
  const trackId = cardId ?? id;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const sync = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const handleRatio = React.useCallback((r: number) => {
    setRatio(r);
  }, []);

  React.useEffect(() => {
    setRatio(metaFromSrc(src).ratio);
  }, [src]);

  React.useEffect(() => {
    hover?.setOpenCard(active ? trackId : null);
    return () => {
      hover?.setOpenCard(null);
    };
  }, [active, hover, trackId]);

  React.useEffect(() => {
    if (!active) return;

    setExpandableCardOverlayOpen(true);
    const unlock = lockPageScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false);
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const clickTimer = window.setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 0);

    return () => {
      setExpandableCardOverlayOpen(false);
      unlock();
      window.clearTimeout(clickTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [active]);

  /**
   * Fit image + details into the viewport.
   * Box matches photo aspect exactly → object-cover fills with no crop and no bars.
   */
  const fitted = React.useMemo(() => {
    const header = 64;
    const padY = 24;
    const padX = 24;
    const detailsH = 152;
    const maxW = Math.min(viewport.w - padX * 2, 820);
    const maxImageH = Math.max(160, viewport.h - header - padY * 2 - detailsH);
    const r = ratio ?? 3 / 4;

    let width = maxW;
    let imageHeight = width / r;
    if (imageHeight > maxImageH) {
      imageHeight = maxImageH;
      width = imageHeight * r;
    }

    return {
      width: Math.round(width),
      imageHeight: Math.round(imageHeight),
    };
  }, [ratio, viewport.h, viewport.w]);

  const thumbStyle =
    ratio != null
      ? ({ aspectRatio: `${ratio}`, width: "100%", height: "auto" } as const)
      : ({ width: "100%", height: "auto" } as const);

  const fullSrc = resolveFullImageSrc(src);

  const overlay =
    mounted &&
    createPortal(
      <>
        {/* Backdrop fades on its own so blur eases in, not pops with the card */}
        <AnimatePresence>
          {active ? (
            <motion.div
              key="backdrop"
              aria-hidden
              className="fixed inset-0 z-[140] bg-[#0F0F0F]/50 backdrop-blur-[6px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {active ? (
            <motion.div
              key="dialog-layer"
              className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center px-4 pt-16 pb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                ref={cardRef}
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: fitted.width }}
                className={cn(
                  "pointer-events-auto relative flex max-h-full flex-col overflow-hidden bg-[#0F0F0F] shadow-2xl",
                  classNameExpanded,
                )}
              >
                {/* Exact aspect box — fill = no crop, no letterbox */}
                <div
                  className="relative shrink-0 overflow-hidden bg-[#0F0F0F]"
                  style={{ width: fitted.width, height: fitted.imageHeight }}
                >
                  <img
                    src={fullSrc}
                    alt={title}
                    draggable={false}
                    className="pointer-events-none block h-full w-full object-cover object-center"
                  />
                </div>

                <div className="relative shrink-0 bg-[#0F0F0F] text-[#EFEFEF]">
                  <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-4 sm:px-6 sm:pt-5">
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-semibold uppercase tracking-wide text-[#EFEFEF] sm:text-2xl">
                        {title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Close card"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#EFEFEF]/40 bg-transparent text-[#EFEFEF] transition-colors duration-300 hover:border-[#EFEFEF] hover:bg-[#EFEFEF]/10 focus:outline-none"
                      onClick={() => setActive(false)}
                    >
                      <span className="flex rotate-45 items-center justify-center">{plusIcon}</span>
                    </button>
                  </div>
                  <div className="px-5 pb-4 sm:px-6 sm:pb-5">
                    <div className="flex max-h-[9.5rem] flex-col items-start gap-1.5 overflow-y-auto text-sm text-[#EFEFEF]/60">
                      {children}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </>,
      document.body,
    );

  return (
    <>
      {overlay}

      <div
        className={cn("relative", className)}
        onPointerEnter={() => {
          if (!active) hover?.setHovered(trackId);
        }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-labelledby={`card-title-${id}`}
          onClick={() => setActive(true)}
          onMouseDown={(event) => {
            // Prevent double-click text/image highlight
            if (event.detail > 1) event.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActive(true);
            }
          }}
          className="relative h-fit w-full cursor-pointer select-none overflow-hidden rounded-none bg-[#EFEFEF] dark:bg-[#0F0F0F]"
        >
          <h3 id={`card-title-${id}`} className="sr-only">
            {title}
          </h3>
          <AdaptiveThumb
            src={src}
            index={index}
            alt={title}
            onRatio={handleRatio}
            className="pointer-events-none block h-auto w-full select-none"
            style={thumbStyle}
          />
        </div>
      </div>
    </>
  );
}
