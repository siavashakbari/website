import { test } from "node:test";
import assert from "node:assert/strict";
import { migrateBilingualSnapshot } from "./migrate-bilingual-content.mjs";

test("migration preserves identities, tombstones, unknown fields, partial translations and duplicate metadata labels", () => {
  const source = {
    revision: 27,
    content: {
      siavash_vault_pages_v2: JSON.stringify([{ id: "page-1", route: "/photography/a", name: "نام پروژه", nameFa: "نام تاییدشده", descriptionEn: "Existing", descriptionFa: "موجود", isHidden: true, order: 3, pairedBoxes: [{ key: "Model", value: "Sara" }, { key: "Model", value: "Leila" }], futureField: { keep: 1 } }]),
      siavash_vault_media_v2: JSON.stringify([{ id: "media-1", assignedRoute: "/photography/a", title: "عکس", imgSrc: "/api/blob-media?path=media%2Fone.jpg", pairedBoxes: [{ key: "Name", value: "سارا" }] }]),
      siavash_studio_custom_blogs: JSON.stringify([{ slug: "story", title: "Story", titleFa: "داستان", published: false, author: { name: "Siavash", bio: "Bio" } }]),
      siavash_vault_deleted_pages_v1: '["deleted-1"]',
      future_collection: '{"keep":true}',
    },
  };
  const first = migrateBilingualSnapshot(source).snapshot;
  const second = migrateBilingualSnapshot(first).snapshot;
  assert.deepEqual(second, first);
  assert.equal(first.revision, 27);
  assert.equal(first.content.siavash_vault_deleted_pages_v1, source.content.siavash_vault_deleted_pages_v1);
  assert.equal(first.content.future_collection, source.content.future_collection);
  const page = JSON.parse(first.content.siavash_vault_pages_v2)[0];
  assert.equal(page.nameFa, "نام تاییدشده");
  assert.equal(page.isHidden, true);
  assert.equal(page.order, 3);
  assert.deepEqual(page.futureField, { keep: 1 });
  assert.deepEqual(page.pairedBoxes.map((pair) => pair.key), ["Model", "Model"]);
  assert.notEqual(page.pairedBoxes[0].id, page.pairedBoxes[1].id);
  const media = JSON.parse(first.content.siavash_vault_media_v2)[0];
  assert.equal(media.titleFa, "عکس");
  assert.equal(media.imgSrc, "/api/blob-media?path=media%2Fone.jpg");
  assert.equal(media.pairedBoxes[0].valueFa, "سارا");
  assert.equal(JSON.parse(first.content.siavash_studio_custom_blogs)[0].published, false);
});
