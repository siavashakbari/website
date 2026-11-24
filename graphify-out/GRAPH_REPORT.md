# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~216,843 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .ttf 9, .woff2 5, (none) 4)

## Summary
- 1495 nodes · 3523 edges · 51 communities (50 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8de9d386`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DedicatedPhotoView.tsx
- react
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
- BinaryBannerCanvas.tsx
- ping
- package.json
- vite.config.ts
- taxonomy.ts
- expandable-gallery.tsx
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- seo.ts
- recover-and-compress.mjs
- api.contact.ts
- brand-discovery.tsx
- portfolio-schema.ts
- photo-inventory.ts
- validateSnapshot
- grow-to-band.mjs
- index.tsx
- server.ts
- scripts
- compress-images.mjs
- vault.invoices.tsx
- vault.blog.tsx
- migrate-bilingual-content.mjs
- start.ts
- vault.tsx
- SelectedWork
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
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx
- `Route` --calls--> `currentLocale()`  [EXTRACTED]
  src/routes/about.tsx → src/lib/locale.ts
- `Route` --calls--> `pageHead()`  [EXTRACTED]
  src/routes/about.tsx → src/lib/seo.ts
- `Route` --calls--> `siteField()`  [EXTRACTED]
  src/routes/about.tsx → src/lib/site-content.ts

## Import Cycles
- None detected.

## Communities (51 total, 1 thin omitted)

### Community 1 - "DedicatedPhotoView.tsx"
Cohesion: 0.05
Nodes (132): BackToTop(), CoverTile(), CoverTileProps, buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoView() (+124 more)

### Community 2 - "react"
Cohesion: 0.17
Nodes (14): lucide-react, motion, react, ContactFormValues, TOPICS, CustomDatePicker(), CustomDatePickerProps, MONTH_NAMES (+6 more)

### Community 3 - "__root.tsx"
Cohesion: 0.11
Nodes (15): getPublishedHydrationSnapshot(), requestSnapshot(), seedPublishedContent(), startPublishedContentSync(), siteJsonLd(), CloseIcon(), Header(), HoverFooter (+7 more)

### Community 4 - "studio-store.ts"
Cohesion: 0.11
Nodes (21): Project, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), deleteCustomPhotoAsset(), deleteInvoice(), extractAssetFilename() (+13 more)

### Community 5 - "vercel-private-content.server.ts"
Cohesion: 0.22
Nodes (15): @supabase/supabase-js, @tanstack/react-router, @vercel/blob, blobCredentials(), requireVaultAdmin(), readVercelPrivateContent(), readWithEtag(), saveVercelPrivateContent() (+7 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.16
Nodes (16): contentStorage, isLocalized(), Localized, publishSiteContent(), SITE_CONTENT_KEY, SiteContent, SiteLink, SitePageContent (+8 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (59): Route, Route, Route, Route, Route, Route, Route, Route (+51 more)

### Community 9 - "about.tsx"
Cohesion: 0.06
Nodes (38): siteLocalized(), ABOUT_EDITORIAL_FIELDS, AboutPage(), CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON (+30 more)

### Community 10 - "media-sizing.ts"
Cohesion: 0.16
Nodes (20): mp4box@^2.5.0, mp4box, compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions (+12 more)

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
Nodes (29): dependencies, clsx@^2.1.1, html-to-image@^1.11.13, jspdf@^4.2.1, lucide-react@^0.575.0, motion@^12.42.2, mp4-muxer@^5.2.2, @radix-ui/react-dropdown-menu@^2.1.16 (+21 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.06
Nodes (89): UI_TYPE_LIST, PageHeaderProps, GalleryMediaItem, HorizontalLightbox(), HorizontalMediaTile(), itemsAlt(), UI02_HorizontalScroll(), UI02_HorizontalScrollProps (+81 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "blog-posts.ts"
Cohesion: 0.17
Nodes (10): BLOG_CATEGORIES, BLOG_POSTS, BlogAuthor, BlogCategory, BlogCategoryMeta, BlogPost, BlogSection, DEFAULT_AUTHOR (+2 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 20 - "published-store.ts"
Cohesion: 0.27
Nodes (15): PublishStatus(), announceContent(), content, CONTENT_STATUS_EVENT, discardPendingContentSave(), flushContentSave(), getContentStatus(), hasPendingRecovery() (+7 more)

### Community 21 - "test-all-routes-live.mjs"
Cohesion: 0.17
Nodes (13): cleanSegment(), __dirname, fetchWithTimeout(), __filename, getFreePort(), main(), normalizeProjectSlug(), parseTestRoutes() (+5 more)

### Community 22 - "BinaryBannerCanvas.tsx"
Cohesion: 0.24
Nodes (9): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), LanguageSwitch(), switchLocaleUrl(), nearestEdge() (+1 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "package.json"
Cohesion: 0.08
Nodes (35): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, @eslint/js@^9.32.0, eslint-plugin-prettier@^5.2.6, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.20, globals@^15.15.0 (+27 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.18
Nodes (9): @tailwindcss/vite@^4.2.1, vite-tsconfig-paths@^6.0.2, vite@^8.0.16, @tailwindcss/vite, vite, vite-tsconfig-paths, projectRoot, WATCH_ROOT_FILES (+1 more)

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
Nodes (3): DisciplineCard, Discipline, echoPrimeVideos

### Community 31 - "seo.ts"
Cohesion: 0.22
Nodes (8): OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH, PageSeoInput, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE_DEFAULT, TWITTER_HANDLE

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.24
Nodes (9): PEYDA_BASE64, COUPLED_LOGO_PAIRS, MOODBOARD_GRID_IMAGES, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL(), renderWhiteLogoDataUrl() (+1 more)

### Community 35 - "portfolio-schema.ts"
Cohesion: 0.22
Nodes (9): Window, DISCIPLINE_CODE_MAP, DISCIPLINE_QUICK_TAGS, DISCIPLINE_ROLE_MATRIX, DisciplineCode, DisciplineRoleDefinition, DisciplineSlug, ProjectCaseStudy (+1 more)

### Community 36 - "photo-inventory.ts"
Cohesion: 0.22
Nodes (10): DedicatedPhotoLoaderData, codeMap, computeItemSeoSlug(), CustomCreditField, PHOTO_INVENTORY, PhotoInventoryItem, slugifyValue(), slugMap (+2 more)

### Community 37 - "validateSnapshot"
Cohesion: 0.29
Nodes (12): commitSnapshot(), ContentSnapshot, PUBLIC_CONTENT_KEYS, validateSnapshot(), BlobContentSnapshot, initializeVercelPublishedContent(), readSnapshotWithEtag(), readVercelPublishedContent() (+4 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "index.tsx"
Cohesion: 0.32
Nodes (13): ContactForm(), readSiteContent(), siteField(), BehanceIcon(), Contact(), easeInOutCubic(), Route, TypewriterHeadline() (+5 more)

### Community 40 - "server.ts"
Cohesion: 0.15
Nodes (16): @tanstack/react-start@^1.169.4, @tanstack/react-start, consumeLastCapturedError(), renderErrorPage(), DEFAULT_LOCALE, isNonPublicPath(), localeFromPath(), stripLocale() (+8 more)

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "vault.invoices.tsx"
Cohesion: 0.18
Nodes (17): SIGNATURE_DATA_URL, exportInvoiceToPDF(), loadPrivateVaultContent(), savePrivateVaultContent(), getSavedInvoices(), saveInvoice(), requireVaultToken(), PrivateVaultData (+9 more)

### Community 44 - "vault.blog.tsx"
Cohesion: 0.46
Nodes (7): deleteStudioBlogPost(), getStudioBlogPosts(), notifyStudioStoreUpdated(), saveCustomTaxonomy(), saveStudioBlogPost(), AdminBlogView(), Route

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "start.ts"
Cohesion: 0.33
Nodes (7): requestLocales, withRequestLocale(), loadRequestPublishedSnapshot(), PublishedSnapshot, requestSnapshots, withRequestPublishedSnapshot(), publishedContentMiddleware

### Community 47 - "vault.tsx"
Cohesion: 0.38
Nodes (5): Logo(), supabase, Route, VaultLayout(), VaultSession

### Community 48 - "SelectedWork"
Cohesion: 0.43
Nodes (7): portfolioMediaKey(), readPortfolioWork(), SelectedWork(), WorkImage(), WorkLink(), WorkMetadata(), WorkOrbit()

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.13
Nodes (9): browser(), blog, blogs, media, pages, photo, project, site (+1 more)

### Community 58 - "react"
Cohesion: 0.06
Nodes (48): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), HoverFooter() (+40 more)

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `DedicatedPhotoView.tsx`, `brand-discovery.tsx`, `__root.tsx`, `index.tsx`, `site-content.ts`, `about.tsx`, `vault.invoices.tsx`, `vault.blog.tsx`, `dependencies`, `vault-store.ts`, `vault.tsx`, `published-store.ts`, `BinaryBannerCanvas.tsx`, `package.json`, `react`, `expandable-gallery.tsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `vercel-private-content.server.ts` to `DedicatedPhotoView.tsx`, `react`, `__root.tsx`, `site-content.ts`, `routeTree.gen.ts`, `about.tsx`, `dependencies`, `vault-store.ts`, `BinaryBannerCanvas.tsx`, `package.json`, `api.contact.ts`, `brand-discovery.tsx`, `validateSnapshot`, `index.tsx`, `server.ts`, `vault.invoices.tsx`, `vault.blog.tsx`, `vault.tsx`, `react`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `DedicatedPhotoView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05400943396226415 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `server.ts` to `DedicatedPhotoView.tsx`, `vercel-private-content.server.ts`, `routeTree.gen.ts`, `start.ts`, `package.json`, `vite.config.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `__root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11076923076923077 - nodes in this community are weakly interconnected._
- **Should `studio-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._