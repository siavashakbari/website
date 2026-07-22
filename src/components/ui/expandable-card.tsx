import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface ExpandableCardProps {
  title: string;
  src: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  classNameExpanded?: string;
}

/**
 * Lock scroll without shifting the layout.
 * `scrollbar-gutter: stable` on html already reserves the scrollbar lane.
 */
function lockPageScroll() {
  const html = document.documentElement;
  const body = document.body;
  const prevHtmlOverflow = html.style.overflow;
  const prevBodyOverflow = body.style.overflow;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  return () => {
    html.style.overflow = prevHtmlOverflow;
    body.style.overflow = prevBodyOverflow;
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
  description,
  children,
  className,
  classNameExpanded,
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const [ratio, setRatio] = React.useState<number | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setRatio(naturalWidth / naturalHeight);
    }
  };

  React.useEffect(() => {
    if (!active) return;

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
      unlock();
      window.clearTimeout(clickTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [active]);

  const expandedMetrics = React.useMemo(() => {
    if (typeof window === "undefined" || !ratio) {
      return { width: 720, imageHeight: 480 };
    }

    const maxW = Math.min(window.innerWidth * 0.92, 820);
    const maxH = window.innerHeight * 0.9;
    const textReserve = 260;
    const imageMaxH = Math.max(180, maxH - textReserve);

    let width = maxW;
    let imageHeight = width / ratio;

    if (imageHeight > imageMaxH) {
      imageHeight = imageMaxH;
      width = imageHeight * ratio;
    }

    return {
      width: Math.round(width),
      imageHeight: Math.round(imageHeight),
    };
  }, [ratio]);

  const imageStyle =
    ratio != null
      ? ({ aspectRatio: `${ratio}`, width: "100%", height: "auto" } as const)
      : ({ width: "100%", height: "auto" } as const);

  return (
    <>
      <AnimatePresence>
        {active ? (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 h-full w-full bg-black/50 backdrop-blur-md"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div
            key="overlay"
            className="fixed inset-0 z-[100] grid place-items-center overflow-hidden p-4"
            onWheel={(event) => event.preventDefault()}
            onTouchMove={(event) => event.preventDefault()}
          >
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              style={{ width: expandedMetrics.width }}
              className={cn(
                "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl sm:rounded-3xl",
                classNameExpanded,
              )}
            >
              <motion.div layoutId={`image-${title}-${id}`} className="shrink-0 overflow-hidden">
                <img
                  src={src}
                  alt={title}
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="pointer-events-none block w-full object-cover object-center"
                  style={{
                    width: expandedMetrics.width,
                    height: expandedMetrics.imageHeight,
                  }}
                />
              </motion.div>

              <div className="relative shrink-0 text-white">
                <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                  <div className="min-w-0">
                    <p className="text-base text-white/55 sm:text-lg">{description}</p>
                    <h3 className="mt-0.5 truncate text-2xl font-semibold uppercase tracking-wide text-white sm:text-3xl">
                      {title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    aria-label="Close card"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-transparent text-white transition-colors duration-300 hover:border-white hover:bg-white/10 focus:outline-none"
                    onClick={() => setActive(false)}
                  >
                    <motion.div
                      animate={{ rotate: 45 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-center"
                    >
                      {plusIcon}
                    </motion.div>
                  </button>
                </div>
                <div className="relative px-5 sm:px-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex max-h-[22vh] flex-col items-start gap-3 overflow-hidden pb-6 text-sm text-white/60 sm:text-base"
                  >
                    {children}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "relative",
          active && "invisible pointer-events-none",
          className,
        )}
      >
        <motion.div
          role="button"
          tabIndex={0}
          aria-labelledby={`card-title-${id}`}
          layoutId={`card-${title}-${id}`}
          onClick={() => setActive(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActive(true);
            }
          }}
          className="relative h-fit w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-50 shadow-sm dark:bg-zinc-950 dark:shadow-none"
        >
          <h3 id={`card-title-${id}`} className="sr-only">
            {title}
          </h3>
          <motion.div layoutId={`image-${title}-${id}`} style={imageStyle}>
            <img
              src={src}
              alt={title}
              onLoad={handleImageLoad}
              draggable={false}
              className="pointer-events-none block h-auto w-full object-cover object-center"
              style={imageStyle}
            />
          </motion.div>
          <GlowingEffect
            spread={40}
            glow
            disabled={active}
            proximity={64}
            centerZone={0.55}
            borderWidth={2}
            className="z-10"
          />
        </motion.div>
      </div>
    </>
  );
}
