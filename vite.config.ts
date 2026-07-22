import path from "node:path";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Root photo dumps only — watching them can EBUSY-crash on Windows
      ignored: [
        path.resolve(import.meta.dirname, "food"),
        path.resolve(import.meta.dirname, "food 2"),
        path.resolve(import.meta.dirname, "fashion"),
        path.resolve(import.meta.dirname, "products"),
        path.resolve(import.meta.dirname, "portrait"),
        path.resolve(import.meta.dirname, ".recover-hq"),
        path.resolve(import.meta.dirname, "src/_assets_reorg"),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Use src/server.ts (SSR error wrapper) instead of the default entry.
      server: { entry: "server" },
    }),
    nitro({
      defaultPreset: "cloudflare-module",
    }),
    viteReact(),
  ],
});
