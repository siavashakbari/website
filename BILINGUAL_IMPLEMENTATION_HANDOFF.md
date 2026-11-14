# FA/EN website and Vault implementation handoff

Prepared from a read-only inspection of this repository on 2026-11-14. This file is a specification, not evidence that the feature is implemented or that production storage has been inspected. Recheck the current source before editing; it may have changed since this handoff.

## 1. Objective and scope

Implement a fully bilingual Persian/English public website, with editable bilingual content managed through the existing Vault and its current publishing infrastructure.

The owner has approved these requirements:

1. All visitor-facing text/data on Vault media, portfolio page, and blog cards must support independently editable English and Persian versions, including their text boxes and custom metadata.
2. Replace section-specific public language controls with one global language switch in the top bar beside the logo.
3. Use `/en` and `/fa` URL prefixes. Never use `/far`.
4. Build proper LTR English and RTL Persian layouts throughout the public website.
5. Add a Vault menu for managing the content of the landing, About, and Contact pages.

The landing-page visual redesign is a separate future phase. Preserve its current composition and behavior while making its content editable and bilingual. Do not invent a redesign, replace the framework, rebuild the CMS, or change storage providers.

This handoff does not authorize deployments, production data replacement, or sending form submissions/messages to real recipients as tests. Prepare implementation and safe verification; distinguish any live migration still needing execution.

## 2. Current architecture: facts to preserve

### Framework and routes

- React 19, TypeScript, TanStack Start and TanStack Router with file-based routes; Vite 8 and Tailwind CSS 4.
- Motion handles animations; Radix dropdown primitives and Lucide icons are already installed.
- Read `src/routes/README.md`. This is not Next.js. Do not create Next.js `app/layout.tsx`, a `src/pages` router, or an unrelated application shell.
- `src/routes/__root.tsx` contains the document shell, public navigation, logo, footer integration, published-content hydration, error UI, and shared SEO. Its document currently has `lang="en"`.
- `src/router.tsx` configures the router. `src/routeTree.gen.ts` is generated: regenerate using the project tooling, never maintain it by hand.
- `src/start.ts`, `src/server.ts`, and `src/lib/published-store-server.ts` participate in server rendering. Published snapshots are isolated per request using AsyncLocalStorage. HTML responses are marked `no-store`.

Current public route files:

| Route file under `src/routes/` | Current URL role |
| --- | --- |
| `index.tsx` | Landing `/` |
| `about.tsx`, `contact.tsx` | About and Contact |
| `blog.index.tsx`, `blog.$slug.tsx` | Blog listing and post |
| `$discipline.index.tsx` | Top-level portfolio discipline |
| `$discipline.$specialty.index.tsx` | Specialty listing |
| `$discipline.$specialty.$project.index.tsx` | Project page |
| `$discipline.$specialty.$project.$photoId.tsx` | Project media detail |
| `$discipline.$photoId.tsx` | Flat/legacy media detail |
| `brand-discovery.tsx` | Public brand-discovery form and export flow |

Private/editor routes include `vault.tsx`, `vault.index.tsx`, `vault.pages.tsx`, `vault.media.tsx`, `vault.blog.tsx`, and `vault.invoices.tsx`. Older `admin*.tsx` routes also exist: inspect their current behavior before changing them; do not remove them as incidental cleanup.

### Storage: critical distinction

Read `VAULT_PUBLISHING.md` before touching persistence.

**The current live content architecture is Vercel Blob publishing, not the old Supabase content table.** The owner refers to the recently created storage/database structure; preserve the structure actually used by this repository.

| Concern | Current implementation |
| --- | --- |
| Public portfolio content | Private Vercel Blob document `vault/published-content.json` |
| Public content API | `src/routes/api.content.ts`: public GET, administrator-authenticated POST |
| Server document access | `src/lib/vercel-blob-content.server.ts` |
| Client state, save queue, recovery, hydration | `src/lib/published-store.ts` |
| Snapshot allowlist and validation | `src/lib/published-store-core.ts` |
| Vault identity | Supabase Auth; administrator requires `app_metadata.vault_admin === true` |
| Private invoices/banking/default invoice | Separate `vault/private-content.json` and `/api/private-content` |
| New photos | Private Vercel Blob uploads; delivery through `/api/blob-media` |
| Videos | Supabase Storage `vault-media` bucket |
| File cleanup | `/api/media-cleanup`, `src/lib/media-cleanup.ts`, and `src/lib/managed-media.ts` |

