Vault pages, media metadata, assignments, visibility, deletion markers, and public
Studio content now use Supabase's `vault_content` record. The browser store is a
view of published content; a pending snapshot is retained locally if a save fails.
The status above Vault's editor says **Saved to server** only after the database
acknowledges the write. Revision checks reject stale browser writes.

## Save and refresh behavior

The one-time browser migration is complete and its export/recovery panel has been
removed. Historical browser collections are never automatically republished.

- Successful edits display **Saved to server**.
- Failed saves remain queued locally and can be retried after a reload. Vault
  attempts to resume its pending save when reopened; it never overwrites a newer
  server revision. Conflicts stay visible until resolved or explicitly discarded.
- Public pages and other Vault sessions refresh on focus, when the tab becomes
  visible, and every 30 seconds while visible. Other tabs also refresh when a save
  completes. Network reconnection retries an in-memory failed save.
- Pages, media details, assignments, covers, visibility, deletions, and blog edits
  share this persistence path. Deleted/unpublished articles no longer resolve via
  fallback defaults; renaming a blog slug replaces its previous record.
- The compact status indicator retains retry/discard controls only when needed.

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
