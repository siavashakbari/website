# Graph Report - Creative Showcase Studio  (2026-11-25)

## Corpus Check
- 152 files · ~219,974 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .ttf 9, (none) 4, .woff2 3)

## Summary
- 1507 nodes · 3590 edges · 66 communities (57 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fa4fb366`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- eslint.config.js
- $discipline.$specialty.index.tsx
- DedicatedPhotoView.tsx
- published-store.ts
- vercel-blob-content.server.ts
- visual-identity-assets.ts
- contact.tsx
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
- site-content.ts
- test-all-routes-live.mjs
- __root.tsx
- ping
- devDependencies
- vite.config.ts
- vault.tsx
- package.json
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- admin.blog.tsx
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- admin.index.tsx
- react
- admin.tsx
- grow-to-band.mjs
- useLocale
- localizedText
- scripts
- compress-images.mjs
- vault.invoices.tsx
- admin.inventory.tsx
- migrate-bilingual-content.mjs
- BinaryBannerCanvas.tsx
- vault.pages.tsx
- expandable-gallery.tsx
- test-vault-ssr-first-render.mjs
- AboutPage
- TimelineEntry
- SelectedWork
- react
- admin.invoices.tsx
- test-vault-ssr-first-render.mjs
- admin.projects.tsx
- vault.index.tsx
- photo-inventory.ts
- $discipline.$specialty.$project.index.tsx
- vault.blog.tsx
- FileRoutesByPath
- local-media-db.ts
- vault.site-content.tsx
- taxonomy.ts
- blog-posts.ts

## God Nodes (most connected - your core abstractions)
1. `useLocale()` - 54 edges
2. `localizedText()` - 47 edges
3. `@tanstack/react-router` - 45 edges
4. `react` - 43 edges
5. `normalizeProjectSlug()` - 38 edges
6. `getVaultPages()` - 36 edges
7. `FileRoutesByPath` - 35 edges
8. `getVaultMedia()` - 33 edges
9. `currentLocale()` - 33 edges
10. `withLocale()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `PageHeaderProps` --references--> `KeyValuePair`  [EXTRACTED]
  src/components/ui-types/PageHeader.tsx → src/components/vault/PairedBoxesEditor.tsx
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts
- `DedicatedPhotoRouteComponent()` --calls--> `DedicatedPhotoView()`  [EXTRACTED]
  src/routes/$discipline.$specialty.$project.$photoId.tsx → src/components/DedicatedPhotoView.tsx
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx

## Import Cycles
- None detected.

## Communities (66 total, 9 thin omitted)

### Community 1 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0, typescript-eslint@^8.56.1, @eslint/js, eslint-plugin-prettier (+4 more)

### Community 2 - "$discipline.$specialty.index.tsx"
Cohesion: 0.14
Nodes (33): UITypeCode, resolveInventoryImage(), getPublishedArray(), isContentReady(), getDeletedProjectIds(), getStudioProjects(), buildMediaLiveDetailUrl(), getGalleryMediaForRoute() (+25 more)

### Community 3 - "DedicatedPhotoView.tsx"
Cohesion: 0.20
Nodes (31): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), DedicatedPhotoView(), extFromSrc(), formatSlugLabel(), isVideoAsset(), looksLikeMediaCode() (+23 more)

### Community 4 - "published-store.ts"
Cohesion: 0.14
Nodes (26): LiquidWaveSpinner(), LiquidWaveSpinnerProps, sizeClasses, PublishStatus(), announceContent(), content, CONTENT_STATUS_EVENT, contentStorage (+18 more)

