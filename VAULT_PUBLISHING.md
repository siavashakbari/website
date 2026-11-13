# Vault publishing

The website has one live content source: a private Vercel Blob store connected to
the production project. `vault/published-content.json` holds portfolio pages,
media metadata and assignments, project styles, and blog posts. The server reads
this document before rendering a public route, then embeds the same revision in
the initial HTML. Vault edits save through `/api/content` with a revision and a
strong Blob ETag; conflicting edits are rejected instead of replacing newer data.

`vault/private-content.json` holds invoice history, bank-card presets, and the
default invoice. `/api/private-content` requires a Supabase Auth user with
`vault_admin: true` in `app_metadata`. Supabase Auth remains the Vault login.
Older invoices saved in the owner's browser can be merged into the private
document with **Import older records from this browser** on `/vault/invoices`.
The local records are never automatically published.

New photos upload to the same private Blob store using short-lived signed URLs
and are delivered through `/api/blob-media`. Supabase Storage's `vault-media`
bucket is reserved for videos. Its insert policy accepts only administrator
uploads ending in `.mp4`, `.webm`, or `.mov`. The old Supabase `vault_content`
table and publishing function have been removed after archiving their contents
inside the private Vercel store.

## Runtime configuration

- Vercel connects the private Blob store to the project for Production. New
  connections use OIDC, which provides `BLOB_STORE_ID` and a short-lived server
  identity without a `BLOB_READ_WRITE_TOKEN` environment variable.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` identify the Supabase project
  used for Vault login and video storage. These are public browser credentials.
- Local maintenance uses `VAULT_BLOB_READ_WRITE_TOKEN` in ignored `.env.local`.
  Never commit it or give it a `VITE_` prefix. Production uses OIDC instead.
- `SUPABASE_ACCESS_TOKEN` is a local Management API credential, never deployed.

## Save and recovery behavior

- Vault shows **Saved to server** only after a Vercel Blob write succeeds.
- Failed public-content saves stay in a local pending outbox and can be retried.
  A newer server revision is never silently overwritten.
- Public pages do not use bundled defaults or old browser content while waiting
  for the published document. HTML responses are marked `no-store`.
- Private invoice edits save through their separate authenticated API. Use the
  import control in the original browser once if it has older local invoices.

## Verification

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-vm-modules --test scripts/test-published-store.mjs scripts/test-published-sync.mjs
npm run build
node scripts/test-vault-ssr-first-render.mjs
```

The last command needs the ignored local Blob token. It checks that current
photo, project, blog, and video content appears in the first HTML response.
