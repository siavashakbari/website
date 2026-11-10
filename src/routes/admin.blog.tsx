import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/blog")({
  beforeLoad: () => {
    throw redirect({ to: "/vault/blog" as any });
  },
});
