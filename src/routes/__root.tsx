import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

import appCss from "../styles.css?url";
import satoshiMedium from "../assets/fonts/Satoshi-Medium.woff2?url";
import { Logo } from "@/components/Logo";
import { NotFoundPage } from "@/components/NotFoundPage";
import { DISCIPLINES } from "@/data/disciplines";
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
  getSiteUrl,
  jsonLdScript,
  siteJsonLd,
} from "@/lib/seo";

const InvertCursor = lazy(() =>
  import("@/components/InvertCursor").then((m) => ({ default: m.InvertCursor })),
);
const HoverFooter = lazy(() =>
  import("@/components/HoverFooter").then((m) => ({ default: m.HoverFooter })),
);

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const siteUrl = getSiteUrl();
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
        { property: "og:url", content: siteUrl },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:locale", content: "en_US" },
        { property: "og:locale:alternate", content: "fa_IR" },
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
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,900&display=swap",
        },
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
  return (
    <html lang="en" className="dark">
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
  "flex h-full items-center text-sm font-normal uppercase leading-none tracking-widest text-foreground transition-colors hover:text-secondary data-[status=active]:font-bold data-[status=active]:text-secondary";

const navFont = { fontFamily: "Satoshi, system-ui, sans-serif" } as const;

function isDisciplinePath(pathname: string) {
  return DISCIPLINES.some((d) => pathname === `/${d.slug}`);
}

function WorksDropdown({ active }: { active: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={navFont}
        className={`${navLinkClass} gap-1.5 outline-none data-[state=open]:text-secondary ${
          active ? "font-bold text-secondary" : ""
        }`}
      >
        Works
        <ChevronDown
          className="h-3 w-3 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={0}
        className="z-[210] min-w-[14rem] rounded-none border-foreground/10 bg-background p-1 shadow-none"
      >
        {DISCIPLINES.map((discipline) => (
          <DropdownMenuItem key={discipline.slug} asChild className="rounded-none p-0 focus:bg-foreground/5">
            <Link
              to="/$discipline"
              params={{ discipline: discipline.slug }}
              style={navFont}
              className="block cursor-pointer px-3 py-2.5 text-xs font-normal uppercase tracking-widest text-foreground transition-colors hover:text-secondary data-[status=active]:font-bold data-[status=active]:text-secondary"
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
  const pathname = router.state.location.pathname;
  const worksActive = isDisciplinePath(pathname);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[200] border-b border-foreground/10 bg-background">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-6 md:px-9">
          <Link
            to="/"
            className="flex items-center text-foreground"
            aria-label="Siavash Akbari — Home"
          >
            <Logo className="block h-[1.05rem] w-auto" />
          </Link>
          <nav className="hidden h-full items-center gap-12 md:flex">
            <Link to="/" style={navFont} className={navLinkClass}>
              Home
            </Link>
            <WorksDropdown active={worksActive} />
            <Link to="/about" style={navFont} className={navLinkClass}>
              About
            </Link>
            <Link to="/contact" style={navFont} className={navLinkClass}>
              Contact
            </Link>
          </nav>
          <MobileNav />
        </div>
      </header>
      {/* Spacer matches fixed header height so content isn't hidden underneath */}
      <div className="h-14 shrink-0" aria-hidden />
    </>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const [worksOpen, setWorksOpen] = useState(false);
  const router = useRouter();
  const worksActive = isDisciplinePath(router.state.location.pathname);

  return (
    <div className="md:hidden">
      <button
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center text-foreground transition-colors hover:opacity-70"
      >
        <MenuIcon className="h-[0.9rem] w-[0.9rem]" />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-3/4 max-w-sm border-l border-background/20 bg-background/85 p-6 shadow-xl backdrop-blur-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between py-2">
            <span className="text-foreground">
              <Logo className="h-[1.05rem] w-auto" />
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center p-2 text-foreground transition-colors hover:opacity-70"
            >
              <CloseIcon className="h-[0.9rem] w-[0.9rem]" />
            </button>
          </div>
          <nav className="flex flex-col gap-6 pt-10">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              Home
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
                Works
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
                    {DISCIPLINES.map((discipline) => (
                      <Link
                        key={discipline.slug}
                        to="/$discipline"
                        params={{ discipline: discipline.slug }}
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
              to="/about"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

/** Custom cursor only — keep it out of the first paint path. */
function DeferredCursor() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;
    const enable = () => setReady(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(enable, 250);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <InvertCursor />
    </Suspense>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isProjectPage = pathname.startsWith("/projects/");
  const isSideScrollDiscipline =
    pathname === "/book-covers" || pathname === "/posters";
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Lock page scroll only for desktop side-scroll project pages.
  const lockProjectScroll = isProjectPage && isDesktop;
  const hideFooter =
    isProjectPage ||
    pathname === "/about" ||
    pathname === "/contact" ||
    (isSideScrollDiscipline && isDesktop);

  useEffect(() => {
    if (!lockProjectScroll) return;
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [lockProjectScroll]);

  return (
    <QueryClientProvider client={queryClient}>
      <DeferredCursor />
      <div
        className={`flex flex-col bg-background ${
          lockProjectScroll ? "h-dvh overflow-hidden overscroll-none" : "min-h-screen"
        }`}
      >
        <Header />
        <main
          className={`flex-1 ${
            lockProjectScroll ? "flex min-h-0 flex-col overflow-hidden" : ""
          }`}
        >
          <Outlet />
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
