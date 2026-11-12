import { createFileRoute } from "@tanstack/react-router";
import { get } from "@vercel/blob";

export const Route = createFileRoute("/api/storage-health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const tokenNames = Object.keys(process.env).filter((key) =>
          /(?:^|_)(?:BLOB_)?READ_WRITE_TOKEN$/.test(key) && Boolean(process.env[key]),
        );
        let blobReadAvailable = false;
        let readError: string | null = null;
        try {
          const blob = await get("vault/published-content.json", {
            access: "private",
            useCache: false,
            storeId: process.env.BLOB_STORE_ID,
            oidcToken: request.headers.get("x-vercel-oidc-token") || undefined,
          });
          blobReadAvailable = blob?.statusCode === 200;
          if (blob?.stream) await blob.stream.cancel();
        } catch (error) {
          readError = error instanceof Error ? error.name : "BlobReadError";
        }
        return Response.json({
          blobTokenAvailable: tokenNames.length > 0,
          blobStoreAvailable: Boolean(process.env.BLOB_STORE_ID),
          blobReadAvailable,
          readError,
          deploymentCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
        }, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
