import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DISCIPLINES, type DisciplineCard } from "@/data/disciplines";
import { cn } from "@/lib/utils";

const FULL_WIDTH = 1000;
/** Letter-spacing as a fraction of the leftover width after glyphs. */
const SPACING_FACTOR = 0.24;

/**
 * Uppercase centered label sized to fill `fillPercent` of the parent width.
 * ViewBox height controls how large the type renders on screen.
 */
function StretchLabel({
  text,
  className,
  height = 40,
  fillPercent = 80,
}: {
  text: string;
  className?: string;
  /** SVG viewBox height — larger = bigger rendered type */
  height?: number;
  /** How much of the parent width the text block should occupy */
  fillPercent?: number;
}) {
  const label = text.toUpperCase();
  const textRef = useRef<SVGTextElement>(null);
  const [textLength, setTextLength] = useState(FULL_WIDTH);
  const [fontSize, setFontSize] = useState(height * 0.72);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    el.removeAttribute("textLength");

    // Grow type as large as the viewBox allows, then ease down only if
    // glyphs alone would overflow the line before letter-spacing.
    let size = height * 0.82;
    el.style.fontSize = `${size}px`;
    let natural = el.getComputedTextLength();

    const maxNatural = FULL_WIDTH * (1 - SPACING_FACTOR * 0.5);
    if (natural > maxNatural && natural > 0) {
      size = size * (maxNatural / natural);
      el.style.fontSize = `${size}px`;
      natural = el.getComputedTextLength();
    }

    const spacing = Math.max(0, FULL_WIDTH - natural);
    setFontSize(size);
    setTextLength(natural + spacing * SPACING_FACTOR);
  }, [label, height]);

  return (
    <svg
      viewBox={`0 0 ${FULL_WIDTH} ${height}`}
      className={cn("mx-auto block overflow-visible", className)}
      style={{ width: `${fillPercent}%` }}
      role="img"
      aria-label={text}
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        ref={textRef}
        x={(FULL_WIDTH - textLength) / 2}
        y={height * 0.78}
        textLength={textLength}
        lengthAdjust="spacing"
        className="fill-current font-display font-bold"
        style={{ fontSize }}
      >
        {label}
      </text>
    </svg>
  );
}

function DisciplineTile({ discipline }: { discipline: DisciplineCard }) {
  return (
    <Link
      to="/$discipline"
      params={{ discipline: discipline.slug }}
      aria-label={`View ${discipline.label}`}
      className="group relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-[3px] no-underline"
    >
      {discipline.image ? (
        <img
          src={discipline.image}
          alt={discipline.label}
          width={800}
          height={1067}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#0F0F0F]">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#EFEFEF]/40">
            Coming soon
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F0F0F]/85 to-transparent px-0 pb-3 pt-12 md:pb-4">
        <StretchLabel
          text={discipline.label}
          height={140}
          fillPercent={90}
          className="text-[#EFEFEF]"
        />
      </div>
    </Link>
  );
}

/**
 * Category strip: equal tiles across the section.
 */
export function DisciplinesMarquee() {
  return (
    <div className="w-full bg-[#0F0F0F] px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
        {DISCIPLINES.map((discipline) => (
          <DisciplineTile key={discipline.slug} discipline={discipline} />
        ))}
      </div>
    </div>
  );
}
