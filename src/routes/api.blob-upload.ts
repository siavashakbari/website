import { createFileRoute } from "@tanstack/react-router";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { requireVaultAdmin } from "@/lib/vault-auth.server";
import { blobCredentials } from "@/lib/blob-credentials.server";

export const Route = createFileRoute("/api/blob-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const result = await handleUploadPresigned({
            request,
            body: await request.json() as HandleUploadPresignedBody,
            getSignedToken: async (pathname) => {
              await requireVaultAdmin(request);
              if (!/^images\/[a-zA-Z0-9._-]+$/.test(pathname)) {
                throw new Error("Invalid image path.");
              }
              const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
              const maximumSizeInBytes = 30 * 1024 * 1024;
              const token = await issueSignedToken({
                ...blobCredentials(request),
                pathname,
                operations: ["put"],
                allowedContentTypes,
                maximumSizeInBytes,
                validUntil: Date.now() + 15 * 60 * 1000,
              });
              return {
                token,
                urlOptions: { allowedContentTypes, maximumSizeInBytes, addRandomSuffix: false },
              };
            },
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
