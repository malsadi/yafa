# Decisions

Every owner answer and every confirmed P-item is recorded here. Nothing under "Owner decisions" is inferred. Technical choices made by Claude Code (allowed by CLAUDE.md, "What to ask the owner, and what to decide yourself") are recorded under "Technical decisions" and listed in each phase report.

**Note on the specification.** On 2026-09-20, after D-001 to D-011 were recorded, the owner replaced both `CLAUDE.md` and `system build prompt.md`. Section numbers quoted in D-001 to D-011 refer to the earlier brief. In the current brief, section 8.5 is "Languages and texts" (it was "Texts" before), and the portal is English and Arabic from launch.

## Owner decisions

### D-001 Cron schedules (brief section 11 and 30)

All times are UTC. Cron Triggers cannot change at runtime, so these are set in `wrangler.jsonc`.

| Job | Schedule | Cron expression |
|---|---|---|
| Close votes | every 15 minutes | `*/15 * * * *` |
| Task reminders | daily at 07:00 | `0 7 * * *` |
| Backup | daily at 02:00 | `0 2 * * *` |
| Orphan clean-up | daily at 03:00 | `0 3 * * *` |
| Push pruning | daily at 04:00 | `0 4 * * *` |

### D-002 The text layer must allow another language later

Superseded by D-013: the portal is English and Arabic from launch, with `src/web/text/` holding one folder per language.

### D-003 Identity tables are created in Phase 0 (option a)

Phase 0 creates only the minimum columns of `units`, `people`, `terms`, `roles` and the permissions matrix table that the Clerk middleware, the webhook and `can()` need. Phase 1 extends them with new migrations. No applied migration is ever edited.

### D-004 Route classes that declare no capability (brief section 7.4)

Three route classes are allowed to declare something other than a capability:

1. "signed webhook"
2. "signed-in only"
3. "calendar feed token" (for the `.ics` feed)

Every route in these classes is listed in the phase report and checked by the permission sweep. Every other route declares a capability.

### D-005 Privacy notice on first sign-in (brief section 13, 15 C5)

- The officer must tick "I have read this" before continuing.
- The portal records who, when, and which version of the text.
- When the administrator changes the notice, it shows again (timing clarified in D-016).

### D-006 PWA manifest

The manifest is served from branding data. The app is not installable until branding is set. No name or icon is coded.

### D-007 Git host and CI

- Git host: GitHub. The repository is private and empty.
- GitHub Actions runs lint, tests and the permission sweep on every push, and deploys the preview on `main`.
- The Cloudflare API token goes in GitHub secrets, never in the repository.
- The repository path (`owner/name`) was not supplied: the message still contained the template placeholders. See O-002.

### D-008 Cloudflare resource names

The owner approved the naming pattern as proposed (`yafa-portal-<environment>-<purpose>`):

| Thing | Preview | Production (never created by Claude Code) |
|---|---|---|
| Worker | `yafa-portal-preview` | `yafa-portal-production` |
| D1 database, EU jurisdiction | `yafa-portal-preview-db` | `yafa-portal-production-db` |
| R2 files bucket, EU jurisdiction | `yafa-portal-preview-files` | `yafa-portal-production-files` |
| R2 backup bucket, EU jurisdiction | `yafa-portal-preview-backups` | `yafa-portal-production-backups` |
| Queue: notifications | `yafa-portal-preview-notifications` | `yafa-portal-production-notifications` |
| Queue: PDF jobs | `yafa-portal-preview-pdf-jobs` | `yafa-portal-production-pdf-jobs` |

### D-009 Clerk development instance

The owner created it: application id `app_3JZOkbOO4j2kHMfATFKzfco6lyI` (an identifier, not a credential). Sign-up is Restricted and multi-factor authentication is on. The keys are in `.dev.vars` and `.env.local`, placed by the owner. Claude Code never reads those files.

### D-010 Preview resources

Creating resources in the preview environment only is approved, now that the naming pattern (D-008) is approved. Production is never touched.

