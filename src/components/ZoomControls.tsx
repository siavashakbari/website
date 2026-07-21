interface ZoomControlsProps {
  scale: number;
  onChange: (s: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function ZoomControls({
  scale,
  onChange,
  min = 0.6,
  max = 1.4,
  step = 0.1,
}: ZoomControlsProps) {
  const inc = () => onChange(Math.min(max, +(scale + step).toFixed(2)));
  const dec = () => onChange(Math.max(min, +(scale - step).toFixed(2)));
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-40 hidden justify-center gap-3 lg:flex">
      <button
        aria-label="Zoom in"
        onClick={inc}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-foreground/30 bg-background/60 text-foreground backdrop-blur-md transition-colors hover:border-foreground/60"
      >
        <span className="text-base leading-none">+</span>
      </button>
      <button
        aria-label="Zoom out"
        onClick={dec}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-foreground/30 bg-background/60 text-foreground backdrop-blur-md transition-colors hover:border-foreground/60"
      >
        <span className="text-base leading-none">−</span>
      </button>
    </div>
  );
}