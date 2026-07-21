import { createFileRoute } from "@tanstack/react-router";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projectsByDiscipline } from "@/data/projects";

export const Route = createFileRoute("/photography")({
  head: () => ({
    meta: [
      { title: "Photography — Siavash Akbari" },
      {
        name: "description",
        content:
          "Editorial photography portfolio: food, portrait, and fashion stories by Siavash Akbari.",
      },
      { property: "og:title", content: "Photography — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Editorial photography portfolio: food, portrait, and fashion stories by Siavash Akbari.",
      },
    ],
  }),
  component: Photography,
});

function Photography() {
  const projects = projectsByDiscipline("photography");

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20">
      <div className="mb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          Photography
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
          Food, Portrait, Fashion
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Editorial photography that treats every frame as a small stage — where light, subject, and
          mood converge.
        </p>
      </div>
      <ProjectGrid projects={projects} columns={3} />
    </div>
  );
}
