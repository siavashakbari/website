# Graph Report - Creative Showcase Studio  (2026-11-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1495 nodes · 3524 edges · 50 communities (44 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a46196d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DedicatedPhotoView.tsx
- published-store.ts
- vault-store.ts
- __root.tsx
- react
- visual-identity-assets.ts
- seo.ts
- routeTree.gen.ts
- about.tsx
- AdaptiveThumb.tsx
- generate-sitemap.mjs
- test-all-vault-connectivity.mjs
- generate-architecture-map.mjs
- dependencies
- media-sizing.ts
- audit-cross-system.mjs
- studio-store.ts
- compilerOptions
- components.json
- devDependencies
- test-all-routes-live.mjs
- FileRoutesByPath
- ping
- package.json
- vite.config.ts
- blog-posts.ts
- taxonomy.ts
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- pageHead
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- portfolio-schema.ts
- photo-inventory.ts
- ref_node_assert
- grow-to-band.mjs
- AboutPage
- vault.blog.tsx
- scripts
- compress-images.mjs
- test-vault-ssr-first-render.mjs
- TimelineEntry
- migrate-bilingual-content.mjs
- prettier@^3.7.3
- @types/react@^19.2.0
- mergeMilestones
- portfolioProjectToMilestone

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
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts
- `RootShell()` --calls--> `useLocale()`  [EXTRACTED]
  src/routes/__root.tsx → src/lib/use-locale.ts
- `RootComponent()` --indirect_call--> `startPublishedContentSync()`  [INFERRED]
  src/routes/__root.tsx → src/lib/published-store.ts
- `DedicatedPhotoLoaderData` --references--> `PhotoInventoryItem`  [EXTRACTED]
  src/components/DedicatedPhotoView.tsx → src/data/photo-inventory.ts

## Import Cycles
- None detected.

## Communities (50 total, 6 thin omitted)

### Community 1 - "DedicatedPhotoView.tsx"
Cohesion: 0.06
Nodes (125): @tanstack/react-router, CoverTile(), CoverTileProps, buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoLoaderData (+117 more)

### Community 2 - "published-store.ts"
Cohesion: 0.06
Nodes (68): @supabase/supabase-js, @vercel/blob, SIGNATURE_DATA_URL, Logo(), PublishStatus(), blobCredentials(), exportInvoiceToPDF(), loadPrivateVaultContent() (+60 more)

### Community 3 - "vault-store.ts"
Cohesion: 0.07
Nodes (83): UI_TYPE_LIST, PageHeaderProps, KeyValuePair, PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs(), CloudUploadResult (+75 more)

### Community 4 - "__root.tsx"
Cohesion: 0.06
Nodes (44): @tanstack/react-query@^5.101.1, @tanstack/react-start@^1.169.4, @tanstack/react-query, @tanstack/react-start, BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES (+36 more)

### Community 5 - "react"
Cohesion: 0.07
Nodes (47): motion@^12.42.2, lucide-react, motion, react, BackToTop(), HoverFooter(), clientToSvgPoint(), LOGO_PATHS (+39 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "seo.ts"
Cohesion: 0.07
Nodes (49): ContactForm(), ContactFormValues, TOPICS, CustomDatePicker(), CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, GROUPS (+41 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (47): AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute, AdminRoute, AdminRouteChildren (+39 more)

### Community 9 - "about.tsx"
Cohesion: 0.05
Nodes (27): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+19 more)

### Community 10 - "AdaptiveThumb.tsx"
Cohesion: 0.13
Nodes (21): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), GalleryMediaItem (+13 more)

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
Nodes (22): dependencies, clsx@^2.1.1, html-to-image@^1.11.13, lucide-react@^0.575.0, mp4-muxer@^5.2.2, @radix-ui/react-dropdown-menu@^2.1.16, react@^19.2.0, @supabase/supabase-js@^2.117.2 (+14 more)

