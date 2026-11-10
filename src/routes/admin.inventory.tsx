import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/inventory")({
  beforeLoad: () => {
    throw redirect({ to: "/vault/media" as any });
  },
});
