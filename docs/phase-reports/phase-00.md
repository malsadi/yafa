# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress. **Latest session, 2026-09-24: step 5 built** (three commits, T-066 to T-070). This covers the Worker entry and full `wrangler.jsonc`; the preview D1 (EU jurisdiction) and both preview Queues, created on Cloudflare; the API the shell needs; the frontend shell itself, checked in a real browser in English and Arabic; the preview deploy scripts; the CI deploy-preview job; and Playwright end-to-end tests in both languages. **The preview deploy is not done. It waits on owner actions** (section 4a): enable R2 on the Cloudflare account, upload the Worker's secrets, and set three GitHub secrets. `wrangler` is logged in again (account `45ded829…`), so `core/pdf` is no longer blocked on authentication. It has not been started, because it wasn't part of step 5. Earlier session summary follows.

**Earlier status (2026-09-23):** In progress, resumed on 2026-09-23. Tooling scaffold, `ids`, the route registry, CI, and the D1-backed identity/permissions slice were already built and green. Since the last report draft, six more core modules landed, each its own commit: `errors` (T-051), `money`/`dates` (T-052), `security-headers` (T-053), `maintenance-mode` (T-054), `events-bus` (T-055), `files` (`buildObjectKey()` only, T-056). This session added `core/notifications` (in-portal inbox plus unread count/mark-all-read, T-057/T-061), `core/push` (subscription storage plus a single-delivery primitive, T-059), the cron/queue dispatchers (empty registries, T-063), and — the largest single piece — **the Clerk session middleware, the privacy-notice gate, `/api/me`, and the permission sweep's real behavioural half (T-064)**: signed session tokens are verified for real (`@clerk/backend`'s `verifyToken`, RS256, a genuine trap in the installed package's compiled output found and worked around, not assumed from its types), a person who isn't linked or has no current term sees `not-active`, a signed-in officer is blocked until the current privacy notice is acknowledged (two new append-only tables), and three fixture-capability HTTP requests now prove all three of brief section 7.4's cases fail closed end to end. **A `core/pdf` feasibility check found local Browser Rendering could not be proven working in this development environment (T-058)** — the owner then approved remote Browser Rendering against `preview`, sparingly (D-030) — **but the actual build is still blocked on Cloudflare account authentication**: `wrangler`'s token has expired in this non-interactive environment and cannot be refreshed without the owner running `wrangler login` (or supplying a scoped `CLOUDFLARE_API_TOKEN`) themselves — see section 4. **The webhook (T-065, the deliberately-separate second commit of step 4) is also done this session:** `verifyWebhook` (Standard Webhooks/Svix-compatible signature, not the `svix` package — T-003 confirmed again by reading the compiled source), `user.created`/`user.updated`/`user.deleted` link/sync/unlink a person by email, case-insensitively, real HMAC-signed test payloads, all proven end to end. Step 4 is now fully finished. Not yet built: `core/pdf` (blocked on auth), the frontend shell, preview resources and deploy — step 5. Pushed to `origin/main` this session (owner instruction, 2026-09-23) through the `core/push` commit; everything after that is committed locally but not pushed again yet — check `git status`/`git log` against `origin/main` when resuming.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 0. `.dev.vars`/`.env.local` — resolved (D-023)

