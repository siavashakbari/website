import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  loadRankForIndex,
  metaFromSrc,
  nextUnlockCount,
} from "@/lib/adaptive-image";

/** How many full-res images may fetch at once (row-major). */
const HQ_CONCURRENCY = 3;

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
  hqUnlocked: number;
  rankOf: (domIndex: number) => number;
  reportHqDone: (rank: number) => void;
  total: number;
  cols: number;
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
  const [hqDone, setHqDone] = useState(0);
  const hqSet = useRef(new Set<number>());

  useEffect(() => {
    hqSet.current = new Set();
    setHqDone(0);
  }, [total, cols]);

  const recount = (set: Set<number>) => {
    let n = 0;
    while (set.has(n)) n += 1;
    return n;
  };

  const rankOf = useCallback(
    (domIndex: number) => loadRankForIndex(domIndex, total, cols),
    [total, cols],
  );

  const reportHqDone = useCallback((rank: number) => {
    if (hqSet.current.has(rank)) return;
    hqSet.current.add(rank);
    setHqDone(recount(hqSet.current));
  }, []);

  const value = useMemo<GalleryLoadContextValue>(
    () => ({
      hqUnlocked: nextUnlockCount(hqDone, total, HQ_CONCURRENCY),
      rankOf,
      reportHqDone,
      total,
      cols,
    }),
    [hqDone, total, cols, rankOf, reportHqDone],
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
 * 1) Immediate solid placeholder (dominant color of the image)
 * 2) Full-quality image loads when its row-major rank is unlocked
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
  const [loaded, setLoaded] = useState(false);
  const reported = useRef(false);

  const rank = gallery ? gallery.rankOf(index) : index;
  const canLoad = !gallery || rank < gallery.hqUnlocked;

  useEffect(() => {
    reported.current = false;
    setLoaded(false);
    onRatio?.(meta.ratio);
  }, [rank, src, meta.ratio, onRatio]);

  useEffect(() => {
    if (!canLoad || !loaded || reported.current) return;
    reported.current = true;
    gallery?.reportHqDone(rank);
  }, [canLoad, loaded, gallery, rank]);

  const markLoaded = () => {
    setLoaded(true);
  };

  // Cached / already-complete images
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!canLoad) return;
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      markLoaded();
      onRatio?.(img.naturalWidth / img.naturalHeight);
    }
  }, [canLoad, src, onRatio]);

  const boxStyle: CSSProperties = {
    ...style,
    aspectRatio: style?.aspectRatio ?? String(meta.ratio),
    backgroundColor: meta.color,
  };

  return (
    <div className="relative w-full overflow-hidden" style={boxStyle}>
      {canLoad ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              onRatio?.(img.naturalWidth / img.naturalHeight);
            }
            markLoaded();
          }}
          onError={markLoaded}
          className={className}
          style={{
            ...style,
            opacity: loaded ? 1 : 0,
            transition: "opacity 320ms ease",
          }}
        />
      ) : null}
    </div>
  );
}

export function resolveFullImageSrc(src: string): string {
  return src;
}