- The public snapshot has shape `{ revision, content }`; `content` is a `Record<string, string>` whose values contain serialized JSON. Do not silently switch that wire format to nested objects.
- Writes use expected revisions and strong Blob ETags. Conflicts must remain conflicts, never silent last-writer-wins overwrites.
- Failed saves have a local recovery outbox. Local storage/IndexedDB are not the authoritative public CMS.
- “Saved to server” must mean an actual successful server write.
- Initial public HTML and hydration use the same published revision. Do not replace server content with bundled sample defaults while loading or after an outage.
- The migration `20261113_remove_legacy_vault_content.sql` removes the old `vault_content` table and `save_vault_content` RPC. The older `20261112_vault_content.sql` describes historical infrastructure. Do not recreate it for translations.
- Preserve the video upload/delete policies, server authentication, upload processing, and reference-aware cleanup.
- Public content is delivered publicly even though its backing Blob document is private. Never put invoices, banking details, credentials, contact submissions, or other private records in it.
- Never read credentials into logs, commit environment files, or put secret tokens in `VITE_*` variables.

The existing public collection allowlist is:

```text
siavash_vault_pages_v2
siavash_vault_media_v2
siavash_vault_deleted_pages_v1
siavash_vault_deleted_media_v1
siavash_studio_custom_projects
siavash_studio_deleted_projects
siavash_custom_photo_assets_v2
siavash_portfolio_inventory_v3
siavash_custom_taxonomy_v2
siavash_studio_custom_blogs
```

New site-page content must enter this same publishing pipeline through an explicitly allowed, validated collection. Trace every allowlist, reader, writer, hydration path, recovery path, and media-reference consumer when adding it.

### Content models and rendering

- `src/lib/vault-store.ts` owns `VaultPageItem`, `VaultMediaItem`, hierarchy, assignments, visibility, ordering, and media detail URL construction.
- `VaultPageItem` currently has a single `name`, bilingual `descriptionEn`/`descriptionFa`, shared `route`/`parentRoute`, cover, UI type, visibility, order, and `pairedBoxes`.
- `VaultMediaItem` currently has single-language `title`/`caption`, optional client/model/makeupArtist/assistant, shared identity/codes/taxonomy/assignment/media URLs, visibility, and `pairedBoxes`.
- `src/components/vault/PairedBoxesEditor.tsx` currently models each pair as `{ key: string; value: string }` and supports boxes and JSON editing. Both the displayed key and value need translation support; preserve editing capabilities.
- `src/lib/studio-store.ts` owns project/blog readers and writers, inventory and taxonomy integration, and change notifications. Follow actual runtime consumers, not just interfaces.
- `src/types/admin.ts` includes `StudioProjectItem` and `StudioBlogItem`. Blog already has fields such as `titleFa`, `excerptFa`, `contentMarkdownFa`, `aiSummaryFa`, and `tagsFa`; not every field is bilingual.
- `src/types/portfolio-schema.ts` also describes project/asset/credit/SEO types. Check which types are actually used before treating this file as the sole schema.
- `src/data/*` contains bundled content and assets. Existing content and any existing translations must survive migration; do not substitute bundled defaults for the current published document.
- `src/lib/taxonomy.ts`, `src/lib/media-title.ts`, and `src/lib/inventory-assets.ts` affect lookup, naming, and asset resolution.
- `src/components/ui-types/` contains four portfolio layouts: vertical scroll, horizontal scroll, equal cards grid, and video showcase, plus shared headers/navigation.
- `src/components/DedicatedPhotoView.tsx`, `CoverTile.tsx`, `AdaptiveThumb.tsx`, and the gallery/video components are additional public consumers.
- `src/lib/media-sizing.ts` and `webcodecs-transcoder.ts` implement media processing. Bilingual work is not a reason to alter image sizing, aspect ratios, video encoding, or upload quality.

### Existing language behavior

- About has local language state, a local switch, and substantial existing bilingual copy, timeline entries, filters, and skills in `src/routes/about.tsx`.
- Blog listing and detail have local language state/switches and the legacy browser preference `siavash_blog_lang`.
- Contact currently contains mixed-language content and an alternating FA/EN headline. `ContactForm.tsx` also contains bilingual labels. Do not assume Contact has the same switch implementation as About; audit the actual UI.
- `brand-discovery.tsx` has language-related behavior and Persian PDF support. Include this public route in the global-language audit while preserving submission/export contracts.
- Landing content is currently largely in `src/routes/index.tsx`, with `DisciplinesMarquee` and `MorphingText` as related components.
- Satoshi and Peyda font assets already exist under `src/assets/fonts/`; inspect `src/styles.css` and existing `font-farsi` usage before adding fonts.

