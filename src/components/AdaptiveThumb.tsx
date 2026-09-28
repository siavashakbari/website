import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { getThumbSrc, loadRankForIndex, metaFromSrc } from "@/lib/adaptive-image";
import { cn } from "@/lib/utils";

/** Images within the first visual rows load eagerly; the rest lazy-load natively. */
const EAGER_COUNT = 6;

/** Matches `columns-1 sm:columns-2 lg:columns-3` on the category grid. */
function useGalleryColumnCount() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (lg.matches) setCols(3);
      else if (sm.matches) setCols(2);
      else setCols(1);
    };
    sync();
    sm.addEventListener("change", sync);
    lg.addEventListener("change", sync);
    return () => {
      sm.removeEventListener("change", sync);
      lg.removeEventListener("change", sync);
    };
  }, []);

  return cols;
}

type GalleryLoadContextValue = {
  rankOf: (domIndex: number) => number;
  total: number;
  cols: number;
  registerThumbLoaded: (index: number) => void;
  isUnlockedForFull: (index: number) => boolean;
};

const GalleryLoadContext = createContext<GalleryLoadContextValue | null>(null);

export function GalleryLoadProvider({
  total,
  children,
}: {
  total: number;
  children: ReactNode;
}) {
  const cols = useGalleryColumnCount();
  const [loadedThumbs, setLoadedThumbs] = useState<Set<number>>(() => new Set());
  const [currentUpgradeRank, setCurrentUpgradeRank] = useState<number>(-1);

  const rankOf = useCallback(
    (domIndex: number) => loadRankForIndex(domIndex, total, cols),
    [total, cols],
  );

  const registerThumbLoaded = useCallback((index: number) => {
    setLoadedThumbs((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // When all visible thumbs (or all thumbs) are loaded, start sequential upgrading from rank 0 downwards
  useEffect(() => {
    // If at least EAGER_COUNT or all items are loaded, or after timeout fallback
    const allThumbsReady = total > 0 && (loadedThumbs.size >= Math.min(total, EAGER_COUNT * 2));
    
    // Safety timer: even if some bottom lazy image hasn't scrolled into view yet,
    // start sequential upgrading after 1.5 seconds so user gets sharp images
    const timer = setTimeout(() => {
      if (currentUpgradeRank === -1) {
        setCurrentUpgradeRank(0);
      }
    }, 1500);

    if (allThumbsReady && currentUpgradeRank === -1) {
      setCurrentUpgradeRank(0);
    }

    return () => clearTimeout(timer);
  }, [loadedThumbs.size, total, currentUpgradeRank]);

  // Advance upgrade rank sequentially one by one from the top
  useEffect(() => {
    if (currentUpgradeRank < 0 || currentUpgradeRank >= total) return;

    // Small stagger per image upgrade to keep network & UI fluid without spike
    const interval = setTimeout(() => {
      setCurrentUpgradeRank((prev) => (prev < total ? prev + 1 : prev));
    }, 120);

    return () => clearTimeout(interval);
  }, [currentUpgradeRank, total]);

  const isUnlockedForFull = useCallback(
    (domIndex: number) => {
      if (currentUpgradeRank < 0) return false;
      const rank = rankOf(domIndex);
      return rank <= currentUpgradeRank;
    },
    [currentUpgradeRank, rankOf],
  );

  const value = useMemo<GalleryLoadContextValue>(
    () => ({ rankOf, total, cols, registerThumbLoaded, isUnlockedForFull }),
    [rankOf, total, cols, registerThumbLoaded, isUnlockedForFull],
  );

  return (
    <GalleryLoadContext.Provider value={value}>{children}</GalleryLoadContext.Provider>
  );
}

export function useGalleryLoad() {
  return useContext(GalleryLoadContext);
}

type AdaptiveThumbProps = {
  src: string;
  index: number;
  alt: string;
  className?: string;
  style?: CSSProperties;
  onRatio?: (ratio: number) => void;
};

/**
 * Two-stage Progressive Image Loader:
 * 1. Loads ultra-lightweight WebP thumbnail (<20KB) first so grid renders instantly without lag.
 * 2. Once initial thumbnails are ready, sequentially upgrades images one by one from the top to full quality.
 */
export function AdaptiveThumb({
  src,
  index,
  alt,
  className,
  style,
  onRatio,
}: AdaptiveThumbProps) {
  const gallery = useGalleryLoad();
  const meta = useMemo(() => metaFromSrc(src), [src]);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  const effectiveRatio = naturalRatio ?? meta.ratio;
  const rank = gallery ? gallery.rankOf(index) : index;

  const isVideo = src.endsWith(".mp4");
  const thumbSrc = useMemo(() => (isVideo ? src : getThumbSrc(src)), [isVideo, src]);

  const shouldUpgrade = gallery ? gallery.isUnlockedForFull(index) : true;
  const [fullLoaded, setFullLoaded] = useState(false);

  useEffect(() => {
    onRatio?.(effectiveRatio);
  }, [effectiveRatio, onRatio]);

  // When unlocked for full size, preload full original image in background
  useEffect(() => {
    if (isVideo || !shouldUpgrade || fullLoaded || thumbSrc === src) return;

    let active = true;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (active) {
        setFullLoaded(true);
      }
    };
    return () => {
      active = false;
    };
  }, [isVideo, shouldUpgrade, fullLoaded, src, thumbSrc]);

  const boxStyle: CSSProperties = {
    ...style,
    aspectRatio: style?.aspectRatio ?? String(effectiveRatio),
    backgroundColor: meta.color,
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid && vid.readyState >= 1) {
      if (vid.videoWidth > 0 && vid.videoHeight > 0) {
        const r = vid.videoWidth / vid.videoHeight;
        setNaturalRatio(r);
        onRatio?.(r);
      }
    }
  }, [src, onRatio]);

  return (
    <div className="relative w-full overflow-hidden bg-[#0A0A0A]" style={boxStyle}>
      {isVideo ? (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className={cn(className, "object-cover")}
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            if (vid.videoWidth > 0 && vid.videoHeight > 0) {
              const r = vid.videoWidth / vid.videoHeight;
              setNaturalRatio(r);
              onRatio?.(r);
            }
          }}
        />
      ) : (
        <>
          {/* 1. Low-weight WebP thumbnail (<20KB) renders first */}
          <img
            src={thumbSrc}
            alt={alt}
            loading={rank < EAGER_COUNT ? "eager" : "lazy"}
            fetchPriority={rank < 3 ? "high" : undefined}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            decoding="async"
            onLoad={(e) => {
              gallery?.registerThumbLoaded(index);
              const img = e.currentTarget;
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const r = img.naturalWidth / img.naturalHeight;
                setNaturalRatio(r);
                onRatio?.(r);
              }
            }}
            className={cn(
              className,
              "w-full h-auto object-cover",
              fullLoaded ? "opacity-0" : "opacity-100",
              "transition-opacity duration-500 ease-out"
            )}
          />

          {/* 2. Full-resolution original image cross-fades smoothly in place once unlocked */}
          {fullLoaded && (
            <img
              src={src}
              alt={alt}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              decoding="async"
              className={cn(
                className,
                "absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-500 ease-out"
              )}
            />
          )}
        </>
      )}
    </div>
  );
}

export function resolveFullImageSrc(src: string): string {
  return src;
}
