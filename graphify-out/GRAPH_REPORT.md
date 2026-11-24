# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~216,739 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .ttf 9, .woff2 5, (none) 4)

## Summary
- 1496 nodes · 3525 edges · 54 communities (53 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `556b8bac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- $discipline.$specialty.index.tsx
- normalizeProjectSlug
- __root.tsx
- studio-store.ts
- vercel-private-content.server.ts
- visual-identity-assets.ts
- site-content.ts
- routeTree.gen.ts
- about.tsx
- media-sizing.ts
- generate-sitemap.mjs
- test-all-vault-connectivity.mjs
- generate-architecture-map.mjs
- dependencies
- vault-store.ts
- audit-cross-system.mjs
- blog-posts.ts
- compilerOptions
- components.json
- devDependencies
- test-all-routes-live.mjs
- react
- ping
- devDependencies
- vite.config.ts
- taxonomy.ts
- expandable-gallery.tsx
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- FileRoutesByPath
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- DedicatedPhotoView.tsx
- photo-inventory.ts
- validateSnapshot
- grow-to-band.mjs
- AboutPage
- server.ts
- scripts
- compress-images.mjs
- published-store.ts
- TimelineEntry
- migrate-bilingual-content.mjs
- start.ts
- package.json
- SelectedWork
- localizedText
- $discipline.$specialty.$project.index.tsx
- inventory-assets.ts
- test-vault-ssr-first-render.mjs
- react

## God Nodes (most connected - your core abstractions)
1. `useLocale()` - 54 edges
2. `localizedText()` - 45 edges
3. `@tanstack/react-router` - 45 edges
4. `react` - 43 edges
5. `normalizeProjectSlug()` - 38 edges
6. `getVaultPages()` - 36 edges
7. `FileRoutesByPath` - 35 edges
8. `isContentReady()` - 34 edges
9. `getVaultMedia()` - 33 edges
10. `currentLocale()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `SpecialtyRouteData` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/$discipline.$specialty.index.tsx → src/lib/vault-store.ts
- `PageHeaderProps` --references--> `KeyValuePair`  [EXTRACTED]
  src/components/ui-types/PageHeader.tsx → src/components/vault/PairedBoxesEditor.tsx
- `ProjectRouteLoaderData` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/$discipline.$specialty.$project.index.tsx → src/lib/vault-store.ts
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts

## Import Cycles
- None detected.

## Communities (54 total, 1 thin omitted)

### Community 1 - "$discipline.$specialty.index.tsx"
Cohesion: 0.13
Nodes (32): resolveInventoryImage(), getPublishedArray(), isContentReady(), getDeletedProjectIds(), getStudioProjects(), getGalleryMediaForRoute(), getVaultPages(), isRouteOrAncestorHidden() (+24 more)

### Community 2 - "normalizeProjectSlug"
Cohesion: 0.29
Nodes (19): looksLikeMediaCode(), redirectToCanonicalPath(), resolveDedicatedPhotoLoader(), getPhotoByCode(), getPhotoBySeoSlug(), getPhotoByStem(), getPhotoItemBySlugOrCode(), buildPhotoUrl() (+11 more)

### Community 3 - "__root.tsx"
Cohesion: 0.13
Nodes (15): LanguageSwitch(), HiddenPageNotice(), HiddenPageNoticeProps, nearestEdge(), useLocale(), CloseIcon(), ErrorComponent(), Header() (+7 more)

### Community 4 - "studio-store.ts"
Cohesion: 0.11
Nodes (26): Project, projects, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), extractAssetFilename(), getCanonicalProjectSlug() (+18 more)

