import { createFileRoute } from "@tanstack/react-router";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projectsByDiscipline } from "@/data/projects";

export const Route = createFileRoute("/product-design")({
  head: () => ({
    meta: [
      { title: "Product Design — Siavash Akbari" },
      {
        name: "description",
        content:
          "Product design portfolio: objects shaped by purpose and quiet detail by Siavash Akbari.",
      },
      { property: "og:title", content: "Product Design — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Product design portfolio: objects shaped by purpose and quiet detail by Siavash Akbari.",
      },
    ],
  }),
  component: ProductDesign,
});

function ProductDesign() {
  const projects = projectsByDiscipline("product-design");

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20">
      <div className="mb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          Product Design
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
          Objects with Intention
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Product design that balances function, material honesty, and a sense of quiet luxury.
        </p>
      </div>
      <ProjectGrid projects={projects} columns={3} />
    </div>
  );
}
