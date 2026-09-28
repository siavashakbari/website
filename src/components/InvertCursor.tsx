import { useEffect, useRef } from "react";

const SIZE_PX = 24;

/** Velocity threshold where maximum aerodynamic elongation is reached */
const VELOCITY_FULL = 36;
/** Fast velocity decay (0.36 = 36% decay per 16.6ms frame) so momentum doesn't linger */
const VELOCITY_DECAY = 0.36;
/** Snappy morph interpolation (0.45) so shape reacts instantly and resets immediately on stop */
const MORPH_EASE = 0.45;
/** Position tracking ease (0.65) so the cursor tightly tracks the pointer without sluggish delay */
const POSITION_EASE = 0.65;

/** Distance from button center where magnetism begins */
const MAGNET_RANGE = 110;
/** Inside this distance from center, cursor locks onto the button */
const MAGNET_STICK = 36;
const MAGNET_EASE = 0.35;

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
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      // Clamp single-event impulse to prevent wild spikes on window boundary crossing
      impulseX += Math.max(-75, Math.min(75, dx));
      impulseY += Math.max(-75, Math.min(75, dy));
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
      velX = 0;
      velY = 0;
      morphX = 0;
      morphY = 0;
      impulseX = 0;
      impulseY = 0;
    };

    const onEnter = (e: MouseEvent) => {
      visible = true;
      el.style.opacity = "1";
      targetX = e.clientX;
      targetY = e.clientY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      currentX = e.clientX;
      currentY = e.clientY;
      impulseX = 0;
      impulseY = 0;
      velX = 0;
      velY = 0;
      morphX = 0;
      morphY = 0;
    };

    const onWheel = (e: WheelEvent) => {
      impulseY += Math.max(-40, Math.min(40, e.deltaY * 0.25));
      lastWheelAt = performance.now();
    };

    const onScroll = () => {
      if (performance.now() - lastWheelAt < 80) {
        lastScrollY = window.scrollY;
        return;
      }
      const y = window.scrollY;
      const dy = y - lastScrollY;
      impulseY += Math.max(-40, Math.min(40, dy * 0.35));
      lastScrollY = y;
    };

    let cachedMagnets: HTMLElement[] = [];
    let lastMagnetUpdate = 0;

    const findMagnet = (x: number, y: number) => {
      const now = performance.now();
      // Scan for magnets only once per 1.5s or if empty
      if (now - lastMagnetUpdate > 1500 || cachedMagnets.length === 0) {
        cachedMagnets = Array.from(document.querySelectorAll<HTMLElement>("[data-cursor-magnet]"));
        lastMagnetUpdate = now;
      }

      if (cachedMagnets.length === 0) return null;

      let best: { cx: number; cy: number; dist: number; r: number } | null = null;

      for (let i = 0; i < cachedMagnets.length; i++) {
        const node = cachedMagnets[i];
        if (!node || !node.isConnected) continue;
        if (node.offsetParent === null) continue;

        const rect = node.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) continue;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(x - cx, y - cy);

        if (dist > MAGNET_RANGE) continue;
        const r = Math.min(rect.width, rect.height) / 2;
        if (!best || dist < best.dist) best = { cx, cy, dist, r };
      }

      return best;
    };

    let frame = 0;
    let magnetCache: ReturnType<typeof findMagnet> = null;
    let lastRadius = "";
    let lastTime = performance.now();

    const tick = (now: number) => {
      // Calculate delta time relative to ideal 60fps (16.67ms)
      const dtMs = Math.min(now - lastTime, 40);
      lastTime = now;
      const dtRatio = dtMs / 16.67;

      frame += 1;
      // Check magnet every 10 frames to keep main thread completely light
      if (frame % 10 === 0) {
        magnetCache = visible ? findMagnet(targetX, targetY) : null;
      }

      let aimX = targetX;
      let aimY = targetY;
      const magnet = magnetCache;
      let wantMagnet = 0;

      if (magnet) {
        lastButtonRadius = magnet.r;
        if (magnet.dist <= MAGNET_STICK) {
          wantMagnet = 1;
          aimX = magnet.cx;
          aimY = magnet.cy;
        } else {
          wantMagnet = smoothstep(1 - (magnet.dist - MAGNET_STICK) / (MAGNET_RANGE - MAGNET_STICK));
          const pull = wantMagnet * wantMagnet;
          aimX = targetX + (magnet.cx - targetX) * pull;
          aimY = targetY + (magnet.cy - targetY) * pull;
        }
      }

      magnetStrength += (wantMagnet - magnetStrength) * Math.min(1, MAGNET_EASE * dtRatio);
      if (magnetStrength < 0.001) magnetStrength = 0;

      // Snappy and direct position ease (0.65 by default, 0.5 when magnetic)
      const baseEase = magnetStrength > 0.5 ? 0.5 : POSITION_EASE;
      const effectiveEase = 1 - Math.pow(1 - baseEase, Math.max(0.1, dtRatio));
      currentX += (aimX - currentX) * effectiveEase;
      currentY += (aimY - currentY) * effectiveEase;

      // Fast velocity processing with high decay rate to eliminate tail lag
      velX += impulseX;
      velY += impulseY;
      impulseX = 0;
      impulseY = 0;
      const decayFactor = Math.pow(1 - VELOCITY_DECAY, dtRatio);
      velX *= decayFactor;
      velY *= decayFactor;

      // Suppress morphing while magnetically locked onto a button
      const morphDamp = 1 - magnetStrength;
      const targetMorphX = Math.max(-1, Math.min(1, (velX / VELOCITY_FULL) * morphDamp));
      const targetMorphY = Math.max(-1, Math.min(1, (velY / VELOCITY_FULL) * morphDamp));

      // Snappy morph ease (0.45) catches speed immediately and returns to 0 on stop
      const morphEase = 1 - Math.pow(1 - MORPH_EASE, Math.max(0.1, dtRatio));
      morphX += (targetMorphX - morphX) * morphEase;
      morphY += (targetMorphY - morphY) * morphEase;

      // Threshold cut-off to instantly settle back to perfect circle
      if (Math.abs(morphX) < 0.005) morphX = 0;
      if (Math.abs(morphY) < 0.005) morphY = 0;

      const intensity = Math.min(1, Math.hypot(morphX, morphY));

      // Immediately orient rotation angle with current directional velocity
      if (intensity >= 0.03) {
        lastAngle = Math.atan2(morphY, morphX);
      }

      // Aerodynamic elongation: stretch along travel vector, squish across width
      const stretch = 1 + intensity * 0.72;
      const squish = 1 - intensity * 0.22;

      let radius = "50%";
      if (intensity >= 0.03) {
        const wide = 58 + intensity * 12;
        const narrow = 42 - intensity * 12;
        // Sleek aerodynamic profile: rounder at front (+X), narrower at tail (-X)
        radius = `${wide}% ${narrow}% ${narrow}% ${wide}% / 50% 50% 50% 50%`;
      }

      const angleDeg = (lastAngle * 180) / Math.PI;

      // Button magnet expansion
      const stuckSize = Math.max(SIZE_PX, lastButtonRadius * 2 - 4);
      const drawSize = SIZE_PX + (stuckSize - SIZE_PX) * magnetStrength * magnetStrength;
      const drawScale = drawSize / SIZE_PX;
      const half = SIZE_PX / 2;

      const finalStretch = stretch * drawScale;
      const finalSquish = squish * drawScale;

      el.style.transform = `translate3d(${currentX - half}px, ${currentY - half}px, 0)`;
      shape.style.transform =
        intensity < 0.03 && magnetStrength < 0.001
          ? `scale(${drawScale})`
          : `rotate(${angleDeg}deg) scale(${finalStretch}, ${finalSquish})`;

      if (radius !== lastRadius) {
        shape.style.borderRadius = radius;
        lastRadius = radius;
      }

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
      className="pointer-events-none fixed left-0 top-0 z-[100000] hidden opacity-0 mix-blend-difference lg:block"
      style={{ willChange: "transform" }}
    >
      <span
        ref={shapeRef}
        className="block bg-[#EFEFEF]"
        style={{
          width: SIZE_PX,
          height: SIZE_PX,
          borderRadius: "50%",
          willChange: "transform, border-radius",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
