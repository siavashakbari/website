# Website optimization report

## Executive summary

Audited the TanStack Start / React 19 / Vite 8 portfolio and Vault on a dedicated `audit/website-optimization` branch. Tightened public contact request validation, corrected two Vault input behaviors, and applied compatible dependency security updates. The visual design and portfolio content were left intact. No deployment or push was performed.

## Tool status and order

1. **Ponytail 5.3.3:** installed as a Codex plugin and used its repository audit instructions. The audit inspected build configuration, routes, public API handlers, animation and event patterns, dependency data, and the main data stores. It prioritized public input handling and security advisories. It was a targeted risk audit, not a line-by-line review of every source file.
2. **Graphify 0.9.109:** installed through uv and integrated with this project. A local code-only graph was generated without API keys or external model extraction. `.graphifyignore` excludes media and agent tooling. The final map contains **1,495 nodes, 3,524 edges, 50 communities**. Outputs: `graphify-out/graph.html`, `graphify-out/graph.json`, and `graphify-out/GRAPH_REPORT.md`. Graphify's SQL parser extra is absent, so four migration files yielded no symbols. Community names are placeholders because no LLM backend was used.
3. **Modern Web Guidance 1.0.0:** installed as a Codex plugin. Its legacy scan found two actionable Vault input issues; after the fixes, the scan found zero matches among its 35 deterministic rules. This scan covers only a subset of its guidance catalog.

## Ponytail audit: findings and changes

| Priority | Finding | Action |
| --- | --- | --- |
| High | The public contact handler accepted an unbounded request body and assumed JSON values were strings. Malformed data could produce a server error. | Added a 16 KiB streamed request cap, JSON error response, runtime field checks, and field length limits. |
| High | Production dependency audit reported seven advisories: one critical, five high, one moderate. | Applied compatible `npm audit fix --ignore-scripts` updates. The production audit now reports zero advisories. |
| Medium | The brand discovery API accepts large base64 attachments. | Left unchanged because PDF/image payload sizes and Telegram delivery behavior require a focused limit and client agreement. |
| Medium | Repo-wide lint has a substantial existing backlog, including formatting and explicit `any` errors. | Left unrelated code unchanged. The edited contact handler passes targeted ESLint. |

The audit assumed normal traffic for a personal portfolio plus occasional Vault administrator use. It did not validate production load, external storage, Telegram delivery, or every asset. Potential further cleanup includes the Vite warning that native `resolve.tsconfigPaths` may replace `vite-tsconfig-paths`; this was not changed without a compatibility check.

## Graphify architecture

TanStack file routes connect public pages, the Vault, and API handlers. `published-store.ts`, `vault-store.ts`, `studio-store.ts`, `site-content.ts`, `__root.tsx`, and the discipline/project routes are central modules. The graph was refreshed after source and dependency changes. It can narrow future searches, but no token-saving claim was measured. Graphify's generated Codex instructions are in `AGENTS.md` and `.codex/`; their project scope was reviewed.

## Modern Web Guidance changes

- Added stable IDs, labels, names, and `autocomplete` hints to the Vault email and password inputs so browser password managers can recognize the sign-in form.
- Prevented the Vault media page's Enter shortcut from blurring and submitting while an input method editor is composing text, including the Safari `keyCode === 229` fallback.

## Measurements and verification

| Check | Baseline | Final |
| --- | --- | --- |
| Production dependency advisories | 7 (1 critical, 5 high, 1 moderate) | 0 |
| TypeScript | Pass | Pass |
| Production build | Pass | Pass |
| Focused Node tests | Not run at baseline | 8 passed |
| Modern Web Guidance deterministic findings | 2 | 0 |
| Emitted client JavaScript | Not captured at baseline | 73 files, 2,955,632 uncompressed bytes |
| Emitted CSS | Not captured at baseline | 2 files, 136,436 uncompressed bytes |

Core Web Vitals and before/after bundle comparisons were not measured, so no speed improvement is claimed. `eslint src` still reports 13,446 errors and 19 warnings; this figure includes existing formatting issues and needs a separate cleanup plan. The large `index` chunk (about 1.12 MB uncompressed) merits route-level profiling before changes.

Local HTTP smoke checks returned 200 for `/en`, `/en/about`, `/en/contact`, `/fa`, and `/robots.txt`. The unprefixed public paths redirected (308), as expected. Malformed and wrong-type contact JSON returned 400. `/sitemap.xml` returned 503 locally because the published Vercel Blob source was unreachable from this environment; production sitemap behavior remains unverified. Visual layout, animation smoothness, mobile behavior, browser console, and Core Web Vitals were not verified in a browser; the user previously asked to avoid computer inspection.

## Files changed

- `src/routes/api.contact.ts` — bounded and validated contact requests.
- `src/routes/vault.tsx` — sign-in field semantics and autofill.
- `src/routes/vault.media.tsx` — composition-safe Enter behavior.
- `package-lock.json` — compatible security updates.
- `.graphifyignore`, `AGENTS.md`, `.codex/skills/graphify/`, `.codex/hooks.json`, and `graphify-out/` — project graph setup and outputs.
- `WEBSITE_OPTIMIZATION_REPORT.md` — this report.

## Remaining work

- Measure LCP, INP, CLS, route bundle transfer sizes, and responsive behavior in a browser with production-like content.
- Review the seven remaining **development-only moderate** dependency advisories separately; `npm audit fix` did not resolve them without a potentially breaking change.
- Review rate limiting and size policy for public form endpoints, especially brand discovery with base64 media.
- Run Vault and storage integration tests in an environment with configured external services.
- Reduce the existing lint backlog in small, independently reviewed changes.
