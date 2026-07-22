import { useEffect, useRef } from "react";

const SIZE_PX = 24;
const HALF = SIZE_PX / 2;

const VELOCITY_FULL = 28;
const VELOCITY_DECAY = 0.14;
const MORPH_EASE = 0.2;

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

    const tick = () => {
      const ease = 0.3;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      velX += impulseX;
      velY += impulseY;
      impulseX = 0;
      impulseY = 0;
      velX *= 1 - VELOCITY_DECAY;
      velY *= 1 - VELOCITY_DECAY;

      const targetMorphX = Math.max(-1, Math.min(1, velX / VELOCITY_FULL));
      const targetMorphY = Math.max(-1, Math.min(1, velY / VELOCITY_FULL));
      morphX += (targetMorphX - morphX) * MORPH_EASE;
      morphY += (targetMorphY - morphY) * MORPH_EASE;
      if (Math.abs(morphX) < 0.001) morphX = 0;
      if (Math.abs(morphY) < 0.001) morphY = 0;

      const intensity = Math.min(1, Math.hypot(morphX, morphY));

      // Keep last heading when nearly still so the ease-out doesn’t snap angle
      if (intensity >= 0.02) {
        lastAngle = Math.atan2(morphY, morphX);
      }

      const stretch = 1 + intensity * 0.85;
      const squish = 1 - intensity * 0.22;

      let radius = "50%";
      if (intensity >= 0.02) {
        const wide = 60 + intensity * 12;
        const narrow = 40 - intensity * 14;
        // Local +X = movement direction after rotate.
        // Swapped ends: narrower on the trailing side (−X).
        radius = `${wide}% ${narrow}% ${narrow}% ${wide}% / 50% 50% 50% 50%`;
      }

      const angleDeg = (lastAngle * 180) / Math.PI;

      el.style.transform = `translate3d(${currentX - HALF}px, ${currentY - HALF}px, 0)`;
      // Rotate into the motion angle, then stretch into an ovoid along that axis
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
        className="block bg-white"
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
