import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { NotFoundPage } from "@/components/NotFoundPage";
import { DEFAULT_LOCALE, localeFromPath, stripLocale, withLocale, type LocaleState } from "@/lib/locale";

export const getRouter = () => {
  const queryClient = new QueryClient();
  // The router is created per SSR request. The input rewrite records the
  // requested locale before route matching; all stored route keys stay neutral.
  const locale: LocaleState = { current: DEFAULT_LOCALE };

  const router = createRouter({
    routeTree,
    context: { queryClient, locale },
    rewrite: {
      input: ({ url }) => {
        const requested = localeFromPath(url.pathname);
        if (requested) {
          locale.current = requested;
          url.pathname = stripLocale(url.pathname);
        }
        return url;
      },
      output: ({ url }) => {
        url.pathname = withLocale(url.pathname, locale.current);
        return url;
      },
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    notFoundMode: "root",
    defaultNotFoundComponent: NotFoundPage,
  });

  return router;
};
