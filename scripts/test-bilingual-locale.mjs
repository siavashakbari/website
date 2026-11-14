import { test } from "node:test";
import assert from "node:assert/strict";
import { localeFromPath, localizedText, stripLocale, switchLocaleUrl, withLocale } from "../src/lib/locale.ts";
import { validateSnapshot } from "../src/lib/published-store-core.ts";

test("locale conversion preserves deep entity path, search and hash without double prefixes", () => {
  const path = "/photography/fashion-photography/sepidar/5826-PHOTOGRAPHY";
  assert.equal(withLocale(path, "fa"), `/fa${path}`);
  assert.equal(withLocale(`/en${path}`, "fa"), `/fa${path}`);
  assert.equal(stripLocale(`/fa${path}`), path);
  assert.equal(switchLocaleUrl(`https://example.com/fa${path}?view=grid#credits`, "en"), `/en${path}?view=grid#credits`);
  assert.equal(localeFromPath("/far/about"), null);
  assert.equal(withLocale("/api/content", "fa"), "/api/content");
  assert.equal(withLocale("/vault/media", "fa"), "/vault/media");
});

test("missing translations use existing text with its actual direction", () => {
  assert.deepEqual(localizedText("English caption", "", "fa"), { text: "English caption", lang: "en", missing: true });
  assert.deepEqual(localizedText("عکس", undefined, "en"), { text: "عکس", lang: "fa", missing: true });
  assert.deepEqual(localizedText("English", "فارسی", "fa"), { text: "فارسی", lang: "fa", missing: false });
});

test("new site content key is validated inside the existing string snapshot", () => {
  const valid = { siavash_site_content_v1: JSON.stringify({ version: 1, landing: { fields: [], links: [] }, about: { fields: [], links: [] }, contact: { fields: [], links: [] } }) };
  assert.doesNotThrow(() => validateSnapshot(valid));
  assert.throws(() => validateSnapshot({ siavash_site_content_v1: JSON.stringify({ version: 2 }) }), /Invalid site content/);
  assert.throws(() => validateSnapshot({ siavash_site_content_v1: { version: 1 } }), /Unexpected content key/);
});
