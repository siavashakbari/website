import { AsyncLocalStorage } from "node:async_hooks";
import { DEFAULT_LOCALE, localeFromPath, type Locale } from "./locale";

const requestLocales = new AsyncLocalStorage<Locale>();
globalThis.__getRequestLocale = () => requestLocales.getStore();

export function withRequestLocale<T>(pathname: string, callback: () => T): T {
  return requestLocales.run(localeFromPath(pathname) || DEFAULT_LOCALE, callback);
}
