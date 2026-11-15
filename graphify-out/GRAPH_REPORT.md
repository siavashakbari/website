# Graph Report - Creative Showcase Studio  (2026-11-15)

## Corpus Check
- 150 files · ~216,901 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .otf 10, .ttf 9, .woff2 7)

## Summary
- 1500 nodes · 3519 edges · 60 communities (57 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3892d39`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- normalizeProjectSlug
- published-store.ts
- vault.media.tsx
- locale.ts
- react
- visual-identity-assets.ts
- seo.ts
- routeTree.gen.ts
- about.tsx
- react
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
- devDependencies
- vite.config.ts
- blog-posts.ts
- taxonomy.ts
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
- vault-store.ts
- mergeMilestones
- portfolioProjectToMilestone
- vault.pages.tsx
- $discipline.$specialty.index.tsx
- $discipline.index.tsx
- resolveInventoryImage
- $discipline.$specialty.$project.index.tsx
- getVaultPages
- DedicatedPhotoView.tsx
- package.json
- expandable-gallery.tsx
- inventory-assets.ts

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
10. `withLocale()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `RootShell()` --calls--> `useLocale()`  [EXTRACTED]
  src/routes/__root.tsx → src/lib/use-locale.ts
- `PageHeaderProps` --references--> `KeyValuePair`  [EXTRACTED]
  src/components/ui-types/PageHeader.tsx → src/components/vault/PairedBoxesEditor.tsx
- `SpecialtyRouteData` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/$discipline.$specialty.index.tsx → src/lib/vault-store.ts
- `ProjectRouteLoaderData` --references--> `VaultPageItem`  [EXTRACTED]
  src/routes/$discipline.$specialty.$project.index.tsx → src/lib/vault-store.ts
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts

## Import Cycles
- None detected.

## Communities (60 total, 3 thin omitted)

### Community 1 - "normalizeProjectSlug"
Cohesion: 0.23
Nodes (26): buildLivePhotoViewState(), computeClientPhotoState(), resolveDedicatedPhotoLoader(), synthesizePhotoFromVault(), getPublishedArray(), getCanonicalProjectSlug(), getCustomPhotoAssets(), getDeletedProjectIds() (+18 more)

### Community 2 - "published-store.ts"
Cohesion: 0.07
Nodes (48): @supabase/supabase-js, @tanstack/react-router, @vercel/blob, SIGNATURE_DATA_URL, blobCredentials(), exportInvoiceToPDF(), loadPrivateVaultContent(), savePrivateVaultContent() (+40 more)

### Community 3 - "vault.media.tsx"
Cohesion: 0.18
Nodes (22): KeyValuePair, PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs(), ManagedMedia, managedMediaFromUrl(), pending() (+14 more)

### Community 4 - "locale.ts"
Cohesion: 0.13
Nodes (24): consumeLastCapturedError(), renderErrorPage(), DEFAULT_LOCALE, detectedScript(), isNonPublicPath(), localeFromPath(), LocaleState, requestLocales (+16 more)

### Community 5 - "react"
Cohesion: 0.06
Nodes (47): motion@^12.42.2, motion, AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount() (+39 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.04
Nodes (3): CoupledOption, CoupledPair, MoodboardItem

### Community 7 - "seo.ts"
Cohesion: 0.07
Nodes (44): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), ContactForm(), ContactFormValues, TOPICS (+36 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (52): Route, Route, Route, Route, Route, Route, Route, AboutRoute (+44 more)

### Community 9 - "about.tsx"
Cohesion: 0.05
Nodes (27): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+19 more)

### Community 10 - "react"
Cohesion: 0.16
Nodes (14): react, UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeCode, UITypeDefinition, GalleryMediaItem, UI01_VerticalScroll(), UI01_VerticalScrollProps (+6 more)

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
Nodes (20): dependencies, jspdf@^4.2.1, lucide-react@^0.575.0, mp4-muxer@^5.2.2, react@^19.2.0, react-dom@^19.2.0, @supabase/supabase-js@^2.117.2, tailwind-merge@^3.5.0 (+12 more)

### Community 15 - "media-sizing.ts"
Cohesion: 0.16
Nodes (20): mp4box@^2.5.0, mp4box, compressVideoToStudioSpec(), computeStudioVideoDimensions(), getVideoExt(), pickRecorderMimeType(), processImageFile(), ProcessMediaOptions (+12 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "studio-store.ts"
Cohesion: 0.11
Nodes (18): Project, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), extractAssetFilename(), getCustomPhotoMetadata(), getCustomTaxonomy() (+10 more)

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

### Community 22 - "FileRoutesByPath"
Cohesion: 0.27
Nodes (13): dedicatedPhotoHead(), currentLocale(), pageHead(), Route, Route, Route, Route, DedicatedPhotoRouteComponent() (+5 more)

### Community 23 - "ping"
Cohesion: 0.12
Nodes (15): SUPABASE_KEY, SUPABASE_URL, jobs, ping, name, on, schedule, workflow_dispatch (+7 more)

### Community 24 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^9.32.0, eslint-config-prettier@^10.1.1, prettier@^3.7.3, @types/node@^22.16.5, @types/react@^19.2.0, @types/react-dom@^19.2.0, typescript@^5.8.3 (+7 more)

### Community 25 - "vite.config.ts"
Cohesion: 0.12
Nodes (15): @tailwindcss/vite@^4.2.1, @tanstack/react-start@^1.169.4, vite-tsconfig-paths@^6.0.2, nitro@3.0.260603-beta, vite@^8.0.16, @vitejs/plugin-react@^5.2.0, nitro, @tailwindcss/vite (+7 more)

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
Cohesion: 0.20
Nodes (3): DisciplineCard, Discipline, echoPrimeVideos

### Community 31 - "seo.ts"
Cohesion: 0.21
Nodes (17): lucide-react, absoluteUrl(), getSiteUrl(), jsonLdScript(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH, PageSeoInput (+9 more)

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
Cohesion: 0.22
Nodes (10): DedicatedPhotoLoaderData, codeMap, computeItemSeoSlug(), CustomCreditField, PHOTO_INVENTORY, PhotoInventoryItem, slugifyValue(), slugMap (+2 more)

### Community 37 - "ref_node_assert"
Cohesion: 0.13
Nodes (9): browser(), blog, blogs, media, pages, photo, project, site (+1 more)

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

### Community 43 - "__root.tsx"
Cohesion: 0.08
Nodes (41): LanguageSwitch(), Logo(), PublishedPageLoading(), LiquidWaveSpinner(), PublishStatus(), nearestEdge(), announceContent(), content (+33 more)

### Community 44 - "TimelineEntry"
Cohesion: 0.29
Nodes (7): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), Timeline(), TimelineEntry(), tipYFromProgress()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "useLocale"
Cohesion: 0.19
Nodes (16): CoverTile(), CoverTileProps, DisciplineCircleMap(), ROOTS, coverTileImage(), DisciplinesMarquee(), HiddenPageNoticeProps, EqualCardItem (+8 more)

### Community 47 - "vault-store.ts"
Cohesion: 0.22
Nodes (21): addDeletedKeys(), buildAssignedRoute(), buildDynamicMediaCode(), cleanSegment(), ensureMediaItemDynamicFields(), extFromMediaSrc(), filenameKeyFromSrc(), FLAT_FIELDS (+13 more)

### Community 50 - "vault.pages.tsx"
Cohesion: 0.19
Nodes (19): CloudUploadResult, getSupabaseConfig(), isCloudStorageConfigured(), publishInlineMedia(), sanitizeFileName(), uploadToCloudStorage(), processMediaUpload(), deleteVaultPage() (+11 more)

### Community 51 - "$discipline.$specialty.index.tsx"
Cohesion: 0.18
Nodes (17): BackToTop(), PageHeader(), PageHeaderProps, UI04_VideoShowcase(), UI04_VideoShowcaseProps, VideoShowcaseCard(), VideoShowcaseItem, projects (+9 more)

### Community 52 - "$discipline.index.tsx"
Cohesion: 0.22
Nodes (16): looksLikeMediaCode(), redirectToCanonicalPath(), NotFoundPage(), getPhotoByCode(), getPhotoBySeoSlug(), getPhotoByStem(), getMediaByCode(), computeClientDisciplineState() (+8 more)

### Community 53 - "resolveInventoryImage"
Cohesion: 0.24
Nodes (16): resolveInventoryImage(), deleteMediaBlob(), getMediaObjectUrl(), inflightReads, isIndexedDbMediaUrl(), listMediaBlobKeys(), objectUrlCache, openBlobDb() (+8 more)

### Community 54 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.17
Nodes (10): projectBackButtonClass, projectBackButtonMobileClass, getDeletedVaultPageKeys(), CombinedLoaderData, computeClientProjectState(), computeInitialProjectState(), ProjectCaseStudyPage(), ProjectOrPhotoRouteComponent() (+2 more)

### Community 55 - "getVaultPages"
Cohesion: 0.29
Nodes (14): buildMediaLiveDetailUrl(), computeVaultDiagnostics(), getGalleryMediaForRoute(), getVaultPages(), isRouteOrAncestorHidden(), normalizeRouteStr(), buildDisciplineData(), computeDisciplineChildCards() (+6 more)

### Community 56 - "DedicatedPhotoView.tsx"
Cohesion: 0.26
Nodes (12): computeInitialPhotoState(), DedicatedPhotoView(), extFromSrc(), formatSlugLabel(), isVideoAsset(), SiblingNavTarget, HiddenPageNotice(), trackCommissionInquiryFromAsset() (+4 more)

### Community 57 - "package.json"
Cohesion: 0.15
Nodes (12): clsx@^2.1.1, html-to-image@^1.11.13, @radix-ui/react-dropdown-menu@^2.1.16, tw-animate-css@^1.3.4, name, private, sideEffects, type (+4 more)

### Community 58 - "expandable-gallery.tsx"
Cohesion: 0.24
Nodes (8): COMPACT_STACK_LAYOUT, COMPACT_STACK_MOBILE, ExpandableGallery(), ExpandableGalleryProps, GalleryPhoto, STACK_LAYOUT, transition, useOutsideClick()

### Community 59 - "inventory-assets.ts"
Cohesion: 0.29
Nodes (7): assetEntries, AssetEntry, assetModules, byFileLower, byStem, matchAssetEntry(), resolveKnownAssetFile()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `published-store.ts`, `vault.media.tsx`, `react`, `seo.ts`, `about.tsx`, `dependencies`, `seo.ts`, `brand-discovery.tsx`, `vault.blog.tsx`, `__root.tsx`, `useLocale`, `vault.pages.tsx`, `$discipline.$specialty.index.tsx`, `$discipline.index.tsx`, `resolveInventoryImage`, `$discipline.$specialty.$project.index.tsx`, `DedicatedPhotoView.tsx`, `package.json`, `expandable-gallery.tsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `vite.config.ts` to `published-store.ts`, `locale.ts`, `getVaultPages`, `package.json`, `seo.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `published-store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07372229760289462 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `published-store.ts` to `vault.media.tsx`, `locale.ts`, `seo.ts`, `routeTree.gen.ts`, `about.tsx`, `react`, `dependencies`, `FileRoutesByPath`, `seo.ts`, `api.contact.ts`, `brand-discovery.tsx`, `vault.blog.tsx`, `__root.tsx`, `useLocale`, `vault.pages.tsx`, `$discipline.$specialty.index.tsx`, `$discipline.index.tsx`, `$discipline.$specialty.$project.index.tsx`, `getVaultPages`, `DedicatedPhotoView.tsx`, `package.json`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `locale.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13368983957219252 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.059887005649717516 - nodes in this community are weakly interconnected._