import path from "node:path";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

const projectRoot = path.resolve(import.meta.dirname);
/** Only watch app source — root dumps / PDFs EBUSY-crash Vite on Windows */
const WATCH_TOP = new Set(["src", "public", "scripts"]);
const WATCH_ROOT_FILES = new Set([
  "vite.config.ts",
  "vite.config.js",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "index.html",
  "components.json",
]);

function ignoreDumpPaths(watchPath: string) {
  const rel = path.relative(projectRoot, watchPath);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return false;
  const top = rel.split(path.sep)[0];
  // Root-level files: only watch known config/entry files
  if (top === rel) return !WATCH_ROOT_FILES.has(top);
  if (WATCH_TOP.has(top)) {
    return (
      rel.includes(`${path.sep}_assets_reorg${path.sep}`) ||
      rel.endsWith(`${path.sep}_assets_reorg`)
    );
  }
  return true;
}

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ignoreDumpPaths,
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
