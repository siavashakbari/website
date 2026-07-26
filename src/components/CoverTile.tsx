import { Link } from "@tanstack/react-router";

type CoverTileProps = {
  label: string;
  image?: string;
  ariaLabel?: string;
} & (
  | { to: "/$discipline"; params: { discipline: string } }
  | { to: "/projects/$projectId"; params: { projectId: string } }
);

/**
 * Shared cover card used by homepage disciplines and Visual Identity project cards.
 */
export function CoverTile({ to, params, label, image, ariaLabel }: CoverTileProps) {
  return (
    <Link
      to={to}
      params={params}
      aria-label={ariaLabel ?? `View ${label}`}
      className="group relative isolate block aspect-[3/4] cursor-pointer overflow-hidden rounded-[3px] no-underline [clip-path:inset(0_round_3px)]"
    >
      {image ? (
        <img
          src={image}
          alt={label}
          width={480}
          height={640}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full rounded-[3px] object-cover object-center transition-[filter] duration-500 ease-out group-hover:brightness-[0.45]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-[3px] bg-[#0F0F0F] transition-[filter] duration-500 ease-out group-hover:brightness-[0.45]">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#EFEFEF]/40">
            Coming soon
          </span>
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0F0F0F]/0 transition-colors duration-500 ease-out group-hover:bg-[#0F0F0F]/35"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0F0F0F]/85 via-[#0F0F0F]/45 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0"
      />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-2 pb-[calc(0.75rem+35px)] transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:translate-y-[calc(-50%+2.75rem)] md:pb-[calc(1rem+35px)]">
        <span className="relative inline-grid origin-center place-items-center transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.44]">
          <span className="font-inter col-start-1 row-start-1 text-center text-[13.2px] font-normal uppercase tracking-[0.16em] text-[#EFEFEF] transition-opacity duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0 md:text-[14.52px]">
            {label}
          </span>
          <span
            aria-hidden
            className="font-inter col-start-1 row-start-1 text-center text-[13.2px] font-black uppercase tracking-[0.16em] text-[#EFEFEF] opacity-0 transition-opacity duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 md:text-[14.52px]"
          >
            {label}
          </span>
        </span>
      </div>
    </Link>
  );
}
