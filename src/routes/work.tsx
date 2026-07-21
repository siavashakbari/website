import { createFileRoute, Link } from "@tanstack/react-router";
import { ProjectGrid } from "@/components/ProjectGrid";
import { disciplines, projects, type Discipline } from "@/data/projects";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — Siavash Akbari" },
      {
        name: "description",
        content:
          "Browse photography, graphic design, and product design projects from Siavash Akbari.",
      },
      { property: "og:title", content: "Work — Siavash Akbari" },
      {
        property: "og:description",
        content:
          "Browse photography, graphic design, and product design projects from Siavash Akbari.",
      },
    ],
  }),
  component: Work,
});

function Work() {
  const search = Route.useSearch();
  const activeDiscipline = (search as { discipline?: Discipline }).discipline;

  const filteredProjects = activeDiscipline
    ? projects.filter((p) => p.discipline === activeDiscipline)
    : projects;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Portfolio</p>
        <h1 className="mt-4 font-display text-5xl font-medium text-foreground md:text-7xl">
          Work
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          A selection of projects across photography, visual identity, book cover design, and product
          design.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap gap-3">
        <Link
          to="/work"
          search={{}}
          className={`px-5 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
            !activeDiscipline
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </Link>
        {disciplines.map((d) => (
          <Link
            key={d.id}
            to="/work"
            search={{ discipline: d.id }}
            className={`px-5 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
              activeDiscipline === d.id
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.label}
          </Link>
        ))}
      </div>

      <ProjectGrid projects={filteredProjects} columns={3} />
    </div>
  );
}
