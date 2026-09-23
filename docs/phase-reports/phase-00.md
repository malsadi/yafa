# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress, resumed on 2026-09-23 (this session). Tooling scaffold, `ids`, the route registry, CI, and the D1-backed identity/permissions slice were already built and green. Since the last report draft, six more core modules landed, each its own commit: `errors` (T-051), `money`/`dates` (T-052), `security-headers` (T-053), `maintenance-mode` (T-054), `events-bus` (T-055), `files` (`buildObjectKey()` only, T-056). **This session adds `core/notifications`** (in-portal inbox plus unread count/mark-all-read, T-057/T-061), **`core/push`** (subscription storage plus a single-delivery primitive, T-059), and **the cron/queue dispatchers** (empty registries, T-063). **A `core/pdf` feasibility check found local Browser Rendering could not be proven working in this development environment (T-058)** — the owner then approved remote Browser Rendering against `preview`, sparingly (D-030) — **but the actual build is currently blocked on Cloudflare account authentication**: `wrangler`'s token has expired in this non-interactive environment and cannot be refreshed without the owner running `wrangler login` (or supplying a scoped `CLOUDFLARE_API_TOKEN`) themselves — see section 4. Not yet built: `core/pdf` (blocked on auth), Clerk middleware, the frontend shell, preview resources and deploy. Step 2 of the resume plan is otherwise finished, including its dispatcher item (step 3). The permission sweep's *route-level* behavioural half still waits on the Clerk middleware. Pushed to `origin/main` this session (owner instruction, 2026-09-23) through the `core/push` commit; commits made after that push are not yet pushed again — check `git status`/`git log` against `origin/main` when resuming.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 0. `.dev.vars`/`.env.local` — resolved (D-023)

