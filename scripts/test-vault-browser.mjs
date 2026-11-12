import { chromium } from "../.output/browser-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
process.loadEnvFile(".env");
const remote = process.env.VITE_SUPABASE_URL;
const ref = new URL(remote).hostname.split(".")[0];
let revision = 0;
let content = {};
let failWrites = false;
let uploads = 0;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const errors = [];
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const user = {
  id: "383ab4ac-4c4b-4c19-81a7-c3cb3cda0732",
  email: "test@example.com",
  app_metadata: { vault_admin: true },
  aud: "authenticated",
};
const token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: user.id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600, app_metadata: user.app_metadata })}.fake`;
async function context(admin = false, readDelayMs = 0) {
  const ctx = await browser.newContext();
  await ctx.route(`${remote}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("/rest/v1/vault_content")) {
      if (readDelayMs) await new Promise((resolve) => setTimeout(resolve, readDelayMs));
      return route.fulfill({ json: { revision, content } });
    }
    if (url.includes("/rest/v1/rpc/save_vault_content")) {
      const data = route.request().postDataJSON();
      if (failWrites)
        return route.fulfill({ status: 503, json: { message: "Test network failure" } });
      if (data.expected_revision !== revision)
        return route.fulfill({ status: 409, json: { message: "Newer changes exist" } });
      content = data.next_content;
      return route.fulfill({ json: ++revision });
    }
    if (url.includes("/auth/")) return route.fulfill({ json: { user } });
    if (url.includes("/storage/v1/object/") && route.request().method() === "POST") {
      uploads++;
      return route.fulfill({ json: { Key: "recovered.mp4" } });
    }
    return route.abort();
  });
  if (admin)
    await ctx.addInitScript(
      ({ ref, token, user }) => {
        localStorage.setItem(
          `sb-${ref}-auth-token`,
          JSON.stringify({
            access_token: token,
            refresh_token: "test",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: "bearer",
            user,
          }),
        );
      },
      { ref, token, user },
    );
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  return { ctx, page };
}
try {
  const admin = await context(true);
  await admin.page.goto("http://127.0.0.1:8080/vault/media");
  await admin.page.getByText("Published content loaded", { exact: true }).waitFor();
  await admin.page.evaluate(async () => {
    const store = await import("/src/lib/vault-store.ts");
    store.saveVaultMedia({
      id: "custom-media-9999",
      uniqueCode: "9999",
      dynamicCode: "9999-VIDEO-VISHNU",
      imgSrc: "https://example.com/vishnu.mp4",
      thumbSrc: "",
      field: "video",
      category: "",
      project: "vishnu",
      assignedRoute: "/video/vishnu",
      title: "Vishnu regression",
      year: "2026",
      model: "Cross-device model",
      pairedBoxes: [],
      isHidden: false,
      isVideo: true,
      createdAt: new Date().toISOString(),
    });
  });
  await admin.page.getByText("Saved to server", { exact: true }).waitFor();
  assert.equal(revision, 1);
  const directVisitor = await context(false, 800);
  await directVisitor.page.addInitScript(() => {
    window.__sawTransient404 = false;
    window.__sawPrematureEmpty = false;
    document.addEventListener("DOMContentLoaded", () => {
      const check = () => {
        if (document.body?.textContent?.includes("NOT FOUND !")) window.__sawTransient404 = true;
        if (document.body?.textContent?.includes("More coming soon.")) window.__sawPrematureEmpty = true;
      };
      new MutationObserver(check).observe(document.body, { subtree: true, childList: true });
      check();
    });
  });
  await directVisitor.page.goto("http://127.0.0.1:8080/video/vishnu");
  await directVisitor.page.locator('video[src="https://example.com/vishnu.mp4"]').first().waitFor({ state: "attached" });
  assert.equal(await directVisitor.page.evaluate(() => window.__sawTransient404), false);
  assert.equal(await directVisitor.page.evaluate(() => window.__sawPrematureEmpty), false);
  console.log("PASS: Direct Vishnu URL never flashes a 404 or empty gallery while published content loads");
  const directProject = await context(false, 800);
  await directProject.page.goto("http://127.0.0.1:8080/photography/fashion-photography/sepidar", { waitUntil: "domcontentloaded" });
  await directProject.page.locator('[aria-label="Loading portfolio page"]').waitFor();
  await directProject.page.getByRole("heading", { name: "Sepidar", exact: true }).waitFor();
  console.log("PASS: Direct project URL waits for published UI selection before rendering");
  const visitor = await context();
  await visitor.page.goto("http://127.0.0.1:8080/video");
  await visitor.page.waitForFunction(async () => {
    const store = await import("/src/lib/vault-store.ts");
    return store
      .getVaultMedia()
      .some((m) => m.id === "custom-media-9999" && m.model === "Cross-device model");
  });
  console.log("PASS: Fresh browser loads published Vishnu metadata");
  await visitor.page.goto("http://127.0.0.1:8080/video/vishnu");
  await visitor.page
    .locator('video[src="https://example.com/vishnu.mp4"]')
    .first()
    .waitFor({ state: "attached" });
  console.log("PASS: Direct public video route renders the published upload");
  const unauth = await context();
  await unauth.page.goto("http://127.0.0.1:8080/vault/media");
  await unauth.page.getByPlaceholder("you@example.com").waitFor();
  console.log("PASS: Fresh browser requires a real login");
  failWrites = true;
  await admin.page.evaluate(async () => {
    const store = await import("/src/lib/vault-store.ts");
    const item = store.getVaultMedia().find((m) => m.id === "custom-media-9999");
    store.saveVaultMedia({ ...item, year: "2027" });
  });
  await admin.page.getByText("Not saved: Test network failure", { exact: true }).waitFor();
  assert.equal(
    JSON.parse(content.siavash_vault_media_v2).find((m) => m.id === "custom-media-9999").year,
    "2026",
  );
  await admin.page.reload();
  await admin.page.getByText("Not saved: Test network failure", { exact: true }).waitFor();
  assert.equal(await admin.page.getByRole("button", { name: "Export browser backup" }).count(), 0);
  assert.equal(
    await admin.page.getByRole("button", { name: "Recover and publish browser data" }).count(),
    0,
  );
  failWrites = false;
  await admin.page.getByRole("button", { name: "Retry save / connection" }).click();
  await admin.page.getByText("Saved to server", { exact: true }).waitFor();
  assert.equal(
    JSON.parse(content.siavash_vault_media_v2).find((m) => m.id === "custom-media-9999").year,
    "2027",
  );
  console.log("PASS: Reloaded failed save retries without the migration panel");

  const deletedBlog = await admin.page.evaluate(async () => {
    const store = await import("/src/lib/studio-store.ts");
    const posts = store.getStudioBlogPosts();
    posts.forEach((post) => store.deleteStudioBlogPost(post.slug));
    return {
      count: store.getMergedBlogPosts().length,
      found: Boolean(store.getBlogPostBySlug(posts[0].slug)),
    };
  });
  assert.equal(deletedBlog.count, 0, "Deleting every post must not restore built-in articles");
  assert.equal(deletedBlog.found, false, "Deleted built-in article must not resolve by slug");
  await admin.page.getByText("Saved to server", { exact: true }).waitFor();
  async function save(action, value) {
    const response = admin.page.waitForResponse((r) => r.url().includes("/rpc/save_vault_content"));
    await admin.page.evaluate(action, value);
    assert.equal((await response).status(), 200);
    await admin.page.getByText("Saved to server", { exact: true }).waitFor();
  }
  async function refresh(page) {
    const response = page.waitForResponse((r) => r.url().includes("/rest/v1/vault_content"));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await response;
  }
  await save(async () => {
    const store = await import("/src/lib/vault-store.ts");
    store.saveVaultPage({
      id: "custom-page-sync",
      route: "/video/vishnu",
      parentRoute: "/video",
      name: "Vishnu sync page",
      coverPhoto: "https://example.com/cover.jpg",
      coverModifiedByUser: true,
      descriptionEn: "Synced description",
      descriptionFa: "",
      uiType: "UI04",
      isHidden: false,
      pairedBoxes: [{ key: "Year", value: "2027" }],
      order: 99,
    });
  });
  await refresh(visitor.page);
  await visitor.page.getByRole("heading", { name: /^Vishnu sync page/ }).waitFor();
  await save(async () => {
    const store = await import("/src/lib/vault-store.ts");
    const page = store.getPageByRoute("/video/vishnu");
    store.saveVaultPage({ ...page, route: "/video/vishnu-renamed", name: "Renamed page" });
  });
  await refresh(visitor.page);
  await visitor.page.waitForFunction(async () => {
    const store = await import("/src/lib/vault-store.ts");
    return (
      store.getVaultMedia().find((m) => m.id === "custom-media-9999")?.assignedRoute ===
      "/video/vishnu-renamed"
    );
  });
  await visitor.page.goto("http://127.0.0.1:8080/video/vishnu-renamed");
  await visitor.page.getByRole("heading", { name: /^Renamed page/ }).waitFor();
  await save(async () => {
    const store = await import("/src/lib/vault-store.ts");
    const media = store.getVaultMedia().find((m) => m.id === "custom-media-9999");
    store.saveVaultMedia({ ...media, isHidden: true, model: "Updated model", year: "2028" });
  });
  await refresh(visitor.page);
  await visitor.page.waitForFunction(async () => {
    const store = await import("/src/lib/vault-store.ts");
    return (
      store.getVaultMedia().find((m) => m.id === "custom-media-9999")?.model === "Updated model" &&
      !store
        .getGalleryMediaForRoute("/video/vishnu-renamed")
        .some((m) => m.id === "custom-media-9999")
    );
  });
  await save(async () => {
    const store = await import("/src/lib/vault-store.ts");
    store.deleteVaultMedia("custom-media-9999");
    store.deleteVaultPage("custom-page-sync");
  });
  await refresh(visitor.page);
  await visitor.page.waitForFunction(async () => {
    const store = await import("/src/lib/vault-store.ts");
    return (
      !store.getVaultMedia().some((m) => m.id === "custom-media-9999") &&
      !store.getPageByRoute("/video/vishnu-renamed")
    );
  });
  console.log(
    "PASS: Page metadata, renames, media reassignment, visibility, and deletions reach another browser",
  );

  const blogAdmin = await context(true);
  await blogAdmin.page.goto("http://127.0.0.1:8080/vault/blog");
  await blogAdmin.page.getByText("Published content loaded", { exact: true }).waitFor();
  await save(async () => {
    const store = await import("/src/lib/studio-store.ts");
    store.saveStudioBlogPost({
      slug: "sync-check",
      title: "Sync test article",
      excerpt: "Cross-browser excerpt",
      contentMarkdown: "Cross-browser body",
      category: "my-blogs",
      categoryLabel: "My Blogs",
      coverImage: "",
      publishedAt: "2026-11-12",
      readTime: "1 min read",
      published: true,
    });
  });
  await refresh(blogAdmin.page);
  await blogAdmin.page.getByText("Sync test article", { exact: true }).waitFor();
  await visitor.page.goto("http://127.0.0.1:8080/blog/sync-check");
  await visitor.page.getByRole("heading", { name: "Sync test article", exact: true }).waitFor();
  await save(async () => {
    const store = await import("/src/lib/studio-store.ts");
    const post = store.getStudioBlogPosts().find((p) => p.slug === "sync-check");
    store.saveStudioBlogPost({ ...post, published: false });
  });
  await refresh(visitor.page);
  await visitor.page.getByRole("heading", { name: "Article Not Found", exact: true }).waitFor();
  await save(async () => {
    const store = await import("/src/lib/studio-store.ts");
    const post = store.getStudioBlogPosts().find((p) => p.slug === "sync-check");
    store.saveStudioBlogPost(
      { ...post, slug: "sync-check-renamed", published: true },
      "sync-check",
    );
  });
  await refresh(blogAdmin.page);
  const slugs = await blogAdmin.page.evaluate(async () =>
    (await import("/src/lib/studio-store.ts")).getStudioBlogPosts().map((p) => p.slug),
  );
  assert.deepEqual(slugs, ["sync-check-renamed"]);
  await visitor.page.goto("http://127.0.0.1:8080/blog/sync-check-renamed");
  await visitor.page.getByRole("heading", { name: "Sync test article", exact: true }).waitFor();
  await save(async () =>
    (await import("/src/lib/studio-store.ts")).deleteStudioBlogPost("sync-check-renamed"),
  );
  await refresh(visitor.page);
  await visitor.page.getByRole("heading", { name: "Article Not Found", exact: true }).waitFor();
  await visitor.page.goto("http://127.0.0.1:8080/blog");
  await visitor.page.getByRole("heading", { name: "No posts found", exact: true }).waitFor();
  await visitor.page.waitForFunction(async () => {
    const sync = await import("/src/lib/published-store.ts");
    const store = await import("/src/lib/studio-store.ts");
    return sync.isContentReady() && store.getMergedBlogPosts().length === 0;
  });
  const count = await visitor.page.evaluate(
    async () => (await import("/src/lib/studio-store.ts")).getMergedBlogPosts().length,
  );
  assert.equal(count, 0);
  console.log(
    "PASS: Blog create, admin refresh, unpublish, rename, and deletion sync without restoring deleted articles",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
