import { createFileRoute } from "@tanstack/react-router";
import { readVercelPublishedContent, saveVercelPublishedContent } from "@/lib/vercel-blob-content.server";
import { requireVaultAdmin } from "@/lib/vault-auth.server";
import { validateSnapshot } from "@/lib/published-store-core";

const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

export const Route = createFileRoute("/api/content")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json(await readVercelPublishedContent());
        } catch (error) {
          console.error("Published content read failed:", error);
          return json({ error: "Published content is unavailable." }, 503);
        }
      },
      POST: async ({ request }) => {
        try {
          await requireVaultAdmin(request);
        } catch {
          return json({ error: "Vault administrator access required." }, 401);
        }
        try {
          const body = await request.json();
          const expectedRevision = body?.expected_revision;
          if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
            return json({ error: "Invalid content revision." }, 400);
          }
          validateSnapshot(body?.next_content);
          const revision = await saveVercelPublishedContent(body.next_content, expectedRevision);
          return json({ revision });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Content save failed.";
          if (message.includes("Newer changes")) return json({ error: message }, 409);
          console.error("Published content save failed:", error);
          return json({ error: "Content save failed." }, 500);
        }
      },
    },
  },
});
