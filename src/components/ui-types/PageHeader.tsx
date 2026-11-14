import { localizedText } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";
import type { KeyValuePair } from "@/components/vault/PairedBoxesEditor";

interface PageHeaderProps {
  title?: string;
  titleFa?: string;
  showTitle?: boolean;
  descriptionEn?: string;
  descriptionFa?: string;
  pairedBoxes?: KeyValuePair[];
  className?: string;
}

export function PageHeader({
  title,
  titleFa,
  showTitle = false,
  descriptionEn,
  descriptionFa,
  pairedBoxes,
  className = "",
}: PageHeaderProps) {
  const locale = useLocale();
  const resolvedTitle = localizedText(title, titleFa, locale);
  const resolvedDescription = localizedText(descriptionEn, descriptionFa, locale);
  const hasDesc = Boolean(descriptionEn?.trim() || descriptionFa?.trim());
  const hasPairs = Array.isArray(pairedBoxes) && pairedBoxes.length > 0;
  const shouldRenderTitle = Boolean(showTitle && resolvedTitle.text.trim());

  if (!hasDesc && !hasPairs && !shouldRenderTitle) {
    return null;
  }

  return (
    <div className={`w-full max-w-5xl mx-auto px-5 sm:px-8 pt-4 pb-6 space-y-5 ${className}`}>
      {/* Optional visible Page Title */}
      {shouldRenderTitle && (
        <h1
          lang={resolvedTitle.lang}
          dir={resolvedTitle.lang === "fa" ? "rtl" : "ltr"}
          className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight"
        >
          {resolvedTitle.text}
        </h1>
      )}

      {/* Show the requested translation, or the existing text with its own direction. */}
      {hasDesc && (
        <div
          className="border-b border-white/10 pb-5 pt-1"
          lang={resolvedDescription.lang}
          dir={resolvedDescription.lang === "fa" ? "rtl" : "ltr"}
        >
          <span className="text-[10px] text-[#2CE3C0]">
            {resolvedDescription.lang === "fa" ? "درباره پروژه" : "About"}
          </span>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
            {resolvedDescription.text}
          </p>
        </div>
      )}

      {/* Additional Paired Boxes (e.g. Model : Sara | Year : 2020) */}
      {hasPairs && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {pairedBoxes?.map((pair, idx) => {
            const label = localizedText(pair.key, pair.keyFa, locale);
            const value = localizedText(pair.value, pair.valueFa, locale);
            if (!label.text && !value.text) return null;
            return (
              <div
                key={pair.id || idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono transition-colors hover:border-[#2CE3C0]/40"
              >
                <span
                  lang={label.lang}
                  dir={label.lang === "fa" ? "rtl" : "ltr"}
                  className="text-neutral-400 font-medium"
                >
                  {label.text}:
                </span>
                <span
                  lang={value.lang}
                  dir={value.lang === "fa" ? "rtl" : "ltr"}
                  className="text-[#2CE3C0] font-semibold"
                >
                  {value.text}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
