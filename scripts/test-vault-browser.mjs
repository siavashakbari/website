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
async function context(admin = false) {
  const ctx = await browser.newContext();
  await ctx.route(`${remote}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("/rest/v1/vault_content"))
      return route.fulfill({ json: { revision, content } });
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
  await admin.page
    .getByText("Unpublished edits are stored in this browser. Recover them before editing.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await admin.page.getByRole("button", { name: "Recover and publish browser data" }).count(),
    1,
  );
  console.log("PASS: Failed save remains recoverable after reload");
  failWrites = false;
  const legacy = await context(true);
  await legacy.page.goto("http://127.0.0.1:8080/vault/media");
  await legacy.page.getByText("Published content loaded", { exact: true }).waitFor();
  await legacy.page.evaluate(async () => {
    const store = await import("/src/lib/vault-store.ts");
    const db = await import("/src/lib/local-media-db.ts");
    const original = store.getVaultMedia().find((m) => m.id === "custom-media-9999");
    await db.putMediaBlob(
      "idb://legacy-vishnu.mp4",
      new Blob(["recovery-fixture"], { type: "video/mp4" }),
    );
    localStorage.setItem(
      "siavash_vault_media_v2",
      JSON.stringify([
        { ...original, imgSrc: "idb://legacy-vishnu.mp4", model: "Recovered original model" },
      ]),
    );
  });
  await legacy.page.reload();
  legacy.page.on("dialog", (dialog) => dialog.accept());
  await legacy.page.getByRole("button", { name: "Recover and publish browser data" }).click();
  await legacy.page.getByText("Saved to server", { exact: true }).waitFor();
  assert.equal(uploads, 1);
  assert.match(content.siavash_vault_media_v2, /Recovered original model/);
  assert.doesNotMatch(content.siavash_vault_media_v2, /idb:\/\//);
  await visitor.page.reload();
  await visitor.page.waitForFunction(async () => {
    const store = await import("/src/lib/vault-store.ts");
    return store
      .getVaultMedia()
      .some(
        (m) =>
          m.model === "Recovered original model" && m.imgSrc.includes("/storage/v1/object/public/"),
      );
  });
  console.log(
    "PASS: Original browser IndexedDB video and metadata recover to public cloud content",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
