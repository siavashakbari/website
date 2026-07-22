import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "motion/react";
import { TextAnimate } from "@/components/ui/text-animate";

const INTRO_LINES = [
  "Multi-disciplinary Designer",
  "Photographer",
  "Creative Director",
] as const;

const CHAR_DURATION = 0.28;

/** Time for character blurInUp enter/exit to finish for a given line */
function lineAnimMs(text: string) {
  const chars = Math.max(text.length, 1);
  const stagger = CHAR_DURATION / chars;
  return Math.round((CHAR_DURATION + stagger * (chars - 1) + 0.12) * 1000);
}

const HOLD_MS = 660;
const GAP_MS = 160;
const VEIL_FADE_MS = 520;

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
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [linePhase, setLinePhase] = useState<"show" | "exit">("show");
  const [veilVisible, setVeilVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  // Lock scroll before the browser paints to avoid the scrollbar flash/jump
  useLayoutEffect(() => {
    return lockScroll();
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const run = async () => {
      for (let i = 0; i < INTRO_LINES.length; i++) {
        setLinePhase("show");
        setActiveLine(i);
        await wait(lineAnimMs(INTRO_LINES[i]) + HOLD_MS);

        // Character-by-character exit (same stagger as enter, reversed)
        setLinePhase("exit");
        await wait(lineAnimMs(INTRO_LINES[i]));

        setActiveLine(null);
        await wait(GAP_MS);
      }

      // Black layer + blur leave together
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
      {/* Blur + black fade out together */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
        initial={{ opacity: 1 }}
        animate={{ opacity: veilVisible ? 1 : 0 }}
        transition={{ duration: VEIL_FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        {activeLine !== null ? (
          <TextAnimate
            key={INTRO_LINES[activeLine]}
            animation="blurInUp"
            by="character"
            startOnView={false}
            once
            duration={CHAR_DURATION}
            as="p"
            animate={linePhase}
            className="text-center font-display text-xl font-medium tracking-wide text-white sm:text-2xl md:text-4xl"
          >
            {INTRO_LINES[activeLine]}
          </TextAnimate>
        ) : null}
      </div>
    </div>
  );
}
