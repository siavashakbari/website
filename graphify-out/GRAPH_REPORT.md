# Graph Report - Creative Showcase Studio  (2026-11-24)

## Corpus Check
- 150 files · ~216,911 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .otf 10, .ttf 9, .woff2 7)

## Summary
- 1501 nodes · 3507 edges · 59 communities (55 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ede0f9f4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DedicatedPhotoView.tsx
- vercel-private-content.server.ts
- __root.tsx
- locale.ts
- react
- visual-identity-assets.ts
- site-content.ts
- routeTree.gen.ts
- about.tsx
- validateSnapshot
- generate-sitemap.mjs
- test-all-vault-connectivity.mjs
- generate-architecture-map.mjs
- dependencies
- vault.media.tsx
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
- server.ts
- react
- $discipline.$specialty.index.tsx
- vault.pages.tsx
- $discipline.$specialty.$project.index.tsx
- test-vault-ssr-first-render.mjs
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
- `PageHeaderProps` --references--> `KeyValuePair`  [EXTRACTED]
  src/components/ui-types/PageHeader.tsx → src/components/vault/PairedBoxesEditor.tsx
- `FileRoutesById` --references--> `Route`  [EXTRACTED]
  src/routeTree.gen.ts → src/routes/__root.tsx
- `getCustomTaxonomy()` --calls--> `isContentReady()`  [EXTRACTED]
  src/lib/studio-store.ts → src/lib/published-store.ts
- `errorMiddleware` --calls--> `renderErrorPage()`  [EXTRACTED]
  src/start.ts → src/lib/error-page.ts
- `RootShell()` --calls--> `useLocale()`  [EXTRACTED]
  src/routes/__root.tsx → src/lib/use-locale.ts

## Import Cycles
- None detected.

## Communities (59 total, 4 thin omitted)

### Community 1 - "DedicatedPhotoView.tsx"
Cohesion: 0.17
Nodes (31): buildLivePhotoViewState(), computeClientPhotoState(), computeInitialPhotoState(), dedicatedPhotoHead(), DedicatedPhotoView(), extFromSrc(), formatSlugLabel(), isVideoAsset() (+23 more)

### Community 2 - "vercel-private-content.server.ts"
Cohesion: 0.24
Nodes (14): @supabase/supabase-js, @vercel/blob, blobCredentials(), requireVaultAdmin(), readVercelPrivateContent(), readWithEtag(), saveVercelPrivateContent(), validatePrivateData() (+6 more)

### Community 3 - "__root.tsx"
Cohesion: 0.09
Nodes (21): LanguageSwitch(), nearestEdge(), OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH, PageSeoInput, SITE_DESCRIPTION, SITE_NAME (+13 more)

### Community 4 - "locale.ts"
Cohesion: 0.25
Nodes (12): NotFoundPage(), DEFAULT_LOCALE, detectedScript(), localeFromPath(), LocaleState, requestLocales, stripLocale(), switchLocaleUrl() (+4 more)

### Community 5 - "react"
Cohesion: 0.06
Nodes (47): AdaptiveThumb(), AdaptiveThumbProps, GalleryLoadContext, GalleryLoadContextValue, GalleryLoadProvider(), useGalleryColumnCount(), useGalleryLoad(), HoverFooter() (+39 more)

### Community 6 - "visual-identity-assets.ts"
Cohesion: 0.03
Nodes (5): COUPLED_LOGO_PAIRS, CoupledOption, CoupledPair, MOODBOARD_GRID_IMAGES, MoodboardItem

### Community 7 - "site-content.ts"
Cohesion: 0.22
Nodes (17): ContactForm(), ContactFormValues, TOPICS, CustomDatePicker(), Localized, readSiteContent(), SITE_CONTENT_KEY, SITE_SEED (+9 more)

### Community 8 - "routeTree.gen.ts"
Cohesion: 0.04
Nodes (56): Route, Route, Route, Route, Route, Route, Route, Route (+48 more)

### Community 9 - "about.tsx"
Cohesion: 0.05
Nodes (27): ABOUT_EDITORIAL_FIELDS, CAREER_MILESTONES, CARPET_LOVERS_PHOTOS, CATEGORY, CATEGORY_FILTERS, CATEGORY_ICON, CategoryKey, COPY (+19 more)

### Community 10 - "validateSnapshot"
Cohesion: 0.20
Nodes (18): withRequestLocale(), commitSnapshot(), ContentSnapshot, validateSnapshot(), loadRequestPublishedSnapshot(), PublishedSnapshot, requestSnapshots, withRequestPublishedSnapshot() (+10 more)

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

### Community 15 - "vault.media.tsx"
Cohesion: 0.06
Nodes (61): mp4box@^2.5.0, mp4box, PairedBoxesEditor(), PairedBoxesEditorProps, parsePairs(), serializedPairs(), CloudUploadResult, getSupabaseConfig() (+53 more)

### Community 16 - "audit-cross-system.mjs"
Cohesion: 0.11
Nodes (18): cleanSegment(), __dirname, endMatch, invContent, invItems, issues, normalizeProjectSlug(), prjContent (+10 more)

### Community 17 - "studio-store.ts"
Cohesion: 0.11
Nodes (21): Project, contentStorage, CustomTaxonomyState, DEFAULT_TAXONOMY_DISCIPLINES, DEFAULT_TAXONOMY_SPECIALTIES, defaultProjectToStudioItem(), deleteCustomPhotoAsset(), extractAssetFilename() (+13 more)

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
Cohesion: 0.20
Nodes (12): BinaryBannerCanvas(), Cell, drawShape(), GRID_SHADES, smooth(), GROUPS, HorizontalSkillTree(), SkillGroup (+4 more)

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
Cohesion: 0.24
Nodes (19): lucide-react, BackToTop(), localizedText(), absoluteUrl(), getSiteUrl(), jsonLdScript(), siteJsonLd(), getBlogPostBySlug() (+11 more)

### Community 32 - "recover-and-compress.mjs"
Cohesion: 0.31
Nodes (10): compressToBand(), encodeCandidate(), extractBlob(), git(), listHqImages(), main(), RECOVER_DIR, resolveWorkingPath() (+2 more)

### Community 33 - "api.contact.ts"
Cohesion: 0.36
Nodes (7): sendTelegram(), telegramMessageIds(), TelegramMessageRef, TelegramResult, Route, ContactPayload, Route

### Community 34 - "brand-discovery.tsx"
Cohesion: 0.24
Nodes (12): PEYDA_BASE64, currentLocale(), pageHead(), Route, BrandDiscoveryPage(), submitAutomatically(), getLowQualityBase64(), hasRTL() (+4 more)

### Community 35 - "portfolio-schema.ts"
Cohesion: 0.22
Nodes (9): Window, DISCIPLINE_CODE_MAP, DISCIPLINE_QUICK_TAGS, DISCIPLINE_ROLE_MATRIX, DisciplineCode, DisciplineRoleDefinition, DisciplineSlug, ProjectCaseStudy (+1 more)

### Community 36 - "photo-inventory.ts"
Cohesion: 0.19
Nodes (13): codeMap, computeItemSeoSlug(), CustomCreditField, getPhotoByCode(), getPhotoBySeoSlug(), getPhotoByStem(), PHOTO_INVENTORY, PhotoInventoryItem (+5 more)

### Community 38 - "grow-to-band.mjs"
Cohesion: 0.22
Nodes (7): all, EXTS, files, ROOTS, TARGET, under, walk()

### Community 39 - "AboutPage"
Cohesion: 0.36
Nodes (8): AboutPage(), createDefaultFilters(), Hero(), SkillColumn(), SkillsSection(), t(), TimelineFilters(), toFiveScale()

### Community 40 - "vault.blog.tsx"
Cohesion: 0.46
Nodes (7): deleteStudioBlogPost(), getStudioBlogPosts(), notifyStudioStoreUpdated(), saveCustomTaxonomy(), saveStudioBlogPost(), AdminBlogView(), Route

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, format, lint, optimize:images, preview

### Community 42 - "compress-images.mjs"
Cohesion: 0.29
Nodes (5): EXTS, files, oversized, ROOTS, walk()

### Community 43 - "__root.tsx"
Cohesion: 0.07
Nodes (50): SIGNATURE_DATA_URL, Logo(), PublishedPageLoading(), LiquidWaveSpinner(), LiquidWaveSpinnerProps, sizeClasses, PublishStatus(), exportInvoiceToPDF() (+42 more)

### Community 44 - "TimelineEntry"
Cohesion: 0.29
Nodes (7): durationCapsuleHeight(), fillFromTip(), hasDurationCapsule(), isOngoing(), Timeline(), TimelineEntry(), tipYFromProgress()

### Community 45 - "migrate-bilingual-content.mjs"
Cohesion: 0.73
Nodes (4): ifMissing(), isPersian(), migrateBilingualSnapshot(), normalizePairs()

### Community 46 - "useLocale"
Cohesion: 0.17
Nodes (17): @tanstack/react-router, CoverTile(), CoverTileProps, DisciplineCircleMap(), ROOTS, coverTileImage(), DisciplinesMarquee(), HiddenPageNotice() (+9 more)

### Community 47 - "vault-store.ts"
Cohesion: 0.18
Nodes (30): addDeletedKeys(), buildAssignedRoute(), buildDynamicMediaCode(), cleanSegment(), computeVaultDiagnostics(), deleteVaultMedia(), deleteVaultPage(), ensureMediaItemDynamicFields() (+22 more)

### Community 50 - "server.ts"
Cohesion: 0.27
Nodes (8): consumeLastCapturedError(), renderErrorPage(), isNonPublicPath(), fetch(), getServerEntry(), isH3SwallowedErrorBody(), normalizeCatastrophicSsrResponse(), ServerEntry

### Community 51 - "react"
Cohesion: 0.16
Nodes (12): motion, react, CustomDatePickerProps, MONTH_NAMES, WEEK_DAYS, InteractiveHoverButton, InteractiveHoverButtonProps, UI04_VideoShowcase() (+4 more)

### Community 52 - "$discipline.$specialty.index.tsx"
Cohesion: 0.16
Nodes (26): projects, resolveInventoryImage(), getPublishedArray(), getDeletedProjectIds(), getStudioProjects(), FLAT_FIELDS, getGalleryMediaForRoute(), getPageByRoute() (+18 more)

### Community 53 - "vault.pages.tsx"
Cohesion: 0.12
Nodes (27): DedicatedPhotoLoaderData, UI_TYPE_LIST, UI_TYPE_REGISTRY, UITypeCode, UITypeDefinition, KeyValuePair, deleteMediaBlob(), getMediaObjectUrl() (+19 more)

### Community 54 - "$discipline.$specialty.$project.index.tsx"
Cohesion: 0.23
Nodes (16): looksLikeMediaCode(), redirectToCanonicalPath(), projectBackButtonClass, projectBackButtonMobileClass, isContentReady(), Route, buildGalleryItemsForProject(), CombinedLoaderData (+8 more)

### Community 55 - "test-vault-ssr-first-render.mjs"
Cohesion: 0.25
Nodes (7): blog, blogs, media, pages, photo, project, site

### Community 57 - "package.json"
Cohesion: 0.15
Nodes (12): clsx@^2.1.1, html-to-image@^1.11.13, react-dom@^19.2.0, @tanstack/router-plugin@^1.168.18, name, private, sideEffects, type (+4 more)

### Community 58 - "expandable-gallery.tsx"
Cohesion: 0.24
Nodes (8): COMPACT_STACK_LAYOUT, COMPACT_STACK_MOBILE, ExpandableGallery(), ExpandableGalleryProps, GalleryPhoto, STACK_LAYOUT, transition, useOutsideClick()

### Community 59 - "inventory-assets.ts"
Cohesion: 0.20
Nodes (10): assetEntries, AssetEntry, assetModules, byFileLower, byStem, matchAssetEntry(), resolveKnownAssetFile(), escapeXml() (+2 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `DedicatedPhotoView.tsx`, `__root.tsx`, `locale.ts`, `react`, `site-content.ts`, `about.tsx`, `dependencies`, `vault.media.tsx`, `index.tsx`, `seo.ts`, `brand-discovery.tsx`, `vault.blog.tsx`, `__root.tsx`, `useLocale`, `$discipline.$specialty.index.tsx`, `vault.pages.tsx`, `$discipline.$specialty.$project.index.tsx`, `package.json`, `expandable-gallery.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.006711409395973154 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `useLocale` to `DedicatedPhotoView.tsx`, `vercel-private-content.server.ts`, `__root.tsx`, `locale.ts`, `react`, `site-content.ts`, `routeTree.gen.ts`, `about.tsx`, `validateSnapshot`, `dependencies`, `vault.media.tsx`, `index.tsx`, `seo.ts`, `api.contact.ts`, `brand-discovery.tsx`, `vault.blog.tsx`, `__root.tsx`, `$discipline.$specialty.index.tsx`, `vault.pages.tsx`, `$discipline.$specialty.$project.index.tsx`, `package.json`, `inventory-assets.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `__root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0907563025210084 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-start` connect `vite.config.ts` to `vercel-private-content.server.ts`, `validateSnapshot`, `server.ts`, `package.json`, `inventory-assets.ts`, `seo.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.061581920903954805 - nodes in this community are weakly interconnected._
- **Should `visual-identity-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03389830508474576 - nodes in this community are weakly interconnected._