### D-011 Starting Phase 0

The owner said "go" to start Phase 0 and asked to see any new dependency before it is installed.

### D-012 Governance change: ask about critical things only

From 2026-09-20 the owner wants to be asked only about critical things, batched once per phase. Claude Code decides technical implementation choices within the fixed stack (package versions, config, internal module design, test setup, build tooling, resource names that follow an agreed pattern, small UI interaction details), records them here and lists them in the phase report. When unsure, treat it as critical. Written into CLAUDE.md and brief section 1, rule 1.

### D-013 English and Arabic from launch (brief section 8.5)

The portal works fully in English and Arabic from launch, with full right-to-left support. Each officer's language is saved on their person record. `src/web/text/` has one folder per language (`en/`, `ar/`) with one file per service. Claude Code drafts the Arabic texts; they are marked "awaiting owner review" in each phase report until the owner approves them.

### D-014 Approved dependency list and naming pattern

The owner approved the dependency list as proposed on 2026-09-20 (see T-001 to T-005 for the exact versions and pins) and approved the naming pattern in D-008.

### D-015 Plans confirmed

Cloudflare Workers Paid plan: confirmed. Clerk plan with multi-factor authentication: confirmed.

### D-016 Privacy notice re-show timing (answer to O-007)

When the administrator changes the privacy notice, it is shown again the next time the officer opens the portal.

### D-017 GitHub repository (answer to O-002)

`git@github.com:malsadi/yafa.git`, private. The owner set the remote up directly (confirmed present via `git remote -v` before the first push) and confirmed SSH works. Before that first push, `.dev.vars`/`.env.local`/`.env*` were confirmed covered by `.gitignore` (`git check-ignore -v`) and absent from `git status`. Pushed 2026-09-22. Force push is never used.

### D-018 Commit cadence

Commit after every piece of finished work that passes lint, typecheck and tests. Short, plain commit messages. Applies from 2026-09-22 onward (answers the workflow question raised when resuming Phase 0).

### D-019 What counts as a "current" term (answer to O-006)

A term with no end date is current until it is explicitly ended. A term whose end date has passed counts as Past from that date onward — **calculated on read, never stored.** There is no separate mutable "status" column to go stale: `terms` has `start_date` and a nullable `end_date`; "Current" vs "Past officer" (brief section 14's two status values) is a value derived at query time from `end_date` versus now, not a column the code or an officer sets directly. This replaces the "status field, checked against end date" idea sketched in the Phase 0 draft's database plan — supersedes that detail of T-021/the design plan's `terms` column list.

### D-020 Service switches: build order (answer to O-005, build-order half)

Build `core/service-switches` as its own module in Phase 0, exactly as the brief describes it (section 8.4): each service switched on/off portal-wide or per unit; switching off hides it and blocks its routes without deleting data; the switch refuses combinations that break a dependency; the Committee register, Documents archive and Administration panel can never be switched off. The Administration panel's own switch **screens** (15 C2) are Phase 2, not Phase 0 — Phase 0 ships the checking mechanism with no UI to edit it yet. Only the one dependency the brief states (Event organiser needs Treasury) is encoded now; the full cross-service dependency list is still needed before Phase 2 builds the switch screen (unchanged ask, not urgent while there's no UI). The resolution order proposed when this was first raised — no switch row recorded for a (unit, service) pair means off, except the three that can never be off; a unit's own row overrides the portal-wide row, which is the default for units without their own — was shown to the owner as the proposed handling and not contested when they said to build the module now, so it is what's built; flag it back if that's not what was meant.

### D-021 Admin area visibility (answer to O-008, visibility half)

The admin area and its navigation are shown only to people holding at least one Administration-panel capability. Each admin screen checks its own capability separately (no single "is admin" gate covering every screen). The other half of O-008 — system administrators as a plain list of people — wasn't separately reconfirmed in this answer; it stays as recorded in T-021 (a modelling choice, not a permissions question, so treated as settled rather than re-raised).

### D-022 Missing-translation runtime fallback, for database-stored bilingual text only

