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
    window: new EventTarget(),
    document: { visibilityState: "visible" },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    fake: {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  async single() {
                    return { data: structuredClone(server), error: null };
                  },
                };
              },
            };
          },
        };
      },
      async rpc(_name, { expected_revision, next_content }) {
        if (server.fail) return { error: { message: "offline" } };
        if (expected_revision !== server.revision)
          return { error: { message: "Newer changes exist" } };
        server.content = structuredClone(next_content);
        return { data: ++server.revision, error: null };
      },
    },
  });
  const modules = new Map();
  async function module(name) {
    if (modules.has(name)) return modules.get(name);
    const source =
      name === "./supabase-client"
        ? 'export const supabase = fake; export async function requireVaultToken() { return "test"; }'
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
  return { api: entry.namespace, storage };
}

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
  assert.match(reopened.api.browserRecoverySnapshot().siavash_vault_pages_v2, /vishnu/);
  server.fail = false;
  await editor.api.flushContentSave();
  assert.equal(editor.api.getContentStatus(), "Saved to server");
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
});

test("read-time normalization does not cause a server write", async () => {
  const server = { revision: 0, content: {} };
  const reader = await browser(server);
  await reader.api.refreshPublishedContent();
  reader.api.contentStorage.setItem("siavash_vault_pages_v2", "[]");
  await reader.api.flushContentSave();
  assert.equal(server.revision, 0);
});
