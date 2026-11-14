import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PAGE_KEY = "siavash_vault_pages_v2";
const MEDIA_KEY = "siavash_vault_media_v2";
const BLOG_KEY = "siavash_studio_custom_blogs";

function isPersian(text) {
  const arabic = String(text || "").match(/[\u0600-\u06ff]/g)?.length || 0;
  const latin = String(text || "").match(/[a-z]/gi)?.length || 0;
  return arabic > latin;
}

function ifMissing(record, key, value) {
  if (record[key] === undefined) record[key] = value;
}

function normalizePairs(pairs) {
  if (!Array.isArray(pairs)) return pairs;
  return pairs.map((pair, index) => {
    if (!pair || typeof pair !== "object" || Array.isArray(pair)) return pair;
    const next = { ...pair };
    ifMissing(next, "id", `legacy-${index}`);
    ifMissing(next, "keyFa", isPersian(next.key) ? next.key : "");
    ifMissing(next, "valueFa", isPersian(next.value) ? next.value : "");
    return next;
  });
}

export function migrateBilingualSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || !Number.isInteger(snapshot.revision) || !snapshot.content || typeof snapshot.content !== "object" || Array.isArray(snapshot.content)) {
    throw new Error("Expected a { revision, content } published snapshot.");
  }
  const content = { ...snapshot.content };
  const counts = { pages: 0, media: 0, blogs: 0, metadataRows: 0, existingPersianValues: 0 };
  for (const [key, kind] of [[PAGE_KEY, "pages"], [MEDIA_KEY, "media"], [BLOG_KEY, "blogs"]]) {
    if (!(key in content)) continue;
    if (typeof content[key] !== "string") throw new Error(`Invalid ${key} value.`);
    const records = JSON.parse(content[key]);
    if (!Array.isArray(records)) throw new Error(`Expected ${key} to contain an array.`);
    const migrated = records.map((record) => {
      if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error(`Invalid record in ${key}.`);
      const next = { ...record };
      counts[kind]++;
      if (kind === "pages") {
        ifMissing(next, "nameFa", isPersian(next.name) ? next.name : "");
      } else if (kind === "media") {
        for (const field of ["title", "caption", "client", "model", "makeupArtist", "assistant"]) {
          ifMissing(next, `${field}Fa`, isPersian(next[field]) ? next[field] : "");
        }
        ifMissing(next, "altEn", "");
        ifMissing(next, "altFa", "");
      } else {
        for (const [base, translated] of [["title", "titleFa"], ["excerpt", "excerptFa"], ["contentMarkdown", "contentMarkdownFa"], ["seoDescription", "seoDescriptionFa"], ["categoryLabel", "categoryLabelFa"], ["coverAltEn", "coverAltFa"]]) {
          ifMissing(next, translated, isPersian(next[base]) ? next[base] : "");
        }
        if (next.author && typeof next.author === "object" && !Array.isArray(next.author)) {
          next.author = { ...next.author };
          ifMissing(next.author, "nameFa", isPersian(next.author.name) ? next.author.name : "");
          ifMissing(next.author, "bioFa", isPersian(next.author.bio) ? next.author.bio : "");
        }
      }
      if (Array.isArray(next.pairedBoxes)) {
        counts.metadataRows += next.pairedBoxes.length;
        next.pairedBoxes = normalizePairs(next.pairedBoxes);
      }
      for (const [field, value] of Object.entries(next)) {
        if (field.endsWith("Fa") && typeof value === "string" && value.trim()) counts.existingPersianValues++;
      }
      return next;
    });
    content[key] = JSON.stringify(migrated);
  }
  return { snapshot: { ...snapshot, content }, counts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const input = process.argv[2];
  const output = process.argv[3];
  if (!input) {
    console.error("Usage: node scripts/migrate-bilingual-content.mjs <exported-snapshot.json> [output.local]");
    process.exitCode = 2;
  } else {
    const source = JSON.parse(fs.readFileSync(input, "utf8"));
    const result = migrateBilingualSnapshot(source);
    const changed = Object.keys(result.snapshot.content).filter((key) => result.snapshot.content[key] !== source.content[key]);
    console.log(JSON.stringify({ dryRun: !output, revision: source.revision, changedCollections: changed, counts: result.counts }, null, 2));
    if (output) {
      if (fs.existsSync(output)) throw new Error("Output already exists; choose a new path to preserve the backup.");
      fs.writeFileSync(output, JSON.stringify(result.snapshot, null, 2), { encoding: "utf8", flag: "wx", mode: 0o600 });
    }
  }
}
