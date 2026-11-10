import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { VideoPlayer } from "@/components/ui/video-player";
import { metaFromSrc } from "@/lib/adaptive-image";

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
  const [activeVideo, setActiveVideo] = useState<VideoShowcaseItem | null>(null);
  const [videoRatio, setVideoRatio] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectVideo = (item: VideoShowcaseItem) => {
    const initialRatio = item.aspectRatio || metaFromSrc(item.src).ratio || 0.5625;
    setVideoRatio(initialRatio);
    setActiveVideo(item);
  };

  useEffect(() => {
    if (!activeVideo) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeVideo]);

  if (!items || items.length === 0) {
    return (
      <p className="mx-auto max-w-3xl py-20 px-6 text-center text-sm text-neutral-500 font-mono">
        {emptyMessage}
      </p>
    );
  }

  const currentRatio =
    videoRatio || (activeVideo ? metaFromSrc(activeVideo.src).ratio : 0.5625) || 0.5625;

  return (
    <div className="w-full px-[13px] sm:px-[20px]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const itemRatio = item.aspectRatio || metaFromSrc(item.src).ratio || 0.5625;
          return (
            <div
              key={item.id}
              onClick={() => handleSelectVideo(item)}
              style={{ aspectRatio: `${itemRatio}` }}
              className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-[#141414] transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl border border-white/5 flex items-center justify-center"
            >
              <video
                src={item.src}
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
        })}
      </div>

      {/* Theater Modal Player */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeVideo && (
              <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
                onClick={() => setActiveVideo(null)}
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
                  style={{
                    aspectRatio: `${currentRatio}`,
                    maxWidth: `min(90vw, calc(86vh * ${currentRatio}))`,
                    maxHeight: "86vh",
                  }}
                  className="relative z-10 w-full rounded-[30px] overflow-hidden bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border border-white/10 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <VideoPlayer
                    src={activeVideo.src}
                    title={activeVideo.title}
                    autoPlay
                    loop
                    onClose={() => setActiveVideo(null)}
                    onRatioChange={(r) => setVideoRatio(r)}
                    className="w-full h-full"
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
