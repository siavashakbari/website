import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";

// Each VM has its own browser memory and storage; only the fake server is shared.
async function browser(server, initialStorage = {}) {
  const storage = new Map(Object.entries(initialStorage));
  const context = vm.createContext({
    console,
    Event,
    EventTarget,
    queueMicrotask,
    setTimeout,
    clearTimeout,
    window: Object.assign(new EventTarget(), { location: { pathname: "/en" }, setTimeout, clearTimeout }),
    document: { visibilityState: "visible" },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    async fetch(path, options = {}) {
      assert.equal(path, "/api/content");
      if (options.method === "POST") {
        const { expected_revision, next_content } = JSON.parse(options.body);
        if (server.fail) return Response.json({ error: "offline" }, { status: 503 });
        if (expected_revision !== server.revision)
          return Response.json({ error: "Newer changes exist" }, { status: 409 });
        server.content = structuredClone(next_content);
        return Response.json({ revision: ++server.revision });
      }
      return Response.json(structuredClone(server));
    },
  });
  const modules = new Map();
  async function module(name) {
    if (modules.has(name)) return modules.get(name);
    const source =
      name === "./supabase-client"
        ? 'export async function requireVaultToken() { return "test"; }'
        : ts.transpileModule(fs.readFileSync(`src/lib/${name.replace("./", "")}.ts`, "utf8"), {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
          }).outputText;
    const result = new vm.SourceTextModule(source, { context });
    modules.set(name, result);
    await result.link(module);
    return result;
  }
  const entry = await module("./published-store");
  await entry.evaluate();
  return { api: entry.namespace, storage, async siteContent() {
    const site = await module("./site-content");
    await site.evaluate();
    return site.namespace;
  } };
}

test("landing and shared menu edits survive publication and a fresh visitor load", async () => {
  const server = { revision: 7, content: {} };
  const editor = await browser(server);
  const site = await editor.siteContent();
  const legacy = structuredClone(site.SITE_SEED);
  delete legacy.landingCopyRevision;
  legacy.landing.links = [];
  legacy.landing.fields.find(field => field.id === "role1").value.en = "Multi-disciplinary Designer";
  server.content[site.SITE_CONTENT_KEY] = JSON.stringify(legacy);
  await editor.api.refreshPublishedContent();
  const draft = site.readSiteContent();
  const role = draft.landing.fields.find(field => field.id === "role1");
  assert.equal(role.value.en, "Photography, Visual Identity Design");
  role.value.en = "Multi-disciplinary Designer";
  draft.landing.fields.find(field => field.id === "nav-home").value.fa = "خانه من";
  draft.landing.links[0].href = "/about";
  draft.landing.links[0].label.en = "Meet me";
  draft.appearance = { outline: 0.3, "counter-weight": 300, fill: 48 };
  assert.throws(() => site.publishSiteContent({ ...draft, appearance: { outline: -1 } }));
  site.publishSiteContent(draft);
  await editor.api.waitForPublishedContentSave();
  const visitor = await browser(server);
  await visitor.api.refreshPublishedContent();
  const publicSite = await visitor.siteContent();
  assert.deepEqual(JSON.parse(JSON.stringify(publicSite.readSiteContent())), JSON.parse(JSON.stringify(draft)));
  assert.equal(publicSite.siteField("landing", "nav-home", "fa").text, "خانه من");
  assert.equal(server.revision, 8);
});

test("media metadata survives independent browser loads; visitors do not publish legacy state", async () => {
  const server = { revision: 0, content: {} };
  const editor = await browser(server);
  await editor.api.refreshPublishedContent();
  const key = "siavash_vault_media_v2";
  const value = JSON.stringify([
    {
      id: "vishnu",
      model: "Model",
      year: "2026",
      assignedRoute: "/video/vishnu",
      imgSrc: "https://example.com/vishnu.mp4",
    },
  ]);
  editor.api.contentStorage.setItem(key, value);
  editor.api.queueContentSave();
  await editor.api.flushContentSave();
  assert.equal(editor.api.getContentStatus(), "Saved to server");
  const mobile = await browser(server, { [key]: '[{"id":"stale-browser"}]' });
  await mobile.api.refreshPublishedContent();
  assert.equal(mobile.api.contentStorage.getItem(key), value);
  assert.equal(server.revision, 1);
  assert.equal(mobile.storage.get(key), '[{"id":"stale-browser"}]');
});

test("offline saves remain recoverable after reload and are not shown as saved", async () => {
  const server = { revision: 0, content: {}, fail: true };
  const editor = await browser(server);
  await editor.api.refreshPublishedContent();
  editor.api.contentStorage.setItem("siavash_vault_pages_v2", '[{"route":"/video/vishnu"}]');
  editor.api.queueContentSave();
  await editor.api.flushContentSave();
  assert.match(editor.api.getContentStatus(), /Not saved: offline/);
  assert.equal(server.revision, 0);
  const reopened = await browser(server, Object.fromEntries(editor.storage));
  await reopened.api.refreshPublishedContent();
  assert.equal(reopened.api.hasPendingRecovery(), true);
  assert.match(
    JSON.parse(reopened.storage.get("siavash_pending_public_content_v1")).content
      .siavash_vault_pages_v2,
    /vishnu/,
  );
  server.fail = false;
  await reopened.api.retryContentSave();
  assert.equal(reopened.api.getContentStatus(), "Saved to server");
  assert.match(server.content.siavash_vault_pages_v2, /vishnu/);
});

test("stale editor cannot overwrite changes from another browser", async () => {
  const server = { revision: 0, content: {} };
  const first = await browser(server);
  const second = await browser(server);
  await first.api.refreshPublishedContent();
  await second.api.refreshPublishedContent();
  first.api.contentStorage.setItem("siavash_vault_pages_v2", '[{"name":"newer"}]');
  first.api.queueContentSave();
  await first.api.flushContentSave();
  second.api.contentStorage.setItem("siavash_vault_pages_v2", '[{"name":"stale"}]');
  second.api.queueContentSave();
  await second.api.flushContentSave();
  assert.match(second.api.getContentStatus(), /Not saved: Newer/);
  assert.match(server.content.siavash_vault_pages_v2, /newer/);
  const reopened = await browser(server, Object.fromEntries(second.storage));
  await reopened.api.refreshPublishedContent();
  await reopened.api.retryContentSave();
  assert.match(reopened.api.getContentStatus(), /Not saved: Newer/);
  assert.match(server.content.siavash_vault_pages_v2, /newer/);
  await reopened.api.discardPendingContentSave();
  assert.equal(reopened.api.hasPendingRecovery(), false);
  assert.match(reopened.api.contentStorage.getItem("siavash_vault_pages_v2"), /newer/);
});

test("read-time normalization does not cause a server write", async () => {
  const server = { revision: 0, content: {} };
  const reader = await browser(server);
  await reader.api.refreshPublishedContent();
  reader.api.contentStorage.setItem("siavash_vault_pages_v2", "[]");
  await reader.api.flushContentSave();
  assert.equal(server.revision, 0);
});
