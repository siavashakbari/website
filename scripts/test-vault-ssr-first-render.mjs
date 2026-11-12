import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";

const latestTitle = "Latest Vault Photo Title";
const latestProject = "Latest Vault Project Name";
const latestBlog = "Latest Vault Blog Title";
const snapshot = {
  revision: 42,
  content: {
    siavash_vault_media_v2: JSON.stringify([{
      uniqueCode: "1017",
      title: latestTitle,
    }]),
    siavash_vault_pages_v2: JSON.stringify([{
      id: "photography-fashion-sepidar",
      route: "/photography/fashion-photography/sepidar",
      name: latestProject,
      parentRoute: "/photography/fashion-photography",
      coverPhoto: "",
      descriptionEn: "",
      descriptionFa: "",
      uiType: "UI02",
      isHidden: false,
      pairedBoxes: [],
      order: 1,
    }]),
    siavash_studio_custom_blogs: JSON.stringify([{
      slug: "latest-vault-post",
      title: latestBlog,
      excerpt: "Fresh blog content",
      category: "News",
      publishedAt: "2026-11-12",
      readTime: "1 min",
      contentMarkdown: "Fresh blog content",
      published: true,
      featured: false,
      tags: [],
    }]),
  },
};
let mockFailure = false;
const headingsFrom = (html) => [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
  .map((match) => match[1].replace(/<[^>]*>/g, "").trim());

const supabase = createServer((request, response) => {
  if (request.url?.startsWith("/rest/v1/vault_content")) {
    if (mockFailure) {
      response.writeHead(503);
      response.end();
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(request.headers.accept?.includes("vnd.pgrst.object") ? snapshot : [snapshot]));
    return;
  }
  response.writeHead(404);
  response.end();
});
supabase.listen(0, "127.0.0.1");
await once(supabase, "listening");
const supabaseUrl = `http://127.0.0.1:${supabase.address().port}`;
const sitePort = 8765;
const site = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "dev", "--host", "127.0.0.1", "--port", String(sitePort), "--strictPort"], {
  env: {
    ...process.env,
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: "test-public-key",
  },
  stdio: "ignore",
});

try {
  let response;
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      response = await fetch(`http://127.0.0.1:${sitePort}/photography/fashion-photography/sepidar/1017-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-SEPIDAR`);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  assert.ok(response, "The local site did not start");
  const checks = [
    [response, latestTitle, "photo"],
    [await fetch(`http://127.0.0.1:${sitePort}/photography/fashion-photography/sepidar`), latestProject, "project"],
    [await fetch(`http://127.0.0.1:${sitePort}/blog/latest-vault-post`), latestBlog, "blog"],
  ];
  for (const [pageResponse, expected, label] of checks) {
    assert.equal(pageResponse.status, 200, `${label} route failed`);
    assert.match(pageResponse.headers.get("cache-control") || "", /no-store/, `${label} response can be cached with stale Vault data`);
    const html = await pageResponse.text();
    assert.ok(headingsFrom(html).includes(expected), `First ${label} HTML did not render the latest Vault heading`);
  }
  mockFailure = true;
  const unavailable = await fetch(`http://127.0.0.1:${sitePort}/photography/fashion-photography/sepidar/1017-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-SEPIDAR`);
  const unavailableHeadings = headingsFrom(await unavailable.text());
  assert.ok(!unavailableHeadings.includes("1017-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-SEPIDAR.JPG"), "A server outage exposed the old photo heading");
  mockFailure = false;
  if (process.env.VAULT_TEST_BROWSER === "1") {
    const { chromium } = await import("../.output/browser-tools/node_modules/playwright/index.mjs");
    const browser = await chromium.launch({ channel: "msedge", headless: true });
    try {
      for (const [path, title, oldTitle] of [
        ["/photography/fashion-photography/sepidar/1017-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-SEPIDAR", latestTitle, "1017-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-SEPIDAR.JPG"],
        ["/photography/fashion-photography/sepidar", latestProject, "Sepidar"],
        ["/blog/latest-vault-post", latestBlog, ""],
      ]) {
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.addInitScript(() => {
          window.__seenHeadings = [];
          new MutationObserver(() => {
            for (const heading of document.querySelectorAll("h1")) {
              const title = heading.textContent?.trim();
              if (title) window.__seenHeadings.push(title);
            }
          }).observe(document, { childList: true, subtree: true, characterData: true });
        });
        await page.goto(`http://127.0.0.1:${sitePort}${path}`);
        await page.getByRole("heading", { level: 1, name: title }).waitFor();
        const seen = await page.evaluate(() => window.__seenHeadings);
        assert.ok(!seen.includes(oldTitle) || !oldTitle, `Hydration showed the old title on ${path}`);
        assert.deepEqual(errors, [], `Hydration produced a browser error on ${path}`);
        await page.close();
      }
      const navigationPage = await browser.newPage();
      await navigationPage.goto(`http://127.0.0.1:${sitePort}/photography/fashion-photography/sepidar`);
      snapshot.revision += 1;
      snapshot.content.siavash_vault_media_v2 = JSON.stringify([{
        uniqueCode: "1017",
        title: "Newer Vault Photo Title",
      }]);
      await navigationPage.locator('a[href$="/1017-PHOTOGRAPHY-FASHION-PHOTOGRAPHY-SEPIDAR"]').first().click();
      await navigationPage.getByRole("heading", { level: 1, name: "Newer Vault Photo Title" }).waitFor();
      await navigationPage.close();
    } finally {
      await browser.close();
    }
  }
  if (process.env.VAULT_TEST_ALL_ROUTES === "1") {
    const routeCheck = spawn(process.execPath, ["scripts/test-all-routes-live.mjs"], {
      env: { ...process.env, BASE_URL: `http://127.0.0.1:${sitePort}` },
      stdio: "inherit",
    });
    const [code] = await once(routeCheck, "exit");
    assert.equal(code, 0, "The full route check failed");
  }
  console.log("SSR first render uses the latest Vault photo, project, and blog titles.");
} finally {
  site.kill();
  supabase.close();
}
