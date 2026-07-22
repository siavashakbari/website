import { useEffect, useRef } from "react";

const SIZE_PX = 24;

const VELOCITY_FULL = 28;
const VELOCITY_DECAY = 0.14;
const MORPH_EASE = 0.2;

/** Distance from button center where magnetism begins */
const MAGNET_RANGE = 110;
/** Inside this distance from center, cursor locks onto the button */
const MAGNET_STICK = 36;
const MAGNET_EASE = 0.28;

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export function InvertCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const shapeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = dotRef.current;
    const shape = shapeRef.current;
    if (!el || !shape) return;

    document.documentElement.classList.add("invert-cursor-active");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let raf = 0;
    let visible = false;

    let impulseX = 0;
    let impulseY = 0;
    let velX = 0;
    let velY = 0;
    let morphX = 0;
    let morphY = 0;

    let lastMouseX = targetX;
    let lastMouseY = targetY;
    let lastScrollY = window.scrollY;
    let lastWheelAt = 0;
    let lastAngle = 0;
    let magnetStrength = 0;
    let lastButtonRadius = SIZE_PX / 2;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      impulseX += e.clientX - lastMouseX;
      impulseY += e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };
    const onEnter = () => {
      visible = true;
      el.style.opacity = "1";
    };

    const onWheel = (e: WheelEvent) => {
      impulseY += e.deltaY * 0.35;
      lastWheelAt = performance.now();
    };

    const onScroll = () => {
      if (performance.now() - lastWheelAt < 80) {
        lastScrollY = window.scrollY;
        return;
      }
      const y = window.scrollY;
      impulseY += (y - lastScrollY) * 0.5;
      lastScrollY = y;
    };

    const findMagnet = (x: number, y: number) => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-cursor-magnet]");
      let best: { cx: number; cy: number; dist: number; r: number } | null = null;

      nodes.forEach((node) => {
        const style = getComputedStyle(node);
        if (
          style.pointerEvents === "none" ||
          style.opacity === "0" ||
          style.visibility === "hidden" ||
          style.display === "none"
        ) {
          return;
        }
        const rect = node.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const r = Math.min(rect.width, rect.height) / 2;
        const dist = Math.hypot(x - cx, y - cy);
        if (dist > MAGNET_RANGE) return;
        if (!best || dist < best.dist) best = { cx, cy, dist, r };
      });

      return best;
    };

    const tick = () => {
      let aimX = targetX;
      let aimY = targetY;
      const magnet = visible ? findMagnet(targetX, targetY) : null;
      let wantMagnet = 0;

      if (magnet) {
        lastButtonRadius = magnet.r;
        if (magnet.dist <= MAGNET_STICK) {
          wantMagnet = 1;
          aimX = magnet.cx;
          aimY = magnet.cy;
        } else {
          wantMagnet = smoothstep(
            1 - (magnet.dist - MAGNET_STICK) / (MAGNET_RANGE - MAGNET_STICK),
          );
          const pull = wantMagnet * wantMagnet;
          aimX = targetX + (magnet.cx - targetX) * pull;
          aimY = targetY + (magnet.cy - targetY) * pull;
        }
      }

      magnetStrength += (wantMagnet - magnetStrength) * MAGNET_EASE;
      if (magnetStrength < 0.001) magnetStrength = 0;

      const ease = magnetStrength > 0.5 ? 0.45 : 0.3;
      currentX += (aimX - currentX) * ease;
      currentY += (aimY - currentY) * ease;

      velX += impulseX;
      velY += impulseY;
      impulseX = 0;
      impulseY = 0;
      velX *= 1 - VELOCITY_DECAY;
      velY *= 1 - VELOCITY_DECAY;

      // Kill stretch while stuck so it sits clean on the button
      const morphDamp = 1 - magnetStrength;
      const targetMorphX = Math.max(-1, Math.min(1, (velX / VELOCITY_FULL) * morphDamp));
      const targetMorphY = Math.max(-1, Math.min(1, (velY / VELOCITY_FULL) * morphDamp));
      morphX += (targetMorphX - morphX) * MORPH_EASE;
      morphY += (targetMorphY - morphY) * MORPH_EASE;
      if (Math.abs(morphX) < 0.001) morphX = 0;
      if (Math.abs(morphY) < 0.001) morphY = 0;

      const intensity = Math.min(1, Math.hypot(morphX, morphY));

      if (intensity >= 0.02) {
        lastAngle = Math.atan2(morphY, morphX);
      }

      const stretch = 1 + intensity * 0.85;
      const squish = 1 - intensity * 0.22;

      let radius = "50%";
      if (intensity >= 0.02) {
        const wide = 60 + intensity * 12;
        const narrow = 40 - intensity * 14;
        radius = `${wide}% ${narrow}% ${narrow}% ${wide}% / 50% 50% 50% 50%`;
      }

      const angleDeg = (lastAngle * 180) / Math.PI;

      // Grow to button radius − 2px when stuck
      const stuckSize = Math.max(SIZE_PX, lastButtonRadius * 2 - 4);
      const drawSize = SIZE_PX + (stuckSize - SIZE_PX) * magnetStrength * magnetStrength;
      const half = drawSize / 2;

      el.style.transform = `translate3d(${currentX - half}px, ${currentY - half}px, 0)`;
      shape.style.width = `${drawSize}px`;
      shape.style.height = `${drawSize}px`;
      shape.style.transform =
        intensity < 0.02
          ? "none"
          : `rotate(${angleDeg}deg) scale(${stretch}, ${squish})`;
      shape.style.borderRadius = radius;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("invert-cursor-active");
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden opacity-0 mix-blend-difference lg:block"
      style={{ willChange: "transform" }}
    >
      <span
        ref={shapeRef}
        className="block bg-[#EFEFEF]"
        style={{
          width: SIZE_PX,
          height: SIZE_PX,
          borderRadius: "50%",
          willChange: "transform, border-radius, width, height",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
