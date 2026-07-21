export interface MosaicItem {
  key: string;
  src: string;
  alt: string;
  title: string;
  year: string;
  discipline: string;
  photo: string;
}

interface MosaicGalleryProps {
  items: MosaicItem[];
  scale?: number;
  onSelect?: (item: MosaicItem) => void;
}

function hash(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// Column widths as a fraction of the container. They sum to ~1 with gutters.
const COLUMN_WEIGHTS = [1.1, 0.9, 1.05, 0.95];
// Offsets pushed to the FIRST item in each column so columns start staggered.
const COLUMN_OFFSETS_PX = [0, 110, 35, 150];

export function MosaicGallery({ items, onSelect }: MosaicGalleryProps) {
  const colCount = COLUMN_WEIGHTS.length;
  const columns: MosaicItem[][] = Array.from({ length: colCount }, () => []);
  items.forEach((item, i) => {
    columns[i % colCount].push(item);
  });

  const totalWeight = COLUMN_WEIGHTS.reduce((a, b) => a + b, 0);

  return (
    <div className="relative mx-auto w-full max-w-[1600px] px-1">
      <div className="flex w-full items-start gap-3">
        {columns.map((colItems, colIdx) => (
          <div
            key={colIdx}
            className="flex flex-col gap-3"
            style={{ flexBasis: `${(COLUMN_WEIGHTS[colIdx] / totalWeight) * 100}%`, flexGrow: 0, flexShrink: 0, paddingTop: `${COLUMN_OFFSETS_PX[colIdx]}px` }}
          >
            {colItems.map((item, idxInCol) => {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect?.(item)}
                  className="group block w-full text-left"
                  aria-label={item.alt}
                >
                  <div className="w-full overflow-hidden bg-card">
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading={colIdx < 2 && idxInCol === 0 ? "eager" : "lazy"}
                      className="block h-auto w-full transition-opacity duration-500 group-hover:opacity-80"
                    />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="truncate font-display text-xs uppercase tracking-widest text-foreground">
                      {item.title}
                    </p>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {item.year}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}