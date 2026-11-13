import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useResolvedMediaSrc } from "@/lib/local-media-db";
import { resolveKnownAssetStem } from "@/lib/inventory-assets";

type CoverTileProps = {
  label: string;
  image?: string;
  ariaLabel?: string;
  href?: string;
  to?: any;
  params?: any;
  index?: number;
};

/**
 * Shared cover card used by homepage disciplines and Visual Identity project cards.
 */
export function CoverTile({ to, params, href, label, image, ariaLabel, index }: CoverTileProps) {
  const linkProps = href ? { to: href as any } : { to: to as any, params };
  const [imgFailed, setImgFailed] = useState(false);
  const [videoInView, setVideoInView] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const resolvedImage = useResolvedMediaSrc(image);
  const isVideo = Boolean(image && /\.(mp4|webm|mov)(\?|#|$)|^data:video\//i.test(image));

  useEffect(() => {
    if (!isVideo || !videoElement) return;
    if (typeof IntersectionObserver === "undefined") {
      setVideoInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(videoElement);
    return () => observer.disconnect();
  }, [isVideo, videoElement]);

  useEffect(() => {
    setImgFailed(false);
  }, [image]);

  const hasValidImage = Boolean(resolvedImage && !imgFailed && !(image && image.startsWith("blob:")));
  const videoPoster = (resolveKnownAssetStem(image || "") === "video-echo-prime-01"
    || (image || "").includes("video-echo-prime-01.mp4"))
    ? "/video-echo-prime-poster.webp"
    : undefined;

  return (
    <Link
      {...linkProps}
      aria-label={ariaLabel ?? `View ${label}`}
      className="group relative isolate block aspect-[3/4] cursor-pointer overflow-hidden rounded-[3px] no-underline [clip-path:inset(0_round_3px)]"
    >
      {hasValidImage ? (
        isVideo ? (
          <video
            ref={setVideoElement}
            src={videoInView ? resolvedImage : undefined}
            poster={videoPoster}
            preload="none"
            muted
            loop
            playsInline
            autoPlay
            onError={() => setImgFailed(true)}
            className="h-full w-full rounded-[3px] object-cover object-center transition-[filter] duration-500 ease-out group-hover:brightness-[0.45]"
          />
        ) : (
          <img
            src={resolvedImage}
            alt={label}
            width={480}
            height={640}
            loading={index !== undefined && index < 8 ? "eager" : "lazy"}
            fetchPriority={index !== undefined && index < 4 ? "high" : undefined}
            decoding="async"
            draggable={false}
            onError={() => setImgFailed(true)}
            className="h-full w-full rounded-[3px] object-cover object-center transition-[filter] duration-500 ease-out group-hover:brightness-[0.45]"
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-[3px] bg-[#0F0F0F] transition-[filter] duration-500 ease-out group-hover:brightness-[0.45]">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#EFEFEF]/40">
            Coming soon
          </span>
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0F0F0F]/0 transition-colors duration-500 ease-out group-hover:bg-[#0F0F0F]/35"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0F0F0F]/85 via-[#0F0F0F]/45 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0"
      />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-2 pb-[calc(0.75rem+35px)] transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:translate-y-[calc(-50%+2.75rem)] md:pb-[calc(1rem+35px)]">
        <span className="relative inline-grid place-items-center">
          <span className="font-display col-start-1 row-start-1 text-center text-[13.2px] font-normal uppercase tracking-[0.16em] text-[#EFEFEF] transition-opacity duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0 md:text-[14.52px]">
            {label}
          </span>
          <span
            aria-hidden
            className="font-display col-start-1 row-start-1 text-center text-[13.2px] font-black uppercase tracking-[0.16em] text-[#EFEFEF] opacity-0 transition-opacity duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 md:text-[14.52px]"
          >
            {label}
          </span>
        </span>
      </div>
    </Link>
  );
}
