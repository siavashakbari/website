export type Locale = "en" | "fa";

export interface LocaleState {
  current: Locale;
}

export const DEFAULT_LOCALE: Locale = "en";

declare global {
  var __getRequestLocale: (() => Locale | undefined) | undefined;
}

export function currentLocale(): Locale {
  if (typeof window !== "undefined")
    return localeFromPath(window.location.pathname) || DEFAULT_LOCALE;
  return globalThis.__getRequestLocale?.() || DEFAULT_LOCALE;
}

export function isNonPublicPath(pathname: string): boolean {
  return (
    /^\/(?:api|vault|admin)(?:\/|$)/.test(pathname) ||
    /^\/(?:robots\.txt|sitemap\.xml|favicon\.svg|site\.webmanifest)$/.test(pathname) ||
    /\.[a-z0-9]{2,8}$/i.test(pathname)
  );
}

export function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split("/")[1];
  return first === "en" || first === "fa" ? first : null;
}

export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (!locale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

export function withLocale(pathname: string, locale: Locale): string {
  if (isNonPublicPath(pathname)) return pathname;
  const clean = stripLocale(pathname);
  return `/${locale}${clean === "/" ? "" : clean.startsWith("/") ? clean : `/${clean}`}`;
}

export function switchLocaleUrl(href: string, locale: Locale): string {
  const url = new URL(href, "http://localhost");
  url.pathname = withLocale(url.pathname, locale);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function localizedText(
  english: string | undefined,
  persian: string | undefined,
  locale: Locale,
): { text: string; lang: Locale; missing: boolean } {
  const primary = locale === "fa" ? persian : english;
  const fallback = locale === "fa" ? english : persian;
  if (primary?.trim()) {
    // Older records may have Persian in a formerly single-language field.
    // Keep its original bytes and mark it as a missing English translation.
    if (locale === "en" && !persian?.trim() && detectedScript(primary) === "fa") {
      return { text: primary, lang: "fa", missing: true };
    }
    return { text: primary, lang: locale, missing: false };
  }
  const fallbackLang = locale === "fa" ? "en" : "fa";
  return {
    text: fallback || "",
    lang: fallback ? detectedScript(fallback) || fallbackLang : fallbackLang,
    missing: true,
  };
}

function detectedScript(value: string): Locale | null {
  const arabic = value.match(/[\u0600-\u06ff]/g)?.length || 0;
  const latin = value.match(/[a-z]/gi)?.length || 0;
  if (arabic > latin) return "fa";
  if (latin > arabic) return "en";
  return null;
}
