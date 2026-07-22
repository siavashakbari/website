import { createFileRoute } from "@tanstack/react-router";
import heroPortrait from "../assets/brand/hero/brand-hero-01.jpg";
import heroPortraitWebp from "../assets/brand/hero/brand-hero-01.webp";
import heroPortraitWebpSm from "../assets/brand/hero/brand-hero-01-sm.webp";
import { useLayoutEffect, useState } from "react";
import { DisciplinesMarquee } from "@/components/DisciplinesMarquee";
import { MorphingText } from "@/components/ui/morphing-text";
import { cn } from "@/lib/utils";

const HERO_ROLES = [
  "Multi-disciplinary Designer",
  "Photographer",
  "Creative Director",
];

/** Matches fixed header spacer in __root.tsx */
const HEADER_H = "3.5rem";

const HERO_SRCSET = `${heroPortraitWebpSm} 960w, ${heroPortraitWebp} 1920w`;
const HERO_SIZES = "100vw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Siavash Akbari" },
      {
        name: "description",
        content: "Siavash Akbari Portfolio",
      },
      { property: "og:title", content: "Siavash Akbari" },
      {
        property: "og:description",
        content: "Siavash Akbari Portfolio",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: heroPortraitWebp,
        type: "image/webp",
        imageSrcSet: HERO_SRCSET,
        imageSizes: HERO_SIZES,
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        children: `if("scrollRestoration"in history)history.scrollRestoration="manual";document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0);`,
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [isWindows, setIsWindows] = useState(false);

  useLayoutEffect(() => {
    setIsWindows(/Win/i.test(navigator.userAgent));
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prevBehavior;
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero fills exactly the viewport below the fixed header */}
      <section
        className="relative w-full overflow-hidden bg-background"
        style={{ height: `calc(100dvh - ${HEADER_H})` }}
      >
        <picture>
          <source
            type="image/webp"
            srcSet={HERO_SRCSET}
            sizes={HERO_SIZES}
          />
          <img
            src={heroPortrait}
            alt="Portrait"
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-6 md:pb-8">
          <MorphingText
            texts={HERO_ROLES}
            morphTime={2.25}
            cooldownTime={0.75}
            className={cn(
              "h-auto min-h-[1.6em] max-w-none font-display text-[12.24pt] font-medium uppercase tracking-[0.2em] text-foreground lg:text-[1.836rem]",
              isWindows && "translate-y-[10px]",
            )}
          />
        </div>
      </section>

      {/* Disciplines — OMS-style category tile strip */}
      <section className="w-full">
        <DisciplinesMarquee />
      </section>
    </div>
  );
}
