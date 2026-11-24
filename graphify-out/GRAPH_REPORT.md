# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~217,503 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .ttf 9, (none) 4, .woff2 3)

## Summary
- 1492 nodes · 3520 edges · 48 communities (46 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b6e85582`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.tsx
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
- validateSnapshot
- test-all-routes-live.mjs
- AdaptiveThumb.tsx
- ping
- devDependencies
- vite.config.ts
- eslint.config.js
- package.json
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- FileRoutesByPath
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- portfolio-schema.ts
- ref_node_fs
- grow-to-band.mjs
- useLocale
- server.ts
- scripts
- compress-images.mjs
- published-store.ts
- migrate-bilingual-content.mjs
- start.ts
- @tanstack/react-router
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
- `BlobContentSnapshot` --references--> `ContentSnapshot`  [EXTRACTED]
  src/lib/vercel-blob-content.server.ts → src/lib/published-store-core.ts
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx
- `errorMiddleware` --calls--> `renderErrorPage()`  [EXTRACTED]
  src/start.ts → src/lib/error-page.ts
- `Route` --calls--> `currentLocale()`  [EXTRACTED]
  src/routes/about.tsx → src/lib/locale.ts

## Import Cycles
- None detected.

## Communities (48 total, 2 thin omitted)

### Community 1 - "index.tsx"
Cohesion: 0.19
Nodes (13): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), nearestEdge(), SITE_TITLE_DEFAULT, AnimatedStat() (+5 more)

### Community 2 - "CustomDatePicker.tsx"
Cohesion: 0.50
Nodes (4): CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, Locale

### Community 3 - "__root.tsx"
Cohesion: 0.15
Nodes (10): @tanstack/react-query@^5.101.1, @tanstack/react-query, CloseIcon(), ErrorComponent(), Header(), isDisciplinePath(), MenuIcon(), MobileNav() (+2 more)

### Community 4 - "studio-store.ts"
Cohesion: 0.05
Nodes (133): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoLoaderData, DedicatedPhotoView(), extFromSrc(), formatSlugLabel() (+125 more)

### Community 5 - "vercel-private-content.server.ts"
Cohesion: 0.22
Nodes (15): @supabase/supabase-js, @vercel/blob, blobCredentials(), requireVaultAdmin(), PrivateVaultSnapshot, readVercelPrivateContent(), readWithEtag(), saveVercelPrivateContent() (+7 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.13
Nodes (29): ContactForm(), ContactFormValues, TOPICS, CustomDatePicker(), contentStorage, SITE_DESCRIPTION, isLocalized(), Localized (+21 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (48): AboutRoute, AdminBlogRoute, AdminIndexRoute, AdminInventoryRoute, AdminInvoicesRoute, AdminProjectsRoute, AdminRoute, AdminRouteChildren (+40 more)

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
Cohesion: 0.11
Nodes (19): dependencies, clsx@^2.1.1, jspdf@^4.2.1, lucide-react@^0.575.0, mp4box@^2.5.0, @radix-ui/react-dropdown-menu@^2.1.16, react@^19.2.0, react-dom@^19.2.0 (+11 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.05
Nodes (98): UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeCode, UITypeDefinition, PageHeader(), PageHeaderProps, GalleryMediaItem, HorizontalLightbox() (+90 more)

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

### Community 20 - "validateSnapshot"
Cohesion: 0.28
Nodes (11): commitSnapshot(), PUBLIC_CONTENT_KEYS, validateSnapshot(), BlobContentSnapshot, initializeVercelPublishedContent(), readSnapshotWithEtag(), readVercelPublishedContent(), saveVercelPublishedContent() (+3 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "AdaptiveThumb.tsx"
Cohesion: 0.11
Nodes (23): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), UI01_VerticalScroll() (+15 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, prettier@^3.7.3, @types/node@^22.16.5, @types/react@^19.2.0, @types/react-dom@^19.2.0, typescript@^5.8.3 (+7 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.13
Nodes (13): @tailwindcss/vite@^4.2.1, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite, vite (+5 more)

### Community 26 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0, typescript-eslint@^8.56.1, @eslint/js, eslint-plugin-prettier (+4 more)

### Community 27 - "package.json"
Cohesion: 0.18
Nodes (10): tailwind-merge@^3.5.0, tailwindcss@^4.2.1, @tanstack/router-plugin@^1.168.18, name, private, sideEffects, type, tailwind-merge (+2 more)

### Community 28 - "ref_node_fs"
Cohesion: 0.29
Nodes (4): EXTS, files, ROOT, walk()

### Community 29 - "extract-dominant-colors.mjs"
Cohesion: 0.18
Nodes (11): analyze(), assetsRoot, __dirname, EXT, files, isNearWhiteOrBlack(), map, outFile (+3 more)

### Community 30 - "disciplines.ts"
Cohesion: 0.18
Nodes (4): DisciplineCard, DISCIPLINES, Discipline, echoPrimeVideos

### Community 31 - "FileRoutesByPath"
Cohesion: 0.15
Nodes (25): lucide-react, @tanstack/react-start, BackToTop(), absoluteUrl(), getSiteUrl(), jsonLdScript(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH (+17 more)

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

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "useLocale"
Cohesion: 0.21
Nodes (14): react, CoverTile(), CoverTileProps, ROOTS, coverTileImage(), DisciplinesMarquee(), LanguageSwitch(), HiddenPageNotice() (+6 more)

### Community 40 - "server.ts"
Cohesion: 0.18
Nodes (17): consumeLastCapturedError(), renderErrorPage(), DEFAULT_LOCALE, detectedScript(), isNonPublicPath(), localeFromPath(), LocaleState, requestLocales (+9 more)

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "published-store.ts"
Cohesion: 0.07
Nodes (48): html-to-image@^1.11.13, html-to-image, SIGNATURE_DATA_URL, Logo(), PublishedPageLoading(), LiquidWaveSpinner(), PublishStatus(), exportInvoiceToPDF() (+40 more)

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "start.ts"
Cohesion: 0.31
Nodes (8): withRequestLocale(), ContentSnapshot, loadRequestPublishedSnapshot(), PublishedSnapshot, requestSnapshots, withRequestPublishedSnapshot(), errorMiddleware, publishedContentMiddleware

### Community 51 - "@tanstack/react-router"
Cohesion: 0.13
Nodes (13): @tanstack/react-router, Route, Route, Route, Route, Route, Route, Route (+5 more)

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.18
Nodes (7): blog, blogs, media, pages, photo, project, site

### Community 58 - "react"
Cohesion: 0.07
Nodes (39): motion@^12.42.2, motion, HoverFooter(), clientToSvgPoint(), LOGO_PATHS, LogoHoverEffect(), screenPxToSvgRadius(), DropdownMenuCheckboxItem (+31 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useLocale` to `index.tsx`, `CustomDatePicker.tsx`, `brand-discovery.tsx`, `studio-store.ts`, `__root.tsx`, `site-content.ts`, `about.tsx`, `published-store.ts`, `dependencies`, `vault-store.ts`, `blog-posts.ts`, `AdaptiveThumb.tsx`, `react`, `package.json`, `FileRoutesByPath`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `@tanstack/react-router` to `api.contact.ts`, `brand-discovery.tsx`, `index.tsx`, `studio-store.ts`, `vercel-private-content.server.ts`, `__root.tsx`, `site-content.ts`, `useLocale`, `server.ts`, `about.tsx`, `published-store.ts`, `dependencies`, `vault-store.ts`, `blog-posts.ts`, `validateSnapshot`, `AdaptiveThumb.tsx`, `package.json`, `FileRoutesByPath`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `studio-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050335570469798654 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `FileRoutesByPath` to `vercel-private-content.server.ts`, `server.ts`, `start.ts`, `dependencies`, `vite.config.ts`, `package.json`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `visual-identity-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._
- **Should `site-content.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12834224598930483 - nodes in this community are weakly interconnected._