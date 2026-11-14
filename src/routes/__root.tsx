import {
  CONTENT_STATUS_EVENT,
  getPublishedHydrationSnapshot,
  isContentReady,
  refreshPublishedContent,
  seedPublishedContent,
  startPublishedContentSync,
} from "@/lib/published-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/use-locale";
import { currentLocale, localizedText, withLocale, type Locale } from "@/lib/locale";

import appCss from "../styles.css?url";
import satoshiMedium from "../assets/fonts/Satoshi-Medium.woff2?url";
import satoshiRegular from "../assets/fonts/Satoshi-Regular.woff2?url";
import satoshiBold from "../assets/fonts/Satoshi-Bold.woff2?url";
import { Logo } from "@/components/Logo";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { NotFoundPage } from "@/components/NotFoundPage";
import { PublishedPageLoading } from "@/components/PublishedPageLoading";
import { DISCIPLINES } from "@/data/disciplines";
import { getVaultPages, isRouteOrAncestorHidden, subscribeToVaultStore } from "@/lib/vault-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  TWITTER_HANDLE,
  absoluteUrl,
  jsonLdScript,
  siteJsonLd,
} from "@/lib/seo";

const HoverFooter = lazy(() =>
  import("@/components/HoverFooter").then((m) => ({ default: m.HoverFooter })),
);

function ErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {locale === "fa" ? "صفحه بارگذاری نشد" : "This page didn't load"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "fa"
            ? "خطایی رخ داد. صفحه را دوباره بارگذاری کنید یا به خانه برگردید."
            : "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {locale === "fa" ? "تلاش دوباره" : "Try again"}
          </button>
          <a
            href={withLocale("/", locale)}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {locale === "fa" ? "بازگشت به خانه" : "Go home"}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  locale: import("@/lib/locale").LocaleState;
}>()({
  beforeLoad: async () => {
    if (typeof window !== "undefined") await refreshPublishedContent();
  },
  loader: () => getPublishedHydrationSnapshot(),
  head: () => {
    const locale = currentLocale();
    const ogImage = absoluteUrl("/og.jpg");
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: SITE_TITLE_DEFAULT },
        { name: "description", content: SITE_DESCRIPTION },
        { name: "author", content: SITE_NAME },
        {
          name: "robots",
          content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        },
        { name: "theme-color", content: "#0F0F0F" },
        { name: "googlebot", content: "index, follow" },
        { property: "og:title", content: SITE_TITLE_DEFAULT },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: absoluteUrl(withLocale("/", locale)) },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:locale", content: locale === "fa" ? "fa_IR" : "en_US" },
        { property: "og:locale:alternate", content: locale === "fa" ? "en_US" : "fa_IR" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: SITE_TITLE_DEFAULT },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: TWITTER_HANDLE },
        { name: "twitter:creator", content: TWITTER_HANDLE },
        { name: "twitter:title", content: SITE_TITLE_DEFAULT },
        { name: "twitter:description", content: SITE_DESCRIPTION },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        {
          rel: "preload",
          href: satoshiRegular,
          as: "font",
          type: "font/woff2",
          crossOrigin: "anonymous",
        },
        {
          rel: "preload",
          href: satoshiBold,
          as: "font",
          type: "font/woff2",
          crossOrigin: "anonymous",
        },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
        { rel: "manifest", href: "/site.webmanifest" },
        {
          rel: "preload",
          href: satoshiMedium,
          as: "font",
          type: "font/woff2",
          crossOrigin: "anonymous",
        },
      ],
      scripts: [jsonLdScript(siteJsonLd())],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const locale = useLocale();
  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"} className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const navLinkClass =
  "flex h-full items-center text-[21px] font-normal uppercase leading-none tracking-widest text-foreground transition-colors hover:text-secondary data-[status=active]:font-bold data-[status=active]:text-secondary";

const navFont = { fontFamily: "Satoshi, system-ui, sans-serif" } as const;

function isDisciplinePath(pathname: string) {
  return (
    pathname === "/photography" ||
    pathname.startsWith("/photography/") ||
    pathname === "/graphic-design" ||
    pathname.startsWith("/graphic-design/") ||
    pathname === "/video" ||
    pathname.startsWith("/video/") ||
    pathname === "/product-design" ||
    pathname.startsWith("/product-design/") ||
    DISCIPLINES.some((d) => pathname === d.path || pathname === `/${d.slug}`)
  );
}

