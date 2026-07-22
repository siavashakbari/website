"use client";

import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";

const GLOW_MASK =
  "linear-gradient(#0000,#0000), conic-gradient(from calc((var(--start) - var(--spread)) * 1deg), #0000 0deg, #EFEFEF, #0000 calc(var(--spread) * 2deg))";

/** Shared flag so every glow turns off while an expandable card overlay is open */
const OVERLAY_OPEN_CLASS = "expandable-card-open";

export function setExpandableCardOverlayOpen(open: boolean) {
  document.documentElement.classList.toggle(OVERLAY_OPEN_CLASS, open);
}

function useOverlayBlocksGlow() {
  const [blocked, setBlocked] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains(OVERLAY_OPEN_CLASS)
      : false,
  );

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setBlocked(html.classList.contains(OVERLAY_OPEN_CLASS));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return blocked;
}

interface GlowingEffectProps {
  blur?: number;
  /** 0–1 share of half-size from center that expands toward full 4-side glow */
  centerZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

const GlowingEffect = memo(
  ({
    blur = 0,
    centerZone = 0.4,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);
    const overlayBlocks = useOverlayBlocksGlow();
    const isDisabled = disabled || overlayBlocks;

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          if (document.documentElement.classList.contains(OVERLAY_OPEN_CLASS)) {
            element.style.setProperty("--active", "0");
            return;
          }

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          if (!isActive) {
            element.style.setProperty("--active", "0");
            return;
          }

          element.style.setProperty("--active", "1");

          const centerX = left + width * 0.5;
          const centerY = top + height * 0.5;
          const distanceFromCenter = Math.hypot(mouseX - centerX, mouseY - centerY);
          const fullRadius = Math.max(1, 0.5 * Math.min(width, height) * centerZone);

          // Widen the arc toward a full ring as the cursor nears the center (no hard switch)
          const edgeT = smoothstep(distanceFromCenter / fullRadius);
          const nextSpread = 180 + (spread - 180) * edgeT;
          element.style.setProperty("--spread", String(nextSpread));

          const currentAngle = parseFloat(element.style.getPropertyValue("--start")) || 0;
          const targetAngle =
            (180 * Math.atan2(mouseY - centerY, mouseX - centerX)) / Math.PI + 90;
          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [centerZone, proximity, movementDuration, spread],
    );

    useEffect(() => {
      if (isDisabled) {
        containerRef.current?.style.setProperty("--active", "0");
        return;
      }

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, isDisabled]);

    return (
      <div
        ref={containerRef}
        style={
          {
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": "0",
            "--active": "0",
            "--glowingeffect-border-width": `${borderWidth}px`,
            "--glow-mask": GLOW_MASK,
            "--repeating-conic-gradient-times": "5",
            "--gradient":
              variant === "white"
                ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #0F0F0F,
                  #0F0F0F calc(25% / var(--repeating-conic-gradient-times))
                )`
                : `radial-gradient(circle, var(--secondary) 10%, transparent 20%),
                radial-gradient(circle at 40% 40%, var(--secondary) 5%, transparent 15%),
                radial-gradient(circle at 60% 60%, var(--secondary) 10%, transparent 20%),
                radial-gradient(circle at 40% 60%, var(--secondary) 10%, transparent 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--secondary) 0%,
                  var(--secondary) calc(25% / var(--repeating-conic-gradient-times)),
                  var(--secondary) calc(50% / var(--repeating-conic-gradient-times)),
                  var(--secondary) calc(75% / var(--repeating-conic-gradient-times)),
                  var(--secondary) calc(100% / var(--repeating-conic-gradient-times))
                )`,
          } as CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
          glow && "opacity-100",
          blur > 0 && "blur-[var(--blur)]",
          className,
          isDisabled && "!hidden",
        )}
      >
        <div
          className={cn(
            "glow h-full w-full rounded-[inherit]",
            'after:absolute after:inset-0 after:rounded-[inherit] after:content-[""]',
            "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
            "after:[background:var(--gradient)]",
            "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
            "after:[mask-clip:padding-box,border-box]",
            "after:[mask-composite:intersect]",
            "after:[mask-image:var(--glow-mask)]",
          )}
        />
      </div>
    );
  },
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
