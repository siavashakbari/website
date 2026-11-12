import { createFileRoute } from "@tanstack/react-router";
import { get } from "@vercel/blob";

export const Route = createFileRoute("/api/blob-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const pathname = new URL(request.url).searchParams.get("pathname") || "";
        if (!/^images\/[a-zA-Z0-9._-]+$/.test(pathname)) {
          return new Response("Not found", { status: 404 });
        }
        try {
          const token = process.env.VAULT_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
          if (!token) throw new Error("Private Blob store is not connected.");
          const result = await get(pathname, { access: "private", token, useCache: true });
          if (!result || result.statusCode !== 200 || !result.blob.contentType.startsWith("image/")) {
            return new Response("Not found", { status: 404 });
          }
          return new Response(result.stream, {
            headers: {
              "content-type": result.blob.contentType,
              "cache-control": "public, max-age=31536000, immutable",
              "x-content-type-options": "nosniff",
              etag: result.blob.etag,
            },
          });
        } catch (error) {
          console.error("Vercel image read failed:", error);
          return new Response("Image unavailable", { status: 503 });
        }
      },
    },
  },
});
