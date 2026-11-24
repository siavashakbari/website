# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~216,354 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .ttf 9, .woff2 5, (none) 4)

## Summary
- 1492 nodes · 3515 edges · 58 communities (52 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c008809c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- $discipline.$specialty.index.tsx
- normalizeProjectSlug
- __root.tsx
- getVaultPages
- @tanstack/react-router
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
- $discipline.$photoId.tsx
- motion
- grow-to-band.mjs
- AboutPage
- dedicatedPhotoHead
- scripts
- compress-images.mjs
- __root.tsx
- TimelineEntry
- migrate-bilingual-content.mjs
- useLocale
- package.json
- server.ts
- $discipline.$specialty.$project.index.tsx
- inventory-assets.ts
- admin.tsx
- test-vault-ssr-first-render.mjs
- admin.index.tsx
- admin.inventory.tsx
- react
- admin.invoices.tsx
- vault.index.tsx

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
- `RootComponent()` --indirect_call--> `startPublishedContentSync()`  [INFERRED]
  src/routes/__root.tsx → src/lib/published-store.ts
- `SpecialtyRouteData` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/$discipline.$specialty.index.tsx → src/lib/vault-store.ts
- `ProjectRouteLoaderData` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/$discipline.$specialty.$project.index.tsx → src/lib/vault-store.ts
- `DedicatedPhotoRouteComponent()` --calls--> `DedicatedPhotoView()`  [EXTRACTED]
  src/routes/$discipline.$specialty.$project.$photoId.tsx → src/components/DedicatedPhotoView.tsx
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx

## Import Cycles
- None detected.

## Communities (58 total, 6 thin omitted)

### Community 1 - "$discipline.$specialty.index.tsx"
Cohesion: 0.16
Nodes (13): isContentReady(), getDeletedProjectIds(), DisciplineMediaItem, LEGACY_SINGLE_SEGMENT_REDIRECTS, ProjectCardItem, ROOT_DISCIPLINE_META, computeClientSpecialtyState(), computeInitialSpecialtyState() (+5 more)

### Community 2 - "normalizeProjectSlug"
Cohesion: 0.33
Nodes (18): looksLikeMediaCode(), redirectToCanonicalPath(), resolveDedicatedPhotoLoader(), synthesizePhotoFromVault(), getCustomPhotoAssets(), getMergedPhotoInventory(), getPhotoDedupeKey(), getPhotoItemBySlugOrCode() (+10 more)

### Community 3 - "__root.tsx"
Cohesion: 0.11
Nodes (16): LanguageSwitch(), Logo(), nearestEdge(), seedPublishedContent(), CloseIcon(), ErrorComponent(), Header(), HoverFooter (+8 more)

### Community 4 - "getVaultPages"
Cohesion: 0.26
Nodes (19): resolveInventoryImage(), getPublishedArray(), getCanonicalProjectSlug(), getStudioProjects(), isProjectDeleted(), getGalleryMediaForRoute(), getVaultPages(), isRouteOrAncestorHidden() (+11 more)

### Community 5 - "@tanstack/react-router"
Cohesion: 0.34
Nodes (10): lucide-react, react, @tanstack/react-router, BackToTop(), HiddenPageNoticeProps, getBlogPostBySlug(), getMergedBlogPosts(), subscribeToStudioStore() (+2 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.13
Nodes (27): ContactForm(), ContactFormValues, TOPICS, InteractiveHoverButton, InteractiveHoverButtonProps, isLocalized(), Localized, publishSiteContent() (+19 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (47): Route, Route, AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute (+39 more)

### Community 9 - "about.tsx"
Cohesion: 0.06
Nodes (23): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+15 more)

### Community 10 - "media-sizing.ts"
Cohesion: 0.15
Nodes (21): mp4box@^2.5.0, mp4box, compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions (+13 more)

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
Nodes (21): dependencies, jspdf@^4.2.1, lucide-react@^0.575.0, motion@^12.42.2, mp4-muxer@^5.2.2, @radix-ui/react-dropdown-menu@^2.1.16, react@^19.2.0, @supabase/supabase-js@^2.117.2 (+13 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.06
Nodes (91): UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeCode, UITypeDefinition, PageHeaderProps, GalleryMediaItem, HorizontalLightbox(), HorizontalMediaTile() (+83 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "studio-store.ts"
Cohesion: 0.05
Nodes (57): SIGNATURE_DATA_URL, BLOG_CATEGORIES, BLOG_POSTS, BlogAuthor, BlogCategory, BlogCategoryMeta, BlogPost, BlogSection (+49 more)

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
Cohesion: 0.14
Nodes (17): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH (+9 more)

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
Cohesion: 0.20
Nodes (4): DisciplineCard, DISCIPLINES, Discipline, echoPrimeVideos

### Community 31 - "FileRoutesByPath"
Cohesion: 0.23
Nodes (19): currentLocale(), absoluteUrl(), getSiteUrl(), jsonLdScript(), pageHead(), siteJsonLd(), Route, Route (+11 more)

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.27
Nodes (8): PEYDA_BASE64, COUPLED_LOGO_PAIRS, MOODBOARD_GRID_IMAGES, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL(), renderWhiteLogoDataUrl()

### Community 35 - "DedicatedPhotoView.tsx"
Cohesion: 0.13
Nodes (24): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), DedicatedPhotoLoaderData, DedicatedPhotoView(), extFromSrc(), formatSlugLabel(), isVideoAsset() (+16 more)

### Community 36 - "$discipline.$photoId.tsx"
Cohesion: 0.19
Nodes (17): codeMap, computeItemSeoSlug(), CustomCreditField, getPhotoByCode(), getPhotoBySeoSlug(), getPhotoByStem(), PHOTO_INVENTORY, slugifyValue() (+9 more)

### Community 37 - "motion"
Cohesion: 0.33
Nodes (6): motion, CustomDatePicker(), CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, Locale

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "AboutPage"
Cohesion: 0.25
Nodes (11): AboutPage(), createDefaultFilters(), Hero(), SelectedWork(), SkillColumn(), SkillsSection(), t(), Timeline() (+3 more)

### Community 40 - "dedicatedPhotoHead"
Cohesion: 0.67
Nodes (3): dedicatedPhotoHead(), DedicatedPhotoRouteComponent(), Route

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "__root.tsx"
Cohesion: 0.08
Nodes (50): @supabase/supabase-js, @vercel/blob, PublishedPageLoading(), LiquidWaveSpinner(), LiquidWaveSpinnerProps, sizeClasses, PublishStatus(), blobCredentials() (+42 more)

### Community 44 - "TimelineEntry"
Cohesion: 0.33
Nodes (6): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), TimelineEntry(), tipYFromProgress()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "useLocale"
Cohesion: 0.18
Nodes (19): CoverTile(), CoverTileProps, DisciplineCircleMap(), ROOTS, coverTileImage(), DisciplinesMarquee(), PageHeader(), EqualCardItem (+11 more)

### Community 47 - "package.json"
Cohesion: 0.15
Nodes (12): clsx@^2.1.1, html-to-image@^1.11.13, react-dom@^19.2.0, @tanstack/router-plugin@^1.168.18, name, private, sideEffects, type (+4 more)

### Community 50 - "server.ts"
Cohesion: 0.11
Nodes (28): consumeLastCapturedError(), renderErrorPage(), DEFAULT_LOCALE, detectedScript(), isNonPublicPath(), localeFromPath(), LocaleState, requestLocales (+20 more)

### Community 51 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.23
Nodes (13): NotFoundPage(), projectBackButtonClass, projectBackButtonMobileClass, buildGalleryItemsForProject(), CombinedLoaderData, computeClientProjectState(), computeInitialProjectState(), findMatchingProject() (+5 more)

### Community 52 - "inventory-assets.ts"
Cohesion: 0.29
Nodes (7): assetEntries, AssetEntry, assetModules, byFileLower, byStem, matchAssetEntry(), resolveKnownAssetFile()

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.13
Nodes (9): browser(), blog, blogs, media, pages, photo, project, site (+1 more)

### Community 58 - "react"
Cohesion: 0.07
Nodes (40): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), HoverFooter() (+32 more)

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `@tanstack/react-router` to `$discipline.$specialty.index.tsx`, `brand-discovery.tsx`, `DedicatedPhotoView.tsx`, `__root.tsx`, `motion`, `$discipline.$photoId.tsx`, `site-content.ts`, `about.tsx`, `__root.tsx`, `dependencies`, `package.json`, `useLocale`, `vault-store.ts`, `studio-store.ts`, `$discipline.$specialty.$project.index.tsx`, `index.tsx`, `react`, `expandable-gallery.tsx`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `@tanstack/react-router` to `$discipline.$specialty.index.tsx`, `__root.tsx`, `getVaultPages`, `site-content.ts`, `routeTree.gen.ts`, `about.tsx`, `dependencies`, `vault-store.ts`, `studio-store.ts`, `index.tsx`, `FileRoutesByPath`, `api.contact.ts`, `brand-discovery.tsx`, `DedicatedPhotoView.tsx`, `$discipline.$photoId.tsx`, `dedicatedPhotoHead`, `__root.tsx`, `useLocale`, `package.json`, `server.ts`, `$discipline.$specialty.$project.index.tsx`, `admin.tsx`, `admin.index.tsx`, `admin.inventory.tsx`, `react`, `admin.invoices.tsx`, `vault.index.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `__root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11494252873563218 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `vite.config.ts` to `getVaultPages`, `__root.tsx`, `package.json`, `server.ts`, `FileRoutesByPath`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `visual-identity-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._
- **Should `site-content.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13257575757575757 - nodes in this community are weakly interconnected._