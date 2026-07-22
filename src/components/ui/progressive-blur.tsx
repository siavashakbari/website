import { cn } from "@/lib/utils";

export interface ProgressiveBlurProps {
  className?: string;
  /** Used for top/bottom; horizontal uses `width` */
  height?: string;
  width?: string;
  position?: "top" | "bottom" | "both" | "left" | "right";
  blurLevels?: number[];
}

/**
 * Build stacked band masks.
 * For vertical: outer edge is bottom (or top).
 * For horizontal: outer edge is left (or right).
 * Gradient direction always goes from the INNER side (0%) toward the OUTER edge (100%).
 */
function bandMask(
  position: ProgressiveBlurProps["position"],
  start: number,
  mid: number,
  end: number,
  endPlus: number,
) {
  const stops = `rgba(0,0,0,0) ${start}%, rgba(0,0,0,1) ${mid}%, rgba(0,0,0,1) ${end}%, rgba(0,0,0,0) ${endPlus}%`;
  switch (position) {
    case "left":
      // 0% = inner (right of left strip), 100% = outer (left edge)
      return `linear-gradient(to left, ${stops})`;
    case "right":
      // 0% = inner (left of right strip), 100% = outer (right edge)
      return `linear-gradient(to right, ${stops})`;
    case "top":
      return `linear-gradient(to top, ${stops})`;
    case "bottom":
    default:
      return `linear-gradient(to bottom, ${stops})`;
  }
}

function edgeMask(position: ProgressiveBlurProps["position"]) {
  // Strongest blur at the outer edge
  switch (position) {
    case "left":
      return `linear-gradient(to left, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)`;
    case "right":
      return `linear-gradient(to right, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)`;
    case "top":
      return `linear-gradient(to top, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)`;
    case "bottom":
    default:
      return `linear-gradient(to bottom, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)`;
  }
}

function firstMask(position: ProgressiveBlurProps["position"]) {
  switch (position) {
    case "left":
      return `linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)`;
    case "right":
      return `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)`;
    case "top":
      return `linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)`;
    case "bottom":
    default:
      return `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)`;
  }
}

export function ProgressiveBlur({
  className,
  height = "30%",
  width = "30%",
  position = "bottom",
  blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
}: ProgressiveBlurProps) {
  const divElements = Array(Math.max(blurLevels.length - 2, 0)).fill(null);
  const horizontal = position === "left" || position === "right";

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-10",
        horizontal ? "inset-y-0" : "inset-x-0",
        position === "top" && "top-0",
        position === "bottom" && "bottom-0",
        position === "left" && "left-0",
        position === "right" && "right-0",
        className,
      )}
      style={horizontal ? { width } : { height }}
    >
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          backdropFilter: `blur(${blurLevels[0]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[0]}px)`,
          maskImage: firstMask(position),
          WebkitMaskImage: firstMask(position),
        }}
      />

      {divElements.map((_, index) => {
        const blurIndex = index + 1;
        const startPercent = blurIndex * 12.5;
        const midPercent = (blurIndex + 1) * 12.5;
        const endPercent = (blurIndex + 2) * 12.5;
        const mask = bandMask(
          position,
          startPercent,
          midPercent,
          endPercent,
          endPercent + 12.5,
        );

        return (
          <div
            key={`blur-${index}`}
            className="absolute inset-0"
            style={{
              zIndex: index + 2,
              backdropFilter: `blur(${blurLevels[blurIndex]}px)`,
              WebkitBackdropFilter: `blur(${blurLevels[blurIndex]}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}

      <div
        className="absolute inset-0"
        style={{
          zIndex: blurLevels.length,
          backdropFilter: `blur(${blurLevels[blurLevels.length - 1]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[blurLevels.length - 1]}px)`,
          maskImage: edgeMask(position),
          WebkitMaskImage: edgeMask(position),
        }}
      />
    </div>
  );
}
