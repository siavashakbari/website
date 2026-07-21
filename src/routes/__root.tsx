import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Logo } from "@/components/Logo";
import { InvertCursor } from "@/components/InvertCursor";
import { HoverFooter } from "@/components/HoverFooter";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

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
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c300a005-d295-4b8b-94b3-6c8812faa3c5/id-preview-a4cda077--3131727f-1085-40e3-ac0e-533e6c964a0a.lovable.app-1784621692440.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c300a005-d295-4b8b-94b3-6c8812faa3c5/id-preview-a4cda077--3131727f-1085-40e3-ac0e-533e6c964a0a.lovable.app-1784621692440.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      {
        rel: "stylesheet",
        href: "https://fonts.cdnfonts.com/css/orkney",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
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
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-foreground">
          <Logo className="h-[1.05rem] w-auto" />
        </Link>
        <nav className="hidden items-center gap-12 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              className="text-sm font-light uppercase tracking-widest text-foreground transition-colors hover:text-secondary data-[status=active]:font-black data-[status=active]:text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <MobileNav />
      </div>
    </header>
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
        className="inline-flex items-center justify-center p-2 text-foreground transition-colors hover:opacity-70"
      >
        <Menu className="h-[0.9rem] w-[0.9rem]" />
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
              <X className="h-[0.9rem] w-[0.9rem]" />
            </button>
          </div>
          <nav className="flex flex-col gap-6 pt-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="font-display text-2xl font-light text-foreground transition-transform hover:scale-105 data-[status=active]:font-bold data-[status=active]:text-secondary"
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const isProjectPage = router.state.location.pathname.startsWith("/projects/");

  return (
    <QueryClientProvider client={queryClient}>
      <InvertCursor />
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
        {!isProjectPage && <HoverFooter />}
      </div>
    </QueryClientProvider>
  );
}
