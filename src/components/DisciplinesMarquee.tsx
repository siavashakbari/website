import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { DISCIPLINES, type DisciplineCard } from "@/data/disciplines";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

function DisciplineCardItem({ discipline }: { discipline: DisciplineCard }) {
  return (
    <Link
      to="/disciplines/$discipline"
      params={{ discipline: discipline.slug }}
      className="group relative shrink-0"
      aria-label={`View ${discipline.label}`}
    >
      <div className="relative aspect-[3/4] h-[min(52dvh,380px)] w-auto overflow-hidden rounded-[2rem] bg-zinc-50 shadow-sm sm:h-[min(56dvh,460px)] sm:rounded-[2.5rem] md:h-[min(60dvh,560px)] md:rounded-[3rem] dark:bg-zinc-950 dark:shadow-none">
        {discipline.image ? (
          <img
            src={discipline.image}
            alt={discipline.label}
            className="pointer-events-none h-full w-full object-cover object-center"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-card p-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Coming soon
            </span>
          </div>
        )}
        <GlowingEffect
          spread={40}
          glow
          disabled={false}
          proximity={64}
          centerZone={0.55}
          borderWidth={2}
          className="z-10"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 md:p-6">
          <span className="inline-flex items-center justify-center rounded-full border border-white/40 bg-black/45 px-4 py-2 font-display text-xs font-medium tracking-wide text-white backdrop-blur-md sm:text-sm md:px-6 md:py-2.5 md:text-base">
            {discipline.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function DisciplinesMarquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    if (!root || !scroller) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.55;
      },
      { threshold: [0, 0.55, 0.8, 1] },
    );
    io.observe(root);

    let raf = 0;

    const onWheel = (event: WheelEvent) => {
      if (!activeRef.current) return;

      // Only remap dominant vertical wheel → horizontal (skip trackpad sideways)
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 1) return;

      const { deltaY } = event;
      const atStart = scroller.scrollLeft <= 0.5;
      const atEnd = scroller.scrollLeft >= maxScroll - 0.5;

      // Let the page keep scrolling when the strip can't move further
      if ((deltaY < 0 && atStart) || (deltaY > 0 && atEnd)) return;

      event.preventDefault();

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = Math.min(maxScroll, Math.max(0, scroller.scrollLeft + deltaY));
        scroller.scrollLeft = next;
      });
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      root.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        ref={scrollerRef}
        className="flex w-full items-stretch gap-4 overflow-x-auto overflow-y-hidden px-6 py-2 sm:gap-5 sm:px-10 md:gap-8 md:px-16"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {DISCIPLINES.map((discipline) => (
          <DisciplineCardItem key={discipline.slug} discipline={discipline} />
        ))}
      </div>

      <ProgressiveBlur position="left" width="72px" className="z-30" />
      <ProgressiveBlur position="right" width="72px" className="z-30" />
    </div>
  );
}
