import { createFileRoute } from "@tanstack/react-router";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireVaultAdmin } from "@/lib/vault-auth.server";

export const Route = createFileRoute("/api/blob-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (import.meta.env.VITE_VAULT_BACKEND === "supabase") {
          return new Response("Vercel media storage is not active.", { status: 503 });
        }
        try {
          const result = await handleUpload({
            request,
            body: await request.json() as HandleUploadBody,
            token: process.env.VAULT_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async (pathname) => {
              await requireVaultAdmin(request);
              if (!/^images\/[a-zA-Z0-9._-]+$/.test(pathname)) {
                throw new Error("Invalid image path.");
              }
              return {
                allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
                maximumSizeInBytes: 30 * 1024 * 1024,
                addRandomSuffix: false,
              };
            },
            onUploadCompleted: async () => {},
          });
          return Response.json(result, { headers: { "cache-control": "no-store" } });
        } catch (error) {
          console.error("Vercel image upload failed:", error);
          return Response.json({ error: "Image upload failed or Vault session expired." }, { status: 400 });
        }
      },
    },
  },
});