function computeVisibleNavItems(locale: Locale) {
  const pages = getVaultPages();
  const byRoute = new Map(pages.map((p) => [p.route.toLowerCase(), p]));
  const items = DISCIPLINES.filter((d) => !isRouteOrAncestorHidden(d.path, pages)).map((d) => {
    const vp = byRoute.get(d.path.toLowerCase());
    return {
      key: d.path || d.slug,
      path: d.path,
      label: vp
        ? localizedText(vp.name, vp.nameFa, locale).text
        : localizedText(d.label, d.labelFa, locale).text,
    };
  });
  const seen = new Set(items.map((i) => i.path.toLowerCase()));
  pages
    .filter(
      (p) =>
        !p.parentRoute &&
        !p.isHidden &&
        !seen.has(p.route.toLowerCase()) &&
        p.route !== "/graphic-design" &&
        p.route !== "/photography",
    )
    .forEach((p) => {
      items.push({
        key: p.route,
        path: p.route,
        label: localizedText(p.name, p.nameFa, locale).text,
      });
    });
  return items;
}

function useVisibleNavDisciplines() {
  const locale = useLocale();
  const [items, setItems] = useState(() => computeVisibleNavItems(locale));

  useEffect(() => {
    setItems(computeVisibleNavItems(locale));
    return subscribeToVaultStore(() => setItems(computeVisibleNavItems(locale)));
  }, [locale]);

  return items;
}

