import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { switchLocaleUrl } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";

export function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const targetLocale = locale === "en" ? "fa" : "en";
  const selectedLocale = switching ? targetLocale : locale;
  const targetUrl = switchLocaleUrl(router.state.location.href, targetLocale);

  return (
    <a
      dir="ltr"
      href={targetUrl}
      hrefLang={targetLocale}
      aria-label={targetLocale === "fa" ? "Switch to Persian" : "تغییر زبان به انگلیسی"}
      onClick={(event) => {
        if (switching) {
          event.preventDefault();
          return;
        }
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        event.preventDefault();
        setSwitching(true);
        window.setTimeout(() => window.location.assign(targetUrl), 280);
      }}
      className="relative inline-grid grid-cols-2 items-center rounded-full border border-foreground/20 bg-white/[0.06] p-1 text-center no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/2)] rounded-full bg-[#2CE3C0] motion-safe:transition-transform motion-safe:duration-[280ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${selectedLocale === "fa" ? "translate-x-full" : "translate-x-0"}`}
      />
      <span
        lang="en"
        className={`relative min-w-[40px] px-1.5 py-1.5 text-sm font-semibold leading-none motion-safe:transition-colors motion-safe:duration-[280ms] sm:min-w-[3.25rem] sm:px-2 sm:text-lg ${selectedLocale === "en" ? "text-black" : "text-foreground/70"}`}
      >
        EN
      </span>
      <span
        lang="fa"
        dir="rtl"
        className={`relative min-w-[40px] px-1.5 py-1.5 text-sm font-semibold leading-none motion-safe:transition-colors motion-safe:duration-[280ms] sm:min-w-[3.25rem] sm:px-2 sm:text-lg ${selectedLocale === "fa" ? "text-black" : "text-foreground/70"}`}
      >
        فا
      </span>
    </a>
  );
}
