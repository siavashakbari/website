"use client";

import React, { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative w-full h-1 bg-white/25 rounded-full cursor-pointer py-1.5 flex items-center",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-[#EFEFEF] rounded-full"
          style={{ width: `${value}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
};

export interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  onClose?: () => void;
  onRatioChange?: (ratio: number) => void;
}

export const VideoPlayer = ({
  src,
  title,
  className,
  autoPlay = true,
  loop = true,
  onClose,
  onRatioChange,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isPlaying]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      resetHideTimer();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight, duration } = videoRef.current;
      if (videoWidth && videoHeight) {
        onRatioChange?.(videoWidth / videoHeight);
      }
      if (duration && !isNaN(duration)) {
        setDuration(duration);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(cur);
      if (dur && !isNaN(dur) && dur > 0) {
        setDuration(dur);
        setProgress((cur / dur) * 100);
      }
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(value);
        resetHideTimer();
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.min(
        Math.max(videoRef.current.currentTime + seconds, 0),
        duration || 0
      );
      videoRef.current.currentTime = newTime;
      resetHideTimer();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipTime(-10);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration, onClose]);

  return (
    <div
      className={cn(
        "relative w-full h-full mx-auto overflow-hidden bg-black select-none",
        className
      )}
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        playsInline
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* TOP HEADER: Centered Project Title Pill & Close Button */}
      <div className="absolute top-5 inset-x-5 z-30 flex items-center justify-between pointer-events-none">
        <div className="w-10" />

        {/* Centered Title Pill */}
        {title && (
          <div className="pointer-events-auto px-6 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 shadow-lg flex items-center justify-center">
            <span className="text-[#EFEFEF] font-medium text-sm tracking-wide whitespace-nowrap">
              {title}
            </span>
          </div>
        )}

        {/* Close Button */}
        {onClose ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="pointer-events-auto h-10 w-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#EFEFEF] hover:bg-white/20 transition-all cursor-pointer focus:outline-none"
            aria-label="Close video player"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* OVERLAID BOTTOM CONTROLS (Screenshot Style) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Bottom dark vignette gradient */}
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

            <div className="relative z-30 px-6 sm:px-8 pb-6 sm:pb-8 pointer-events-auto">
              {/* Timeline Row */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <span className="text-[#EFEFEF] text-xs sm:text-sm font-medium tabular-nums drop-shadow">
                  {formatTime(currentTime)}
                </span>
                <CustomSlider
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-[#EFEFEF] text-xs sm:text-sm font-medium tabular-nums drop-shadow">
                  -{formatTime(Math.max((duration || 0) - currentTime, 0))}
                </span>
              </div>

              {/* 3 Circular Action Buttons Row */}
              <div className="flex items-center justify-center gap-5 sm:gap-7">
                {/* Skip Backward 10s */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(-10);
                  }}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-black/45 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#EFEFEF] hover:bg-black/70 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Skip backward 10 seconds"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                  </svg>
                </button>

                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-black/55 backdrop-blur-xl border border-white/15 flex items-center justify-center text-[#EFEFEF] hover:bg-black/80 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>

                {/* Skip Forward 10s */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(10);
                  }}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-black/45 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#EFEFEF] hover:bg-black/70 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Skip forward 10 seconds"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;

