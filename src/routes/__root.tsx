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

import appCss from "../styles.css?url";
import satoshiMedium from "../assets/fonts/Satoshi-Medium.woff2?url";
import { Logo } from "@/components/Logo";
import { NotFoundPage } from "@/components/NotFoundPage";

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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Siavash Akbari" },
      {
        name: "description",
        content:
          "Siavash Akbari Portfolio",
      },
      { name: "author", content: "Siavash Akbari" },
      { property: "og:title", content: "Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Siavash Akbari Portfolio",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@siavashakbari" },
      { name: "twitter:title", content: "Siavash Akbari" },
      { name: "twitter:description", content: "Siavash Akbari Portfolio" },
      { property: "og:image", content: "/og.jpg" },
      { name: "twitter:image", content: "/og.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      {
        rel: "preload",
        href: satoshiMedium,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
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

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Header() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[200] border-b border-foreground/10 bg-background">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-6">
          <Link to="/" className="flex items-center text-foreground">
            <Logo className="block h-[1.05rem] w-auto" />
          </Link>
          <nav className="hidden h-full items-center gap-12 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{ fontFamily: "Satoshi, system-ui, sans-serif" }}
                className="flex h-full items-center text-sm font-normal uppercase leading-none tracking-widest text-foreground transition-colors hover:text-secondary data-[status=active]:font-bold data-[status=active]:text-secondary"
              >
                {link.label}
              </Link>
            ))}
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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="font-display text-2xl font-normal text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

/** Cursor + footer are deferred so they don't inflate homepage TBT. */
function DeferredChrome({ showFooter }: { showFooter: boolean }) {
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
      {showFooter ? <HoverFooter /> : null}
    </Suspense>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isProjectPage = pathname.startsWith("/projects/");
  const hideFooter = isProjectPage || pathname === "/about" || pathname === "/contact";

  useEffect(() => {
    if (!isProjectPage) return;
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isProjectPage]);

  return (
    <QueryClientProvider client={queryClient}>
      <DeferredChrome showFooter={!hideFooter} />
      <div
        className={`flex flex-col bg-background ${
          isProjectPage ? "h-dvh overflow-hidden overscroll-none" : "min-h-screen"
        }`}
      >
        <Header />
        <main
          className={`flex-1 ${
            isProjectPage ? "flex min-h-0 flex-col overflow-hidden" : ""
          }`}
        >
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
