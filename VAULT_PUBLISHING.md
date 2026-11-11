Vault pages, media metadata, assignments, visibility, deletion markers, and public
Studio content now use Supabase's `vault_content` record. The browser store is a
view of published content; a pending snapshot is retained locally if a save fails.
The status above Vault's editor says **Saved to server** only after the database
acknowledges the write. Revision checks reject stale browser writes.

## Recover existing browser edits

1. Open the deployed site's `/vault/media` in the original browser and origin
   (including the same `www` hostname) containing the missing media.
2. Sign in with the existing Supabase administrator email and password. The old
   arbitrary three-character Vault key no longer authenticates.
3. Use **Export browser backup** first. This JSON backs up metadata; keep the
   original browser data intact because IndexedDB video bytes are not in that JSON.
4. Select **Recover and publish browser data**. This explicitly replaces the
   corresponding server collections with that browser's snapshot. It uploads
   IndexedDB/inline media and replaces device-only references with public URLs.
5. Wait for **Saved to server**, then verify from a separate browser or phone.

Original browser records and media blobs are preserved during recovery. If the
browser is missing a referenced blob, recovery fails visibly instead of publishing
a broken link. Do not run legacy recovery from an older browser over newer edits.

## Deployment and access

- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting build
  environment. These identify the same project as local `.env`.
- Apply `supabase/migrations/20261112_vault_content.sql` before deploying the app.
  It is already installed in the configured project as part of this repair.
- Authorized users must have `vault_admin: true` in **app_metadata**, set by an
  administrator through Supabase Auth's admin API or SQL, never user_metadata.
  The existing owner account was authorized during the repair.
- Only authenticated Vault admins may write content or upload media. Visitors can
  read portfolio content. Hidden flags are presentation controls, not private data
  access controls.
- Invoice archives and banking preferences retain their existing local behavior;
  they are excluded from the public portfolio database.
- Public pages refresh shared content after mounting, on focus, and every 30
  seconds. Existing server-rendered metadata/sitemaps still use bundled defaults.

## Verification

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-vm-modules --test scripts/test-published-store.mjs scripts/test-published-sync.mjs
npm run build
```

`scripts/test-vault-database.sql` exercises actual database authorization, revision
conflicts, and independent public reads inside a rolled-back transaction.

The browser regression uses mocked network responses and isolated Edge contexts;
it never writes test content to the live database. With `npm run dev` running:

```sh
npm install --prefix .output/browser-tools --no-save --package-lock=false --ignore-scripts --no-audit playwright
node scripts/test-vault-browser.mjs
```

`SUPABASE_ACCESS_TOKEN` is an optional local maintenance credential for
`scripts/supabase-admin.mjs`; never expose it with a `VITE_` prefix or deploy it as
a client credential. Revoke temporary repair tokens when finished.
