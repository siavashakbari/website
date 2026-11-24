# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 149 files · ~216,567 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .ttf 9, .woff2 5, (none) 4)

## Summary
- 1497 nodes · 3499 edges · 57 communities (54 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ee88cfc3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DedicatedPhotoView.tsx
- blobCredentials
- __root.tsx
- locale.ts
- AdaptiveThumb.tsx
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
- cn
- ref_node_fs
- extract-dominant-colors.mjs
- disciplines.ts
- seo.ts
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
- __root.tsx
- TimelineEntry
- migrate-bilingual-content.mjs
- useLocale
- LogoHoverEffect.tsx
- mergeMilestones
- portfolioProjectToMilestone
- server.ts
- useResolvedMediaSrc
- UI02_HorizontalScroll.tsx
- morphing-text.tsx
- CustomDatePicker.tsx
- test-vault-ssr-first-render.mjs
- expandable-gallery.tsx

## God Nodes (most connected - your core abstractions)
1. `useLocale()` - 54 edges
2. `localizedText()` - 45 edges
3. `@tanstack/react-router` - 45 edges
4. `react` - 43 edges
5. `normalizeProjectSlug()` - 38 edges
6. `FileRoutesByPath` - 35 edges
7. `getVaultPages()` - 34 edges
8. `isContentReady()` - 34 edges
9. `currentLocale()` - 33 edges
10. `withLocale()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `RootComponent()` --indirect_call--> `startPublishedContentSync()`  [INFERRED]
  src/routes/__root.tsx → src/lib/published-store.ts
- `PageNodeCardProps` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/vault.pages.tsx → src/lib/vault-store.ts
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts
- `getRouter()` --indirect_call--> `NotFoundPage()`  [INFERRED]
  src/router.tsx → src/components/NotFoundPage.tsx

## Import Cycles
- None detected.

## Communities (57 total, 3 thin omitted)

### Community 1 - "DedicatedPhotoView.tsx"
Cohesion: 0.05
Nodes (121): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoView(), extFromSrc(), formatSlugLabel(), isVideoAsset() (+113 more)

### Community 2 - "blobCredentials"
Cohesion: 0.22
Nodes (17): @supabase/supabase-js@^2.117.2, @vercel/blob@^2.4.0, @supabase/supabase-js, @vercel/blob, blobCredentials(), validateSnapshot(), requireVaultAdmin(), initializeVercelPublishedContent() (+9 more)

### Community 3 - "__root.tsx"
Cohesion: 0.12
Nodes (14): LanguageSwitch(), Logo(), switchLocaleUrl(), nearestEdge(), seedPublishedContent(), CloseIcon(), Header(), HoverFooter (+6 more)

### Community 4 - "locale.ts"
Cohesion: 0.16
Nodes (18): DEFAULT_LOCALE, detectedScript(), localeFromPath(), LocaleState, requestLocales, withRequestLocale(), stripLocale(), ContentSnapshot (+10 more)

### Community 5 - "AdaptiveThumb.tsx"
Cohesion: 0.18
Nodes (15): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), UI01_VerticalScroll() (+7 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.13
Nodes (30): ContactForm(), ContactFormValues, TOPICS, CustomDatePicker(), NotFoundPage(), SITE_DESCRIPTION, isLocalized(), Localized (+22 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (59): Route, Route, Route, Route, Route, Route, Route, Route (+51 more)

### Community 9 - "about.tsx"
Cohesion: 0.05
Nodes (27): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+19 more)

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
Cohesion: 0.08
Nodes (32): dependencies, clsx@^2.1.1, html-to-image@^1.11.13, jspdf@^4.2.1, lucide-react@^0.575.0, mp4-muxer@^5.2.2, mp4box@^2.5.0, @radix-ui/react-dropdown-menu@^2.1.16 (+24 more)

### Community 15 - "vault-store.ts"
Cohesion: 0.06
Nodes (78): UI_TYPE_LIST, PageHeader(), PageHeaderProps, KeyValuePair, PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs() (+70 more)

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
Cohesion: 0.26
Nodes (10): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), AnimatedStat(), Index(), portraitSrc() (+2 more)

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

### Community 27 - "cn"
Cohesion: 0.32
Nodes (11): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+3 more)

### Community 28 - "ref_node_fs"
Cohesion: 0.17
Nodes (4): EXTS, files, ROOT, walk()

### Community 29 - "extract-dominant-colors.mjs"
Cohesion: 0.20
Nodes (11): analyze(), assetsRoot, __dirname, EXT, files, isNearWhiteOrBlack(), map, outFile (+3 more)

### Community 30 - "disciplines.ts"
Cohesion: 0.20
Nodes (3): DisciplineCard, Discipline, echoPrimeVideos

### Community 31 - "seo.ts"
Cohesion: 0.18
Nodes (26): lucide-react, BackToTop(), withLocale(), absoluteUrl(), getSiteUrl(), jsonLdScript(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH (+18 more)

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

### Community 37 - "ref_node_assert"
Cohesion: 0.25
Nodes (3): browser(), commitSnapshot(), PUBLIC_CONTENT_KEYS

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "AboutPage"
Cohesion: 0.36
Nodes (8): AboutPage(), createDefaultFilters(), Hero(), SkillColumn(), SkillsSection(), t(), TimelineFilters(), toFiveScale()

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
Cohesion: 0.08
Nodes (46): SIGNATURE_DATA_URL, PublishStatus(), exportInvoiceToPDF(), loadPrivateVaultContent(), savePrivateVaultContent(), announceContent(), content, CONTENT_STATUS_EVENT (+38 more)

### Community 44 - "TimelineEntry"
Cohesion: 0.29
Nodes (7): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), Timeline(), TimelineEntry(), tipYFromProgress()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.57
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "useLocale"
Cohesion: 0.20
Nodes (13): @tanstack/react-router, CoverTile(), CoverTileProps, PublishedPageLoading(), LiquidWaveSpinner(), HiddenPageNotice(), HiddenPageNoticeProps, EqualCardItem (+5 more)

### Community 47 - "LogoHoverEffect.tsx"
Cohesion: 0.39
Nodes (6): HoverFooter(), clientToSvgPoint(), LOGO_PATHS, LogoHoverEffect(), screenPxToSvgRadius(), FooterBackgroundGradient()

### Community 50 - "server.ts"
Cohesion: 0.20
Nodes (11): @tanstack/react-start@^1.169.4, @tanstack/react-start, consumeLastCapturedError(), renderErrorPage(), isNonPublicPath(), fetch(), getServerEntry(), isH3SwallowedErrorBody() (+3 more)

### Community 51 - "useResolvedMediaSrc"
Cohesion: 0.26
Nodes (11): motion@^12.42.2, motion, UI04_VideoShowcase(), UI04_VideoShowcaseProps, VideoShowcaseCard(), VideoShowcaseItem, CustomSlider(), formatTime() (+3 more)

### Community 52 - "UI02_HorizontalScroll.tsx"
Cohesion: 0.36
Nodes (7): GalleryMediaItem, UI01_VerticalScrollProps, HorizontalLightbox(), HorizontalMediaTile(), itemsAlt(), UI02_HorizontalScroll(), UI02_HorizontalScrollProps

### Community 53 - "morphing-text.tsx"
Cohesion: 0.53
Nodes (5): MorphingText(), MorphingTextProps, SvgFilters(), Texts(), useMorphingText()

### Community 54 - "CustomDatePicker.tsx"
Cohesion: 0.50
Nodes (4): CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, Locale

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.25
Nodes (7): blog, blogs, media, pages, photo, project, site

### Community 58 - "expandable-gallery.tsx"
Cohesion: 0.14
Nodes (13): react, COMPACT_STACK_LAYOUT, COMPACT_STACK_MOBILE, ExpandableGallery(), ExpandableGalleryProps, GalleryPhoto, STACK_LAYOUT, transition (+5 more)

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `expandable-gallery.tsx` to `DedicatedPhotoView.tsx`, `__root.tsx`, `AdaptiveThumb.tsx`, `site-content.ts`, `about.tsx`, `dependencies`, `vault-store.ts`, `index.tsx`, `cn`, `seo.ts`, `brand-discovery.tsx`, `vault.blog.tsx`, `__root.tsx`, `useLocale`, `LogoHoverEffect.tsx`, `useResolvedMediaSrc`, `UI02_HorizontalScroll.tsx`, `morphing-text.tsx`, `CustomDatePicker.tsx`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `useLocale` to `DedicatedPhotoView.tsx`, `blobCredentials`, `__root.tsx`, `locale.ts`, `api.contact.ts`, `brand-discovery.tsx`, `site-content.ts`, `routeTree.gen.ts`, `about.tsx`, `vault.blog.tsx`, `__root.tsx`, `dependencies`, `vault-store.ts`, `UI02_HorizontalScroll.tsx`, `index.tsx`, `seo.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `DedicatedPhotoView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.053237410071942444 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `server.ts` to `DedicatedPhotoView.tsx`, `blobCredentials`, `locale.ts`, `routeTree.gen.ts`, `dependencies`, `vite.config.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `__root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Should `visual-identity-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._