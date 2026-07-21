import { createFileRoute, Link } from "@tanstack/react-router";
import heroPortrait from "../assets/hero-portrait.jpg.asset.json";
import { DISCIPLINES } from "@/data/disciplines";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Siavash Akbari" },
      {
        name: "description",
        content:
          "Siavash Akbari Portfolio",
      },
      { property: "og:title", content: "Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Siavash Akbari Portfolio",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Lock scroll while the intro overlay is visible.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const holdTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1000);

    const removeTimer = setTimeout(() => {
      setShowIntro(false);
      document.body.style.overflow = prevOverflow;
    }, 2000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Intro overlay */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-xl transition-all duration-1000 ease-out ${
            fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={fadeOut}
        >
          <Logo className="w-[78vw] text-foreground md:w-[55vw]" />
        </div>
      )}

      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden bg-background">
        <img
          src={heroPortrait.url}
          alt="Portrait"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:pb-14">
          <p
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            className="text-center text-[10px] font-medium uppercase tracking-[0.35em] text-foreground md:text-xs"
          >
            Multi-disciplinary Designer <span className="mx-2 opacity-60">•</span> Photographer{" "}
            <span className="mx-2 opacity-60">•</span> Creative Director
          </p>
        </div>
      </section>

      {/* Disciplines */}
      <section className="w-full py-24">
        <h2 className="mb-16 px-6 text-center font-display text-4xl font-medium uppercase text-foreground md:px-10 md:text-5xl">
          DISCIPLINES
        </h2>
        <div className="grid w-full grid-cols-2 md:grid-cols-4">
          {DISCIPLINES.map((discipline) => (
            <Link
              key={discipline.slug}
              to="/disciplines/$discipline"
              params={{ discipline: discipline.slug }}
              className="group block"
              aria-label={`View ${discipline.label}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-card">
                {discipline.image ? (
                  <>
                    <img
                      src={discipline.image}
                      alt={discipline.label}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <h3 className="font-display text-base font-medium text-foreground md:text-2xl">
                        {discipline.label}
                      </h3>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-5 transition-colors group-hover:bg-accent md:p-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Coming soon
                    </span>
                    <h3 className="mt-2 text-center font-display text-base font-medium text-foreground md:text-2xl">
                      {discipline.label}
                    </h3>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
