import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExpandableCard, ExpandableCardGrid } from "@/components/ui/expandable-card";
import { DISCIPLINES } from "@/data/disciplines";
import { projects, type Project } from "@/data/projects";

interface DisciplinePhoto {
  key: string;
  src: string;
  title: string;
  year: string;
  category: string;
  description: string;
  client?: string;
  credits?: string[];
  photoIndex: number;
  photoTotal: number;
}

export const Route = createFileRoute("/disciplines/$discipline")({
  loader: ({ params }) => {
    const discipline = DISCIPLINES.find((d) => d.slug === params.discipline);
    if (!discipline) throw notFound();
    const matching = projects.filter(
      (p) =>
        (!discipline.disciplines || discipline.disciplines.includes(p.discipline)) &&
        discipline.match(p.category),
    );
    const items: DisciplinePhoto[] = [];
    matching.forEach((project: Project) => {
      const gallery = project.gallery ?? [project.image];
      gallery.forEach((src, idx) => {
        items.push({
          key: `${project.id}-${idx}`,
          src,
          title: project.title,
          year: project.year,
          category: project.category,
          description: project.description,
          client: project.client,
          credits: project.credits,
          photoIndex: idx + 1,
          photoTotal: gallery.length,
        });
      });
    });
    return {
      discipline: { slug: discipline.slug, label: discipline.label, blurb: discipline.blurb },
      items,
    };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.discipline.label ?? "DISCIPLINE";
    return {
      meta: [
        { title: `${label} — Siavash Akbari` },
        { name: "description", content: loaderData?.discipline.blurb ?? "" },
        { property: "og:title", content: `${label} — Siavash Akbari` },
        { property: "og:description", content: loaderData?.discipline.blurb ?? "" },
      ],
    };
  },
  component: DisciplinePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">DISCIPLINE not found</h1>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Back home
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function DisciplinePage() {
  const { discipline, items } = Route.useLoaderData();

  return (
    <section className="relative w-full bg-background pb-40 pt-3 md:pt-3.5">
      {items.length === 0 ? (
        <p className="mx-auto max-w-3xl px-6 text-center text-muted-foreground">
          More coming soon.
        </p>
      ) : (
        <ExpandableCardGrid className="columns-1 gap-0 px-[13px] sm:columns-2 lg:columns-3">
          {items.map((item) => (
            <ExpandableCard
              key={item.key}
              cardId={item.key}
              title={item.title}
              src={item.src}
              className="mb-0"
              classNameExpanded="[&_h4]:font-medium [&_h4]:text-black dark:[&_h4]:text-white"
            >
              <p className="text-[10px] font-light uppercase tracking-[0.3em] text-zinc-400">
                {discipline.label} · {item.year} · {String(item.photoIndex).padStart(2, "0")} /{" "}
                {String(item.photoTotal).padStart(2, "0")}
              </p>
              <h4>About</h4>
              <p>{item.description}</p>
              {item.client ? (
                <>
                  <h4>Client</h4>
                  <p>{item.client}</p>
                </>
              ) : null}
              {item.credits && item.credits.length > 0 ? (
                <>
                  <h4>Credits</h4>
                  <ul className="list-none space-y-1">
                    {item.credits.map((credit) => (
                      <li key={credit}>{credit}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </ExpandableCard>
          ))}
        </ExpandableCardGrid>
      )}
    </section>
  );
}
