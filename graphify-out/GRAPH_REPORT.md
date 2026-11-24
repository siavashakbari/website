# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~216,840 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .ttf 9, .woff2 5, (none) 4)

## Summary
- 1499 nodes · 3502 edges · 63 communities (52 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca169939`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DedicatedPhotoView.tsx
- vault.pages.tsx
- __root.tsx
- locale.ts
- useResolvedMediaSrc
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
- studio-store.ts
- compilerOptions
- components.json
- devDependencies
- test-all-routes-live.mjs
- index.tsx
- ping
- devDependencies
- vite.config.ts
- blog-posts.ts
- vault.media.tsx
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- seo.ts
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- portfolio-schema.ts
- photo-inventory.ts
- local-media-db.ts
- grow-to-band.mjs
- AboutPage
- vault.blog.tsx
- scripts
- compress-images.mjs
- __root.tsx
- TimelineEntry
- migrate-bilingual-content.mjs
- useLocale
- package.json
- mergeMilestones
- portfolioProjectToMilestone
- server.ts
- VaultPageItem
- inventory-assets.ts
- admin.tsx
- admin.blog.tsx
- test-vault-ssr-first-render.mjs
- admin.index.tsx
- admin.inventory.tsx
- react
- admin.invoices.tsx
- admin.projects.tsx
- vault.index.tsx
- Register

## God Nodes (most connected - your core abstractions)
1. `useLocale()` - 54 edges
2. `localizedText()` - 45 edges
3. `@tanstack/react-router` - 45 edges
4. `react` - 43 edges
5. `normalizeProjectSlug()` - 38 edges
6. `FileRoutesByPath` - 35 edges
7. `isContentReady()` - 34 edges
8. `getVaultPages()` - 34 edges
9. `currentLocale()` - 33 edges
10. `getVaultMedia()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `SpecialtyRouteData` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/$discipline.$specialty.index.tsx → src/lib/vault-store.ts
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx
- `Route` --calls--> `siteField()`  [EXTRACTED]
  src/routes/about.tsx → src/lib/site-content.ts

## Import Cycles
- 1-file cycle: `src/routes/about.tsx -> src/routes/about.tsx`

## Communities (63 total, 11 thin omitted)

### Community 1 - "DedicatedPhotoView.tsx"
Cohesion: 0.06
Nodes (105): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoLoaderData, DedicatedPhotoView(), extFromSrc(), formatSlugLabel() (+97 more)

### Community 2 - "vault.pages.tsx"
Cohesion: 0.19
Nodes (19): PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs(), CloudUploadResult, getSupabaseConfig(), isCloudStorageConfigured(), publishInlineMedia() (+11 more)

### Community 3 - "__root.tsx"
Cohesion: 0.12
Nodes (13): @tanstack/react-query@^5.101.1, @tanstack/react-query, LanguageSwitch(), nearestEdge(), SITE_NAME, CloseIcon(), Header(), isDisciplinePath() (+5 more)

### Community 4 - "locale.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_LOCALE, detectedScript(), localeFromPath(), LocaleState, requestLocales, withRequestLocale(), stripLocale(), switchLocaleUrl() (+7 more)

### Community 5 - "useResolvedMediaSrc"
Cohesion: 0.10
Nodes (30): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), UI_TYPE_LIST (+22 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.10
Nodes (34): ContactForm(), ContactFormValues, TOPICS, CustomDatePicker(), CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, Locale (+26 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (47): Route, Route, AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute (+39 more)

### Community 9 - "about.tsx"
Cohesion: 0.05
Nodes (28): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+20 more)

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
Nodes (21): dependencies, clsx@^2.1.1, html-to-image@^1.11.13, jspdf@^4.2.1, lucide-react@^0.575.0, mp4box@^2.5.0, react@^19.2.0, @supabase/supabase-js@^2.117.2 (+13 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.18
Nodes (29): addDeletedKeys(), buildAssignedRoute(), buildDynamicMediaCode(), cleanSegment(), computeVaultDiagnostics(), deleteVaultMedia(), deleteVaultPage(), ensureMediaItemDynamicFields() (+21 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "studio-store.ts"
Cohesion: 0.11
Nodes (18): Project, contentStorage, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), extractAssetFilename(), getCustomTaxonomy() (+10 more)

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

### Community 22 - "index.tsx"
Cohesion: 0.27
Nodes (9): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), AnimatedStat(), Index(), portraitSrc() (+1 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, prettier@^3.7.3, @types/node@^22.16.5, @types/react@^19.2.0, @types/react-dom@^19.2.0, typescript@^5.8.3 (+7 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.13
Nodes (13): @tailwindcss/vite@^4.2.1, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite, vite (+5 more)

### Community 26 - "blog-posts.ts"
Cohesion: 0.17
Nodes (10): BLOG_CATEGORIES, BLOG_POSTS, BlogAuthor, BlogCategory, BlogCategoryMeta, BlogPost, BlogSection, DEFAULT_AUTHOR (+2 more)

### Community 27 - "vault.media.tsx"
Cohesion: 0.31
Nodes (13): ManagedMedia, managedMediaFromUrl(), pending(), queueMediaCleanup(), retryPendingMediaCleanup(), runMediaCleanup(), waitForPublishedContentSave(), getAvailable4DigitCode() (+5 more)

### Community 28 - "ref_node_fs"
Cohesion: 0.17
Nodes (4): EXTS, files, ROOT, walk()

### Community 29 - "extract-dominant-colors.mjs"
Cohesion: 0.18
Nodes (11): analyze(), assetsRoot, __dirname, EXT, files, isNearWhiteOrBlack(), map, outFile (+3 more)

### Community 30 - "disciplines.ts"
Cohesion: 0.20
Nodes (3): DisciplineCard, Discipline, echoPrimeVideos

### Community 31 - "seo.ts"
Cohesion: 0.17
Nodes (28): lucide-react, @tanstack/react-start, BackToTop(), currentLocale(), absoluteUrl(), getSiteUrl(), jsonLdScript(), OG_IMAGE_HEIGHT (+20 more)

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.27
Nodes (8): PEYDA_BASE64, COUPLED_LOGO_PAIRS, MOODBOARD_GRID_IMAGES, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL(), renderWhiteLogoDataUrl()

### Community 35 - "portfolio-schema.ts"
Cohesion: 0.22
Nodes (8): DISCIPLINE_CODE_MAP, DISCIPLINE_QUICK_TAGS, DISCIPLINE_ROLE_MATRIX, DisciplineCode, DisciplineRoleDefinition, DisciplineSlug, ProjectCaseStudy, VisualAsset

### Community 36 - "photo-inventory.ts"
Cohesion: 0.25
Nodes (8): codeMap, computeItemSeoSlug(), CustomCreditField, PHOTO_INVENTORY, slugifyValue(), slugMap, stemMap, CreditEntry

### Community 37 - "local-media-db.ts"
Cohesion: 0.26
Nodes (12): deleteMediaBlob(), getMediaObjectUrl(), inflightReads, isIndexedDbMediaUrl(), listMediaBlobKeys(), objectUrlCache, openBlobDb(), resolveImmediateMediaSrc() (+4 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "AboutPage"
Cohesion: 0.29
Nodes (10): AboutPage(), createDefaultFilters(), Hero(), SelectedWork(), SkillColumn(), SkillsSection(), t(), Timeline() (+2 more)

### Community 40 - "vault.blog.tsx"
Cohesion: 0.39
Nodes (8): deleteCustomPhotoAsset(), deleteStudioBlogPost(), getStudioBlogPosts(), notifyStudioStoreUpdated(), saveCustomTaxonomy(), saveStudioBlogPost(), AdminBlogView(), Route

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "__root.tsx"
Cohesion: 0.06
Nodes (69): @supabase/supabase-js, @vercel/blob, SIGNATURE_DATA_URL, Logo(), PublishStatus(), blobCredentials(), exportInvoiceToPDF(), loadPrivateVaultContent() (+61 more)

### Community 44 - "TimelineEntry"
Cohesion: 0.33
Nodes (6): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), TimelineEntry(), tipYFromProgress()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "useLocale"
Cohesion: 0.23
Nodes (13): @tanstack/react-router, CoverTile(), CoverTileProps, coverTileImage(), DisciplinesMarquee(), HiddenPageNotice(), HiddenPageNoticeProps, EqualCardItem (+5 more)

### Community 47 - "package.json"
Cohesion: 0.18
Nodes (10): @radix-ui/react-dropdown-menu@^2.1.16, react-dom@^19.2.0, tailwind-merge@^3.5.0, name, private, sideEffects, type, @radix-ui/react-dropdown-menu (+2 more)

### Community 50 - "server.ts"
Cohesion: 0.14
Nodes (16): consumeLastCapturedError(), renderErrorPage(), isNonPublicPath(), ContentSnapshot, loadRequestPublishedSnapshot(), PublishedSnapshot, requestSnapshots, withRequestPublishedSnapshot() (+8 more)

### Community 51 - "VaultPageItem"
Cohesion: 0.24
Nodes (10): UITypeCode, PageHeader(), PageHeaderProps, KeyValuePair, VaultMediaItem, VaultPageItem, DisciplineRouteData, ProjectRouteLoaderData (+2 more)

### Community 52 - "inventory-assets.ts"
Cohesion: 0.29
Nodes (7): assetEntries, AssetEntry, assetModules, byFileLower, byStem, matchAssetEntry(), resolveKnownAssetFile()

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.13
Nodes (9): browser(), blog, blogs, media, pages, photo, project, site (+1 more)

### Community 58 - "react"
Cohesion: 0.07
Nodes (42): motion@^12.42.2, motion, react, HoverFooter(), clientToSvgPoint(), LOGO_PATHS, LogoHoverEffect(), screenPxToSvgRadius() (+34 more)

## Knowledge Gaps
- **1 isolated node(s):** `SELECTED_WORK`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 733 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `DedicatedPhotoView.tsx`, `vault.pages.tsx`, `__root.tsx`, `brand-discovery.tsx`, `useResolvedMediaSrc`, `local-media-db.ts`, `site-content.ts`, `vault.blog.tsx`, `about.tsx`, `__root.tsx`, `dependencies`, `package.json`, `useLocale`, `index.tsx`, `vault.media.tsx`, `seo.ts`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `SELECTED_WORK` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `seo.ts` to `locale.ts`, `__root.tsx`, `dependencies`, `package.json`, `server.ts`, `vite.config.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `DedicatedPhotoView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06212121212121212 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `useLocale` to `DedicatedPhotoView.tsx`, `vault.pages.tsx`, `__root.tsx`, `locale.ts`, `useResolvedMediaSrc`, `site-content.ts`, `about.tsx`, `dependencies`, `index.tsx`, `vault.media.tsx`, `seo.ts`, `api.contact.ts`, `brand-discovery.tsx`, `vault.blog.tsx`, `__root.tsx`, `package.json`, `admin.tsx`, `admin.blog.tsx`, `admin.index.tsx`, `admin.inventory.tsx`, `admin.invoices.tsx`, `admin.projects.tsx`, `vault.index.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `__root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11692307692307692 - nodes in this community are weakly interconnected._