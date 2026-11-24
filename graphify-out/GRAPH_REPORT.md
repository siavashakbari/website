# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~218,512 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .ttf 9, (none) 4, .woff2 3)

## Summary
- 1495 nodes · 3530 edges · 55 communities (53 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b09472d`
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
- seo.ts
- test-all-routes-live.mjs
- __root.tsx
- ping
- devDependencies
- vite.config.ts
- DedicatedPhotoView.tsx
- package.json
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- $discipline.$specialty.$project.index.tsx
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- normalizeDisciplineSlug
- react
- @tanstack/react-router
- grow-to-band.mjs
- useLocale
- server.ts
- scripts
- compress-images.mjs
- published-store.ts
- taxonomy.ts
- migrate-bilingual-content.mjs
- index.tsx
- vercel-private-content.server.ts
- expandable-gallery.tsx
- test-vault-ssr-first-render.mjs
- AboutPage
- TimelineEntry
- SelectedWork
- CustomDatePicker.tsx
- test-vault-ssr-first-render.mjs

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
10. `isContentReady()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `RootShell()` --calls--> `useLocale()`  [EXTRACTED]
  src/routes/__root.tsx → src/lib/use-locale.ts
- `RootComponent()` --indirect_call--> `startPublishedContentSync()`  [INFERRED]
  src/routes/__root.tsx → src/lib/published-store.ts
- `PageHeaderProps` --references--> `KeyValuePair`  [EXTRACTED]
  src/components/ui-types/PageHeader.tsx → src/components/vault/PairedBoxesEditor.tsx
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx
- `SiteField` --calls--> `localizedText()`  [EXTRACTED]
  src/lib/site-content.ts → src/lib/locale.ts

## Import Cycles
- None detected.

## Communities (55 total, 2 thin omitted)

### Community 1 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0, typescript-eslint@^8.56.1, @eslint/js, eslint-plugin-prettier (+4 more)

### Community 2 - "$discipline.$specialty.index.tsx"
Cohesion: 0.15
Nodes (18): NotFoundPage(), UITypeCode, subscribeToStudioStore(), getDeletedVaultPageKeys(), subscribeToVaultStore(), computeInitialDisciplineState(), DisciplineMediaItem, DisciplinePage() (+10 more)

### Community 3 - "localizedText"
Cohesion: 0.24
Nodes (26): buildLivePhotoViewState(), extFromSrc(), resolveInventoryImage(), getCanonicalProjectSlug(), getDeletedProjectIds(), getMergedPhotoInventory(), getPhotosByProject(), getStudioProjects() (+18 more)

### Community 4 - "studio-store.ts"
Cohesion: 0.11
Nodes (23): Project, projects, contentStorage, isContentReady(), CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem() (+15 more)

### Community 5 - "blobCredentials"
Cohesion: 0.17
Nodes (21): @supabase/supabase-js, @vercel/blob, blobCredentials(), commitSnapshot(), ContentSnapshot, validateSnapshot(), loadRequestPublishedSnapshot(), PublishedSnapshot (+13 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.13
Nodes (29): ContactForm(), ContactFormValues, TOPICS, appearanceSettings, isLocalized(), Localized, previousLandingCopy, publishSiteContent() (+21 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (44): AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute, AdminRoute, AdminRouteChildren (+36 more)

### Community 9 - "about.tsx"
Cohesion: 0.06
Nodes (22): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+14 more)

### Community 10 - "media-sizing.ts"
Cohesion: 0.15
Nodes (21): mp4-muxer@^5.2.2, mp4-muxer, compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions (+13 more)

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
Nodes (21): dependencies, lucide-react@^0.575.0, motion@^12.42.2, mp4box@^2.5.0, @radix-ui/react-dropdown-menu@^2.1.16, react@^19.2.0, react-dom@^19.2.0, @supabase/supabase-js@^2.117.2 (+13 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.06
Nodes (83): KeyValuePair, PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs(), CloudUploadResult, getSupabaseConfig(), isCloudStorageConfigured() (+75 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "blog-posts.ts"
Cohesion: 0.14
Nodes (17): BLOG_CATEGORIES, BLOG_POSTS, BlogAuthor, BlogCategory, BlogCategoryMeta, BlogPost, BlogSection, DEFAULT_AUTHOR (+9 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 20 - "seo.ts"
Cohesion: 0.17
Nodes (22): lucide-react, BackToTop(), absoluteUrl(), getSiteUrl(), jsonLdScript(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH (+14 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "__root.tsx"
Cohesion: 0.13
Nodes (15): LanguageSwitch(), nearestEdge(), seedPublishedContent(), CloseIcon(), ErrorComponent(), Header(), HoverFooter, isDisciplinePath() (+7 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, prettier@^3.7.3, @types/node@^22.16.5, @types/react@^19.2.0, @types/react-dom@^19.2.0, typescript@^5.8.3 (+7 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.13
Nodes (13): @tailwindcss/vite@^4.2.1, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite, vite (+5 more)

### Community 26 - "DedicatedPhotoView.tsx"
Cohesion: 0.12
Nodes (24): computeClientPhotoState(), computeInitialPhotoState(), DedicatedPhotoLoaderData, DedicatedPhotoView(), formatSlugLabel(), isVideoAsset(), SiblingNavTarget, synthesizePhotoFromVault() (+16 more)

### Community 27 - "package.json"
Cohesion: 0.15
Nodes (12): clsx@^2.1.1, html-to-image@^1.11.13, jspdf@^4.2.1, @tanstack/react-query@^5.101.1, name, private, sideEffects, type (+4 more)

### Community 28 - "ref_node_fs"
Cohesion: 0.17
Nodes (4): EXTS, files, ROOT, walk()

### Community 29 - "extract-dominant-colors.mjs"
Cohesion: 0.18
Nodes (11): analyze(), assetsRoot, __dirname, EXT, files, isNearWhiteOrBlack(), map, outFile (+3 more)

### Community 30 - "disciplines.ts"
Cohesion: 0.20
Nodes (3): DisciplineCard, Discipline, echoPrimeVideos

### Community 31 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.19
Nodes (22): dedicatedPhotoHead(), DisciplineCircleMap(), PublishedPageLoading(), projectBackButtonClass, projectBackButtonMobileClass, currentLocale(), localizedText(), pageHead() (+14 more)

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.27
Nodes (8): PEYDA_BASE64, COUPLED_LOGO_PAIRS, MOODBOARD_GRID_IMAGES, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL(), renderWhiteLogoDataUrl()

### Community 35 - "normalizeDisciplineSlug"
Cohesion: 0.20
Nodes (19): looksLikeMediaCode(), redirectToCanonicalPath(), resolveDedicatedPhotoLoader(), codeMap, computeItemSeoSlug(), CustomCreditField, getPhotoByCode(), getPhotoBySeoSlug() (+11 more)

### Community 36 - "react"
Cohesion: 0.05
Nodes (52): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), HoverFooter() (+44 more)

### Community 37 - "@tanstack/react-router"
Cohesion: 0.11
Nodes (15): @tanstack/react-router, Route, Route, Route, Route, Route, Route, Route (+7 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "useLocale"
Cohesion: 0.12
Nodes (24): motion, react, CoverTile(), CoverTileProps, ROOTS, coverTileImage(), DisciplinesMarquee(), HiddenPageNotice() (+16 more)

### Community 40 - "server.ts"
Cohesion: 0.10
Nodes (29): @tanstack/react-start@^1.169.4, @tanstack/react-start, consumeLastCapturedError(), renderErrorPage(), DEFAULT_LOCALE, detectedScript(), isNonPublicPath(), localeFromPath() (+21 more)

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "published-store.ts"
Cohesion: 0.08
Nodes (45): SIGNATURE_DATA_URL, Logo(), PublishStatus(), exportInvoiceToPDF(), loadPrivateVaultContent(), savePrivateVaultContent(), announceContent(), content (+37 more)

### Community 44 - "taxonomy.ts"
Cohesion: 0.21
Nodes (13): DISCIPLINE_4_MAP, DISCIPLINE_ALIASES, generate4PartPhotoCode(), getDiscipline4Code(), getProject4Code(), getSpecialty4Code(), KNOWN_DISCIPLINES, KNOWN_SPECIALTIES (+5 more)

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "index.tsx"
Cohesion: 0.27
Nodes (9): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), Index(), portraitSrc(), Route (+1 more)

### Community 47 - "vercel-private-content.server.ts"
Cohesion: 0.47
Nodes (7): readVercelPrivateContent(), readWithEtag(), saveVercelPrivateContent(), validatePrivateData(), headers, json(), Route

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
Cohesion: 0.43
Nodes (7): portfolioMediaKey(), readPortfolioWork(), SelectedWork(), WorkImage(), WorkLink(), WorkMetadata(), WorkOrbit()

### Community 53 - "CustomDatePicker.tsx"
Cohesion: 0.40
Nodes (5): CustomDatePicker(), CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, Locale

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useLocale` to `brand-discovery.tsx`, `$discipline.$specialty.index.tsx`, `react`, `normalizeDisciplineSlug`, `site-content.ts`, `about.tsx`, `published-store.ts`, `index.tsx`, `dependencies`, `expandable-gallery.tsx`, `vault-store.ts`, `blog-posts.ts`, `seo.ts`, `CustomDatePicker.tsx`, `__root.tsx`, `DedicatedPhotoView.tsx`, `package.json`, `$discipline.$specialty.$project.index.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `server.ts` to `@tanstack/react-router`, `vite.config.ts`, `package.json`, `blobCredentials`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `$discipline.$specialty.index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1452991452991453 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `@tanstack/react-router` to `$discipline.$specialty.index.tsx`, `blobCredentials`, `site-content.ts`, `about.tsx`, `dependencies`, `vault-store.ts`, `blog-posts.ts`, `seo.ts`, `__root.tsx`, `DedicatedPhotoView.tsx`, `package.json`, `$discipline.$specialty.$project.index.tsx`, `api.contact.ts`, `brand-discovery.tsx`, `normalizeDisciplineSlug`, `react`, `useLocale`, `server.ts`, `published-store.ts`, `index.tsx`, `vercel-private-content.server.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `studio-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._
- **Should `visual-identity-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._