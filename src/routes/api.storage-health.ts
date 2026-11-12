import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/storage-health")({
  server: {
    handlers: {
      GET: async () => {
        const tokenNames = Object.keys(process.env).filter((key) =>
          /(?:^|_)(?:BLOB_)?READ_WRITE_TOKEN$/.test(key) && Boolean(process.env[key]),
        );
        return Response.json({ blobTokenAvailable: tokenNames.length > 0 }, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
