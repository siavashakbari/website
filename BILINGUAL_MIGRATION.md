# Bilingual content migration and recovery

The source changes do **not** publish or convert the production Blob document. The public snapshot still uses `{ revision, content }`, where each `content` value is a JSON string. Supabase Auth, private invoices, uploads, and Vercel Blob ownership stay as they were.

The approved URL default is English. `/` and old unprefixed public URLs redirect to `/en`; `/fa` and `/en` select the public language. A missing translation displays the existing other-language text with its own direction, while Vault marks the field incomplete. Stored dates and numeric values remain unchanged; date display uses the Gregorian calendar in both languages.

The production `/sitemap.xml` route reads the published snapshot and excludes hidden or draft records. `scripts/generate-sitemap.mjs` is a local bundled-content preview written to the temporary directory; it does not publish a static sitemap.

## Deployment order

1. Deploy the server and client code together. The new server allowlists `siavash_site_content_v1`. An old running server rejects that key, so do not initialize Site Content before the new server is serving all traffic.
2. Export the current `/api/content` response to a private local `.local` file before any live edit. Keep the original export unmodified and outside version control. The export contains public portfolio data, but may still contain owner-authored details.
3. Run `node scripts/migrate-bilingual-content.mjs <backup.local>` for dry-run counts. To prepare a copy, pass a **new** output path ending in `.local`; the script refuses to overwrite an existing file. It does not call the content API or change the published revision.
4. Review the diff between the backup and prepared copy. Existing IDs, slugs, routes, assignments, hidden flags, tombstones, upload URLs, and `*Fa` values must remain. The script adds empty translation fields and stable metadata row IDs; it only copies text into Persian fields when the old text itself has predominantly Persian characters.
5. In the new Vault, open **Site Content**. Its first save is an explicit, one-time initialization of the Landing, About, and Contact collection. Review all prefilled fields, especially About timeline entries and translations, before saving. The public site keeps its legacy fixed-page copy until this step; no page load writes defaults.
6. Publish any prepared record migration only through the authenticated `/api/content` API using the backup's `revision` as `expected_revision`. A `409` means another edit won the race: export again, re-run the migration on the new snapshot, and review the new diff. Never force an old backup over a newer revision.

## Recovery

If an edit fails, use Vault's pending-save status and retry flow. To undo a successfully published migration, fetch the **current** snapshot first, compare it to the backup, and construct a compatible inverse change containing only the fields that should be restored. Submit it with the current `expected_revision`; a conflict requires another comparison. Keep the new server's compatible readers deployed during recovery. Do not blindly replace the whole public document or restore deleted assets/pages.

## Scope of the local checks

`node --test scripts/test-bilingual-migration.mjs` runs on copies with partial translations, duplicate metadata labels, draft posts, tombstones, and unknown fields. Local preview cannot prove production persistence without the connected Blob document and administrator session. Do not send real Contact or Brand Discovery submissions as tests.
