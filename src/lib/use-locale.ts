import { useRouter } from "@tanstack/react-router";
import type { Locale, LocaleState } from "./locale";

/** Reads the request-scoped URL locale, including during the first SSR render. */
export function useLocale(): Locale {
  const router = useRouter();
  return (router.options.context as { locale: LocaleState }).locale.current;
}
