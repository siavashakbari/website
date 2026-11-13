import { createFileRoute } from "@tanstack/react-router";
import { del } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import { blobCredentials } from "@/lib/blob-credentials.server";
import { managedMediaFromUrl } from "@/lib/managed-media";
import { readVercelPublishedContent } from "@/lib/vercel-blob-content.server";
import { requireVaultAdmin } from "@/lib/vault-auth.server";

export const Route = createFileRoute("/api/media-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireVaultAdmin(request);
        } catch {
          return Response.json({ error: "Vault administrator access required." }, { status: 401 });
        }
        try {
          const body = (await request.json()) as { sources?: unknown };
          if (
            !Array.isArray(body.sources) ||
            body.sources.length > 4 ||
            body.sources.some((source) => typeof source !== "string" || source.length > 2048)
          ) {
            return Response.json({ error: "Invalid media sources." }, { status: 400 });
          }
          const files = body.sources.map((source: string) => managedMediaFromUrl(source));
          if (files.some((file) => !file)) {
            return Response.json(
              { error: "This file is not a Vault-managed upload." },
              { status: 400 },
            );
          }
          const snapshot = await readVercelPublishedContent();
          const values = Object.values(snapshot.content);
          for (const file of files) {
            if (!file) continue;
            // All public content collections are checked, including page covers and blogs.
            // A file still used anywhere must remain available.
            if (
              values.some(
                (value) =>
                  value.includes(file.path) || value.includes(encodeURIComponent(file.path)),
              )
            ) {
              return Response.json(
                { error: "This file is still used by published content." },
                { status: 409 },
              );
            }
          }
          const unique = [
            ...new Map(
              files
                .filter((file): file is NonNullable<typeof file> => Boolean(file))
                .map((file) => [`${file.storage}:${file.path}`, file]),
            ).values(),
          ];
          for (const file of unique) {
            if (file.storage === "blob") {
              await del(file.path, blobCredentials(request));
            } else {
              const url = import.meta.env.VITE_SUPABASE_URL;
              const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
              if (!url || !key) throw new Error("Video storage is not configured.");
              const token = request.headers.get("authorization")!.replace(/^Bearer\s+/i, "");
              const client = createClient(url, key, {
                global: { headers: { Authorization: `Bearer ${token}` } },
                auth: { persistSession: false, autoRefreshToken: false },
              });
              const { error } = await client.storage.from("vault-media").remove([file.path]);
              if (error) throw error;
            }
          }
          return Response.json(
            { deleted: unique.length },
            { headers: { "cache-control": "no-store" } },
          );
        } catch (error) {
          console.error("Vault media cleanup failed:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Could not remove stored file." },
            { status: 500 },
          );
        }
      },
    },
  },
});