Reported missing twice (2026-09-20, 2026-09-22). Owner, 2026-09-22 (same day, later): confirmed fixed. Checked by name only (`ls -la` on the project root; contents never read, never will be): **both files are now present.** Nothing further blocked by this.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | Pushed to `origin/main` (owner instruction, 2026-09-23) through the `core/push` commit; later commits await the next push instruction (D-017/D-018 — pushing needs the owner's go-ahead each time). |
| TypeScript, ESLint, Prettier, Vitest, Playwright | Built and green, unchanged since the last draft. Playwright still has no config or tests (step 6). |
| `wrangler.jsonc` | Minimal, dev/test-only (T-027), carrying a local-only D1 binding (T-027 addendum). Unchanged this session. |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | Not started. |
| Core modules | `ids`, route registry, `core/settings`, `core/service-switches`, `core/audit`, `people`/`terms`/`roles`/`permission_grants`/`system_administrators`, the capability catalogue, the request-context loader, and `can()` (earlier sessions). Since then, six more landed, each its own commit: `core/errors` (T-051), `src/shared/core/money`/`dates` (T-052), `core/security-headers` (T-053), `core/maintenance-mode` (T-054), `core/events-bus` (T-055), `core/files` (`buildObjectKey()` only, T-056). **This session:** `core/notifications` — the in-portal inbox plus unread count/mark-all-read (T-057, T-061); `core/push` — subscription storage plus `buildPushRequest()`/`classifyPushResponseStatus()`/`buildRemovePushSubscriptionStatement()` (T-059); the cron/queue dispatchers — `registerCronJob`/`dispatchScheduledJob` (with `job_runs` last-run/outcome tracking) and `registerQueueConsumer`/`dispatchQueueBatch`, empty registries (T-063). Still not started: `core/pdf` (blocked on Cloudflare auth, see section 4). |
| Frontend shell | Not started. |
| CI | Unchanged (verify job only; deploy-preview intentionally not added — T-046). |
| Documentation | `docs/decisions.md` through **T-063** and **O-016 (remainder)** (this session). This file, brought current. |
| PWA manifest route | Not built. Per D-025 (O-004): `/manifest.webmanifest` will be **public, no access class, branding only** — the only route the portal serves without a capability/signed-in-only/signed-webhook/calendar-feed-token declaration. |

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
- All applied to the local dev D1 and confirmed clean (`npm run db:migrate:local`); migrations 0000–0006 all apply cleanly in sequence.

## 2. Test and lint results

All green:

- `npm run lint` — 0 errors, 0 warnings.
- `npm run typecheck` — 0 errors.
- `npm test` — **32 test files, 151 tests, all passing.** `core/push`'s tests generate a throwaway VAPID/ECDH keypair with `crypto.subtle` and prove real VAPID signing and RFC 8291 encryption, not mocks. The dispatcher tests prove the recording behaviour directly: an unregistered job records nothing, a successful run and a thrown error both produce the right `job_runs` row, and repeated runs upsert rather than accumulate.
- `npm run format:check` — clean.
- `npm run test:permissions` — passes (1 file, 2 tests — **still structural half only**, unchanged this session. That is not the same claim as brief section 7.4's sweep, which is *route-level*: sign in over HTTP as an officer of Branch A, attempt Branch B's records, expect 403/404. That still needs the Clerk middleware (not built) to call `loadRequestContext()` and routes that call `can()` (none exist yet)).
- `npm run db:migrate:local` — all seven migrations (0000–0006) applied cleanly to the local dev D1.
- **Browser Rendering usage this session: 0 calls.** Blocked on Cloudflare auth before any call was made — see section 4. Recorded per phase report from here on, per D-030.

## 3. Owner answers received and recorded

**D-030 to D-033** (2026-09-23, this session, answering the batch raised above): **O-014** — remote Browser Rendering against the `preview` environment is approved for building/testing `core/pdf`, sparingly, tracked per phase report, never production; also asked for a real rendered proof of Arabic RTL shaping and a self-hosted font, with English/Arabic samples (see T-060 below for how this was carried out). **O-013** — notifications are read/unread with an unread count and "mark all as read"; nothing is deleted (T-061). **O-015** — push retries use Cloudflare Queues' own `max_retries`, driven by an administrator "maximum attempts" Setting; not built yet (Phase 7). **O-016** — an undelivered push alert is shown on the health screen for an administrator-set period; a `gone` subscription is removed immediately; the raw HTTP TTL value itself is left as a small technical detail for the Phase 7 Queue consumer. Full verbatim text and reasoning for all four are in `docs/decisions.md`.

## 4. Anything uncertain or not finished

- **A known automated-enforcement gap (T-037), owner confirmed 2026-09-22: accept it, and cover it explicitly in the Phase 12 security review** (T-045) — "a core module may import another core module only through its `index.ts`" has no automated check in the one direction (core-to-core) that `eslint-plugin-boundaries`'s removal (T-025) left uncovered. Checked by hand this session: `core/permissions` does not import from any other core module at all (confirmed with `grep`), so nothing here exercises the gap either way; it remains a real gap for the next core module that does.
- **P5** (a person can hold several current terms at once, in different units or roles) is still unconfirmed, but this session's schema doesn't forbid it — `terms.person_id` isn't unique — and the cross-unit-leak test (`can.test.ts`) exercises exactly that shape as a safety property that has to hold regardless of whether P5 is confirmed. This is not building P5; if the owner declines it, Phase 1 would add a constraint limiting a person to one current term.
- **D-027 is a Phase 1 seed-data requirement, not yet actionable:** the seed file(s) that create the first system administrators must also give each one a `terms` row (role, unit, start date), not just a `system_administrators` row — otherwise `loadRequestContext()` correctly, but unhelpfully, locks them out. Nothing to build yet; flagging so Phase 1's seed-loading step doesn't miss it.
- **`npm audit`** still reports the same advisories (T-030); unchanged, not revisited this session.
- **This report had fallen six commits behind** (T-051 to T-056 were built and committed across earlier sessions but never written up here). Brought current this session, through T-063.
- **`core/pdf` is blocked on Cloudflare authentication, not on anything Claude Code can resolve.** The owner approved remote Browser Rendering against `preview` (D-030) once T-058's local feasibility check failed, but `npx wrangler whoami` in this session returns "Not logged in. Your auth token has expired and could not be refreshed, and the environment is non-interactive." Building `core/pdf` for real — including the Arabic RTL/self-hosted-font proof and the English/Arabic samples the owner asked for — needs the owner to run `wrangler login` interactively (suggest typing `! npx wrangler login` in this session so its output reaches the conversation) or export a scoped `CLOUDFLARE_API_TOKEN` themselves. Not attempted as a workaround; account authentication is exactly what CLAUDE.md's "needs an account" category asks to stop for.
- **Font choice for the `core/pdf` proof, notice not question:** Noto Sans (Latin) and Noto Naskh Arabic (Arabic), both SIL Open Font License — self-hosted, no outside-service fetch at render time. These are **test fixtures for the feasibility proof only**; `core/pdf` itself takes its fonts as a parameter, never hard-coded, since brief section 15 C3 makes the real Latin/Arabic fonts an administrator Setting (branding, T-014, Phase 2). Per D-011 ("see any new dependency before it is installed"), flagged here rather than installed silently — no objection needed to proceed, this is the planned default once auth is restored, but say so if a different font is preferred.
- **T-062 (unverified):** whether a Queues consumer's `max_retries` can be changed without a redeploy is still unchecked against Cloudflare's current API — see `docs/decisions.md`. Check before Phase 7 builds the push Queue consumer.

## 5. Questions for the owner

Batched, per the owner's standing instruction not to ask one by one. None of these block Phase 0's remaining work (section "Resume notes" below); all should be confirmed before the phase or feature named in "Blocks" is built. Full text and reasoning for each is in `docs/decisions.md`'s "Open" table. **O-013 through O-016 were answered 2026-09-23 — see D-030 to D-033 in section 3.** One small remainder stays open, alongside two unchanged from earlier:

| # | Question | Blocks |
|---|---|---|
| O-016 (remainder) | D-033 answered the health-screen-retention half; the raw HTTP push TTL seconds value itself still has no portal number, left to whoever builds the Phase 7 Queue consumer | `core/push` Queue consumer (Phase 7) |
| O-007 (remainder) | Arabic-digits setting unset → what an officer with no digits preference sees | Frontend shell |
| O-005 (remainder) | The full cross-service service-switch dependency list (brief section 8.4 states only one: Event organiser needs Treasury) | Phase 2 switch screen |

## 6. Secrets for GitHub Actions

Unchanged from the previous draft — see that section; nothing needed today, the list for when the deploy job is added is already recorded there and in `docs/decisions.md`.

**P-items needed for Phase 1** (unchanged): P1, P3, P4, P5, P21, P22.

**Owner inputs needed for Phase 1** (unchanged): General Council name and code; first system administrators and the national register officer (names and emails); standard roles list and which roles are the register officer roles; branches (name, code, area) — as files in `seed/`.

## Resume notes

### Order of work — where this session stopped

Step 1 (identity/permissions slice) done in an earlier session. Step 2 is finished apart from the one blocked module. Next, in order:

1. ~~`people`/`terms`/`roles`/`permission_grants`, the request-context loader, and `can()`~~ — done.
2. Core modules: ~~`errors`~~ (T-051), ~~`money`/`dates`~~ (T-052), ~~`security-headers`~~ (T-053), ~~`maintenance-mode`~~ (T-054), ~~`events-bus`~~ (T-055), ~~`files`~~ (`buildObjectKey()` only, T-056), ~~`notifications`~~ (in-portal inbox + unread count/mark-all-read, T-057/T-061), ~~`push`~~ (subscription storage + single-delivery primitive, T-059) — all done, each its own commit.
   - **`core/pdf`** — **blocked on Cloudflare authentication, not silently skipped.** T-058's local feasibility check failed (Chromium extraction hangs in this dev environment); the owner then approved remote Browser Rendering against `preview`, sparingly (D-030), and asked for the module to prove real Arabic RTL shaping and a self-hosted font, with English/Arabic samples saved for review. **Before writing any of that: `npx wrangler whoami` fails — "Not logged in... environment is non-interactive."** The owner needs to run `wrangler login` (or set `CLOUDFLARE_API_TOKEN`) before this can proceed. Planned font fixtures: Noto Sans + Noto Naskh Arabic (SIL OFL) — flagged to the owner, not yet installed. Once auth works: build the render function taking fonts as a parameter (never hard-coded — brief section 15 C3 makes them a Phase 2 branding Setting), keep the `browser: { remote: true }` binding out of `npm test`/CI (a separate opt-in suite, e.g. under `test:e2e`, so a normal test run never spends money or needs credentials), assert the fixture font's name in the rendered PDF's `/BaseFont` entries as an automated check, leave visual shaping judgement to the owner's review of the saved samples, and record actual Browser Rendering call counts in the next phase report (D-030).
3. ~~T-016's cron/queue dispatchers~~ (T-063) — done, each registry proven with fixture jobs/consumers, `job_runs` last-run/outcome tracking tested directly.
4. Clerk middleware, webhook, `/api/me`. Applies D-024's privacy-notice gate to everyone, including administrators (D-027 — no exemption). Then write the permission sweep's behavioural half for real (fixture routes that call `can()`, signed in as officers of two different branches, over HTTP).
5. Frontend shell, `vite.config.ts`, then the rest of `wrangler.jsonc` (D1/R2/Queues/assets/`env.preview`/`env.production` with real resources), preview resources, and the deploy-preview CI job.

### How to resume this exact stopping point, without breaking the chain

1. `git status` — should be clean (every session ends on a commit, nothing staged or dangling). `git log origin/main..main` shows anything committed but not yet pushed (owner approves each push separately).
2. `git log --oneline -8` — the top commit describes the last piece finished; cross-check it against this file's "Order of work" above.
3. Read `CLAUDE.md`, then the relevant section of `system build prompt.md`, then `docs/decisions.md` (check the highest T-/O-numbers for the newest entries), then this file — exactly the order CLAUDE.md already prescribes.
4. Check `npx wrangler whoami` first if picking up `core/pdf` — if it still fails, that's still the blocker, not a new problem to debug. Otherwise go straight to step 4 (Clerk middleware) above; nothing else is mid-flight.

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read or write `.dev.vars`/`.env*` (the harness itself blocks this). Never force push.
- Commit after every piece of finished work that passes lint, typecheck and tests (D-018).
- Use the scratchpad directory for temporary files.