## 3. Product decisions not yet approved

The owner approved `/fa`, but has not selected a default language, missing-translation policy, or calendar convention. Do not describe recommendations as approved decisions.

Before finalizing routing/migration behavior, ask one concise bundled question covering default language and missing translations. Meanwhile implement independent scaffolding and preserve all existing data.

Suggested choices for review:

- Default English for `/` and unprefixed legacy URLs, to preserve the current general entry behavior.
- Missing translation: show the existing other-language content with correct local `lang`/`dir`, and flag the missing translation in Vault; do not silently fabricate translations. Alternative: require translation completion before publication.
- Keep stored dates/numbers unchanged; localize display without silently introducing a Persian-calendar conversion.

Do not block unrelated implementation on these decisions. Do not publish a migration that assumes an unanswered product choice.

## 4. Bilingual content requirements

### Model design

Create one consistent typed localization model and centralized accessors. A possible shape is `LocalizedText = { en: string; fa: string }`; additive compatible fields are also acceptable if they better fit existing storage. Choose one strategy, document it, and support old records explicitly.

Separate translatable presentation from shared machine identity:

- Translate/edit titles, display names, descriptions, captions, alternative text, credits/roles/display names, custom metadata keys and values, taxonomy labels, excerpts, article body, author display content, tags, summaries, SEO titles/descriptions, and other visitor-facing text actually present.
- Keep stable IDs, slugs, assigned routes, parent routes, unique/dynamic codes, asset URLs, dimensions, booleans, timestamps, ordering, and taxonomy identifiers shared unless a specific requirement says otherwise.
- One media/page/post remains one entity with two language versions. Do not duplicate entities or uploads per language.
- Treat custom metadata as structured rows with stable identity, shared order, and localized labels/values. Do not use translated labels as identity or drop rows with duplicate display labels during JSON round trips.
- Lists/sections need stable IDs so editing one translation does not detach the other. Preserve shared hierarchy and relationships.
- Real names may have editable Persian and English display forms; URLs/email addresses/codes stay machine-readable and are not “translated.”
- Preserve every existing `*Fa` field and existing English value. Do not overwrite translations with generated copy or infer all old single-language values are English without inspecting them.

### Vault editors

- Update Media, Pages, and Blog editing surfaces, including nested text boxes, metadata, preview, save/load, and JSON import/export where present.
- Provide clearly labeled English and Persian inputs, using English LTR/Satoshi and Persian RTL/Peyda styling as appropriate.
- Tabs or paired panels are acceptable. Switching an editor language must not erase unsaved values. Editor tabs are allowed; they are not public website language switches.
- Show translation completeness/missing fields without confusing fallback content with saved translation.
- Saving one language must preserve the other and all shared fields.
- Preserve current server save/error/conflict/retry semantics and change notifications.
- Translation edits must survive reloads and appear to a fresh public visitor, not only to the editing browser.
- Keep hidden/deleted/draft content behavior intact in both locales. Do not accidentally publish blog drafts through a new reader or sitemap.

## 5. Global routing and switch

Expected examples:

```text
/en                         /fa
/en/about                   /fa/about
/en/contact                 /fa/contact
/en/blog                    /fa/blog
/en/blog/<same-slug>         /fa/blog/<same-slug>
/en/photography/fashion-photography/sepidar
/fa/photography/fashion-photography/sepidar
```

- Use locale-aware TanStack file routing, validate the locale against exactly `en | fa`, and centralize locale/path helpers.
- The URL determines public language on the server and client. Local storage must never override an explicit `/fa` or `/en` URL.
- Switching replaces only the locale segment, preserving the corresponding page/entity, relevant search parameters, and hash. Do not send every switch back to the homepage.
- Keep stored Vault route keys and taxonomy identity locale-neutral. Add/remove locale at navigation boundaries so assignment, ancestor visibility, and page lookup still work.
- Audit all links: logo, navigation/dropdowns, footer, discipline cards, project/media navigation, blog links, breadcrumbs, share URLs, CTA links, canonical paths, and previews.
- Avoid collisions between a new locale segment and the current dynamic `$discipline` routes. Explicitly test flat and deeply nested portfolio paths.
- Preserve old public URLs through deliberate redirects after the default language is settled. Avoid loops and double prefixes. Unknown locales and genuinely unknown paths must not silently become unrelated pages.
- Keep `/vault`, `/admin`, `/api/*`, assets, robots, and sitemap endpoints outside public locale routing. Do not localize upload/API URLs or introduce `/fa/api/content`.
- Add one accessible global language switch beside the logo in desktop/mobile public navigation. Label the target language clearly; keyboard access and focus must work.
- Remove public page-local switches and competing language state/preferences. Contact's alternating/mixed-language content must honor the selected locale.
- The Vault interface itself need not be completely translated as part of this scope; its bilingual content editors are required.