### Community 15 - "media-sizing.ts"
Cohesion: 0.16
Nodes (20): mp4box@^2.5.0, mp4box, compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions (+12 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "studio-store.ts"
Cohesion: 0.11
Nodes (19): Project, isVercelContentBackend, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), deleteInvoice(), extractAssetFilename() (+11 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 20 - "devDependencies"
Cohesion: 0.14
Nodes (17): devDependencies, eslint@^9.32.0, @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0, typescript@^5.8.3 (+9 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "FileRoutesByPath"
Cohesion: 0.12
Nodes (10): Route, Route, Route, Route, Route, Route, Route, Route (+2 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "package.json"
Cohesion: 0.13
Nodes (14): jspdf@^4.2.1, react-dom@^19.2.0, eslint-config-prettier@^10.1.1, @types/node@^22.16.5, @types/react-dom@^19.2.0, name, private, sideEffects (+6 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.13
Nodes (13): @tailwindcss/vite@^4.2.1, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite, vite (+5 more)

### Community 26 - "blog-posts.ts"
Cohesion: 0.17
Nodes (10): BLOG_CATEGORIES, BLOG_POSTS, BlogAuthor, BlogCategory, BlogCategoryMeta, BlogPost, BlogSection, DEFAULT_AUTHOR (+2 more)

### Community 27 - "taxonomy.ts"
Cohesion: 0.21
Nodes (13): DISCIPLINE_4_MAP, DISCIPLINE_ALIASES, generate4PartPhotoCode(), getDiscipline4Code(), getProject4Code(), getSpecialty4Code(), KNOWN_DISCIPLINES, KNOWN_SPECIALTIES (+5 more)

### Community 28 - "ref_node_fs"
Cohesion: 0.17
Nodes (4): EXTS, files, ROOT, walk()

### Community 29 - "extract-dominant-colors.mjs"
Cohesion: 0.18
Nodes (11): analyze(), assetsRoot, __dirname, EXT, files, isNearWhiteOrBlack(), map, outFile (+3 more)

### Community 30 - "disciplines.ts"
Cohesion: 0.18
Nodes (4): DisciplineCard, DISCIPLINES, Discipline, echoPrimeVideos

### Community 31 - "pageHead"
Cohesion: 0.26
Nodes (12): absoluteUrl(), getSiteUrl(), jsonLdScript(), pageHead(), siteJsonLd(), Route, Route, Route (+4 more)

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
Nodes (9): Window, DISCIPLINE_CODE_MAP, DISCIPLINE_QUICK_TAGS, DISCIPLINE_ROLE_MATRIX, DisciplineCode, DisciplineRoleDefinition, DisciplineSlug, ProjectCaseStudy (+1 more)

### Community 36 - "photo-inventory.ts"
Cohesion: 0.24
Nodes (9): codeMap, computeItemSeoSlug(), CustomCreditField, PHOTO_INVENTORY, PhotoInventoryItem, slugifyValue(), slugMap, stemMap (+1 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "AboutPage"
Cohesion: 0.31
Nodes (9): siteLocalized(), AboutPage(), createDefaultFilters(), Hero(), SkillColumn(), SkillsSection(), t(), TimelineFilters() (+1 more)

### Community 40 - "vault.blog.tsx"
Cohesion: 0.39
Nodes (8): deleteCustomPhotoAsset(), deleteStudioBlogPost(), getStudioBlogPosts(), notifyStudioStoreUpdated(), saveCustomTaxonomy(), saveStudioBlogPost(), AdminBlogView(), Route

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.25
Nodes (7): blog, blogs, media, pages, photo, project, site

### Community 44 - "TimelineEntry"
Cohesion: 0.29
Nodes (7): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), Timeline(), TimelineEntry(), tipYFromProgress()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `DedicatedPhotoView.tsx`, `published-store.ts`, `vault-store.ts`, `__root.tsx`, `brand-discovery.tsx`, `seo.ts`, `vault.blog.tsx`, `about.tsx`, `AdaptiveThumb.tsx`, `dependencies`, `package.json`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `DedicatedPhotoView.tsx` to `api.contact.ts`, `published-store.ts`, `brand-discovery.tsx`, `__root.tsx`, `react`, `vault-store.ts`, `seo.ts`, `vault.blog.tsx`, `about.tsx`, `AdaptiveThumb.tsx`, `dependencies`, `FileRoutesByPath`, `package.json`, `pageHead`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `DedicatedPhotoView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05909961685823755 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `__root.tsx` to `DedicatedPhotoView.tsx`, `published-store.ts`, `package.json`, `vite.config.ts`, `pageHead`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `published-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055661729574773056 - nodes in this community are weakly interconnected._
- **Should `vault-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06569517439082656 - nodes in this community are weakly interconnected._