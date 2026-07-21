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
      className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${aspectRatio ? "h-full" : ""}`}
    />
  );

  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="group block"
      aria-label={`View ${project.title}`}
    >
      <div className="relative overflow-hidden bg-card">
      {aspectRatio ? (
          <div className="w-full" style={{ aspectRatio }}>{image}</div>
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