## 6. RTL/LTR and typography

- Render `<html lang="fa" dir="rtl">` or `<html lang="en" dir="ltr">` correctly in initial HTML, not only in an after-mount effect.
- Keep locale state request-scoped; simultaneous FA/EN requests must not leak language into each other.
- Prefer logical CSS properties and direction-aware component alignment. Audit margins, padding, borders, dropdown anchors, nav order, arrows, breadcrumbs, forms, overlays, and absolute positioning.
- Do not mirror photos, logos, video content, or every icon indiscriminately. Mirror directional navigation where semantics require it.
- Test horizontal scrolling, drag/gesture behavior, carousel controls, About timeline, and scroll calculations in real RTL browsers; changing `text-align` is insufficient.
- Use Persian typography without English uppercase/tracking conventions that damage Persian readability.
- Keep emails, URLs, codes, technical numbers, and appropriate controls in isolated LTR spans/inputs (`bdi` or explicit direction). Fallback-language blocks need their own direction.
- Localize form labels, placeholders, validation/success/error messages, empty/loading/not-found states, navigation text, accessibility labels, and relevant public tooltips. Keep API enum values and payload contracts stable.
- Preserve reduced-motion behavior, keyboard navigation, focus order, readable line height, and responsive layouts.
- Preserve user-entered form values when switching if practical; never submit a form merely because language changed.

## 7. New Vault site-page management

Add an obvious menu entry such as **Site Content**, with separate Landing, About, and Contact editors. Keep the existing portfolio Pages hierarchy distinct from these fixed site pages.

Use typed structured content, not an unrestricted HTML/code editor. At minimum cover current editable editorial content:

| Page | Content to model after inventorying the current JSX |
| --- | --- |
| Landing | Headings, role/morphing text, supporting copy, CTA labels/targets where present, hero asset and alt text, visible discipline/feature content, SEO |
| About | Intro, timeline/milestones, categories/filter labels, dates/period display text, roles/descriptions, skills and section labels, related links/media, SEO |
| Contact | Headings, introduction, location and contact display information, social links, form introductory/help text and editable option labels, CTA labels, SEO |

- Expose the actual content of the existing pages; do not invent sections or add a generic page-builder system.
- Separate shared structured settings from localized text. Reordering or deleting a section must preserve predictable bilingual relationships.
- Fixed interface messages can use typed translation dictionaries; owner-managed editorial content must come from the published Vault model.
- Existing working contact destinations and form backend behavior must be preserved. Editable display contact details are not credentials or backend delivery configuration.
- Seed existing hardcoded content through an explicit, idempotent migration into the published model. Preserve existing Persian About content and contact copy.
- Public renderers must consume this published content through the same SSR/hydration/revision flow as other Vault content.
- Missing new collections in an old snapshot need an explicit upgrade/loading/recovery path, not silent production defaults or an automatic write on every page load.
- If site-page content references managed images, update media reference checks so cleanup cannot delete an image still used by Landing/About/Contact or either translation.

## 8. Migration and safety requirements

1. Inspect the current working tree and applicable repository instructions. Preserve unrelated user changes.
2. Inventory runtime fields and consumers; explain the selected model and migration mapping before broad edits.
3. Build an idempotent migration/compatibility layer using realistic old snapshots, including partially translated records. Preserve unknown fields where safe, all IDs, relationships, tombstones, visibility, ordering, and media references.
4. Back up/export the current published snapshot securely before any live conversion. Do not commit private data or secrets.
5. Test migration on fixtures/copies first. Include dry-run counts, validation, and a recovery procedure.
6. Coordinate schema validation and deployment order: an old running server may reject a new allowlisted content key. Avoid partially deployed readers/writers or old clients dropping new fields.
7. Use the existing authenticated revision/ETag write path for any eventual publication. Do not bypass concurrency to force a migration.
8. Do not restore deleted assets/pages, repopulate defaults over live content, re-upload all assets, erase existing translations, or mix private invoices into a public migration.
9. Explain rollback with compatible readers and revision-aware content recovery; do not propose blind overwriting of newer edits with an old backup.

