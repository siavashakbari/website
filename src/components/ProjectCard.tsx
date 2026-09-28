import { Link } from "@tanstack/react-router";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  index?: number;
  aspectRatio?: string;
}

export function ProjectCard({ project, index = 0, aspectRatio }: ProjectCardProps) {
  const image = (
    <img
      src={project.image}
      alt={project.title}
      width={project.aspect === "portrait" ? 1024 : 1280}
      height={project.aspect === "portrait" ? 1280 : 1024}
      loading={index < 2 ? "eager" : "lazy"}
      decoding="async"
      className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${aspectRatio ? "h-full" : ""}`}
    />
  );

  const isVisualIdentity =
    project.discipline === "graphic-design" &&
    project.category.toLowerCase().includes("visual identity");

  const cat = project.category.toLowerCase();
  let linkProps: any = {
    to: "/visual-identity/$projectId",
    params: { projectId: project.id },
  };

  if (!isVisualIdentity) {
    if (cat.includes("fashion")) {
      linkProps = { to: "/$discipline", params: { discipline: "fashion-photography" } };
    } else if (cat.includes("food")) {
      linkProps = { to: "/$discipline", params: { discipline: "food-photography" } };
    } else if (cat.includes("portrait")) {
      linkProps = { to: "/$discipline", params: { discipline: "portrait-photography" } };
    } else if (cat.includes("product")) {
      linkProps = { to: "/$discipline", params: { discipline: "product-photography" } };
    } else if (cat.includes("book cover")) {
      linkProps = { to: "/$discipline", params: { discipline: "book-covers" } };
    } else if (cat.includes("poster")) {
      linkProps = { to: "/$discipline", params: { discipline: "posters" } };
    } else if (project.discipline === "video" || cat.includes("video")) {
      linkProps = { to: "/$discipline", params: { discipline: "videos" } };
    }
  }

  return (
    <Link
      {...linkProps}
      className="group block"
      aria-label={`View ${project.title}`}
    >
      <div className="relative overflow-hidden bg-card">
        {aspectRatio ? (
          <div className="w-full" style={{ aspectRatio }}>
            {image}
          </div>
        ) : (
          image
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-medium text-foreground transition-colors group-hover:text-primary">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{project.category}</p>
        </div>
        <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          {project.year}
        </span>
      </div>
    </Link>
  );
}
