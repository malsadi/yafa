# Phase 0 report: Foundation

**Status:** approved by the owner, 2026-09-24 (D-041). **Date:** 2026-09-24.
**Preview:** https://yafa-portal-preview.mohammedalsadi985.workers.dev (deployed by CI on every push to `main`).
**Progress page:** https://yafa-portal-preview.mohammedalsadi985.workers.dev/progress.html (D-040). *Removed 2026-09-25 at the owner's request (D-069).*

Every owner answer is in `docs/decisions.md` (D-001 to D-040), and every technical choice too (T-001 to T-072). This report summarises; the decision entries have the detail. The previous, session-by-session version of this report is in git history.

## 1. What was built, by sub-point

Sub-points are brief section 26, Phase 0.

### Repository, TypeScript, ESLint, Prettier, Vitest, Playwright

- Private GitHub repository `malsadi/yafa`; pushed after every passing commit (D-039).
- TypeScript `strict`, checked as three projects: worker, web, node (T-026).
- ESLint:
  - `max-lines` 300 (test files 400, components 150) and `max-lines-per-function` 50.
  - Import boundaries: core never imports a service; services and routes reach core only through its `index.ts`; routes never import repos; web never imports worker code.
  - Physical-direction Tailwind classes are forbidden (brief section 28).
- Prettier, plus structure tests for file naming, file size, the `wrangler.jsonc` layout and English/Arabic text-key parity.
- Vitest in three projects: `worker` (runs in workerd), `web` (jsdom), `structure` (Node).
- Playwright runs each journey in English and in Arabic (T-070).

### `wrangler.jsonc`

- **What it declares:** D1, R2 (files and backups), Queues (producers), Cron Triggers (D-001), Browser Rendering (preview and production only), and static assets with the single-page-app fallback. Preview and production are separate environments, with the D-008 names (T-066).
- **How requests are handled:**
  - Every request runs the Worker first, so every response gets the security headers.
  - `html_handling: "none"`: a static file is reachable only at its exact path (D-040).
- **Secret names:** declared in `secrets.required`; `wrangler types` generates them with no values.
- **Preview resources**, all EU jurisdiction where it applies:
  - `yafa-portal-preview-db` (D1)
  - `yafa-portal-preview-files` and `yafa-portal-preview-backups` (R2)
  - the `notifications` and `pdf-jobs` queues
  - the Worker `yafa-portal-preview`
- **Production:** nothing created. The production D1 id is a deliberately invalid marker until Phase 12 (T-010).

### Clerk: middleware, signed webhook, invite-only, "access not active" page

- **Middleware:** verifies the session token from the `Authorization` header (never a cookie) and builds the request context from D1 on every request (T-064).
- **Webhook:** `POST /api/webhooks/clerk` checks the Svix-compatible signature. `user.created` and `user.updated` link or sync a person by email; `user.deleted` unlinks them and keeps the record (T-065). The Clerk endpoint is configured and the signing secret is on the preview Worker.
- **Invite-only:** in the Clerk instance, sign-up is Restricted, social sign-in is off, and multi-factor is on (D-038). The in-portal invitation flow is Phase 1 (register officers).
- **"Access not active" page:** shown to anyone signed in with no linked person holding a current term, and to everyone while no privacy notice is set (D-024). Its message is an administrator text (Phase 2); until then it shows the brief's "This has not been set up yet" message.

### Core modules

All in `src/worker/core/`, each behind its own `index.ts`:
- `permissions`: capability catalogue, `can()`, request-context loader, route registry
- `settings` (registry, no defaults)
- `service-switches`
- `audit`
- `notifications` (in-portal inbox, unread count, mark all read; T-057, D-031)
- `files` (`buildObjectKey()`; the full file layer is Phase 3)
- `pdf` (T-072, below)
- `push` (subscription storage, one-delivery primitive; T-059)
- `ids`
- `events-bus`
- `errors`
- `security-headers` (CSP allowing inline scripts only under the Vite dev server, T-069)
- `maintenance-mode`
- `privacy-notice`

Also:
- `dates` and `money` are in `src/shared/core/` (T-052).
- The cron and queue dispatchers have empty registries (T-063).

