import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/vault/invoices" as any });
  },
});
