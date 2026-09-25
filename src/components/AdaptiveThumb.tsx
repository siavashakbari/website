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
import { loadRankForIndex, metaFromSrc } from "@/lib/adaptive-image";
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

  const rankOf = useCallback(
    (domIndex: number) => loadRankForIndex(domIndex, total, cols),
    [total, cols],
  );

  const value = useMemo<GalleryLoadContextValue>(
    () => ({ rankOf, total, cols }),
    [rankOf, total, cols],
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
 * Dominant-color placeholder behind a real `<img>` that is always present in
 * the markup (SSR/no-JS friendly). Browser-native lazy loading staggers
 * fetches; the first visual rows load eagerly.
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

  const rank = gallery ? gallery.rankOf(index) : index;

  useEffect(() => {
    onRatio?.(meta.ratio);
  }, [src, meta.ratio, onRatio]);

  const boxStyle: CSSProperties = {
    ...style,
    aspectRatio: style?.aspectRatio ?? String(meta.ratio),
    backgroundColor: meta.color,
  };

  const isVideo = src.endsWith(".mp4");

  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const vid = videoRef.current;
    if (vid && vid.readyState >= 1) { // HAVE_METADATA
      if (vid.videoWidth > 0 && vid.videoHeight > 0) {
        onRatio?.(vid.videoWidth / vid.videoHeight);
      }
    }
  }, [src, onRatio]);

  return (
    <div className="relative w-full overflow-hidden" style={boxStyle}>
      {isVideo ? (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className={cn(className, "object-cover")}
          style={style}
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            if (vid.videoWidth > 0 && vid.videoHeight > 0) {
              onRatio?.(vid.videoWidth / vid.videoHeight);
            }
          }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={rank < EAGER_COUNT ? "eager" : "lazy"}
          fetchPriority={rank < 3 ? "high" : undefined}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              onRatio?.(img.naturalWidth / img.naturalHeight);
            }
          }}
          className={className}
          style={style}
        />
      )}
    </div>
  );
}

export function resolveFullImageSrc(src: string): string {
  return src;
}