**`core/pdf`** renders through Browser Rendering. The fonts, page size and margins are always inputs: fonts are embedded as `data:` URLs, and every outside request is refused. The opt-in `npm run test:pdf-remote` rendered the English and Arabic samples in `docs/pdf-samples/`. `pdffonts` shows only the embedded fixture fonts were used. Checked by eye:
- Arabic runs right to left, and letters join correctly, including the lam-alef ligature.
- A Latin phrase sits correctly inside a right-to-left line.
- Arabic-Indic digits render.

The five document templates arrive with the phases that own them.

### Frontend shell

All texts come from `src/web/text/en|ar/`. Built (T-068):
- **Sign-in:** Clerk's own screens, in Clerk's Arabic localisation when the language is Arabic.
- **Privacy notice on first sign-in:** tick, then continue; recorded per version. Refused if the notice changed while it was being read.
- **Layouts:** a portal layout, and an admin layout at `/admin` shown only with an administration capability.
- **Navigation:** every stage-one service, as empty pages, showing only services switched on for the selected unit.
- **Home page:** a welcome line and the unit (D-035). The officer's name joins it in Phase 1, when the register holds names.
- **Unit switcher:** for people in more than one unit.
- **Language:** the officer's choice is saved on their person record. `<html lang dir>` switches right-to-left for Arabic.
- **Also:** a maintenance banner, a footer link to the privacy notice, and a service worker.
- **Not in Phase 0:** the PWA manifest, which moved to Phase 2 with branding (D-036).

### CI

`.github/workflows/ci.yml`:
- **`verify`** runs on every push: types, type check, lint, format, tests, permission sweep.
- **`deploy-preview`** runs on `main` after `verify`: preview migrations, then build and deploy.

Both are green (owner, 2026-09-24).

### Routes that declare no capability (D-004, listed as required)

| Route | Access class |
|---|---|
| `GET /api/me` | signed-in only |
| `PUT /api/me/language` | signed-in only |
| `GET /api/privacy-notice` | signed-in only |
| `POST /api/privacy-notice/acknowledgements` | signed-in only |
| `POST /api/webhooks/clerk` | signed webhook |
| `GET /progress.html` | public progress page (D-040), never the database, noindex. *Removed 2026-09-25 (D-069).* |

No capability routes exist yet; the first arrive in Phase 1. `tests/permissions/app-route-sweep.test.ts` checks the real assembled app: every route it serves is declared, and the declarations are exactly the list above.

### Database

Migrations `0000` to `0009`. They are applied locally and to the preview D1, and applied again by CI on every deploy. Immutability triggers protect `settings_history`, `audit_log` and both privacy-notice tables.

### New dependencies this phase

**Runtime:**
- `hono`, `drizzle-orm`, `zod`
- `@clerk/backend`, `@clerk/react`, `@clerk/shared`, `@clerk/localizations`
- `@cloudflare/puppeteer`, `aws4fetch`, `@block65/webcrypto-web-push`
- `react`, `react-dom`, `react-router`, `@tanstack/react-query`

**Development only:**
- `wrangler`, `vite`, `@cloudflare/vite-plugin`, `@vitejs/plugin-react`
- `tailwindcss`, `@tailwindcss/vite`
- `vitest`, `@cloudflare/vitest-plugin`, `jsdom`, `@playwright/test`
- `drizzle-kit`, `typescript`, `typescript-eslint`, `eslint`, `@eslint/js`, `eslint-config-prettier`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `prettier`
- `@types/node`, `@types/react`, `@types/react-dom`

Everything bundled into the Worker runs on the Workers runtime (T-004). Approved in D-014; `@clerk/shared` (T-053) and the React type packages (T-068) were added since and are type-only or already present transitively. Test fixtures, not packages: the Noto Sans and Noto Naskh Arabic fonts (SIL OFL, T-072).

## 2. Test and lint results

Run on 2026-09-24, on the final commit:

- **`npm run typecheck`:** 0 errors (worker, web, node).
- **`npm run lint`:** 0 problems. **`npm run format:check`:** clean.
- **`npm test`:** 60 files, 252 tests, all passing, none skipped. Also passes in a clean clone with no `.dev.vars`, exactly as CI runs it (T-071).
- **`npm run test:permissions`:** 3 files, 7 tests.
  - Structural sweep: every declared route has a class from the fixed set.
  - Assembled-app sweep: the table above.
  - Behavioural sweep over real HTTP, all failing closed with 403/404: a Branch A officer reading Branch B's records, a branch officer attempting a national action, and an administrator with no content capability reading content.
