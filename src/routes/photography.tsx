import { createFileRoute } from "@tanstack/react-router";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projectsByDiscipline } from "@/data/projects";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/photography")({
  head: () =>
    pageHead({
      title:
        "Photography in Isfahan — Siavash Akbari | عکاسی صنعتی، تبلیغاتی و پرتره در اصفهان",
      description:
        "Professional commercial, fashion, food, portrait, and product photography in Isfahan, Iran by Siavash Akbari. خدمات تخصصی عکاسی تبلیغاتی، صنعتی، فشن، پرتره و غذا در اصفهان و سراسر ایران.",
      path: "/photography",
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
