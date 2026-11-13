import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { get } from "@vercel/blob";

process.loadEnvFile(".env.local");
const token = process.env.VAULT_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error("A local Vercel Blob read/write token is required for this integration test.");
const blob = await get("vault/published-content.json", { access: "private", token, useCache: false });
assert.ok(blob?.stream);
const snapshot = await new Response(blob.stream).json();
const media = JSON.parse(snapshot.content.siavash_vault_media_v2);
const pages = JSON.parse(snapshot.content.siavash_vault_pages_v2);
const blogs = JSON.parse(snapshot.content.siavash_studio_custom_blogs);
const photo = media.find((item) => item.uniqueCode === "1017");
const project = pages.find((item) => item.route === "/photography/fashion-photography/sepidar");
const blog = blogs.find((item) => item.published !== false);
assert.ok(photo && project && blog);

const site = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "dev", "--host", "127.0.0.1", "--port", "8765", "--strictPort"], {
  env: process.env,
  stdio: "ignore",
});
const base = "http://127.0.0.1:8765";
try {
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(`${base}/api/content`)).ok) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  for (const [path, expected] of [
    [project.route, project.name],
    [`${project.route}/${photo.dynamicCode}`, photo.title],
    [`/blog/${blog.slug}`, blog.title],
    ["/video/vishnu", "Vishnu"],
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, `${path} failed`);
    assert.match(response.headers.get("cache-control") || "", /no-store/);
    assert.ok((await response.text()).toLowerCase().includes(expected.toLowerCase()), `${path} did not render current content in its first HTML`);
  }
  console.log("Vercel Blob content appears in the first HTML for photo, project, blog, and video routes.");
} finally {
  site.kill();
}
