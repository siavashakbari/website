import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "motion/react";
import { MorphingText } from "@/components/ui/morphing-text";

const INTRO_LINES = [
  "Multi-disciplinary Designer",
  "Photographer",
  "Creative Director",
];

/** Empty lead-in so the first line morphs in instead of sitting on load */
const MORPH_TEXTS = ["", ...INTRO_LINES];

/** Matches Magic UI MorphingText internal timing */
const MORPH_TIME = 1.5;
const COOLDOWN_TIME = 0.5;
const VEIL_FADE_MS = 520;

/**
 * Morph in each line (empty → first … → last), then morph last → empty.
 * Exit only after the last word is fully gone — before the empty cooldown ends.
 */
const INTRO_DURATION_MS = Math.round(
  INTRO_LINES.length * (MORPH_TIME + COOLDOWN_TIME) * 1000 + MORPH_TIME * 1000,
);

function lockScroll() {
  const html = document.documentElement;
  const body = document.body;
  const prev = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
  };
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  return () => {
    html.style.overflow = prev.htmlOverflow;
    body.style.overflow = prev.bodyOverflow;
  };
}

export function LandingIntro({ onComplete }: { onComplete: () => void }) {
  const [veilVisible, setVeilVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  // Lock scroll + pin to top before paint (avoids intro over a restored scroll position)
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prevBehavior;
    return lockScroll();
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const run = async () => {
      await wait(INTRO_DURATION_MS);

      setVeilVisible(false);
      await wait(VEIL_FADE_MS);

      setMounted(false);
      onComplete();
    };

    void run();

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
        initial={{ opacity: 1 }}
        animate={{ opacity: veilVisible ? 1 : 0 }}
        transition={{ duration: VEIL_FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <MorphingText
          texts={MORPH_TEXTS}
          className="h-auto min-h-12 font-display text-[1.25rem] font-medium tracking-wide text-white sm:min-h-14 sm:text-2xl md:min-h-16 md:text-4xl lg:text-4xl"
        />
      </div>
    </div>
  );
}