### Community 5 - "vercel-blob-content.server.ts"
Cohesion: 0.06
Nodes (59): @supabase/supabase-js@^2.117.2, @tanstack/react-start@^1.169.4, @supabase/supabase-js, @tanstack/react-start, @vercel/blob, blobCredentials(), consumeLastCapturedError(), renderErrorPage() (+51 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.03
Nodes (5): COUPLED_LOGO_PAIRS, CoupledOption, CoupledPair, MOODBOARD_GRID_IMAGES, MoodboardItem

### Community 7 - "contact.tsx"
Cohesion: 0.35
Nodes (11): ContactForm(), ContactFormValues, TOPICS, CustomDatePicker(), readSiteContent(), SITE_SEED, siteField(), BehanceIcon() (+3 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (47): Route, Route, AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute (+39 more)

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
Cohesion: 0.09
Nodes (22): dependencies, html-to-image@^1.11.13, jspdf@^4.2.1, lucide-react@^0.575.0, motion@^12.42.2, mp4box@^2.5.0, @radix-ui/react-dropdown-menu@^2.1.16, react@^19.2.0 (+14 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.16
Nodes (34): deleteMediaBlob(), isIndexedDbMediaUrl(), addDeletedKeys(), buildAssignedRoute(), buildDynamicMediaCode(), cleanSegment(), computeVaultDiagnostics(), deleteVaultMedia() (+26 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "studio-store.ts"
Cohesion: 0.11
Nodes (22): Project, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), deleteCustomPhotoAsset(), extractAssetFilename(), getCustomPhotoAssets() (+14 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 20 - "site-content.ts"
Cohesion: 0.13
Nodes (17): OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH, PageSeoInput, SITE_DESCRIPTION, SITE_TITLE_DEFAULT, appearanceSettings, isLocalized() (+9 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "__root.tsx"
Cohesion: 0.14
Nodes (13): LanguageSwitch(), nearestEdge(), SITE_NAME, TWITTER_HANDLE, CloseIcon(), computeVisibleNavItems(), Header(), isDisciplinePath() (+5 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, prettier@^3.7.3, @types/node@^22.16.5, @types/react@^19.2.0, @types/react-dom@^19.2.0, typescript@^5.8.3 (+7 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.13
Nodes (13): @tailwindcss/vite@^4.2.1, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite, vite (+5 more)

### Community 26 - "vault.tsx"
Cohesion: 0.36
Nodes (5): Logo(), supabase, Route, VaultLayout(), VaultSession

### Community 27 - "package.json"
Cohesion: 0.15
Nodes (12): clsx@^2.1.1, mp4-muxer@^5.2.2, react-dom@^19.2.0, @tanstack/react-query@^5.101.1, name, private, sideEffects, type (+4 more)

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
Cohesion: 0.36
Nodes (6): PEYDA_BASE64, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL(), renderWhiteLogoDataUrl()

### Community 36 - "react"
Cohesion: 0.06
Nodes (47): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), HoverFooter() (+39 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "useLocale"
Cohesion: 0.15
Nodes (21): @tanstack/react-router, CoverTile(), CoverTileProps, coverTileImage(), DisciplinesMarquee(), NotFoundPage(), InteractiveHoverButton, InteractiveHoverButtonProps (+13 more)

### Community 40 - "localizedText"
Cohesion: 0.22
Nodes (12): DisciplineCircleMap(), ROOTS, PageHeader(), PageHeaderProps, DISCIPLINES, detectedScript(), LocaleState, localizedText() (+4 more)

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "vault.invoices.tsx"
Cohesion: 0.16
Nodes (19): SIGNATURE_DATA_URL, exportInvoiceToPDF(), loadPrivateVaultContent(), savePrivateVaultContent(), deleteInvoice(), getSavedInvoices(), saveInvoice(), requireVaultToken() (+11 more)

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "BinaryBannerCanvas.tsx"
Cohesion: 0.29
Nodes (8): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), Index(), portraitSrc(), splitStat()

### Community 47 - "vault.pages.tsx"
Cohesion: 0.16
Nodes (22): UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeDefinition, KeyValuePair, PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs() (+14 more)

### Community 48 - "expandable-gallery.tsx"
Cohesion: 0.24
Nodes (8): COMPACT_STACK_LAYOUT, COMPACT_STACK_MOBILE, ExpandableGallery(), ExpandableGalleryProps, GalleryPhoto, STACK_LAYOUT, transition, useOutsideClick()

### Community 49 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.22
Nodes (8): blog, blogs, media, pages, photo, project, site, siteContent

### Community 50 - "AboutPage"
Cohesion: 0.36
Nodes (8): AboutPage(), createDefaultFilters(), Hero(), SkillColumn(), SkillsSection(), t(), TimelineFilters(), toFiveScale()

### Community 51 - "TimelineEntry"
Cohesion: 0.29
Nodes (7): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), Timeline(), TimelineEntry(), tipYFromProgress()

### Community 52 - "SelectedWork"
Cohesion: 0.70
Nodes (5): SelectedWork(), WorkImage(), WorkLink(), WorkMetadata(), WorkOrbit()

### Community 53 - "react"
Cohesion: 0.26
Nodes (12): lucide-react, motion, react, BackToTop(), CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, Locale (+4 more)

### Community 58 - "photo-inventory.ts"
Cohesion: 0.10
Nodes (22): codeMap, computeItemSeoSlug(), CustomCreditField, getPhotoByCode(), getPhotoBySeoSlug(), getPhotoByStem(), PHOTO_INVENTORY, PhotoInventoryItem (+14 more)

### Community 59 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.14
Nodes (21): DedicatedPhotoLoaderData, PublishedPageLoading(), projectBackButtonClass, projectBackButtonMobileClass, projects, subscribeToStudioStore(), FLAT_FIELDS, VaultMediaItem (+13 more)

### Community 60 - "vault.blog.tsx"
Cohesion: 0.21
Nodes (17): BlogBlocksEditor(), BlogAuthor, BlogCategory, blogMediaUrls(), uploadBlogMedia(), pending(), queueMediaCleanup(), retryPendingMediaCleanup() (+9 more)

### Community 61 - "FileRoutesByPath"
Cohesion: 0.23
Nodes (18): dedicatedPhotoHead(), currentLocale(), absoluteUrl(), getSiteUrl(), jsonLdScript(), pageHead(), siteJsonLd(), Route (+10 more)

### Community 62 - "local-media-db.ts"
Cohesion: 0.15
Nodes (16): assetEntries, AssetEntry, assetModules, byFileLower, byStem, matchAssetEntry(), resolveKnownAssetFile(), getMediaObjectUrl() (+8 more)

### Community 63 - "vault.site-content.tsx"
Cohesion: 0.18
Nodes (15): CloudUploadResult, getSupabaseConfig(), isCloudStorageConfigured(), sanitizeFileName(), uploadToCloudStorage(), waitForPublishedContentSave(), publishSiteContent(), SiteContent (+7 more)

### Community 64 - "taxonomy.ts"
Cohesion: 0.21
Nodes (13): DISCIPLINE_4_MAP, DISCIPLINE_ALIASES, generate4PartPhotoCode(), getDiscipline4Code(), getProject4Code(), getSpecialty4Code(), KNOWN_DISCIPLINES, KNOWN_SPECIALTIES (+5 more)

### Community 65 - "blog-posts.ts"
Cohesion: 0.20
Nodes (6): BLOG_CATEGORIES, BLOG_POSTS, BlogCategoryMeta, BlogPost, BlogSection, DEFAULT_AUTHOR

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `$discipline.$specialty.index.tsx`, `DedicatedPhotoView.tsx`, `published-store.ts`, `contact.tsx`, `about.tsx`, `dependencies`, `vault-store.ts`, `__root.tsx`, `vault.tsx`, `package.json`, `brand-discovery.tsx`, `react`, `useLocale`, `localizedText`, `vault.invoices.tsx`, `BinaryBannerCanvas.tsx`, `vault.pages.tsx`, `expandable-gallery.tsx`, `$discipline.$specialty.$project.index.tsx`, `vault.blog.tsx`, `local-media-db.ts`, `vault.site-content.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `vercel-blob-content.server.ts` to `vite.config.ts`, `package.json`, `site-content.ts`, `FileRoutesByPath`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `$discipline.$specialty.index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14146341463414633 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `useLocale` to `$discipline.$specialty.index.tsx`, `DedicatedPhotoView.tsx`, `vercel-blob-content.server.ts`, `contact.tsx`, `about.tsx`, `dependencies`, `vault-store.ts`, `site-content.ts`, `__root.tsx`, `vault.tsx`, `package.json`, `admin.blog.tsx`, `api.contact.ts`, `brand-discovery.tsx`, `admin.index.tsx`, `react`, `admin.tsx`, `vault.invoices.tsx`, `admin.inventory.tsx`, `BinaryBannerCanvas.tsx`, `vault.pages.tsx`, `react`, `admin.invoices.tsx`, `admin.projects.tsx`, `vault.index.tsx`, `$discipline.$specialty.$project.index.tsx`, `vault.blog.tsx`, `FileRoutesByPath`, `vault.site-content.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `published-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.135632183908046 - nodes in this community are weakly interconnected._
- **Should `vercel-blob-content.server.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05660945498343872 - nodes in this community are weakly interconnected._