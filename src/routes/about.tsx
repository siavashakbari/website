import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

const portfolioBtnClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EFEFEF] bg-transparent px-5 text-sm font-medium text-[#EFEFEF] shadow-none transition-[background-color,border-color,color,box-shadow] duration-300 ease-out hover:border-transparent hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_42%,transparent),0_0_17px_color-mix(in_oklab,var(--secondary)_24%,transparent),0_0_25px_color-mix(in_oklab,var(--secondary)_12%,transparent)]";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Siavash Akbari" },
      {
        name: "description",
        content:
          "Learn about Siavash Akbari, a multidisciplinary studio for photography, graphic design, and product design.",
      },
      { property: "og:title", content: "About — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Learn about Siavash Akbari, a multidisciplinary studio for photography, graphic design, and product design.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">About</p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[1.1] text-foreground md:text-6xl lg:text-7xl">
          A studio practice built on curiosity.
        </h1>
        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            Siavash Akbari is the portfolio of a multidisciplinary creative working across
            photography, graphic design, and product design. The work is united by a single
            obsession: the moment when form, light, and meaning align.
          </p>
          <p>
            In photography, that means treating food, portrait, and fashion as stories told through
            shadow and composition. In graphic design, it means building visual identities and book
            covers that feel timeless rather than trendy. In product design, it means shaping
            objects that people want to live with.
          </p>
          <p>
            Every project begins with listening — to the client, the material, and the intended
            feeling. The result is work that is restrained, deliberate, and quietly luxurious.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-8 border-t border-border pt-8">
          <div>
            <p className="font-display text-3xl font-medium text-foreground">10+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Years</p>
          </div>
          <div>
            <p className="font-display text-3xl font-medium text-foreground">3</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              Disciplines
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-medium text-foreground">50+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Projects</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center md:mt-14">
          <a
            href="/Siavash-Akbari-Summer-2025.pdf"
            download="Siavash Akbari - Summer 2025.pdf"
            className={portfolioBtnClass}
          >
            <Download className="h-4 w-4" />
            Download My Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
