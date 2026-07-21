import { useEffect, useRef } from "react";

const SIZE_PX = 24; // 30px − 20%
const HALF = SIZE_PX / 2;

export function InvertCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only on devices with a fine pointer (mouse).
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = dotRef.current;
    if (!el) return;

    document.documentElement.classList.add("invert-cursor-active");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
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

    const tick = () => {
      // Half the previous lag (was 0.15 → snappier catch-up).
      const ease = 0.3;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      el.style.transform = `translate3d(${currentX - HALF}px, ${currentY - HALF}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
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
        className="block animate-cursor-breathe rounded-full bg-white"
        style={{
          width: SIZE_PX,
          height: SIZE_PX,
        }}
      />
    </div>
  );
}