### Community 5 - "vercel-private-content.server.ts"
Cohesion: 0.22
Nodes (15): @supabase/supabase-js, @vercel/blob, blobCredentials(), requireVaultAdmin(), PrivateVaultSnapshot, readVercelPrivateContent(), readWithEtag(), saveVercelPrivateContent() (+7 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.11
Nodes (32): ContactForm(), ContactFormValues, TOPICS, NotFoundPage(), InteractiveHoverButton, InteractiveHoverButtonProps, SITE_DESCRIPTION, isLocalized() (+24 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (57): @tanstack/react-router, Route, Route, Route, Route, Route, Route, Route (+49 more)

### Community 9 - "about.tsx"
Cohesion: 0.06
Nodes (24): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+16 more)

### Community 10 - "media-sizing.ts"
Cohesion: 0.18
Nodes (18): compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions, processVideoFile(), resizeCanvas() (+10 more)

### Community 11 - "generate-sitemap.mjs"
Cohesion: 0.10
Nodes (23): allEntries, assetPages, blogMatches, blogPages, blogPostsFile, buildDynamicCode(), cleanSegment(), escapeXml() (+15 more)

### Community 12 - "test-all-vault-connectivity.mjs"
Cohesion: 0.09
Nodes (23): cleanSegment(), codeSet, __dirname, endMatch, errors, fieldOptionsSet, __filename, invContent (+15 more)

### Community 13 - "generate-architecture-map.mjs"
Cohesion: 0.11
Nodes (22): arrayStr, buildDynamicCode(), cleanSegment(), __dirname, endMatch, extFromSrc(), __filename, initPagesMatch (+14 more)

### Community 14 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, clsx@^2.1.1, html-to-image@^1.11.13, lucide-react@^0.575.0, motion@^12.42.2, mp4-muxer@^5.2.2, react@^19.2.0, react-dom@^19.2.0 (+15 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.06
Nodes (90): UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeCode, UITypeDefinition, GalleryMediaItem, HorizontalLightbox(), HorizontalMediaTile(), itemsAlt() (+82 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "blog-posts.ts"
Cohesion: 0.13
Nodes (18): BLOG_CATEGORIES, BLOG_POSTS, BlogAuthor, BlogCategory, BlogCategoryMeta, BlogPost, BlogSection, DEFAULT_AUTHOR (+10 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 20 - "devDependencies"
Cohesion: 0.15
Nodes (12): @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0, typescript-eslint@^8.56.1, @eslint/js, eslint-plugin-prettier (+4 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "react"
Cohesion: 0.15
Nodes (19): react, BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), CoverTile(), CoverTileProps (+11 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, prettier@^3.7.3, @types/node@^22.16.5, @types/react@^19.2.0, @types/react-dom@^19.2.0, typescript@^5.8.3 (+7 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.12
Nodes (15): @tailwindcss/vite@^4.2.1, @tanstack/react-start@^1.169.4, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite (+7 more)

### Community 26 - "taxonomy.ts"
Cohesion: 0.21
Nodes (13): DISCIPLINE_4_MAP, DISCIPLINE_ALIASES, generate4PartPhotoCode(), getDiscipline4Code(), getProject4Code(), getSpecialty4Code(), KNOWN_DISCIPLINES, KNOWN_SPECIALTIES (+5 more)

### Community 27 - "expandable-gallery.tsx"
Cohesion: 0.24
Nodes (8): COMPACT_STACK_LAYOUT, COMPACT_STACK_MOBILE, ExpandableGallery(), ExpandableGalleryProps, GalleryPhoto, STACK_LAYOUT, transition, useOutsideClick()

### Community 28 - "ref_node_fs"
Cohesion: 0.17
Nodes (4): EXTS, files, ROOT, walk()

### Community 29 - "extract-dominant-colors.mjs"
Cohesion: 0.18
Nodes (11): analyze(), assetsRoot, __dirname, EXT, files, isNearWhiteOrBlack(), map, outFile (+3 more)

### Community 30 - "disciplines.ts"
Cohesion: 0.18
Nodes (4): DisciplineCard, DISCIPLINES, Discipline, echoPrimeVideos

### Community 31 - "FileRoutesByPath"
Cohesion: 0.16
Nodes (28): lucide-react, BackToTop(), currentLocale(), absoluteUrl(), getSiteUrl(), jsonLdScript(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH (+20 more)

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.15
Nodes (14): motion, PEYDA_BASE64, CustomDatePicker(), CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, COUPLED_LOGO_PAIRS, MOODBOARD_GRID_IMAGES (+6 more)

### Community 35 - "DedicatedPhotoView.tsx"
Cohesion: 0.21
Nodes (17): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoView(), extFromSrc(), formatSlugLabel(), isVideoAsset() (+9 more)

### Community 36 - "photo-inventory.ts"
Cohesion: 0.12
Nodes (18): DedicatedPhotoLoaderData, codeMap, computeItemSeoSlug(), CustomCreditField, PHOTO_INVENTORY, PhotoInventoryItem, slugifyValue(), slugMap (+10 more)

### Community 37 - "validateSnapshot"
Cohesion: 0.34
Nodes (10): commitSnapshot(), PUBLIC_CONTENT_KEYS, validateSnapshot(), initializeVercelPublishedContent(), readSnapshotWithEtag(), readVercelPublishedContent(), saveVercelPublishedContent(), headers (+2 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "AboutPage"
Cohesion: 0.36
Nodes (8): AboutPage(), createDefaultFilters(), Hero(), SkillColumn(), SkillsSection(), t(), TimelineFilters(), toFiveScale()

### Community 40 - "server.ts"
Cohesion: 0.27
Nodes (8): consumeLastCapturedError(), renderErrorPage(), isNonPublicPath(), fetch(), getServerEntry(), isH3SwallowedErrorBody(), normalizeCatastrophicSsrResponse(), ServerEntry

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "published-store.ts"
Cohesion: 0.08
Nodes (47): SIGNATURE_DATA_URL, Logo(), PublishedPageLoading(), LiquidWaveSpinner(), PublishStatus(), exportInvoiceToPDF(), loadPrivateVaultContent(), savePrivateVaultContent() (+39 more)

### Community 44 - "TimelineEntry"
Cohesion: 0.29
Nodes (7): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), Timeline(), TimelineEntry(), tipYFromProgress()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "start.ts"
Cohesion: 0.27
Nodes (9): withRequestLocale(), ContentSnapshot, loadRequestPublishedSnapshot(), PublishedSnapshot, requestSnapshots, withRequestPublishedSnapshot(), BlobContentSnapshot, errorMiddleware (+1 more)

### Community 47 - "package.json"
Cohesion: 0.15
Nodes (12): jspdf@^4.2.1, mp4box@^2.5.0, @radix-ui/react-dropdown-menu@^2.1.16, @tanstack/router-plugin@^1.168.18, name, private, sideEffects, type (+4 more)

### Community 48 - "SelectedWork"
Cohesion: 0.70
Nodes (5): SelectedWork(), WorkImage(), WorkLink(), WorkMetadata(), WorkOrbit()

### Community 50 - "localizedText"
Cohesion: 0.21
Nodes (15): DisciplineCircleMap(), ROOTS, PageHeader(), PageHeaderProps, DEFAULT_LOCALE, detectedScript(), localeFromPath(), LocaleState (+7 more)

### Community 51 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.24
Nodes (12): projectBackButtonClass, projectBackButtonMobileClass, buildGalleryItemsForProject(), CombinedLoaderData, computeClientProjectState(), computeInitialProjectState(), findMatchingProject(), ProjectCaseStudyPage() (+4 more)

### Community 52 - "inventory-assets.ts"
Cohesion: 0.29
Nodes (7): assetEntries, AssetEntry, assetModules, byFileLower, byStem, matchAssetEntry(), resolveKnownAssetFile()

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.13
Nodes (9): browser(), blog, blogs, media, pages, photo, project, site (+1 more)

### Community 58 - "react"
Cohesion: 0.06
Nodes (47): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), HoverFooter() (+39 more)

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@tanstack/react-router` connect `routeTree.gen.ts` to `$discipline.$specialty.index.tsx`, `normalizeProjectSlug`, `__root.tsx`, `vercel-private-content.server.ts`, `site-content.ts`, `about.tsx`, `dependencies`, `vault-store.ts`, `blog-posts.ts`, `react`, `FileRoutesByPath`, `api.contact.ts`, `brand-discovery.tsx`, `DedicatedPhotoView.tsx`, `validateSnapshot`, `published-store.ts`, `package.json`, `localizedText`, `$discipline.$specialty.$project.index.tsx`, `react`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `$discipline.$specialty.index.tsx`, `brand-discovery.tsx`, `DedicatedPhotoView.tsx`, `__root.tsx`, `normalizeProjectSlug`, `site-content.ts`, `about.tsx`, `published-store.ts`, `dependencies`, `package.json`, `vault-store.ts`, `blog-posts.ts`, `localizedText`, `$discipline.$specialty.$project.index.tsx`, `react`, `expandable-gallery.tsx`, `FileRoutesByPath`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `$discipline.$specialty.index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1329268292682927 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `vite.config.ts` to `$discipline.$specialty.index.tsx`, `vercel-private-content.server.ts`, `server.ts`, `start.ts`, `package.json`, `FileRoutesByPath`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `__root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._
- **Should `studio-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10826210826210826 - nodes in this community are weakly interconnected._