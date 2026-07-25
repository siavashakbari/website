import { createFileRoute } from "@tanstack/react-router";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projectsByDiscipline } from "@/data/projects";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/product-design")({
  head: () =>
    pageHead({
      title: "Product Design — Siavash Akbari",
      description:
        "Product design by Siavash Akbari — objects shaped by purpose, material honesty, and quiet detail.",
      path: "/product-design",
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
