import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { switchLocaleUrl } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";
import { nearestEdge } from "@/lib/pointer-edge";

export function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const switchRef = useRef<HTMLAnchorElement>(null);
  const targetLocale = locale === "en" ? "fa" : "en";
  const selectedLocale = switching ? targetLocale : locale;
  const targetUrl = switchLocaleUrl(router.state.location.href, targetLocale);

  useEffect(() => {
    const element = switchRef.current;
    if (!element) return;
    const hoverEnabled = window.matchMedia(
      "(min-width: 701px) and (hover: hover) and (pointer: fine)",
    );
    const move = (event: PointerEvent) => {
      if (!hoverEnabled.matches) return;
      const nearest = nearestEdge(element.getBoundingClientRect(), event.clientX, event.clientY);
      element.style.setProperty("--switch-edge-x", `${nearest.x}px`);
      element.style.setProperty("--switch-edge-y", `${nearest.y}px`);
      element.style.setProperty(
        "--switch-edge-opacity",
        String(Math.max(0, 1 - nearest.distance / 50)),
      );
    };
    const clear = () => element.style.setProperty("--switch-edge-opacity", "0");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", clear);
    document.documentElement.addEventListener("pointerleave", clear);
    hoverEnabled.addEventListener("change", clear);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", clear);
      document.documentElement.removeEventListener("pointerleave", clear);
      hoverEnabled.removeEventListener("change", clear);
    };
  }, []);

  return (
    <a
      ref={switchRef}
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
        window.setTimeout(() => window.location.assign(targetUrl), 550);
      }}
      className="language-switch relative flex h-[32px] w-[120px] shrink-0 flex-row-reverse items-center rounded-full border border-foreground/20 bg-white/[0.06] p-[3px] text-center no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-[3px] w-[calc((100%-6px)*0.68)] rounded-full bg-[#2CE3C0] motion-safe:transition-[left] motion-safe:duration-[280ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${selectedLocale === "en" ? "left-[calc(3px+(100%-6px)*0.32)]" : "left-[3px]"}`}
      />
      <span
        lang="en"
        className={`relative min-w-0 whitespace-nowrap py-[5px] text-[12px] leading-none motion-safe:transition-[width,color] motion-safe:duration-[280ms] sm:text-[14px] ${selectedLocale === "en" ? "w-[68%] font-semibold text-black" : "w-[32%] font-normal text-foreground/70"}`}
      >
        <span key={selectedLocale} className={switching ? "language-typewriter" : undefined}>
          {selectedLocale === "en" ? "English" : "EN"}
        </span>
      </span>
      <span
        lang="en"
        className={`relative min-w-0 whitespace-nowrap py-[5px] text-[12px] leading-none motion-safe:transition-[width,color] motion-safe:duration-[280ms] sm:text-[14px] ${selectedLocale === "fa" ? "w-[68%] font-semibold text-black" : "w-[32%] font-normal text-foreground/70"}`}
      >
        <span key={selectedLocale} className={switching ? "language-typewriter" : undefined}>
          {selectedLocale === "fa" ? "Farsi" : "FA"}
        </span>
      </span>
    </a>
  );
}