Reported missing twice (2026-09-20, 2026-09-22). Owner, 2026-09-22 (same day, later): confirmed fixed. Checked by name only (`ls -la` on the project root; contents never read, never will be): **both files are now present.** Nothing further blocked by this.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | Pushed to `origin/main` (owner instruction, 2026-09-23) through the `core/push` commit; later commits await the next push instruction (D-017/D-018 — pushing needs the owner's go-ahead each time). |
| TypeScript, ESLint, Prettier, Vitest, Playwright | Built and green, unchanged since the last draft. Playwright still has no config or tests (step 6). |
| `wrangler.jsonc` | **Full (T-066, 2026-09-24):** `main`, static assets (single-page-app fallback, `run_worker_first: true` so security headers reach every response), cron triggers (D-001) mapped by `vars.CRON_JOBS`, `secrets.required`, D1, R2 (files and backups), Queue producers, Browser Rendering (preview/production only), and separate `env.preview`/`env.production` with D-008 names. Preview D1 `yafa-portal-preview-db` (jurisdiction `eu`) and both preview Queues exist. **Preview R2 buckets are not created: R2 is not enabled on the account.** Production resources are never created by Claude Code. |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | **Middleware and webhook both done this session.** Middleware (T-064): `requireSignedIn`/`requireActiveAccess`, backed by `verifyClerkSessionToken()` and `resolveSessionState()`. Webhook (T-065): `src/worker/webhooks/`, `verifyWebhook`, `user.created`/`user.updated`/`user.deleted` link/sync/unlink a person by email. Invite-only flow (sending the actual Clerk invitation) and the "access not active" *page* itself are Phase 1+/frontend-shell concerns, not this piece. |
| Core modules | `ids`, route registry, `core/settings`, `core/service-switches`, `core/audit`, `people`/`terms`/`roles`/`permission_grants`/`system_administrators`, the capability catalogue, the request-context loader, and `can()` (earlier sessions). Since then, six more landed, each its own commit: `core/errors` (T-051, **+`UnauthorizedError` this session**), `src/shared/core/money`/`dates` (T-052), `core/security-headers` (T-053), `core/maintenance-mode` (T-054), `core/events-bus` (T-055), `core/files` (`buildObjectKey()` only, T-056). **This session:** `core/notifications` — the in-portal inbox plus unread count/mark-all-read (T-057, T-061); `core/push` — subscription storage plus `buildPushRequest()`/`classifyPushResponseStatus()`/`buildRemovePushSubscriptionStatement()` (T-059); the cron/queue dispatchers (T-063); **`core/privacy-notice`** — the notice-acknowledgement gate's own table access (T-064). Still not started: `core/pdf` (blocked on Cloudflare auth, see section 4). |
| `/api/me` | **Built this session (T-064):** `src/worker/api-me/`, `signed-in-only`, reports `not-active` / `notice-not-set` / `notice-not-acknowledged` / `active` — never itself blocked by the state it exists to report. |
| Permission sweep, behavioural half | **Real this session (T-064):** `tests/permissions/route-sweep-behavioural.test.ts` proves all three brief section 7.4 cases fail 403/404 over actual HTTP, through the real middleware chain and `can()` — a Branch A officer reading Branch B's records, a branch officer attempting a national action, and a system administrator with no content capability of their own (P22). |
| Frontend shell | **Built (T-068, T-069):** Clerk sign-in (Arabic localisation in Arabic), "access not active" page, privacy notice on first sign-in (tick, then continue; recorded per version), portal layout, admin layout at `/admin` (administration capability only), navigation for every stage-one service switched on for the selected unit (empty pages), unit switcher for people in more than one unit, language switcher saved to the person record, `<html lang dir>` right-to-left switching, `src/web/text/en|ar` with a key-parity test, maintenance banner, footer link to the privacy notice, service worker. **PWA manifest route not built:** it needs branding (Phase 2), O-020. Checked in headless Chromium: English is left-to-right and Arabic right-to-left, with Clerk's Arabic screens. Signed-in screens are tested in jsdom only, because no real Clerk user exists yet. |
| CI | `verify` unchanged. **`deploy-preview` added (T-070):** on `main` after `verify`, it migrates the preview D1 and then deploys. It fails until the owner's actions in section 4a are done. |
| Documentation | `docs/decisions.md` through **T-070** and **O-020** (2026-09-24). This file, brought current. |
| PWA manifest route | Not built. Per D-025 (O-004): `/manifest.webmanifest` will be **public, no access class, branding only**. Branding doesn't exist until Phase 2, so there is nothing to serve yet; proposed to build it then (O-020). |

**Database, earlier sessions:**
- `migrations/0000_units_settings_switches_audit.sql`: `units`, `settings`, `settings_history`, `service_switches`, `audit_log`.
- `migrations/0001_immutability_triggers.sql` (hand-written): blocks `UPDATE`/`DELETE` on `settings_history` and `audit_log`.
- `migrations/0002_people_terms_roles_permission_grants.sql`: `people`, `roles`, `terms`, `permission_grants`, `system_administrators`.
- `migrations/0003_maintenance_mode.sql`: `maintenance_mode` (T-054).
- The `worker` Vitest project applies every migration to an isolated D1 instance before each test file (`readD1Migrations`/`applyD1Migrations`).

**Database, this session:**
- `migrations/0004_notifications.sql` (Drizzle-generated): `notifications` (`id`, `person_id` FK to `people`, `kind`, `params_json`, `read_at`, `created_at`), plus a composite index on `(person_id, created_at)` for the inbox's one query shape (T-057). No immutability trigger: not on brief section 9.1's locked list.
- `migrations/0005_push_subscriptions.sql` (Drizzle-generated): `push_subscriptions` (`id`, `person_id` FK, `endpoint` unique, `p256dh`, `auth`, `expiration_time`, `created_at`), plus an index on `person_id` (T-059). No immutability trigger.
- `migrations/0006_job_runs.sql` (Drizzle-generated): `job_runs` (`job_name` primary key, `last_run_at`, `outcome`, `error_code`) — current state, upserted per run, not a history (T-063). No immutability trigger.
- `migrations/0007_privacy_notice.sql` (Drizzle-generated): `privacy_notice_versions`, `privacy_notice_acknowledgements` (T-064).
- `migrations/0008_privacy_notice_immutability_triggers.sql` (hand-written, mirrors 0001): blocks `UPDATE`/`DELETE` on both new tables — D-005/T-020's append-only requirement.
- All applied to the local dev D1 and confirmed clean (`npm run db:migrate:local`); migrations 0000–0008 all apply cleanly in sequence.

**Database, 2026-09-24:**
- `migrations/0009_people_language.sql`: `people.language`, nullable, `CHECK` in `('en','ar')` (T-067). Applied locally. Not yet applied to the preview D1, which happens with the first preview deploy.

## 2. Test and lint results

**2026-09-24 (step 5):** `npm run typecheck` 0 errors (worker, web and node projects); `npm run lint` 0 problems; `npm run format:check` clean; **`npm test` — 55 files, 238 tests, all passing**, including 14 new jsdom tests for the shell and the text-key parity test; **`npm run test:permissions` — 3 files, 7 tests**. The new sweep file checks the real assembled app: every `/api` route Hono serves is declared, and the declarations are exactly the sweep entries (`GET /api/me`, `PUT /api/me/language`, `GET /api/privacy-notice`, `POST /api/privacy-notice/acknowledgements` — all signed-in-only; `POST /api/webhooks/clerk` — signed webhook). **`npm run test:e2e` — 2 passed** (sign-in screen, English and Arabic). `wrangler deploy --dry-run` of the preview build: every binding resolves. **Browser Rendering calls this session: 0.**

Earlier (2026-09-23), all green:

- `npm run lint` — 0 errors, 0 warnings.
- `npm run typecheck` — 0 errors.
- `npm test` — **42 test files, 197 tests, all passing.** `core/push`'s tests generate a throwaway VAPID/ECDH keypair with `crypto.subtle` and prove real VAPID signing and RFC 8291 encryption, not mocks. The dispatcher tests prove the recording behaviour directly: an unregistered job records nothing, a successful run and a thrown error both produce the right `job_runs` row, and repeated runs upsert rather than accumulate. The Clerk session tests generate a throwaway RS256 keypair and sign real JWTs — signature, expiry, and `azp`/origin checks are all exercised against the real `@clerk/backend` verifier, not mocked. The webhook tests sign real payloads with a throwaway HMAC secret and are verified by the actual `standardwebhooks` package.
- `npm run format:check` — clean.
- `npm run test:permissions` — passes (**2 files now, 5 tests: the structural sweep plus a real behavioural sweep**, T-064). Brief section 7.4's three cases — Branch A officer vs. Branch B's records, a branch officer attempting a national action, an administrator attempting to read content — are all proven over real HTTP, through the real middleware chain, this session.
- `npm run db:migrate:local` — all nine migrations (0000–0008) applied cleanly to the local dev D1.
- **Browser Rendering usage this session: 0 calls.** Blocked on Cloudflare auth before any call was made — see section 4. Recorded per phase report from here on, per D-030.

## 3. Owner answers received and recorded

**D-030 to D-033** (2026-09-23, this session, answering the batch raised above): **O-014** — remote Browser Rendering against the `preview` environment is approved for building/testing `core/pdf`, sparingly, tracked per phase report, never production; also asked for a real rendered proof of Arabic RTL shaping and a self-hosted font, with English/Arabic samples — **still pending, blocked on the auth issue in section 4; will be its own decision entry once `core/pdf` is actually built.** **O-013** — notifications are read/unread with an unread count and "mark all as read"; nothing is deleted (T-061). **O-015** — push retries use Cloudflare Queues' own `max_retries`, driven by an administrator "maximum attempts" Setting; not built yet (Phase 7). **O-016** — an undelivered push alert is shown on the health screen for an administrator-set period; a `gone` subscription is removed immediately; the raw HTTP TTL value itself is left as a small technical detail for the Phase 7 Queue consumer. Full verbatim text and reasoning for all four are in `docs/decisions.md`.

## 4. Anything uncertain or not finished

- **A known automated-enforcement gap (T-037), owner confirmed 2026-09-22: accept it, and cover it explicitly in the Phase 12 security review** (T-045) — "a core module may import another core module only through its `index.ts`" has no automated check in the one direction (core-to-core) that `eslint-plugin-boundaries`'s removal (T-025) left uncovered. Checked by hand this session: `core/permissions` does not import from any other core module at all (confirmed with `grep`), so nothing here exercises the gap either way; it remains a real gap for the next core module that does.
- **P5** (a person can hold several current terms at once, in different units or roles) is still unconfirmed, but this session's schema doesn't forbid it — `terms.person_id` isn't unique — and the cross-unit-leak test (`can.test.ts`) exercises exactly that shape as a safety property that has to hold regardless of whether P5 is confirmed. This is not building P5; if the owner declines it, Phase 1 would add a constraint limiting a person to one current term.
- **D-027 is a Phase 1 seed-data requirement, not yet actionable:** the seed file(s) that create the first system administrators must also give each one a `terms` row (role, unit, start date), not just a `system_administrators` row — otherwise `loadRequestContext()` correctly, but unhelpfully, locks them out. Nothing to build yet; flagging so Phase 1's seed-loading step doesn't miss it.
- **`npm audit`** still reports the same advisories (T-030); unchanged, not revisited this session.
- **This report had fallen six commits behind** (T-051 to T-056 were built and committed across earlier sessions but never written up here). Brought current this session, through T-065.
- **The webhook (T-065) needs two account actions before it runs for real, batched, not done silently:** a new secret name, `CLERK_WEBHOOK_SIGNING_SECRET`, added to `.dev.vars.example` once `src/worker/index.ts` actually reads it (step 5); and a webhook endpoint configured in the Clerk dashboard pointed at a public URL, which needs the `preview` environment to exist first (also step 5). Nothing to do about either yet.
- **What the webhook does when a Clerk email matches no `people` row is not stated in the brief — checked, not guessed:** it does nothing (no error), since a person row only ever comes from a register officer through the Committee register, and inventing any other behaviour would be exactly the kind of guess rule 1 forbids. Recorded as a technical call, not an owner question, since there was no second non-destructive option to weigh.
- **New this session — O-017:** D-024/D-027 don't explain how the first administrator reaches the screen that sets the privacy notice, since that gate has no stated exemption for admin-panel routes. Not blocking (no admin screens exist yet); flagged for whoever builds Phase 2's texts screen.
- **Production Clerk verification is unverified, by necessity, not oversight.** T-064's session middleware is tested against real, self-signed throwaway tokens (`jwtKey`, no network) — a genuine Clerk-issued token verified with the production `secretKey` path has never been exercised, since there's no frontend yet to produce a real sign-in. Recorded here so this isn't mistaken for "the Clerk integration is proven end to end."
- **`core/pdf` is blocked on Cloudflare authentication, not on anything Claude Code can resolve.** The owner approved remote Browser Rendering against `preview` (D-030) once T-058's local feasibility check failed, but `npx wrangler whoami` in this session returns "Not logged in. Your auth token has expired and could not be refreshed, and the environment is non-interactive." Building `core/pdf` for real — including the Arabic RTL/self-hosted-font proof and the English/Arabic samples the owner asked for — needs the owner to run `wrangler login` interactively (suggest typing `! npx wrangler login` in this session so its output reaches the conversation) or export a scoped `CLOUDFLARE_API_TOKEN` themselves. Not attempted as a workaround; account authentication is exactly what CLAUDE.md's "needs an account" category asks to stop for.
- **Font choice for the `core/pdf` proof, notice not question:** Noto Sans (Latin) and Noto Naskh Arabic (Arabic), both SIL Open Font License — self-hosted, no outside-service fetch at render time. These are **test fixtures for the feasibility proof only**; `core/pdf` itself takes its fonts as a parameter, never hard-coded, since brief section 15 C3 makes the real Latin/Arabic fonts an administrator Setting (branding, T-014, Phase 2). Per D-011 ("see any new dependency before it is installed"), flagged here rather than installed silently — no objection needed to proceed, this is the planned default once auth is restored, but say so if a different font is preferred.
- **T-062 (unverified):** whether a Queues consumer's `max_retries` can be changed without a redeploy is still unchecked against Cloudflare's current API — see `docs/decisions.md`. Check before Phase 7 builds the push Queue consumer.

## 4a. Owner actions for the first preview deploy (updated 2026-09-24)

**Done by the owner:** R2 enabled; GitHub secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `VITE_CLERK_PUBLISHABLE_KEY` set; Clerk social sign-in off, sign-up Restricted, multi-factor on (D-038). **Done by Claude Code:** preview R2 buckets created (EU jurisdiction); all ten migrations (0000–0009) applied to the preview D1; CI fixed (T-071 — CI was failing in the tests, never reaching the deploy).

**First preview deploy: done by the owner, 2026-09-24 12:26 UTC**, with the Worker's secrets (`wrangler deploy --secrets-file .dev.vars`), after creating the Clerk webhook endpoint. **Preview URL: https://yafa-portal-preview.mohammedalsadi985.workers.dev.** CI deploys on `main` from now on.

**Live checks by Claude Code, 2026-09-24:**
- **Security headers:** `/`, a single-page-app path and a static file all carry CSP, HSTS, `nosniff`, a strict referrer policy and `frame-ancestors 'none'`. The live CSP has no `'unsafe-inline'` for scripts (T-069).
- **Pages:** `/treasury` falls back to the app (200 HTML), and `/service-worker.js` is served.
- **API:** `/api/me` returns 401 `session.missing` with no token and 401 `session.invalid` with a bad token; a call from another origin gets 403 `request.origin-mismatch`; an unknown `/api` path gets 404 `route.not-found`; the privacy-notice acknowledgement without a session gets 401.
- **Webhook:** `POST /api/webhooks/clerk` unsigned, and with a forged Svix signature, both get 401 `webhook.invalid-signature`.
- **Browser (headless Chromium):** the sign-in screen renders in English (left-to-right) and in Arabic (right-to-left, Clerk's Arabic screens). Social sign-in buttons are gone. Only console message: Clerk's development badge image blocked by `img-src` (cosmetic, T-069).
- **Not yet exercised:** a real sign-in, and a real signed Clerk webhook delivery. Both need a person record to link to, which Phase 1's seed data provides.

## 5. Questions for the owner

Batched, per the owner's standing instruction not to ask one by one. None of these block Phase 0's remaining work (section "Resume notes" below); all should be confirmed before the phase or feature named in "Blocks" is built. Full text and reasoning for each is in `docs/decisions.md`'s "Open" table. **O-013 through O-016 were answered 2026-09-23 — see D-030 to D-033 in section 3.** One small remainder stays open, alongside two unchanged from earlier:

| # | Question | Blocks |
|---|---|---|
| O-016 (remainder) | D-033 answered the health-screen-retention half; the raw HTTP push TTL seconds value itself still has no portal number, left to whoever builds the Phase 7 Queue consumer | `core/push` Queue consumer (Phase 7) |
| O-017 | How does the very first administrator reach the privacy-notice-setting screen, given the gate has no stated exemption for admin-panel routes? | Phase 2 Administration panel (texts screen) |
| O-007 (remainder) | Arabic-digits setting unset → what an officer with no digits preference sees | Frontend shell |
| O-005 (remainder) | The full cross-service service-switch dependency list (brief section 8.4 states only one: Event organiser needs Treasury) | Phase 2 switch screen |
| O-018 | Language when nothing is saved: (a) a signed-in officer with no saved language keeps the browser's language; (b) a browser preferring neither English nor Arabic gets English. Both built provisionally. | Frontend shell |
| O-019 | What the home page (`/`) shows. The brief lists none, so it currently shows the layout and navigation with an empty main area. | Frontend shell |
| O-020 | Build the PWA manifest route in Phase 2, with branding, since there is nothing to serve before then? | Phase 2 |
| Arabic texts | All Arabic interface texts drafted this session (`src/web/text/ar/`) are **awaiting owner review** (D-013). | Each phase report |

## 6. Secrets for GitHub Actions

**Needed now** that the deploy job exists: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_CLERK_PUBLISHABLE_KEY`. See section 4a, item 3.

**P-items needed for Phase 1** (unchanged): P1, P3, P4, P5, P21, P22.

**Owner inputs needed for Phase 1** (unchanged): General Council name and code; first system administrators and the national register officer (names and emails); standard roles list and which roles are the register officer roles; branches (name, code, area) — as files in `seed/`.

## Resume notes

### Order of work — where this session stopped

Step 1 (identity/permissions slice) done in an earlier session. Step 2 is finished apart from the one blocked module. Next, in order:

1. ~~`people`/`terms`/`roles`/`permission_grants`, the request-context loader, and `can()`~~ — done.
2. Core modules: ~~`errors`~~ (T-051), ~~`money`/`dates`~~ (T-052), ~~`security-headers`~~ (T-053), ~~`maintenance-mode`~~ (T-054), ~~`events-bus`~~ (T-055), ~~`files`~~ (`buildObjectKey()` only, T-056), ~~`notifications`~~ (in-portal inbox + unread count/mark-all-read, T-057/T-061), ~~`push`~~ (subscription storage + single-delivery primitive, T-059) — all done, each its own commit.
   - **`core/pdf`** — **blocked on Cloudflare authentication, not silently skipped.** T-058's local feasibility check failed (Chromium extraction hangs in this dev environment); the owner then approved remote Browser Rendering against `preview`, sparingly (D-030), and asked for the module to prove real Arabic RTL shaping and a self-hosted font, with English/Arabic samples saved for review. **Before writing any of that: `npx wrangler whoami` fails — "Not logged in... environment is non-interactive."** The owner needs to run `wrangler login` (or set `CLOUDFLARE_API_TOKEN`) before this can proceed. Planned font fixtures: Noto Sans + Noto Naskh Arabic (SIL OFL) — flagged to the owner, not yet installed. Once auth works: build the render function taking fonts as a parameter (never hard-coded — brief section 15 C3 makes them a Phase 2 branding Setting), keep the `browser: { remote: true }` binding out of `npm test`/CI (a separate opt-in suite, e.g. under `test:e2e`, so a normal test run never spends money or needs credentials), assert the fixture font's name in the rendered PDF's `/BaseFont` entries as an automated check, leave visual shaping judgement to the owner's review of the saved samples, and record actual Browser Rendering call counts in the next phase report (D-030).
3. ~~T-016's cron/queue dispatchers~~ (T-063) — done, each registry proven with fixture jobs/consumers, `job_runs` last-run/outcome tracking tested directly.
4. ~~Clerk middleware, webhook, `/api/me`~~ — **done, this session, in two commits as planned:** session middleware/gate/`/api/me`/behavioural sweep (T-064), then the signed webhook (T-065). Step 4 is finished.
5. ~~Frontend shell, `vite.config.ts`, full `wrangler.jsonc`, preview D1/Queues, deploy-preview CI job~~. **Done 2026-09-24 (T-066 to T-070).** Still open in this step: the preview R2 buckets, the preview secrets and the first preview deploy. All wait on the owner's actions in section 4a and a go-ahead to deploy.
6. **Next:** `core/pdf` (step 2's blocked bullet). `wrangler` auth works again, so it is unblocked. It uses remote Browser Rendering, which D-030 approved sparingly. Build it as the plan above describes. After that, and once the owner's section 4a actions are done: the first preview deploy (ask first), the Clerk webhook endpoint, and then the Phase 0 close-out check line by line against brief section 26.

### How to resume this exact stopping point, without breaking the chain

1. `git status` — should be clean (every session ends on a commit, nothing staged or dangling). `git log origin/main..main` shows anything committed but not yet pushed (owner approves each push separately).
2. `git log --oneline -8` — the top commit describes the last piece finished; cross-check it against this file's "Order of work" above.
3. Read `CLAUDE.md`, then the relevant section of `system build prompt.md`, then `docs/decisions.md` (check the highest T-/O-numbers for the newest entries), then this file — exactly the order CLAUDE.md already prescribes.
4. Check `npx wrangler whoami` first — if it now succeeds, `core/pdf` (step 2's blocked bullet) can finally be built; if it still fails, that's still the blocker, not a new problem to debug, and the next real work is step 5 (frontend shell/`wrangler.jsonc`/preview resources). Nothing else is mid-flight.

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read or write `.dev.vars`/`.env*` (the harness itself blocks this). Never force push.
- Commit after every piece of finished work that passes lint, typecheck and tests (D-018), and push it straight away (D-039, standing approval).
- Use the scratchpad directory for temporary files.
