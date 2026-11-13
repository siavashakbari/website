import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveMediaTitle } from "../src/lib/media-title.ts";

const code = "1272-GRAPHIC-DESIGN-VISUAL-IDENTITY-MAANAAR";

test("manual Maanaar titles survive normalizing and clearing", () => {
  for (const title of [
    "Maanaar",
    "Media for Maanaar",
    "Maanaar — brand identity",
    "",
    code + ".JPG",
  ]) {
    assert.equal(
      resolveMediaTitle({ uniqueCode: "1272", title, titleModifiedByUser: true }, code, ".JPG"),
      title,
    );
  }
});

test("generated filenames still follow category and project changes", () => {
  assert.equal(resolveMediaTitle({ uniqueCode: "1272", title: "" }, code, ".JPG"), code + ".JPG");
  assert.equal(
    resolveMediaTitle(
      { uniqueCode: "1272", title: "1272-GRAPHIC-DESIGN-OLD-PROJECT.JPG" },
      code,
      ".JPG",
    ),
    code + ".JPG",
  );
  assert.equal(
    resolveMediaTitle({ uniqueCode: "1272", title: "Maanaar" }, code, ".JPG"),
    "Maanaar",
  );
});
