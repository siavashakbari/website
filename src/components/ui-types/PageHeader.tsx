interface PageHeaderProps {
  title?: string;
  showTitle?: boolean;
  descriptionEn?: string;
  descriptionFa?: string;
  pairedBoxes?: Array<{ key: string; value: string }>;
  className?: string;
}

export function PageHeader({
  title,
  showTitle = false,
  descriptionEn,
  descriptionFa,
  pairedBoxes,
  className = "",
}: PageHeaderProps) {
  const hasDesc = Boolean(descriptionEn?.trim() || descriptionFa?.trim());
  const hasPairs = Array.isArray(pairedBoxes) && pairedBoxes.length > 0;
  const shouldRenderTitle = Boolean(showTitle && title?.trim());

  if (!hasDesc && !hasPairs && !shouldRenderTitle) {
    return null;
  }

  return (
    <div className={`w-full max-w-5xl mx-auto px-5 sm:px-8 pt-4 pb-6 space-y-5 ${className}`}>
      {/* Optional visible Page Title */}
      {shouldRenderTitle && (
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-foreground tracking-tight">
          {title}
        </h1>
      )}

      {/* Descriptions Section: English & Farsi */}
      {hasDesc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 border-b border-white/10 pb-5">
          {/* English Description */}
          {descriptionEn?.trim() && (
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#2CE3C0]">
                About
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
                {descriptionEn}
              </p>
            </div>
          )}

          {/* Farsi Description (RTL) */}
          {descriptionFa?.trim() && (
            <div className="space-y-1.5 text-right" dir="rtl">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#2CE3C0]">
                درباره پروژه
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
                {descriptionFa}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Additional Paired Boxes (e.g. Model : Sara | Year : 2020) */}
      {hasPairs && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {pairedBoxes?.map((pair, idx) => {
            if (!pair.key && !pair.value) return null;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono transition-colors hover:border-[#2CE3C0]/40"
              >
                <span className="text-neutral-400 font-medium">{pair.key}:</span>
                <span className="text-[#2CE3C0] font-semibold">{pair.value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
