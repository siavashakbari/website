import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/projects")({
  beforeLoad: () => {
    throw redirect({ to: "/vault/pages" as any });
  },
});
