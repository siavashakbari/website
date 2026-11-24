# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~217,637 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .ttf 9, (none) 4, .woff2 3)

## Summary
- 1493 nodes · 3512 edges · 45 communities (44 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1b6f023`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- eslint.config.js
- $discipline.$specialty.index.tsx
- localizedText
- studio-store.ts
- blobCredentials
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
- test-all-routes-live.mjs
- AdaptiveThumb.tsx
- ping
- devDependencies
- vite.config.ts
- DedicatedPhotoView.tsx
- package.json
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- normalizeDisciplineSlug
- react
- @tanstack/react-router
- grow-to-band.mjs
- $discipline.$specialty.$project.index.tsx
- server.ts
- scripts
- compress-images.mjs
- published-store.ts
- migrate-bilingual-content.mjs
- vercel-private-content.server.ts
- test-vault-ssr-first-render.mjs

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
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `RootShell()` --calls--> `useLocale()`  [EXTRACTED]
  src/routes/__root.tsx → src/lib/use-locale.ts
- `DedicatedPhotoLoaderData` --references--> `VaultMediaItem`  [EXTRACTED]
  src/components/DedicatedPhotoView.tsx → src/lib/vault-store.ts
- `Route` --calls--> `looksLikeMediaCode()`  [EXTRACTED]
  src/routes/$discipline.$specialty.$project.index.tsx → src/components/DedicatedPhotoView.tsx

## Import Cycles
- None detected.

## Communities (45 total, 1 thin omitted)

### Community 1 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0, typescript-eslint@^8.56.1, @eslint/js, eslint-plugin-prettier (+4 more)

### Community 2 - "$discipline.$specialty.index.tsx"
Cohesion: 0.15
Nodes (17): isContentReady(), getCustomTaxonomy(), subscribeToStudioStore(), getDeletedVaultPageKeys(), computeClientDisciplineState(), computeInitialDisciplineState(), DisciplineMediaItem, DisciplinePage() (+9 more)

### Community 3 - "localizedText"
Cohesion: 0.33
Nodes (23): buildLivePhotoViewState(), resolveInventoryImage(), currentLocale(), localizedText(), getCanonicalProjectSlug(), getDeletedProjectIds(), getStudioProjects(), isProjectDeleted() (+15 more)

### Community 4 - "studio-store.ts"
Cohesion: 0.08
Nodes (40): Project, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), deleteCustomPhotoAsset(), extractAssetFilename(), getCustomPhotoAssets() (+32 more)

### Community 5 - "blobCredentials"
Cohesion: 0.26
Nodes (15): @supabase/supabase-js, @vercel/blob, blobCredentials(), validateSnapshot(), requireVaultAdmin(), initializeVercelPublishedContent(), readSnapshotWithEtag(), readVercelPublishedContent() (+7 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.06
Nodes (68): lucide-react, BackToTop(), BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), ContactForm() (+60 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (46): AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute, AdminRoute, AdminRouteChildren (+38 more)

### Community 9 - "about.tsx"
Cohesion: 0.06
Nodes (45): siteLocalized(), ABOUT_EDITORIAL_FIELDS, AboutPage(), CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON (+37 more)

### Community 10 - "media-sizing.ts"
Cohesion: 0.16
Nodes (20): mp4-muxer@^5.2.2, mp4-muxer, compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions (+12 more)

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
Cohesion: 0.10
Nodes (20): dependencies, jspdf@^4.2.1, lucide-react@^0.575.0, mp4box@^2.5.0, react@^19.2.0, react-dom@^19.2.0, @supabase/supabase-js@^2.117.2, tailwind-merge@^3.5.0 (+12 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.05
Nodes (100): UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeCode, UITypeDefinition, PageHeaderProps, GalleryMediaItem, HorizontalLightbox(), HorizontalMediaTile() (+92 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "blog-posts.ts"
Cohesion: 0.16
Nodes (15): BLOG_CATEGORIES, BLOG_POSTS, BlogAuthor, BlogCategory, BlogCategoryMeta, BlogPost, BlogSection, DEFAULT_AUTHOR (+7 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "AdaptiveThumb.tsx"
Cohesion: 0.09
Nodes (28): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), CoverTile() (+20 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, prettier@^3.7.3, @types/node@^22.16.5, @types/react@^19.2.0, @types/react-dom@^19.2.0, typescript@^5.8.3 (+7 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.12
Nodes (15): @tailwindcss/vite@^4.2.1, @tanstack/react-start@^1.169.4, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite (+7 more)

### Community 26 - "DedicatedPhotoView.tsx"
Cohesion: 0.11
Nodes (26): computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoLoaderData, DedicatedPhotoView(), extFromSrc(), formatSlugLabel(), isVideoAsset() (+18 more)

### Community 27 - "package.json"
Cohesion: 0.15
Nodes (12): clsx@^2.1.1, html-to-image@^1.11.13, @radix-ui/react-dropdown-menu@^2.1.16, tw-animate-css@^1.3.4, name, private, sideEffects, type (+4 more)

### Community 28 - "ref_node_fs"
Cohesion: 0.17
Nodes (4): EXTS, files, ROOT, walk()

### Community 29 - "extract-dominant-colors.mjs"
Cohesion: 0.18
Nodes (11): analyze(), assetsRoot, __dirname, EXT, files, isNearWhiteOrBlack(), map, outFile (+3 more)

### Community 30 - "disciplines.ts"
Cohesion: 0.20
Nodes (3): DisciplineCard, Discipline, echoPrimeVideos

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.24
Nodes (9): PEYDA_BASE64, COUPLED_LOGO_PAIRS, MOODBOARD_GRID_IMAGES, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL(), renderWhiteLogoDataUrl() (+1 more)

### Community 35 - "normalizeDisciplineSlug"
Cohesion: 0.20
Nodes (21): looksLikeMediaCode(), redirectToCanonicalPath(), resolveDedicatedPhotoLoader(), codeMap, computeItemSeoSlug(), CustomCreditField, getPhotoByCode(), getPhotoBySeoSlug() (+13 more)

### Community 36 - "react"
Cohesion: 0.07
Nodes (40): motion@^12.42.2, motion, react, HoverFooter(), clientToSvgPoint(), LOGO_PATHS, LogoHoverEffect(), screenPxToSvgRadius() (+32 more)

### Community 37 - "@tanstack/react-router"
Cohesion: 0.13
Nodes (13): @tanstack/react-router, Route, Route, Route, Route, Route, Route, Route (+5 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.13
Nodes (23): DisciplineCircleMap(), ROOTS, coverTileImage(), DisciplinesMarquee(), NotFoundPage(), PublishedPageLoading(), LiquidWaveSpinner(), HiddenPageNotice() (+15 more)

### Community 40 - "server.ts"
Cohesion: 0.11
Nodes (28): consumeLastCapturedError(), renderErrorPage(), DEFAULT_LOCALE, detectedScript(), isNonPublicPath(), localeFromPath(), LocaleState, requestLocales (+20 more)

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "published-store.ts"
Cohesion: 0.05
Nodes (57): SIGNATURE_DATA_URL, LanguageSwitch(), Logo(), PublishStatus(), exportInvoiceToPDF(), nearestEdge(), loadPrivateVaultContent(), savePrivateVaultContent() (+49 more)

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 47 - "vercel-private-content.server.ts"
Cohesion: 0.47
Nodes (7): readVercelPrivateContent(), readWithEtag(), saveVercelPrivateContent(), validatePrivateData(), headers, json(), Route

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.13
Nodes (9): browser(), blog, blogs, media, pages, photo, project, site (+1 more)

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `brand-discovery.tsx`, `$discipline.$specialty.index.tsx`, `normalizeDisciplineSlug`, `site-content.ts`, `$discipline.$specialty.$project.index.tsx`, `about.tsx`, `published-store.ts`, `dependencies`, `vault-store.ts`, `blog-posts.ts`, `AdaptiveThumb.tsx`, `DedicatedPhotoView.tsx`, `package.json`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `vite.config.ts` to `@tanstack/react-router`, `blobCredentials`, `site-content.ts`, `server.ts`, `package.json`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `studio-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07665505226480836 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `@tanstack/react-router` to `api.contact.ts`, `brand-discovery.tsx`, `$discipline.$specialty.index.tsx`, `normalizeDisciplineSlug`, `blobCredentials`, `$discipline.$specialty.$project.index.tsx`, `server.ts`, `about.tsx`, `site-content.ts`, `published-store.ts`, `dependencies`, `vault-store.ts`, `vercel-private-content.server.ts`, `blog-posts.ts`, `AdaptiveThumb.tsx`, `DedicatedPhotoView.tsx`, `package.json`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `visual-identity-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._
- **Should `site-content.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05895061728395062 - nodes in this community are weakly interconnected._