If an Arabic value is missing from a database-stored bilingual text (privacy notice, "access not active" message, help text, branding/letterhead — 15 C3 to C5, entered by the data administrator in both languages), the portal shows the English value and records that the Arabic one is missing. This is separate from, and does not relax, the static `src/web/text/{en,ar}/` source-code text keys: brief section 8.5's test that fails the build when a key exists in one language folder and not the other still applies there unchanged, since those keys are Claude-drafted in both languages together and never partially entered.

## Technical decisions (made by Claude Code)

### T-001 Package versions

Chosen from the npm registry on 2026-09-20 and checked against peer requirements:

- Runtime, Worker: hono ^4.13.8, drizzle-orm ^0.45.2, zod ^4.6.5, @clerk/backend ^3.18.1, @cloudflare/puppeteer ^1.4.0, aws4fetch ^1.0.20, @block65/webcrypto-web-push ^2.0.0.
- Runtime, browser: react and react-dom ^19.3.0, react-router ^8.4.0, @tanstack/react-query ^5.103.1, @clerk/react ^6.16.1, and @clerk/localizations ^4.17.1 (Clerk's Arabic sign-in screens, brief section 8.5; shown to the owner before install as they asked).
- Pins that are not "latest": TypeScript ~6.0.3 (typescript-eslint requires below 6.1; 7.0.2 is out), Vitest ^4.1 (Cloudflare's test plugin requires 4.1 or later; 5.0.1 is out), @types/node ^24 (matches the Node 24 used locally and in CI).

### T-002 Test plugin package name

`@cloudflare/vitest-plugin` is used instead of the `@cloudflare/vitest-pool-workers` named in the brief. Cloudflare renamed it on 2026-08-19; the API is unchanged. Approved with the list (D-014).

### T-003 Webhook verification

Clerk webhook signatures are verified with `verifyWebhook` from `@clerk/backend/webhooks`, which checks the Svix signature headers. The `svix` package is not added. Approved with the list (D-014).

### T-004 Reading of "every dependency must run on Workers"

Applied to everything bundled into the Worker. Build, test and lint tools run in Node and are never deployed. Approved with the list (D-014).

### T-005 Deliberately not added

`@clerk/clerk-react` (deprecated, replaced by `@clerk/react`), `@clerk/ui`, `@clerk/testing` (deferred until a phase has journeys to sign into), `@cloudflare/workers-types` (types come from `wrangler types`), the Node `web-push` package, ULID, date and money libraries (small in-house modules), any i18n runtime or RTL plugin (brief section 8.5 prescribes the text structure and Tailwind 4 has logical utilities), `vite-plugin-pwa`, `@hono/zod-validator`, and font files (fonts come from branding in Phase 2).

### T-006 Content Security Policy

Brief section 12 asks for a strict policy with "own origin plus Clerk's domains only". Clerk documents that its components need `style-src 'unsafe-inline'`, and that it needs its Frontend API host, `img.clerk.com`, `*.protect.clerk.com` and `challenges.cloudflare.com` (bot protection). Those are the only relaxations. The Frontend API host is derived from the Clerk publishable key at run time, so no instance-specific host is written in the code.

### Planned technical decisions (decided on 2026-09-20, not yet built)

These were decided while planning Phase 0. They are recorded now so the next session does not re-derive them. Change them freely if the build shows a problem, and update this file when you do.

- **T-007 Test layout.** Three Vitest projects: `worker` (runs in workerd through Cloudflare's plugin; `tests/core`, `tests/middleware`, `tests/api`, `tests/permissions`, `tests/integrity`), `web` (jsdom; `tests/web`) and `structure` (plain Node; `tests/structure`, for lint-rule tests, file-size and naming checks, wrangler config checks and the text-key parity test). The Workers plugin does not support custom environments, which is why the web tests need their own project. Playwright lives in `tests/e2e`.
- **T-008 Size limits.** ESLint `max-lines` is an error at 300, `max-lines-per-function` is 50, and 150 for `.tsx` components. Test files get 400 lines, and 400 per function because the outer `describe` callback wraps the whole file (brief section 5.2 allows 400-line tests). A structure test also fails any source file over 250 lines. Generated files are excluded.
- **T-009 Right-to-left lint.** Brief section 28 says logical CSS properties only. An ESLint rule bans physical-direction Tailwind classes (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `rounded-l`, `rounded-r` and similar) in `src/web`.
- **T-010 Wrangler layout.** The top level is for local development and tests. `env.preview` and `env.production` redeclare every binding (Wrangler does not inherit them). Compatibility date is the latest one the installed workerd supports (2026-09-18 at the time of writing), with `nodejs_compat` (Browser Rendering requires it). Assets use the single-page-app fallback with `run_worker_first` for `/api/*` and `/manifest.webmanifest`. Observability is on with the sampling rate left unset. Cron schedules come from D-001; the map from cron expression to job name lives in `vars.CRON_JOBS` in `wrangler.jsonc`, and a structure test checks it matches `triggers.crons`, so no schedule is written in code. The production D1 `database_id` stays an obviously invalid marker until Phase 12, so an accidental deploy cannot auto-create a database without the EU jurisdiction.
- **T-011 Generated types.** `wrangler types` generates the `Env` type. Secrets have no value in CI, so their names come from a committed `.dev.vars.example` (names only, no values). The generated file is git-ignored and regenerated by the `typecheck` script.
- **T-012 Package basics.** Package name `yafa-portal` (matches D-008), npm, Node 24 or later.
- **T-013 Origin rule.** "API accepts requests only from the portal's origin" is done without CORS headers: any request whose `Origin` header differs from the request URL's own origin is rejected.
- **T-014 Fonts.** Until Phase 2 supplies fonts from branding, the interface uses the platform's own fonts, which cover Arabic and Latin. No font file is bundled and nothing is loaded from outside.
- **T-015 Service worker.** Phase 0 registers a service worker with the install and activate lifecycle only. Push and notification-click handling arrive with the notification kinds in Phase 7, because the push text is defined there.
- **T-016 Dispatchers.** Phase 0 builds the scheduled-job and queue dispatchers (including recording each job's last run and outcome, brief section 11) with empty registries. Job and consumer files arrive in the phase that owns each one.
- **T-017 Formatting.** Date and money formatting lives in `src/shared/core/` so the browser and the PDF code share it. Money is passed to `Intl` as an exact decimal string built from integer pence, never as a float. Locale tags: English `en-GB`, Arabic `ar`. The Arabic digits setting, when unset, passes no numbering system, so the browser's own default applies.
- **T-018 Errors.** The API returns error codes, never prose. The web app maps a code to text from `src/web/text/`, in the officer's language. The "not configured" sentence from brief section 8.1 is one of those texts.
- **T-019 Two settings registered in Phase 0**, both in `administration-panel/settings.ts` with no default: `administration-panel.new_officer_language` (required, because creating an officer needs it) and `administration-panel.arabic_digits` (not required). Real settings are registered by the phase that first uses them; the core modules take their limits as parameters.
- **T-020 Immutable text versions.** Privacy notice and other admin-edited texts are stored as append-only versions (English and Arabic together), protected by a trigger, because an acknowledgement records which version the officer saw (D-005).
- **T-021 System administrators.** Stored as a table of person ids (`system_administrators`), because brief section 25 A1 appoints and removes them as a list. Phase 1 builds appoint and remove.
- **T-022 Corrected compatibility date.** T-010 guessed `2026-09-18` from wrangler 4.135.0's bundled workerd before either was installed. The versions actually installed on 2026-09-22 are wrangler 4.136.3 / workerd 1.20260921.1, confirmed by reading `node_modules/workerd/package.json` after `npm install`. `wrangler.jsonc`'s `compatibility_date` is `2026-09-21`. Re-check this the same way (never guess from a registry lookup alone) whenever dependencies are next updated.
- **T-023 `@cloudflare/vitest-plugin` actual API (corrects T-002).** T-002 assumed the API was unchanged from `@cloudflare/vitest-pool-workers`. It is not: the old `defineWorkersConfig`/`defineWorkersProject` wrapper functions do not exist in this package. The real API is a Vite plugin: `import { cloudflareTest } from '@cloudflare/vitest-plugin'`, added to a normal `defineConfig({ plugins: [cloudflareTest({ wrangler: { configPath } })] })` from `vitest/config`. Confirmed by reading the installed package's type declarations and Cloudflare's current docs. `readD1Migrations` is exported from the npm package (Node-side, for a vitest setup file); `applyD1Migrations` is exported from the ambient `cloudflare:test` module instead (worker-side, inside test code) — the draft report's note that these two were both in the npm package was wrong.
- **T-024 Dev tooling: exact versions and two additions not in the original T-001 list.** Resolved against the npm registry on 2026-09-22: `typescript-eslint` ^8.70.1 (combined parser+plugin package, not separate `@typescript-eslint/*` packages), `eslint` ^10.11.0, `@eslint/js` ^10.0.1 (needed separately for `js.configs.recommended`; its version line trails `eslint`'s), `eslint-config-prettier` ^10.1.8, `eslint-plugin-boundaries` ^7.2.0, `eslint-plugin-react-hooks` ^7.1.1, `eslint-plugin-react-refresh` ^0.5.7, `globals` ^17.12.0, `prettier` ^3.9.8, `vite` ^8.3.0, `@vitejs/plugin-react` ^6.1.1, `vitest` ^4.1.11, `@cloudflare/vitest-plugin` ^1.2.3, `wrangler` ^4.136.3, `drizzle-kit` ^0.31.11, `@playwright/test` ^1.63.0, `tailwindcss` ^4.3.3, `@tailwindcss/vite` ^4.3.3. Two additions beyond the original list: **`jsdom`** ^30.1.1 (dev-only, the `web` Vitest project's DOM environment — Vitest doesn't bundle one) and **`@cloudflare/vite-plugin`** ^1.57.3 (dev/build-only; the officially recommended way to serve the Hono Worker and the React SPA from one Vite dev server per the brief's "one Worker serves the API and the frontend through Workers Static Assets" architecture, avoiding a hand-rolled `vite build --watch` + `wrangler dev` combination). Both are Node-only build/test tooling, never bundled into the Worker (T-004 exemption).
- **T-025 `eslint-plugin-boundaries` tried, then dropped entirely for a plain `no-restricted-imports` scheme.** The draft report flagged this plugin as untried on ESLint 10 flat config, with `no-restricted-imports` as the documented fallback. It was tried directly and thoroughly — not just "does it load without a config error," but "does it actually reject a deliberately-wrong deep import" — and needed two rounds of fixing before that was true, found each time by temporarily instrumenting the installed rule with `console.error` (reverted immediately after) rather than guessing further from the plugin's docs, which had already proven unreliable once (T-023). First bug: `target: ['core', 'service']` is a "legacy selector" whose compat shim silently produces no match; needed the object form `target: { element: { type: [...] } }`. Second bug, found after the first fix made a service→core violation correctly fail: `eslint-import-resolver-node` only tries `.js`/`.json`/`.node` by default, so every extension-less `.ts` import failed to resolve and the rule silently skipped every real file; fixed with `settings['import/resolver'] = { node: { extensions: [...'.ts', '.tsx'] } }`. With both fixed, a **third** problem surfaced that had no fix found in reasonable time: `dependency.to.element.fileInternalPath` came back as the full repo-relative path (e.g. `src/worker/core/ids/index.ts`) instead of a path relative to the element's own root (`index.ts`), so `allow: 'index.ts'` could never match *anything* — meaning the rule had actually been rejecting every cross-module import unconditionally, including correct ones through `index.ts`; this had gone unnoticed because the only classified-source case tested so far (service → core) happened to be a rejection either way. Given a real, unresolved false-positive at that point, **the plugin was removed entirely** (`npm uninstall eslint-plugin-boundaries`) rather than shipped half-working. All four module-boundary rules — core never imports a service, core/service import another core module only via its `index.ts`, routes never import a repo directly, web never imports worker code — are now plain `no-restricted-imports` `patterns`, each individually verified to both catch a deliberate violation and pass legitimate code (see T-036 for one further glob-matching surprise found doing that verification).
- **T-033 `NATIONAL_SCOPE` is a structural constant, not a setting.** `src/shared/core/national-scope.ts` exports `NATIONAL_SCOPE = '__national__'`, the sentinel `settings.scope`/`service_switches.scope` use for "the portal-wide value" (as opposed to a real unit id, for a per-unit override). This looks like the hard-coded value rule 2 forbids, but it isn't configuration — it's a fixed discriminator the schema and code need to tell "no unit override" apart from "a unit id happens to be missing," the same way a NULL sentinel would be, chosen as a real string instead of NULL specifically to keep `(key, scope)` a plain two-column composite primary key (SQLite treats NULLs as distinct from each other in uniqueness checks, which would silently allow duplicate "national" rows for the same key). Recorded here so Phase 12's hard-coding review doesn't flag it without this context.
- **T-034 Settings/service-switches writes use raw D1 prepared statements in `db.batch()`, not Drizzle's query builder.** Reads use `drizzle-orm/d1`'s typed `select()`. Writes need an atomic "capture the old value, then upsert, then audit" batch (brief section 8.1/9.1: history's previous value comes from SQL, never read-then-written in TypeScript) via a scalar subquery — `INSERT INTO settings_history (...) VALUES (?, ?, ?, (SELECT value FROM settings WHERE key = ? AND scope = ?), ...)`, which returns `NULL` for a key's first-ever value and the prior value otherwise, in one statement. Drizzle's builder doesn't cleanly express a scalar subquery as a column value, so the batch's three statements (history insert, `settings` upsert via `ON CONFLICT ... DO UPDATE`, audit insert) are built as raw `D1Database.prepare().bind()` and passed to `db.batch([...])` directly. Drizzle's schema definitions are still the source of truth for the tables and for `drizzle-kit generate`'s migrations.
- **T-035 `settings_history` and `audit_log` don't use ULID ids.** Brief section 9.1 says "IDs are ULIDs as text," but a SQLite trigger can't call the JS `generateId()`, and generating the id in TypeScript before the SQL-side history capture (T-034) would defeat the "logic that depends on current data is done in SQL" rule if the trigger approach were used instead — so a trigger-based history-copy was considered and rejected. `settings_history` does use a `generateId()` text id (generated in application code, before the batch — no conflict there, since ITS id doesn't depend on current data). `audit_log` likewise uses a `generateId()` id via `buildAuditStatement()`. Neither uses SQLite's implicit rowid; both follow the "IDs are ULIDs" rule as stated.
- **T-036 The twelve stage-one services (`src/shared/core/services.ts`) are a fixed code constant, not administrator-configurable data.** Names and numbering taken verbatim from brief section 3.1's table (including its gaps — 10, 11, 14, 16 are genuinely absent, not a typo). This is the *set of services that exist*, which is fixed by what's been built (rule 3: build only what the brief describes); the data administrator only controls whether an *existing* service is switched on or off (brief section 8.4), which is what `service_switches` stores.
- **T-037 A `no-restricted-imports` `group` pattern is not anchored to the full specifier string.** Found verifying T-025's replacement rules: a pattern like `../[!.]*/*`, written expecting to match only a 3-segment specifier (`../ids/generate-id`), also matched a 6-segment, unrelated one (`../../../shared/core/national-scope`) — it behaves more like "matches somewhere in the path," not "matches the whole path." Fixed by only using patterns anchored on a distinctive literal substring that can't appear by coincidence (`**/services/**`, `**/core/*/*`, `**/*.repo`, `**/worker/**`) rather than leading-wildcard shapes; the general "any core module's sibling, from within core" case was dropped rather than risk another silent false-positive or false-negative (tracked as a gap — see the Phase 0 report). Also found while wiring this up: ESLint flat config replaces a rule's *entire* option value for the last matching block, it does not merge arrays — two blocks both setting `no-restricted-imports` for overlapping `files` globs (`src/worker/services/**/*.ts` and `src/worker/services/*/**/*.routes.ts`) meant the more specific block silently dropped the general one's patterns for `.routes.ts` files, until fixed by repeating the shared pattern explicitly in both blocks.
- **T-026 Three separate `tsc --noEmit` runs, not TS build-mode project references.** `tsconfig.worker.json` / `tsconfig.web.json` / `tsconfig.node.json` are checked independently (`npm run typecheck`), not via a root `tsconfig.json` with `references` and `tsc -b` — build mode needs `composite: true`, which requires declaration emit, conflicting with the plain `noEmit` type-check-only setup wanted here. `tsconfig.web.json` is deliberately left out of `eslint.config.js`'s type-aware `parserOptions.project` array until `src/web` has real files: a TS project with zero matching inputs fails to build at all (`TS18003`), which breaks linting for every file, not just web ones. Add it back the moment the frontend shell starts.
- **T-027 `wrangler.jsonc` and `wrangler types` started earlier than the step-7 plan, minimally.** The resume-plan order of work put `wrangler.jsonc` at step 7. In practice the `worker` Vitest project (T-007) needs a wrangler config to boot `cloudflareTest()` at all, and any worker-side TypeScript needs the ambient runtime globals (`crypto`, `Request`, `Response`, …) that only `wrangler types` generates into `worker-configuration.d.ts` — needed even before any binding exists. `wrangler.jsonc` currently has only `name`, `compatibility_date` and `compatibility_flags`; D1, R2, Queues, static assets, cron triggers and `env.preview`/`env.production` are still added at step 7, once the worker entry point and the bindings they serve actually exist. `worker-configuration.d.ts` is generated, git-ignored, and included only in `tsconfig.worker.json`.
- **T-028 `ids` module: simplified (non-bit-exact) ULID randomness encoding.** `generateId()` (`src/worker/core/ids/`) produces a 26-character, Crockford-base32, time-sortable id: 10 characters of base-32-encoded millisecond timestamp, then 16 characters each independently derived from one `crypto.getRandomValues()` byte via `% 32` (unbiased, since 256 is an exact multiple of 32). This differs from the official ULID spec's exact 80-bit slicing across byte boundaries, but is not spec-sensitive here: T-005 deliberately excluded an external ULID package, nothing decodes these ids with a third-party ULID library, and the properties that matter (fixed 26-char Crockford output, unique, sortable by generation time) are covered by `tests/core/ids/generate-id.test.ts`.
- **T-029 Prettier scope.** `.prettierignore` excludes all `*.md` files and `.claude/` — hand-maintained prose (the brief, `CLAUDE.md`, `docs/`) and the owner's own permission config are not code-style targets; running Prettier over them risked mangling tables/formatting the owner controls.
- **T-031 Route registry + permission sweep, structural half only.** `src/worker/core/permissions/` (`route-access.schema.ts`, `route-registry.ts`) implements D-004's four fixed access classes as a Zod discriminated union (`capability` — validated against `<service>.<resource>.<action>`, brief section 5.1 — `signed-in-only`, `signed-webhook`, `calendar-feed-token`); `registerRoute()` validates and records a declaration, rejecting duplicates. `tests/permissions/route-sweep.test.ts` proves this against fixture routes (brief section 7.4: "the machinery is proved with fixture routes", since no real routes exist yet), and now genuinely passes rather than reporting "no test files found". This is the **structural** half only ("every route declares one of the fixed classes; a capability is well-formed"). The **behavioural** half (sign in as Branch A, attempt Branch B's records; branch officer attempts a national action; administrator attempts to read content; every attempt fails 403/404) needs the request-context loader and `can()`, which need `people`/`terms`/`roles`/`permission_grants` — not built this pass (kept out deliberately, see T-032/T-033). Not a placeholder: `registerRoute`/`listRegisteredRoutes` are the real mechanism every future route file calls.
- **T-032 GitHub Actions CI, verify job only.** `.github/workflows/ci.yml` runs on every push: install, `wrangler types`, typecheck, lint, format check, tests, permission sweep — all fully self-contained, no secrets or Cloudflare/Clerk credentials needed (`wrangler types` only reads the local `wrangler.jsonc` plus the installed `workerd` version; no network call). The deploy-preview job is deliberately not added yet: it needs `vite.config.ts` (order-of-work step 6), a full `wrangler.jsonc` with `env.preview`/D1/R2/Queues/assets (step 7), and the created preview resources (step 8) — none of which exist. Adding it now would guarantee a red job on every push, which is worse than the gap being visible in the phase report.
- **T-030 `@cloudflare/puppeteer`'s transitive advisory, not remediated.** `npm audit` reports a high-severity symlink-traversal advisory in `extract-zip`, pulled in transitively via `@cloudflare/puppeteer` → `@puppeteer/browsers`. That chain is only used to download/extract a local Chromium binary for local Puppeteer use; the approved runtime path (T-001) is Cloudflare's server-side Browser Rendering binding, which doesn't go through it. Not running `npm audit fix --force`, since that would silently move off the approved pinned version (D-014) without asking. Re-check when `core/pdf` is actually built.

## Open

O-002, O-005 (build-order half), O-006, O-008 (visibility half) were answered on 2026-09-22 — see D-017, D-019, D-020, D-021. O-009 was answered but the answer doesn't match what's on disk (see below). O-003, O-004 and O-007 were each answered with something adjacent to, but not actually resolving, the specific question asked; they stay open, narrowed to the exact unresolved part, restated in the Phase 0 report per the owner's instruction not to re-ask one by one.

| # | What is needed | Blocks |
|---|---|---|
| O-003 | **Privacy notice gate when *no notice has ever been entered* (not "a notice exists and changes," which D-005/D-016 already cover).** Asked again 2026-09-22; the answer given restated the general tick-box/record/re-show mechanism (already D-005/D-016), not this bootstrap case. Brief rule 5 says an unset value makes the related action wait, but blocking every officer would also lock out the administrator who must enter the notice (Phase 2). Proposed, unconfirmed: while no notice exists the portal shows "not set up" behind the footer link and does not block; the tick-box gate applies as soon as a notice exists | First-sign-in screen (not built this session) |
| O-004 | **A fifth route class, "public", for the manifest only.** Asked again 2026-09-22; the answer restated D-004's existing three classes (signed webhook, signed-in only, calendar feed token), none of which fit `/manifest.webmanifest` (unauthenticated, not a webhook, no feed token) — the gap the question was about is still unaddressed. Proposed, unconfirmed: allow one public route, listed in the phase report and the sweep | PWA manifest route (not built this session) |
| O-007 | **Officer language fallback when no language is saved and the "new officer language" setting is unset.** Asked again 2026-09-22; the answer given (D-022) was about a *different* thing — a missing database-stored translation falling back to English — not this. Proposed, unconfirmed: (a) the browser's language decides if it's English or Arabic, (b) otherwise English, (c) Arabic-digits setting unset → the browser's own default numerals | Frontend shell (not built this session) |
| O-009 (reopened) | The owner said `.dev.vars` and `.env.local` are now in place. Checked by name only (`ls -la` on the project root; contents never read) on 2026-09-22 after that answer: **neither file is present** in `/home/albions/Yafa`. Same finding as the original O-009. Possibly created in a different location, or the create command didn't target this directory | Running the app locally against Clerk, and the preview deploy. Nothing else is blocked |
| O-005 (remainder) | The full cross-service service-switch dependency list (brief section 8.4 states only one: Event organiser needs Treasury) | `docs/decisions.md` only for now; blocks the Phase 2 switch screen, not Phase 0 |
