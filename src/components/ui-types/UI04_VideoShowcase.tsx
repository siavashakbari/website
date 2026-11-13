import { useState, useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { VideoPlayer } from "@/components/ui/video-player";
import { metaFromSrc } from "@/lib/adaptive-image";
import { useResolvedMediaSrc } from "@/lib/local-media-db";
import { getVaultMedia } from "@/lib/vault-store";

export interface VideoShowcaseItem {
  id: string;
  src: string;
  title: string;
  category?: string;
  year?: string;
  aspectRatio?: number;
}

interface UI04_VideoShowcaseProps {
  items: VideoShowcaseItem[];
  emptyMessage?: string;
}

/**
 * UI04: Video Showcase
 * Video cards that play on hover with a high-definition theater modal on click.
 * Approved from: https://www.siavashakbari.ir/video
 */
export function UI04_VideoShowcase({
  items,
  emptyMessage = "No videos currently available.",
}: UI04_VideoShowcaseProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [videoRatio, setVideoRatio] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const activeVideo = items.find((item) => item.id === activeVideoId) || null;
  const vaultMedia = activeVideo ? getVaultMedia().find((item) => item.id === activeVideo.id) : undefined;
  const resolvedActiveSrc = useResolvedMediaSrc(activeVideo?.src);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectVideo = (item: VideoShowcaseItem) => {
    const initialRatio = item.aspectRatio || metaFromSrc(item.src).ratio || 0.5625;
    setVideoRatio(initialRatio);
    setActiveVideoId(item.id);
  };

  useEffect(() => {
    if (!activeVideo) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideoId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeVideo?.id]);

  if (!items || items.length === 0) {
    return (
      <p className="mx-auto max-w-3xl py-20 px-6 text-center text-sm text-neutral-500 font-mono">
        {emptyMessage}
      </p>
    );
  }

  const currentRatio =
    videoRatio || (activeVideo ? metaFromSrc(activeVideo.src).ratio : 0.5625) || 0.5625;
  const year = vaultMedia?.year || activeVideo?.year;
  const detailPairs = (vaultMedia?.pairedBoxes || []).filter(
    (pair) => pair.key?.trim() && pair.value?.trim(),
  );
  const hasPair = (keys: string[]) => detailPairs.some((pair) =>
    keys.includes(pair.key.trim().toLowerCase()),
  );
  const addFallback = (key: string, value: string | undefined, aliases: string[]) => {
    if (value?.trim() && !hasPair(aliases)) detailPairs.push({ key, value: value.trim() });
  };
  addFallback("Year", year, ["year", "date", "year / date"]);
  addFallback("Client", vaultMedia?.client, ["client"]);
  addFallback("Model", vaultMedia?.model, ["model", "models"]);
  addFallback("Makeup artist", vaultMedia?.makeupArtist, ["makeup artist", "mua"]);
  addFallback("Assistant", vaultMedia?.assistant, ["assistant"]);

  return (
    <div className="w-full px-[13px] sm:px-[20px]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <VideoShowcaseCard key={item.id} item={item} onSelect={handleSelectVideo} />
        ))}
      </div>

      {/* Theater Modal Player */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeVideo && (
              <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-[4px] md:p-6"
                role="dialog"
                aria-modal="true"
                aria-label={activeVideo.title}
                onClick={() => setActiveVideoId(null)}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 15 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="relative z-10 flex max-h-[98dvh] max-w-[calc(100vw-8px)] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] md:max-h-[94dvh] md:max-w-[94vw] md:flex-row md:rounded-[30px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      aspectRatio: `${currentRatio}`,
                      "--video-mobile-width": `${76 * currentRatio}dvh`,
                      "--video-desktop-width": `${86 * currentRatio}dvh`,
                    } as CSSProperties}
                    className="relative w-[min(calc(100vw-8px),var(--video-mobile-width))] shrink-0 overflow-hidden bg-black md:w-[min(calc(94vw-340px),var(--video-desktop-width))]"
                  >
                    {resolvedActiveSrc && (
                      <VideoPlayer
                        src={resolvedActiveSrc}
                        title={activeVideo.title}
                        autoPlay
                        loop
                        onClose={() => setActiveVideoId(null)}
                        onRatioChange={(r) => setVideoRatio(r)}
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <aside className="w-full max-h-[21dvh] overflow-y-auto border-t border-white/10 bg-[#0F0F0F] p-4 text-white md:max-h-[86dvh] md:w-[340px] md:border-l md:border-t-0 md:p-7">
                    <p className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[#2CE3C0] md:text-[10px]">
                      {activeVideo.category || "Video"}
                    </p>
                    <h2 className="mt-3 break-words font-display text-lg leading-tight text-white md:text-2xl">
                      {activeVideo.title}
                    </h2>
                    {vaultMedia?.caption?.trim() && (
                      <p className="mt-5 whitespace-pre-line break-words text-[10.5px] leading-relaxed text-neutral-300 md:text-sm">
                        {vaultMedia.caption.trim()}
                      </p>
                    )}
                    {detailPairs.length > 0 && (
                      <dl className="mt-6 divide-y divide-white/10 border-t border-white/10">
                        {detailPairs.map((pair, index) => (
                          <div key={`${pair.key}-${index}`} className="grid grid-cols-[90px_1fr] gap-3 py-3 text-[9px] md:text-xs">
                            <dt className="break-words font-mono uppercase tracking-wider text-neutral-500">
                              {pair.key}
                            </dt>
                            <dd className="min-w-0 whitespace-pre-line break-words text-neutral-200">
                              {pair.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </aside>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function VideoShowcaseCard({
  item,
  onSelect,
}: {
  item: VideoShowcaseItem;
  onSelect: (item: VideoShowcaseItem) => void;
}) {
  const resolvedSrc = useResolvedMediaSrc(item.src);

  // Grid cards are ALWAYS 9:16 vertical, regardless of the source video's
  // dimensions. The theater modal on click reads the natural ratio.
  return (
    <div
      onClick={() => onSelect(item)}
      style={{ aspectRatio: "9 / 16" }}
      className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-[#141414] transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl border border-white/5 flex items-center justify-center"
    >
      <video
        src={resolvedSrc || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-40 transition-opacity duration-300 group-hover:opacity-20" />
      <div className="pointer-events-none absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110">
        <Play className="h-4 w-4 fill-white translate-x-[1px]" />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4">
        {item.category && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#2CE3C0] block">
            {item.category}
          </span>
        )}
        <span className="text-sm font-medium text-white truncate block">
          {item.title}
        </span>
      </div>
    </div>
  );
}
