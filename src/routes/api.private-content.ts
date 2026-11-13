import { createFileRoute } from "@tanstack/react-router";
import { requireVaultAdmin } from "@/lib/vault-auth.server";
import { readVercelPrivateContent, saveVercelPrivateContent } from "@/lib/vercel-private-content.server";

const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

export const Route = createFileRoute("/api/private-content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try { await requireVaultAdmin(request); } catch { return json({ error: "Vault administrator access required." }, 401); }
        try { return json(await readVercelPrivateContent()); }
        catch (error) {
          console.error("Private Vault read failed:", error);
          return json({ error: "Private Vault data is unavailable." }, 503);
        }
      },
      POST: async ({ request }) => {
        try { await requireVaultAdmin(request); } catch { return json({ error: "Vault administrator access required." }, 401); }
        try {
          const body = await request.json();
          if (!Number.isInteger(body?.expectedRevision) || body.expectedRevision < -1) return json({ error: "Invalid revision." }, 400);
          const revision = await saveVercelPrivateContent(body.data, body.expectedRevision);
          return json({ revision });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Private Vault save failed.";
          if (message.includes("Newer private")) return json({ error: message }, 409);
          console.error("Private Vault save failed:", error);
          return json({ error: "Private Vault save failed." }, 500);
        }
      },
    },
  },
});
