import { createFileRoute, notFound, rootRouteId, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Layers, User, Sparkles, Tag, Edit, ExternalLink } from "lucide-react";
import { getStudioProjects, getPhotosByProject, type PhotoInventoryItem } from "@/lib/studio-store";
import { resolveInventoryImage } from "@/lib/inventory-assets";
import { projects, type Project } from "@/data/projects";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
  buildPhotoUrl,
  buildSpecialtyUrl,
  buildDisciplineUrl,
} from "@/lib/taxonomy";
import { pageHead, jsonLdScript, projectJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/$discipline/$specialty/$project/")({
  loader: ({ params }) => {
    const disciplineSlug = normalizeDisciplineSlug(params.discipline);
    const specialtySlug = normalizeSpecialtySlug(params.specialty);
    const projectSlug = normalizeProjectSlug(params.project);

    // 1. Find project details
    const allStudioProjects = getStudioProjects();
    const project =
      allStudioProjects.find((p) => normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug) ||
      projects.find((p) => normalizeProjectSlug(p.title) === projectSlug || p.id === projectSlug);

    // 2. Find all photos for this project
    let photos = getPhotosByProject(projectSlug);

    // If no inventory photos found, fall back to project gallery
    if (photos.length === 0 && project) {
      const gallery = project.gallery ?? [project.image];
      photos = gallery.map((src, idx) => ({
        code: `${disciplineSlug.slice(0, 4).toUpperCase()}-${specialtySlug.slice(0, 4).toUpperCase()}-${projectSlug.slice(0, 4).toUpperCase()}-${String(idx + 1).padStart(4, "0")}`,
        project: project.title,
        discipline: project.discipline,
        disciplineSlug,
        specialtySlug,
        projectSlug,
        imgSrc: src,
        subdiscipline: project.subDiscipline || project.category || "",
        model: Array.isArray(project.models) ? project.models.join(", ") : project.models || "",
        client: project.client || "",
        makeupArtist: project.makeupArtist || "",
        assistant: project.assistant || "",
        date: project.year || "2024",
        keywords: `${project.title}, ${specialtySlug}, Siavash Akbari`,
        caption: project.caption || project.description || "",
      }));
    }

    if (!project && photos.length === 0) {
      throw notFound({ routeId: rootRouteId });
    }

    const title = project?.title || photos[0]?.project || params.project;

    return {
      disciplineSlug,
      specialtySlug,
      projectSlug,
      project,
      title,
      photos,
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Project";
    const desc = loaderData?.project?.description || `Explore ${title} portfolio project by Siavash Akbari.`;
    const canonicalPath = `/${loaderData?.disciplineSlug}/${loaderData?.specialtySlug}/${loaderData?.projectSlug}`;

    return pageHead({
      title: `${title} — Siavash Akbari`,
      description: desc,
      path: canonicalPath,
      image: loaderData?.project?.coverImage || loaderData?.project?.image,
      type: "article",
    });
  },
  component: ProjectCaseStudyPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Project Not Found</h1>
      <p className="mt-4 text-muted-foreground">{error.message}</p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  ),
});

function ProjectCaseStudyPage() {
  const { disciplineSlug, specialtySlug, projectSlug, project, title, photos } = Route.useLoaderData();

  const specialtyUrl = buildSpecialtyUrl(disciplineSlug, specialtySlug);
  const disciplineUrl = buildDisciplineUrl(disciplineSlug);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-secondary selection:text-secondary-foreground pb-24">
      {/* Top Breadcrumbs Bar */}
      <div className="sticky top-14 z-30 border-b border-foreground/10 bg-[#0A0A0A]/90 backdrop-blur-md px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider overflow-x-auto whitespace-nowrap">
            <Link
              to={specialtyUrl as any}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mr-2 pr-3 border-r border-foreground/15"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to {specialtySlug.replace("-", " ")}</span>
            </Link>

            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Link
              to={disciplineUrl as any}
              className="capitalize text-muted-foreground hover:text-foreground transition-colors"
            >
              {disciplineSlug.replace("-", " ")}
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Link
              to={specialtyUrl as any}
              className="capitalize text-muted-foreground hover:text-foreground transition-colors"
            >
              {specialtySlug.replace("-", " ")}
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-secondary font-bold">{title}</span>
          </div>

          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#2CE3C0]/40 bg-[#2CE3C0]/10 px-3 py-1.5 text-xs font-mono text-[#2CE3C0] hover:bg-[#2CE3C0]/20 transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit in Studio</span>
          </Link>
        </div>
      </div>

      {/* Project Header / Meta Section */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-10 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded border border-secondary/20">
            {disciplineSlug.replace("-", " ")}
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-white/80 bg-white/5 px-2.5 py-1 rounded border border-white/10">
            {specialtySlug.replace("-", " ")}
          </span>
          {project?.year && (
            <span className="text-xs font-mono text-muted-foreground px-1">
              {project.year}
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {project?.titleFa && (
          <p className="mt-2 text-xl font-sans text-muted-foreground" dir="rtl">
            {project.titleFa}
          </p>
        )}

        {project?.description && (
          <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}

        {/* Project Credits Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-6 border-t border-white/5">
          {project?.client && (
            <div>
              <span className="block text-muted-foreground/60 uppercase text-[10px] tracking-wider">Client</span>
              <span className="text-foreground font-medium mt-0.5 block">{project.client}</span>
            </div>
          )}
          {project?.models && (
            <div>
              <span className="block text-muted-foreground/60 uppercase text-[10px] tracking-wider">Model(s)</span>
              <span className="text-foreground font-medium mt-0.5 block">
                {Array.isArray(project.models) ? project.models.join(", ") : project.models}
              </span>
            </div>
          )}
          {project?.makeupArtist && (
            <div>
              <span className="block text-muted-foreground/60 uppercase text-[10px] tracking-wider">MUA</span>
              <span className="text-foreground font-medium mt-0.5 block">{project.makeupArtist}</span>
            </div>
          )}
          {project?.stylist && (
            <div>
              <span className="block text-muted-foreground/60 uppercase text-[10px] tracking-wider">Stylist</span>
              <span className="text-foreground font-medium mt-0.5 block">{project.stylist}</span>
            </div>
          )}
          {project?.assistant && (
            <div>
              <span className="block text-muted-foreground/60 uppercase text-[10px] tracking-wider">Assistant</span>
              <span className="text-foreground font-medium mt-0.5 block">{project.assistant}</span>
            </div>
          )}
          <div>
            <span className="block text-muted-foreground/60 uppercase text-[10px] tracking-wider">Total Photos</span>
            <span className="text-secondary font-bold mt-0.5 block">{photos.length} Frames</span>
          </div>
        </div>
      </div>

      {/* Project Photos Gallery */}
      <div className="mx-auto max-w-7xl px-6 pt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Project Gallery ({photos.length} frames)
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground/60">
            Click frame for dedicated photo details & specs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {photos.map((item, idx) => {
            const resolvedSrc = resolveInventoryImage(item.imgSrc);
            const photoUrl = buildPhotoUrl(disciplineSlug, specialtySlug, projectSlug, item.code);

            return (
              <Link
                key={item.code || idx}
                to={photoUrl as any}
                className="group relative flex flex-col rounded-md overflow-hidden bg-[#111] border border-white/5 hover:border-secondary/40 transition-all duration-300 shadow-md hover:shadow-secondary/10"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-black/40">
                  <img
                    src={resolvedSrc}
                    alt={item.altText || `${title} — ${item.code}`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-3 bg-[#111]/90 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-foreground group-hover:text-secondary transition-colors">
                    {item.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
