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
- **T-025 `eslint-plugin-boundaries` works on ESLint 10 flat config.** The draft report flagged this as untried, with `no-restricted-imports` as the documented fallback. Tried directly: it works, with its own flat-config example in its README (`export default [{ plugins: { boundaries }, settings: {...} }]`). Used for one rule, `boundaries/entry-point`, which enforces "each service/core module has one `index.ts`; that's the only file another element may import" (brief section 5.3). It logs (non-fatal) deprecation warnings recommending the newer `boundaries/dependencies` rule with `policies`; the exact replacement syntax couldn't be confirmed reliably from available docs in the time available, so `entry-point` stays for now — migrate before the plugin actually removes it, and re-check then. The simpler "core never imports a service", "routes never import a repo", and "web never imports worker code" rules use plain `no-restricted-imports` instead of the boundaries plugin, since their schema is unambiguous and well-known.
- **T-026 Three separate `tsc --noEmit` runs, not TS build-mode project references.** `tsconfig.worker.json` / `tsconfig.web.json` / `tsconfig.node.json` are checked independently (`npm run typecheck`), not via a root `tsconfig.json` with `references` and `tsc -b` — build mode needs `composite: true`, which requires declaration emit, conflicting with the plain `noEmit` type-check-only setup wanted here. `tsconfig.web.json` is deliberately left out of `eslint.config.js`'s type-aware `parserOptions.project` array until `src/web` has real files: a TS project with zero matching inputs fails to build at all (`TS18003`), which breaks linting for every file, not just web ones. Add it back the moment the frontend shell starts.
- **T-027 `wrangler.jsonc` and `wrangler types` started earlier than the step-7 plan, minimally.** The resume-plan order of work put `wrangler.jsonc` at step 7. In practice the `worker` Vitest project (T-007) needs a wrangler config to boot `cloudflareTest()` at all, and any worker-side TypeScript needs the ambient runtime globals (`crypto`, `Request`, `Response`, …) that only `wrangler types` generates into `worker-configuration.d.ts` — needed even before any binding exists. `wrangler.jsonc` currently has only `name`, `compatibility_date` and `compatibility_flags`; D1, R2, Queues, static assets, cron triggers and `env.preview`/`env.production` are still added at step 7, once the worker entry point and the bindings they serve actually exist. `worker-configuration.d.ts` is generated, git-ignored, and included only in `tsconfig.worker.json`.
- **T-028 `ids` module: simplified (non-bit-exact) ULID randomness encoding.** `generateId()` (`src/worker/core/ids/`) produces a 26-character, Crockford-base32, time-sortable id: 10 characters of base-32-encoded millisecond timestamp, then 16 characters each independently derived from one `crypto.getRandomValues()` byte via `% 32` (unbiased, since 256 is an exact multiple of 32). This differs from the official ULID spec's exact 80-bit slicing across byte boundaries, but is not spec-sensitive here: T-005 deliberately excluded an external ULID package, nothing decodes these ids with a third-party ULID library, and the properties that matter (fixed 26-char Crockford output, unique, sortable by generation time) are covered by `tests/core/ids/generate-id.test.ts`.
- **T-029 Prettier scope.** `.prettierignore` excludes all `*.md` files and `.claude/` — hand-maintained prose (the brief, `CLAUDE.md`, `docs/`) and the owner's own permission config are not code-style targets; running Prettier over them risked mangling tables/formatting the owner controls.
- **T-030 `@cloudflare/puppeteer`'s transitive advisory, not remediated.** `npm audit` reports a high-severity symlink-traversal advisory in `extract-zip`, pulled in transitively via `@cloudflare/puppeteer` → `@puppeteer/browsers`. That chain is only used to download/extract a local Chromium binary for local Puppeteer use; the approved runtime path (T-001) is Cloudflare's server-side Browser Rendering binding, which doesn't go through it. Not running `npm audit fix --force`, since that would silently move off the approved pinned version (D-014) without asking. Re-check when `core/pdf` is actually built.

## Open

Items O-003 to O-008 were drafted in a paused session and never actually sent to the owner. They were asked for real, batched, on 2026-09-22 when this session resumed Phase 0 (chat, not recorded verbatim here); this table still shows each one's proposed handling as the reference for what gets built once the owner answers. Update each row with the owner's actual answer (as a new D-number) the moment it arrives, rather than assuming "as proposed" from silence.

| # | What is needed | Blocks |
|---|---|---|
| O-002 | GitHub repository path (`owner/name`); the message still contained `[your-username-or-organisation]/[repository-name]` | Adding the git remote and the first push. Nothing local is blocked |
| O-009 | **The Clerk key files still are not in place.** On 2026-09-22 the owner pasted the publishable and secret key values directly into chat. Claude Code's own permission settings (`.claude/settings.json`) deny `Read` on `.dev.vars` and `.env.*`, and the harness applies that deny to `Write`/`Edit` on the same paths too — so Claude Code cannot create these files itself, consistent with D-009 ("Claude Code never reads those files"). The owner was given the exact file contents to create by hand (values are not repeated here). Not yet confirmed done. | Running the app locally against Clerk, and the preview deploy. Unit tests and the rest of the build are not blocked |
| O-003 | **Privacy notice gate when no notice has been entered.** Brief rule 5 says an unset value makes the related action wait, but blocking every officer would also lock out the administrator who must enter the notice (Phase 2). Proposed: while no notice exists the portal shows "not set up" behind the footer link and does not block; the tick-box gate applies as soon as a notice exists | First-sign-in screen |
| O-004 | **A fifth route class, "public", for the manifest only.** D-004 allows three classes without a capability. The browser fetches `/manifest.webmanifest` without an Authorization header, so it cannot be signed-in only. It carries only branding (organisation name, colours, icons), nothing personal. Proposed: allow one public route, listed in the phase report and the sweep | PWA manifest route |
| O-005 | **Service switch semantics.** (a) With no switch row a service is off, except Committee register, Documents archive and Administration panel, which cannot be switched off. (b) A unit's own switch overrides the portal-wide one; the portal-wide switch is the default for units without their own. (c) Brief section 8.4 gives only one dependency example (Event organiser needs Treasury). Proposed: declare only that one now; please send the full dependency list before Phase 2 builds the switch screen | Navigation, `core/service-switches` |
| O-006 | **What counts as a current term.** Proposed: status is Current and the end date has not passed, so access fails closed if a status was not updated. The alternative is status only | Request context, `can()` |
| O-007 | **Language fallbacks.** (a) An officer who has not chosen a language, and the "language new officers start with" setting is unset: the browser's language decides. (b) The browser's language is neither English nor Arabic: English. (c) Arabic digits setting unset: the browser's own default numerals | Frontend shell |
| O-008 | **System administrators as a list of people** (T-021), and confirmation that the administrator area at `/admin` shows only to people holding at least one Administration panel capability (brief section 25 build notes) | Request context, admin layout |
