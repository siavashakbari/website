import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type LiquidWaveSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = { sm: "h-16 w-16", md: "h-24 w-24", lg: "h-32 w-32" };

const wavePath =
  "M 0 36.5 C 67.43 36.5, 99.09 15.5, 160.53 15.5 C 221.98 15.5, 250.54 36.5, 300 36.5 " +
  "C 348.56 36.5, 397.30 7, 457.63 7 C 517.96 7, 539.66 36.5, 600 36.5 " +
  "C 667.43 36.5, 699.09 15.5, 760.53 15.5 C 821.98 15.5, 850.54 36.5, 900 36.5 " +
  "C 948.56 36.5, 997.30 7, 1057.63 7 C 1117.96 7, 1139.66 36.5, 1200 36.5 L 1200 800 L 0 800 Z";

export default function LiquidWaveSpinner({ size = "md", className }: LiquidWaveSpinnerProps) {
  const clipId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="140 140 220 220"
      className={cn(sizeClasses[size], className)}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="249.5" cy="249.5" r="107.5" />
        </clipPath>
      </defs>
      <circle cx="249.5" cy="249.5" r="107.5" className="fill-muted" />
      <g clipPath={`url(#${clipId})`}>
        <motion.g
          initial={false}
          animate={{ y: 170.1 }}
        >
          <motion.g
            initial={false}
            animate={{ x: reduceMotion ? 0 : -600 }}
            transition={{ duration: 3.5, repeat: reduceMotion ? 0 : Infinity, ease: "linear", repeatType: "reverse" }}
          >
            <path d={wavePath} className="fill-secondary opacity-40" />
          </motion.g>
        </motion.g>
        <motion.g initial={false} animate={{ y: 180.1 }}>
          <motion.g
            initial={false}
            animate={{ x: reduceMotion ? 0 : -600 }}
            transition={{ duration: 2.5, repeat: reduceMotion ? 0 : Infinity, ease: "linear" }}
          >
            <path d={wavePath} className="fill-secondary" />
          </motion.g>
        </motion.g>
      </g>
    </svg>
  );
}
