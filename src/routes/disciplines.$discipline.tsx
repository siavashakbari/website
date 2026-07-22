import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExpandableCard, ExpandableCardGrid } from "@/components/ui/expandable-card";
import { GalleryLoadProvider } from "@/components/AdaptiveThumb";
import { DISCIPLINES } from "@/data/disciplines";
import { projects, type Project } from "@/data/projects";

interface DisciplinePhoto {
  key: string;
  src: string;
  /** Display name derived from the image filename */
  imageName: string;
  title: string;
  year: string;
  category: string;
  description: string;
  client?: string;
  credits?: string[];
  photoIndex: number;
  photoTotal: number;
}

/** e.g. /assets/fashion-atlasi-01-a1b2c3d4.jpg → "Fashion Atlasi 01" */
function imageNameFromSrc(src: string): string {
  const file = decodeURIComponent((src.split("/").pop() ?? src).split("?")[0] ?? "");
  let stem = file.replace(/\.[^.]+$/, "");
  // Strip Vite content hash suffix (e.g. -a1b2c3d4)
  stem = stem.replace(/-[A-Za-z0-9_]{7,}$/, (match) =>
    /^-\d+$/.test(match) ? match : "",
  );
  return stem
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ");
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
          imageName: imageNameFromSrc(src),
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
        <GalleryLoadProvider total={items.length}>
          <ExpandableCardGrid className="columns-1 gap-x-[4px] px-[13px] sm:columns-2 lg:columns-3">
            {items.map((item, index) => (
              <ExpandableCard
                key={item.key}
                cardId={item.key}
                index={index}
                title={item.imageName}
                src={item.src}
                classNameExpanded="[&_h4]:font-medium [&_h4]:text-[#0F0F0F] dark:[&_h4]:text-[#EFEFEF]"
              >
                <h4>Name</h4>
                <p>{item.imageName}</p>
                <p className="text-[10px] font-light uppercase tracking-[0.3em] text-secondary">
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
        </GalleryLoadProvider>
      )}
    </section>
  );
}
