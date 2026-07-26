import { CoverTile } from "@/components/CoverTile";
import { DISCIPLINES } from "@/data/disciplines";

/**
 * Category strip: equal tiles across the section.
 */
export function DisciplinesMarquee() {
  return (
    <div className="w-full bg-[#0F0F0F] px-[20px] pt-3 pb-12 md:pb-16">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {DISCIPLINES.map((discipline) => (
          <CoverTile
            key={discipline.slug}
            to="/$discipline"
            params={{ discipline: discipline.slug }}
            label={discipline.label}
            image={discipline.image}
          />
        ))}
      </div>
    </div>
  );
}
