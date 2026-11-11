import assert from "node:assert/strict";
import { test } from "node:test";
import { commitSnapshot, validateSnapshot } from "../src/lib/published-store-core.ts";

test("an independent reader receives uploaded media metadata and page assignments", async () => {
  let server = { revision: 0, data: {} };
  const write = async (data, revision) => {
    assert.equal(revision, server.revision);
    server = { revision: revision + 1, data: structuredClone(data) };
    return server.revision;
  };
  const data = {
    siavash_vault_media_v2: JSON.stringify([
      {
        id: "vishnu",
        imgSrc: "https://storage.example/vishnu.mp4",
        model: "Model",
        year: "2026",
        assignedRoute: "/video/vishnu",
      },
    ]),
  };
  assert.equal(await commitSnapshot(data, 0, write), 1);
  const otherBrowser = structuredClone(server.data);
  assert.equal(JSON.parse(otherBrowser.siavash_vault_media_v2)[0].model, "Model");
  await assert.rejects(commitSnapshot({}, 0, write));
  assert.deepEqual(server.data, data);
});

test("failed requests never report a completed save", async () => {
  await assert.rejects(
    commitSnapshot({}, 0, async () => {
      throw new Error("offline");
    }),
    /offline/,
  );
});

test("private records and device-only media cannot be published", () => {
  assert.throws(() => validateSnapshot({ siavash_studio_invoices_archive: "[]" }));
  for (const src of ["idb://vishnu", "blob:https://example/123"]) {
    assert.throws(() =>
      validateSnapshot({ siavash_vault_media_v2: JSON.stringify([{ imgSrc: src }]) }),
    );
  }
});
