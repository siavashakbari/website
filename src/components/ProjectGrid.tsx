import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/data/projects";

interface ProjectGridProps {
  projects: Project[];
  columns?: 2 | 3 | 4;
  aspectRatio?: string;
}

export function ProjectGrid({ projects, columns = 3, aspectRatio }: ProjectGridProps) {
  const colClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid grid-cols-1 gap-x-8 gap-y-12 ${colClass}`}>
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} aspectRatio={aspectRatio} />
      ))}
    </div>
  );
}
