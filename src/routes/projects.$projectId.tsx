import { createFileRoute, notFound, redirect, rootRouteId } from "@tanstack/react-router";
import { projects } from "@/data/projects";
import { getProjectById } from "@/lib/studio-store";

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: ({ params }) => {
    const project =
      getProjectById(params.projectId) ||
      projects.find((p) => p.id === params.projectId);

    if (!project) throw notFound({ routeId: rootRouteId });

    // 1. Visual Identity projects -> redirect to /visual-identity/:projectId
    const cat = project.category.toLowerCase();
    if (
      project.discipline === "graphic-design" &&
      cat.includes("visual identity")
    ) {
      throw redirect({
        to: "/visual-identity/$projectId",
        params: { projectId: project.id },
        statusCode: 301,
      });
    }

    // 2. Photography projects have NO dedicated project pages: redirect to gallery
    if (cat.includes("fashion")) {
      throw redirect({
        to: "/$discipline",
        params: { discipline: "fashion-photography" },
        statusCode: 301,
      });
    }
    if (cat.includes("food")) {
      throw redirect({
        to: "/$discipline",
        params: { discipline: "food-photography" },
        statusCode: 301,
      });
    }
    if (cat.includes("portrait")) {
      throw redirect({
        to: "/$discipline",
        params: { discipline: "portrait-photography" },
        statusCode: 301,
      });
    }
    if (cat.includes("product")) {
      throw redirect({
        to: "/$discipline",
        params: { discipline: "product-photography" },
        statusCode: 301,
      });
    }
    if (cat.includes("book cover")) {
      throw redirect({
        to: "/$discipline",
        params: { discipline: "book-covers" },
        statusCode: 301,
      });
    }
    if (cat.includes("poster")) {
      throw redirect({
        to: "/$discipline",
        params: { discipline: "posters" },
        statusCode: 301,
      });
    }
    if (project.discipline === "video" || cat.includes("video")) {
      throw redirect({
        to: "/$discipline",
        params: { discipline: "videos" },
        statusCode: 301,
      });
    }

    // Fallback for visual identity / graphic design
    throw redirect({
      to: "/visual-identity/$projectId",
      params: { projectId: project.id },
      statusCode: 301,
    });
  },
  loader: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: () => null,
});