- **`npm run test:e2e`:** 2 passed (the sign-in screen in English and in Arabic).
- **`npm run test:pdf-remote`:** 2 passed.
- **Browser Rendering usage this phase: 2 calls** (D-030).
- **Live preview checks:**
  - security headers on every kind of response;
  - 401 for `/api/me` with no token or a bad token;
  - 403 for a cross-origin API call;
  - JSON 404 for an unknown API path;
  - 401 for an unsigned or forged webhook;
  - the sign-in screen renders in both languages in a real browser.

## 3. Owner answers received and recorded

All in `docs/decisions.md`:

- **Cron schedules:** D-001.
- **Governance and working rules:** D-011, D-012, D-017, D-018, D-039.
- **Accounts and resources:** D-007 to D-010, D-015, D-023, D-038.
- **Languages:** D-013, D-022, D-026, D-034, D-037.
- **Privacy notice:** D-005, D-016, D-024, D-027.
- **Identity and permissions:** D-003, D-004, D-019, D-021, D-028, D-029.
- **Service switches:** D-020.
- **Notifications and push:** D-031, D-032, D-033.
- **PDF:** D-030.
- **PWA manifest:** D-006, D-025, D-036.
- **Home page:** D-035.
- **Progress page:** D-040.

## 4. Anything uncertain or not finished

- **Awaiting owner review:**
  - the Arabic interface texts (`docs/arabic-texts-review.md`, 36 pairs);
  - the two sample PDFs (`docs/pdf-samples/`).
- **Not yet exercised for real:** a real sign-in, and a real signed webhook delivery from Clerk. Both need a person record to link to, which Phase 1's seed data provides. Journeys past sign-in in the end-to-end tests wait for the same.
- **Cron triggers fire in preview but no job exists yet:** each scheduled run throws "job not registered" until the phase that owns each job adds it (T-063/T-066). This is expected from the code, not observed in logs. It is harmless, but it will show as errors in the preview's Workers Logs and could trigger an error-spike alert if one is set up.
- **Sign-in screen:** Clerk still shows a "Sign up" link although sign-up is Restricted. Clerk refuses sign-ups at that point, so it's cosmetic, but the brief says sign-up is closed. Hiding it is a one-line change to `<SignIn>`, waiting for your word.
- **Cosmetic:** Clerk's development-mode badge image is blocked by the CSP (console only; production instances don't show it).
- **Carried forward, unchanged:**
  - T-037: one direction of the core-to-core import rule has no automatic check. To be covered in the Phase 12 security review.
  - P5: the schema doesn't forbid several current terms, but P5 isn't built.
  - D-027: Phase 1's seed data must give the first system administrators a term, not only an administrator row.
  - T-030: `npm audit` advisories on the local-Chromium download path, which the portal never uses.
- **For Phase 2 (branding):** variable fonts embed as Type 3 in PDFs. Static font files are worth preferring when the branding fonts are chosen (T-072).

## 5. Questions for the owner, and what Phase 1 needs

**Open questions** (full text in `docs/decisions.md`, section "Open"):

| # | Question | Needed by |
|---|---|---|
| O-005 (remainder) | The full list of which services depend on each other for switching (only one pair is stated) | Phase 2 |
| O-007 (remainder) | Which digits Arabic screens show when the digits setting is unset | When numbers first appear on screen |
| O-016 (remainder) | How long an undelivered push alert is kept for delivery | Phase 7 |
| O-017 | How the first administrator reaches the screen that sets the privacy notice, given nobody gets past "access not active" until one exists | Phase 2 |

**Also:** hide Clerk's "Sign up" link (section 4)? And please review the Arabic texts and the sample PDFs.

**Proposals to confirm before Phase 1:** P1, P3, P4, P5, P21 and P22 (brief section 31).

**Owner inputs for Phase 1**, as files in `seed/`:
- General Council name and code.
- The first system administrators and the national register officer: names, emails, and each one's term (role, unit, start date; D-027).
- The standard roles list, and which roles are the register officer roles.
- The branches (name, code, area).

**Approved 2026-09-24 (D-041).** Afterwards, the owner answered the section 4 items: the sign-up link is hidden (D-043), and a scheduled job not built yet now records a normal run instead of an error (D-044). P1, P3, P4, P5, P21 and P22 are confirmed (D-042).