## 9. Suggested implementation sequence

1. Map content, routes, current localization, storage consumers, and initial test baseline.
2. Resolve default-language/fallback decisions; independent work can continue meanwhile.
3. Introduce types, locale helpers, compatibility readers, migration tooling, and focused migration tests.
4. Integrate bilingual Vault editors and site-page content with the existing persistence pipeline.
5. Introduce locale-prefixed public routes, server-derived locale, global switch, and locale-aware links.
6. Wire all public renderers to localized content; remove local switches/state; finish RTL and UI translations.
7. Update SEO/sitemaps and reference-aware media cleanup for new content.
8. Run regression, SSR, persistence, accessibility, and responsive checks; report remaining translation or live-migration work honestly.

Avoid unrelated refactors. Do not call the job complete after adding only the switch, only translations, or only Vault fields.

## 10. SEO and discovery

Inspect `src/lib/seo.ts`, route `head` handlers, `scripts/generate-sitemap.mjs`, `src/routes/sitemap[.]xml.ts`, and `src/routes/robots[.]txt.ts`.

- Each localized public page needs the correct title/description, canonical URL, reciprocal `hreflang` links, Open Graph locale, share URL, and applicable structured data.
- Persian pages must not all canonicalize to English pages.
- Include valid published localized URLs in sitemap generation; preserve hidden/draft filtering and dynamic Vault content coverage.
- Set `x-default` consistently with the approved default-language strategy.
- Define handling of incomplete translations consistently with fallback/publication policy; do not advertise nonexistent translations.
- Check localized metadata in initial server HTML, not only the hydrated DOM.

## 11. Verification and acceptance criteria

Existing verification commands documented in the repository:

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-vm-modules --test scripts/test-published-store.mjs scripts/test-published-sync.mjs
npm run build
node scripts/test-vault-ssr-first-render.mjs
```

The SSR test requires local Blob credentials. Inspect test scripts before running them and use an isolated environment for any mutation checks. Other scripts such as `test-all-vault-connectivity.mjs` and `test-all-routes-live.mjs` may need route updates and configuration. Run relevant lint checks; distinguish pre-existing failures from new ones. Never expose tokens in output.

Add focused tests for substantive risks: migration preservation/idempotency, localized route conversion, fallback resolution, conflict handling, and new collection persistence. Do not merely assert your own implementation constants.

Required acceptance evidence:

- Direct requests to both localized landing/About/Contact/blog/portfolio/media/brand-discovery routes render the correct language/direction without hydration mismatch or a flash of the wrong language.
- Concurrent FA/EN SSR requests stay isolated and use the published content snapshot correctly.
- The single public switch is beside the logo on mobile and desktop; switching twice returns to the same entity/path and preserves applicable query/hash state.
- Legacy links redirect correctly; APIs, Vault login, uploads, and private invoice routes remain functional.
- Edit FA and EN independently on a media card, portfolio page, blog post, and each new fixed-page editor. Save, reload the editor, and verify both public language URLs in a fresh session.
- Custom paired metadata survives boxes/JSON editing with both localized labels and values intact.
- Existing partial translations, codes, assignments, ordering, hidden/deleted flags, and uploaded URLs survive migration. Re-running migration produces no duplicates or data loss.
- A stale-tab conflict and failed-save/retry preserve both languages and do not report false success.
- Media cleanup retains files referenced by the new site-page content and by either language.
- Blog drafts/hidden pages remain excluded as before. Private financial content never enters public API/HTML.
- Check all four portfolio UI types, dedicated photo view, About timeline, dropdowns, footer, Contact form, and brand-discovery flow at narrow mobile and desktop widths in both directions.
- Verify correct Persian shaping, mixed-direction text, keyboard/focus behavior, reduced motion, no text clipping, and no unintended horizontal overflow.
- Contact/brand-discovery validation and export behavior remain correct. Mock outbound submissions during tests.
- Verify localized canonicals, alternates, metadata, share links, and sitemaps from server output.
- Landing visuals, media processing, storage providers, and invoice behavior remain within the agreed scope.

Final implementation report must identify changed areas, migration status, executed checks and results, remaining untranslated content, and any decisions or deployment actions still outstanding. Do not claim production behavior was verified solely from local source inspection.
