# Conservative code cleanup

Reviewed the tracked application source, route entry points, import graph,
dependency declarations, and references from maintenance scripts. Removed only
items with no active consumers; no content records or media files were deleted.

## Removed

- Unused earlier gallery components: `ProjectCard`, `ProjectGrid`,
  `expandable-card`, and its private `glowing-effect` dependency.
- Unused `use-mobile` hook and superseded `image-optimizer` helper.
- Obsolete browser-only `admin-auth` implementation and its `AdminSession`
  interface. The active Supabase authentication remains in place.
- Unused `putMediaBlob` writer. Current uploads use cloud storage; IndexedDB
  readers and cleanup support remain for compatibility.
- Unconsumed `inventory-items.json` export and `parse-inventory.cjs`, which
  generated only that export. The active photo inventory remains intact.
- Unused `webm-muxer` dependency and its lockfile entry. The active MP4
  transcoder and its dependencies remain intact.
- Unused imports, an unused style constant, and unused local bindings.

## Retained intentionally

- Old URL redirects and legacy data normalization/merge readers.
- All images, videos, fonts, and public files. The inventory dynamically loads
  assets, so lack of a direct import is not evidence that an asset is unused.
- Reference PDFs, workbooks, design documents, and other maintenance scripts.
- Exported layout/taxonomy/diagnostic helpers where removal would require a
  broader decision about supported development interfaces.
- Existing build configuration and dependency versions. This is not a tooling
  migration or dependency upgrade.

## Verification

- TypeScript passes with `--noUnusedLocals --noUnusedParameters` enabled.
- Production build passes.
- Seven persistence/synchronization tests pass.
- Connectivity audit passes for 320 bundled media assets and 42 built-in pages.
- Production preview passes 367 canonical routes, six server-rendering
  regression checks, and 11 redirects.
- Isolated browser tests pass for published video metadata, authentication,
  failed-save recovery, page edits/reassignment/visibility/deletion, and blog
  creation/refresh/unpublishing/renaming/deletion across browser contexts.

Browser editing tests use mocked server data, not live portfolio records.
These checks cover existing automated scenarios; they are not a claim that
every possible interaction or external integration has been tested.

## Follow-up cleanup

With the owner's approval, removed unused project/photo editing APIs, taxonomy
URL/metadata generators, duplicate SEO builders, a legacy detail component,
and two unused Vault diagnostic accessors. Removed old feature notes, page
content notes, and standalone Python asset-generation scripts. No route file,
media asset, PDF, inventory viewer, or architecture page was removed.

The follow-up verification passed TypeScript with unused-code checks, the
production build, seven sync tests, 320 media connections, 42 page connections,
367 canonical routes, six rendering regressions, and 11 redirects. Browser
tests also passed for live-content loading, edits, and cross-browser sync.
