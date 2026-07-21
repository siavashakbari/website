import { createFileRoute } from "@tanstack/react-router";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projectsByDiscipline } from "@/data/projects";

export const Route = createFileRoute("/graphic-design")({
  head: () => ({
    meta: [
      { title: "Graphic Design — Siavash Akbari" },
      {
        name: "description",
        content:
          "Visual identity and book cover design portfolio by Siavash Akbari.",
      },
      { property: "og:title", content: "Graphic Design — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Visual identity and book cover design portfolio by Siavash Akbari.",
      },
    ],
  }),
  component: GraphicDesign,
});

function GraphicDesign() {
  const projects = projectsByDiscipline("graphic-design");

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20">
      <div className="mb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          Graphic Design
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
          Visual Identity & Book Covers
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Design systems and cover art that distill a brand or story into a lasting visual language.
        </p>
      </div>
      <ProjectGrid projects={projects} columns={3} />
    </div>
  );
}