function WorksDropdown({ active }: { active: boolean }) {
  const locale = useLocale();
  const navItems = useVisibleNavDisciplines();
  return (
    <DropdownMenu dir={locale === "fa" ? "rtl" : "ltr"}>
      <DropdownMenuTrigger
        style={navFont}
        className={`${navLinkClass} gap-[6px] outline-none data-[state=open]:text-secondary ${
          active ? "font-bold text-secondary" : ""
        }`}
      >
        {locale === "fa" ? "آثار" : "Works"}
        <ChevronDown
          className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={0}
        className="z-[210] min-w-[16rem] rounded-none border-foreground/10 bg-background p-2 shadow-xl"
      >
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          {locale === "fa" ? "تخصص‌ها" : "Specialties"}
        </div>
        {navItems.map((discipline) => (
          <DropdownMenuItem
            key={discipline.key}
            asChild
            className="rounded-none p-0 focus:bg-foreground/5"
          >
            <Link
              to={discipline.path as any}
              style={navFont}
              className="block cursor-pointer px-3 py-2 text-xs font-normal uppercase tracking-widest text-foreground transition-colors hover:text-secondary data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              {discipline.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = router.state.location.pathname;
  const worksActive = isDisciplinePath(pathname);

  return (
    <>
      <header
        dir="ltr"
        className="fixed inset-x-0 top-0 z-[200] border-b border-foreground/10 bg-background"
      >
        <div className="mx-auto flex h-[84px] w-full items-center justify-between px-[16px] sm:px-[24px] md:px-[36px]">
          <div className="flex items-center gap-[8px] sm:gap-[24px]">
            <Link
              to="/"
              className="flex items-center text-foreground"
              aria-label={locale === "fa" ? "سیاوش اکبری — خانه" : "Siavash Akbari — Home"}
            >
              <Logo className="block h-auto w-[clamp(104px,35vw,248px)] sm:h-[25.2px] sm:w-auto" />
            </Link>
            <LanguageSwitch />
          </div>
          <nav className="hidden h-full flex-row-reverse items-center gap-[48px] xl:flex">
            <Link to="/" style={navFont} className={navLinkClass}>
              {locale === "fa" ? "خانه" : "Home"}
            </Link>
            <WorksDropdown active={worksActive} />
            <Link to="/brand-discovery" style={navFont} className={navLinkClass}>
              {locale === "fa" ? "فرم هویت بصری" : "Visual Identity Form"}
            </Link>
            <Link to="/blog" style={navFont} className={navLinkClass}>
              {locale === "fa" ? "وبلاگ" : "Blog"}
            </Link>
            <Link to="/about" style={navFont} className={navLinkClass}>
              {locale === "fa" ? "درباره" : "About"}
            </Link>
            <Link to="/contact" style={navFont} className={navLinkClass}>
              {locale === "fa" ? "تماس" : "Contact"}
            </Link>
          </nav>
          <MobileNav />
        </div>
      </header>
      {/* Spacer matches fixed header height so content isn't hidden underneath */}
      <div className="h-[84px] shrink-0" aria-hidden />
    </>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MobileNav() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [worksOpen, setWorksOpen] = useState(false);
  const navItems = useVisibleNavDisciplines();
  const router = useRouter();
  const worksActive = isDisciplinePath(router.state.location.pathname);

  return (
    <div className="xl:hidden">
      <button
        aria-label={locale === "fa" ? "باز کردن فهرست" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-foreground transition-colors hover:opacity-70"
      >
        <MenuIcon className="h-[21.6px] w-[21.6px]" />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`absolute top-0 h-full w-3/4 max-w-sm border-background/20 bg-background/85 p-6 shadow-xl backdrop-blur-2xl transition-transform duration-300 ${locale === "fa" ? "left-0 border-r" : "right-0 border-l"} ${
            open ? "translate-x-0" : locale === "fa" ? "-translate-x-full" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between py-2">
            <span className="text-foreground">
              <Logo className="h-auto w-[clamp(104px,35vw,248px)] sm:h-[25.2px] sm:w-auto" />
            </span>
            <button
              aria-label={locale === "fa" ? "بستن فهرست" : "Close menu"}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center p-2 text-foreground transition-colors hover:opacity-70"
            >
              <CloseIcon className="h-[21.6px] w-[21.6px]" />
            </button>
          </div>
          <nav className="flex flex-col gap-6 pt-10">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              {locale === "fa" ? "خانه" : "Home"}
            </Link>

            <div>
              <button
                type="button"
                aria-expanded={worksOpen}
                onClick={() => setWorksOpen((v) => !v)}
                className={`flex w-full items-center justify-between font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 ${
                  worksActive ? "font-bold text-secondary" : ""
                }`}
              >
                {locale === "fa" ? "آثار" : "Works"}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                    worksOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  worksOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-3 pt-4 pl-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
                      {locale === "fa" ? "تخصص‌ها" : "Specialties"}
                    </span>
                    {navItems.map((discipline) => (
                      <Link
                        key={discipline.key}
                        to={discipline.path as any}
                        onClick={() => setOpen(false)}
                        className="text-base font-normal uppercase tracking-widest text-foreground/80 transition-colors hover:text-secondary data-[status=active]:font-bold data-[status=active]:text-secondary"
                        style={navFont}
                      >
                        {discipline.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/brand-discovery"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              {locale === "fa" ? "فرم هویت بصری" : "Visual Identity Form"}
            </Link>

            <Link
              to="/blog"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              {locale === "fa" ? "وبلاگ" : "Blog"}
            </Link>

            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              {locale === "fa" ? "درباره" : "About"}
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              {locale === "fa" ? "تماس" : "Contact"}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  seedPublishedContent(Route.useLoaderData());
  useEffect(startPublishedContentSync, []);
  const [publishedReady, setPublishedReady] = useState(isContentReady);
  useEffect(() => {
    const update = () => setPublishedReady(isContentReady());
    window.addEventListener(CONTENT_STATUS_EVENT, update);
    update();
    return () => window.removeEventListener(CONTENT_STATUS_EVENT, update);
  }, []);
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const pathParts = pathname.split("/").filter(Boolean);
  const lastSeg = pathParts[pathParts.length - 1] || "";
  const isMediaCodeSegment =
    /^(\d{4}(?:-[A-Z0-9-]+)?|[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}|SA-[A-Z0-9-]+|(?:custom-)?media-\d{4})$/i.test(
      lastSeg,
    );
  const isPhotoPage =
    pathParts.length >= 4 ||
    (pathParts.length === 3 && isMediaCodeSegment) ||
    (pathParts.length === 2 && isMediaCodeSegment);
  const isProjectPage =
    !isPhotoPage &&
    (pathParts.length === 3 || (pathParts.length === 2 && pathParts[0] === "product-design"));
  const isSideScrollDiscipline =
    !isPhotoPage &&
    (pathname === "/graphic-design/book-covers" ||
      pathname === "/graphic-design/posters" ||
      (pathname.startsWith("/product-design/") && pathParts.length === 2));
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const isVaultPage = pathname.startsWith("/vault") || pathname.startsWith("/admin");
  const lockProjectScroll =
    (isProjectPage || isPhotoPage || isSideScrollDiscipline) && isDesktop && !isVaultPage;
  const hideFooter =
    isVaultPage ||
    (isProjectPage && isDesktop) ||
    isPhotoPage ||
    pathname === "/about" ||
    (isSideScrollDiscipline && isDesktop);

  useEffect(() => {
    const html = document.documentElement;
    if (lockProjectScroll) {
      html.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      html.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      html.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [lockProjectScroll, pathname]);

  useEffect(() => {
    if (pathname.startsWith("/vault") || pathname.startsWith("/admin")) return;

    const isEditable = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
    };

    const block = (e: Event) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (key === "c" || key === "x" || key === "a" || key === "s" || key === "p") {
        e.preventDefault();
      }
    };

    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof HTMLAnchorElement) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={`flex flex-col bg-background ${
          lockProjectScroll ? "h-dvh overflow-hidden overscroll-none" : "min-h-screen"
        }`}
      >
        {!isVaultPage && <Header />}
        <main
          className={`flex-1 ${lockProjectScroll ? "flex min-h-0 flex-col overflow-hidden" : ""}`}
        >
          {isVaultPage || publishedReady ? <Outlet /> : <PublishedPageLoading />}
        </main>
        {!hideFooter && (
          <Suspense fallback={null}>
            <HoverFooter />
          </Suspense>
        )}
      </div>
    </QueryClientProvider>
  );
}
