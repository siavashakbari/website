# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~216,777 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .ttf 9, .woff2 5, (none) 4)

## Summary
- 1494 nodes · 3522 edges · 61 communities (52 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd48559f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- $discipline.$specialty.$project.index.tsx
- CustomDatePicker.tsx
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
- published-store.ts
- test-all-routes-live.mjs
- AdaptiveThumb.tsx
- ping
- package.json
- vite.config.ts
- normalizeProjectSlug
- expandable-gallery.tsx
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- FileRoutesByPath
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- DedicatedPhotoView.tsx
- $discipline.$photoId.tsx
- api.private-content.ts
- grow-to-band.mjs
- useLocale
- server.ts
- scripts
- compress-images.mjs
- vault.invoices.tsx
- AboutPage
- migrate-bilingual-content.mjs
- start.ts
- vault.tsx
- SelectedWork
- TimelineEntry
- inventory-assets.ts
- admin.tsx
- admin.blog.tsx
- admin.index.tsx
- admin.inventory.tsx
- test-vault-ssr-first-render.mjs
- admin.invoices.tsx
- admin.projects.tsx
- react
- vault.index.tsx
- Register

## God Nodes (most connected - your core abstractions)
1. `useLocale()` - 54 edges
2. `localizedText()` - 45 edges
3. `@tanstack/react-router` - 45 edges
4. `react` - 43 edges
5. `normalizeProjectSlug()` - 38 edges
6. `getVaultPages()` - 36 edges
7. `FileRoutesByPath` - 35 edges
8. `isContentReady()` - 34 edges
9. `currentLocale()` - 33 edges
10. `getVaultMedia()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts
- `ErrorComponent()` --calls--> `withLocale()`  [EXTRACTED]
  src/routes/__root.tsx → src/lib/locale.ts
- `ErrorComponent()` --calls--> `useLocale()`  [EXTRACTED]
  src/routes/__root.tsx → src/lib/use-locale.ts

## Import Cycles
- None detected.

## Communities (61 total, 9 thin omitted)

### Community 1 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.10
Nodes (33): NotFoundPage(), PublishedPageLoading(), UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeCode, UITypeDefinition, projectBackButtonClass, projectBackButtonMobileClass (+25 more)

### Community 2 - "CustomDatePicker.tsx"
Cohesion: 0.50
Nodes (4): CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, Locale

### Community 3 - "__root.tsx"
Cohesion: 0.10
Nodes (17): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), LanguageSwitch(), nearestEdge(), SITE_NAME (+9 more)

### Community 4 - "studio-store.ts"
Cohesion: 0.08
Nodes (42): Project, projects, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), deleteCustomPhotoAsset(), extractAssetFilename() (+34 more)

### Community 5 - "vercel-private-content.server.ts"
Cohesion: 0.26
Nodes (15): @supabase/supabase-js, @vercel/blob, blobCredentials(), validateSnapshot(), requireVaultAdmin(), initializeVercelPublishedContent(), readSnapshotWithEtag(), readVercelPublishedContent() (+7 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.03
Nodes (5): COUPLED_LOGO_PAIRS, CoupledOption, CoupledPair, MOODBOARD_GRID_IMAGES, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.12
Nodes (29): ContactForm(), ContactFormValues, TOPICS, CustomDatePicker(), SITE_DESCRIPTION, SITE_TITLE_DEFAULT, isLocalized(), Localized (+21 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (47): Route, AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute, AdminRoute (+39 more)

### Community 9 - "about.tsx"
Cohesion: 0.06
Nodes (22): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+14 more)

### Community 10 - "media-sizing.ts"
Cohesion: 0.18
Nodes (19): compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions, processMediaUpload(), processVideoFile() (+11 more)

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
Cohesion: 0.07
Nodes (30): dependencies, clsx@^2.1.1, jspdf@^4.2.1, lucide-react@^0.575.0, motion@^12.42.2, mp4-muxer@^5.2.2, mp4box@^2.5.0, @radix-ui/react-dropdown-menu@^2.1.16 (+22 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.06
Nodes (85): PageHeaderProps, KeyValuePair, PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs(), CloudUploadResult, getSupabaseConfig() (+77 more)

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

### Community 20 - "published-store.ts"
Cohesion: 0.17
Nodes (21): PublishStatus(), announceContent(), content, CONTENT_STATUS_EVENT, contentStorage, discardPendingContentSave(), flushContentSave(), getContentStatus() (+13 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "AdaptiveThumb.tsx"
Cohesion: 0.12
Nodes (22): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), GalleryMediaItem (+14 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "package.json"
Cohesion: 0.09
Nodes (33): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0 (+25 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.15
Nodes (11): @tailwindcss/vite@^4.2.1, vite-tsconfig-paths@^6.0.2, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, @tailwindcss/vite, vite, vite-tsconfig-paths, @vitejs/plugin-react (+3 more)

### Community 26 - "normalizeProjectSlug"
Cohesion: 0.30
Nodes (21): resolveInventoryImage(), getPublishedArray(), getCanonicalProjectSlug(), getDeletedProjectIds(), getStudioProjects(), isProjectDeleted(), normalizeProjectSlug(), getGalleryMediaForRoute() (+13 more)

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
Cohesion: 0.17
Nodes (27): @tanstack/react-start, currentLocale(), absoluteUrl(), getSiteUrl(), jsonLdScript(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH (+19 more)

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.36
Nodes (6): PEYDA_BASE64, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL(), renderWhiteLogoDataUrl()

### Community 35 - "DedicatedPhotoView.tsx"
Cohesion: 0.11
Nodes (28): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoLoaderData, DedicatedPhotoView(), extFromSrc(), formatSlugLabel() (+20 more)

### Community 36 - "$discipline.$photoId.tsx"
Cohesion: 0.20
Nodes (20): looksLikeMediaCode(), redirectToCanonicalPath(), resolveDedicatedPhotoLoader(), codeMap, computeItemSeoSlug(), CustomCreditField, getPhotoByCode(), getPhotoBySeoSlug() (+12 more)

### Community 37 - "api.private-content.ts"
Cohesion: 0.43
Nodes (7): readVercelPrivateContent(), readWithEtag(), saveVercelPrivateContent(), validatePrivateData(), headers, json(), Route

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "useLocale"
Cohesion: 0.12
Nodes (31): lucide-react, motion, react, @tanstack/react-router, BackToTop(), CoverTile(), CoverTileProps, DisciplineCircleMap() (+23 more)

### Community 40 - "server.ts"
Cohesion: 0.20
Nodes (16): consumeLastCapturedError(), DEFAULT_LOCALE, isNonPublicPath(), localeFromPath(), LocaleState, requestLocales, withRequestLocale(), stripLocale() (+8 more)

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "vault.invoices.tsx"
Cohesion: 0.15
Nodes (21): html-to-image@^1.11.13, html-to-image, SIGNATURE_DATA_URL, exportInvoiceToPDF(), loadPrivateVaultContent(), savePrivateVaultContent(), deleteInvoice(), getSavedInvoices() (+13 more)

### Community 44 - "AboutPage"
Cohesion: 0.36
Nodes (8): AboutPage(), createDefaultFilters(), Hero(), SkillColumn(), SkillsSection(), t(), TimelineFilters(), toFiveScale()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "start.ts"
Cohesion: 0.19
Nodes (11): renderErrorPage(), commitSnapshot(), ContentSnapshot, PUBLIC_CONTENT_KEYS, loadRequestPublishedSnapshot(), PublishedSnapshot, requestSnapshots, withRequestPublishedSnapshot() (+3 more)

### Community 47 - "vault.tsx"
Cohesion: 0.36
Nodes (5): Logo(), supabase, Route, VaultLayout(), VaultSession

### Community 48 - "SelectedWork"
Cohesion: 0.70
Nodes (5): SelectedWork(), WorkImage(), WorkLink(), WorkMetadata(), WorkOrbit()

### Community 49 - "TimelineEntry"
Cohesion: 0.29
Nodes (7): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), Timeline(), TimelineEntry(), tipYFromProgress()

### Community 50 - "inventory-assets.ts"
Cohesion: 0.33
Nodes (5): assetEntries, AssetEntry, assetModules, byFileLower, byStem

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.13
Nodes (9): browser(), blog, blogs, media, pages, photo, project, site (+1 more)

### Community 58 - "react"
Cohesion: 0.09
Nodes (31): HoverFooter(), clientToSvgPoint(), LOGO_PATHS, LogoHoverEffect(), screenPxToSvgRadius(), DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem (+23 more)

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useLocale` to `$discipline.$specialty.$project.index.tsx`, `CustomDatePicker.tsx`, `__root.tsx`, `site-content.ts`, `about.tsx`, `dependencies`, `vault-store.ts`, `blog-posts.ts`, `published-store.ts`, `AdaptiveThumb.tsx`, `package.json`, `expandable-gallery.tsx`, `FileRoutesByPath`, `brand-discovery.tsx`, `DedicatedPhotoView.tsx`, `$discipline.$photoId.tsx`, `vault.invoices.tsx`, `vault.tsx`, `react`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `FileRoutesByPath` to `vercel-private-content.server.ts`, `server.ts`, `start.ts`, `dependencies`, `package.json`, `vite.config.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `$discipline.$specialty.$project.index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10359408033826638 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `useLocale` to `$discipline.$specialty.$project.index.tsx`, `__root.tsx`, `vercel-private-content.server.ts`, `site-content.ts`, `about.tsx`, `dependencies`, `vault-store.ts`, `blog-posts.ts`, `AdaptiveThumb.tsx`, `package.json`, `FileRoutesByPath`, `api.contact.ts`, `brand-discovery.tsx`, `DedicatedPhotoView.tsx`, `$discipline.$photoId.tsx`, `api.private-content.ts`, `server.ts`, `vault.invoices.tsx`, `vault.tsx`, `admin.tsx`, `admin.blog.tsx`, `admin.index.tsx`, `admin.inventory.tsx`, `admin.invoices.tsx`, `admin.projects.tsx`, `vault.index.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `__root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._
- **Should `studio-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07716701902748414 - nodes in this community are weakly interconnected._