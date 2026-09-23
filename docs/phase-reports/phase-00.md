# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress, resumed on 2026-09-23 (this session). Tooling scaffold, `ids`, the route registry, CI, and the D1-backed identity/permissions slice (`units`/`settings`/`service-switches`/`audit`, `people`/`terms`/`roles`/`permission_grants`/`system_administrators`, the request-context loader and `can()`) were already built and green. Since the last report draft, six more core modules landed, each its own commit: `errors` (T-051), `money`/`dates` (T-052), `security-headers` (T-053), `maintenance-mode` (T-054), `events-bus` (T-055), `files` (`buildObjectKey()` only, T-056). **This session adds `core/notifications`** (in-portal inbox, T-057) **and `core/push`** (subscription storage plus a single-delivery primitive, T-059). **A `core/pdf` feasibility check was also run this session and did not build the module** — local Browser Rendering could not be proven working in this development environment (T-058); this is not a silent skip, it's batched as O-014 for the owner. Not yet built: Clerk middleware itself (the context loader it will call is done), `core/pdf` (blocked, see above), the frontend shell, preview resources and deploy. Step 2 of the resume plan is otherwise finished. The permission sweep's *route-level* behavioural half (signing in over HTTP as an officer of Branch A, etc.) still waits on that middleware — see section 4. Committed locally; not pushed — `main` is currently several commits ahead of `origin/main` (T-051 through this session's T-059), none pushed since the initial push (D-017); pushing is a hard-to-reverse, owner-confirmed action, not done automatically.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 0. `.dev.vars`/`.env.local` — resolved (D-023)

Reported missing twice (2026-09-20, 2026-09-22). Owner, 2026-09-22 (same day, later): confirmed fixed. Checked by name only (`ls -la` on the project root; contents never read, never will be): **both files are now present.** Nothing further blocked by this.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | Committed locally on `main`, not pushed this session (D-017/D-018 — pushing needs the owner's go-ahead each time). |
| TypeScript, ESLint, Prettier, Vitest, Playwright | Built and green, unchanged since the last draft. Playwright still has no config or tests (step 6). |
| `wrangler.jsonc` | Minimal, dev/test-only (T-027), carrying a local-only D1 binding (T-027 addendum). Unchanged this session. |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | Not started. |
| Core modules | `ids`, route registry, `core/settings`, `core/service-switches`, `core/audit`, `people`/`terms`/`roles`/`permission_grants`/`system_administrators`, the capability catalogue, the request-context loader, and `can()` (earlier sessions). Since then, six more landed, each its own commit: `core/errors` (T-051), `src/shared/core/money`/`dates` (T-052), `core/security-headers` (T-053), `core/maintenance-mode` (T-054), `core/events-bus` (T-055), `core/files` (`buildObjectKey()` only, T-056). **This session:** `core/notifications` — the in-portal inbox (`buildInPortalNotificationStatement`, `listNotificationsForPerson`, `markNotificationRead`, T-057); `core/push` — subscription storage plus `buildPushRequest()`/`classifyPushResponseStatus()`/`buildRemovePushSubscriptionStatement()` (T-059). Still not started: `core/pdf` (blocked, O-014). |
| Frontend shell | Not started. |
| CI | Unchanged (verify job only; deploy-preview intentionally not added — T-046). |
| Documentation | `docs/decisions.md` through **T-059** and **O-016** (this session). This file, brought current (it had fallen behind six commits — see the note in section 4). |
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
- Both applied to the local dev D1 and confirmed clean (`npm run db:migrate:local`); migrations 0000–0005 all apply cleanly in sequence.

## 2. Test and lint results

All green:

- `npm run lint` — 0 errors, 0 warnings.
- `npm run typecheck` — 0 errors.
- `npm test` — **28 test files, 136 tests, all passing.** `core/push`'s tests generate a throwaway VAPID/ECDH keypair with `crypto.subtle` and prove real VAPID signing and RFC 8291 encryption, not mocks.
- `npm run format:check` — clean.
- `npm run test:permissions` — passes (1 file, 2 tests — **still structural half only**, unchanged this session. That is not the same claim as brief section 7.4's sweep, which is *route-level*: sign in over HTTP as an officer of Branch A, attempt Branch B's records, expect 403/404. That still needs the Clerk middleware (not built) to call `loadRequestContext()` and routes that call `can()` (none exist yet)).
- `npm run db:migrate:local` — all six migrations (0000–0005) applied cleanly to the local dev D1.

## 3. Owner answers received and recorded

**D-030 to D-033** (2026-09-23, this session, answering the batch raised above): **O-014** — remote Browser Rendering against the `preview` environment is approved for building/testing `core/pdf`, sparingly, tracked per phase report, never production; also asked for a real rendered proof of Arabic RTL shaping and a self-hosted font, with English/Arabic samples (see T-060 below for how this was carried out). **O-013** — notifications are read/unread with an unread count and "mark all as read"; nothing is deleted (T-061). **O-015** — push retries use Cloudflare Queues' own `max_retries`, driven by an administrator "maximum attempts" Setting; not built yet (Phase 7). **O-016** — an undelivered push alert is shown on the health screen for an administrator-set period; a `gone` subscription is removed immediately; the raw HTTP TTL value itself is left as a small technical detail for the Phase 7 Queue consumer. Full verbatim text and reasoning for all four are in `docs/decisions.md`.

## 4. Anything uncertain or not finished

- **A known automated-enforcement gap (T-037), owner confirmed 2026-09-22: accept it, and cover it explicitly in the Phase 12 security review** (T-045) — "a core module may import another core module only through its `index.ts`" has no automated check in the one direction (core-to-core) that `eslint-plugin-boundaries`'s removal (T-025) left uncovered. Checked by hand this session: `core/permissions` does not import from any other core module at all (confirmed with `grep`), so nothing here exercises the gap either way; it remains a real gap for the next core module that does.
- **P5** (a person can hold several current terms at once, in different units or roles) is still unconfirmed, but this session's schema doesn't forbid it — `terms.person_id` isn't unique — and the cross-unit-leak test (`can.test.ts`) exercises exactly that shape as a safety property that has to hold regardless of whether P5 is confirmed. This is not building P5; if the owner declines it, Phase 1 would add a constraint limiting a person to one current term.
- **D-027 is a Phase 1 seed-data requirement, not yet actionable:** the seed file(s) that create the first system administrators must also give each one a `terms` row (role, unit, start date), not just a `system_administrators` row — otherwise `loadRequestContext()` correctly, but unhelpfully, locks them out. Nothing to build yet; flagging so Phase 1's seed-loading step doesn't miss it.
- **`npm audit`** still reports the same advisories (T-030); unchanged, not revisited this session.
- **This report had fallen six commits behind** (T-051 to T-056 were built and committed across earlier sessions but never written up here). Brought current this session, through T-059.
- **New this session — O-013:** `core/notifications`'s `read_at`/`markNotificationRead` (an inbox read/unread state) is not stated anywhere in brief section 9.5; it was built anyway as minimal additive schema and flagged, not silently assumed. See T-057 and O-013 in `docs/decisions.md`.
- **`core/pdf` could not be built this session (T-058, O-014).** A feasibility spike (added, tested, then fully reverted — nothing committed) found that local Browser Rendering — a real, documented, no-cost feature — hangs during Chromium extraction in this development environment, reproducibly, at the same point both times (`WidevineCdm/.../libwidevinecdm.so`; confirmed by directly inspecting the cached archive that this is not T-030's symlink advisory — no symlinks in it — so the actual cause is still unknown, not root-caused further). Building `core/pdf` without being able to run it would mean shipping unverified code, which this project's own rules don't allow; the two ways forward (occasional paid remote Browser Rendering calls during development, or resolving the local extraction issue first) are the owner's call, batched as O-014.
- **New this session — O-015:** the brief's push-retry-count Setting can't drive Cloudflare Queues' own `max_retries`, which is static deploy-time config, not a runtime value. Not urgent — no Queue or consumer exists yet — but flagged now so whoever builds the Queue consumer in Phase 7 doesn't try to wire the Setting straight into `max_retries`.
- **New this session — O-016:** how long an undelivered phone push alert should be held (the TTL header) isn't stated in the brief. `core/push`'s `buildPushRequest()` (T-059) makes `ttlSeconds` a required parameter precisely so a dependency's own hidden 60-second default can't quietly answer this instead — found in review before commit, not after.
- **T-016's cron/queue dispatchers (empty registries, recording each job's last run/outcome) are a named Phase 0 item (brief section 11/T-016) with no assigned step.** Not built this session; given an explicit slot in "Resume notes" below rather than left as a vague "somewhere in steps 2–4," so Phase 0 isn't declared done without them by accident.

## 5. Questions for the owner

Batched, per the owner's standing instruction not to ask one by one. None of these block Phase 0's remaining work (section "Resume notes" below); all should be confirmed before the phase or feature named in "Blocks" is built. Full text and reasoning for each is in `docs/decisions.md`'s "Open" table.

| # | Question | Blocks |
|---|---|---|
| O-014 | `core/pdf` is a named Phase 0 module but can't be proven working locally in this environment (T-058) — approve occasional paid remote Browser Rendering calls during development, or wait? | `core/pdf` (named for Phase 0) |
| O-013 | Should an in-portal notification be markable read at all, and does the officer see an unread count? Not stated in brief section 9.5; built anyway as minimal schema (T-057) | Communication hub / Task tracker screens (Phase 4/9) |
| O-015 | Push retry-count Setting vs. Queues' static `max_retries` — no single answer needed yet, just don't wire the Setting straight into `max_retries` | `core/push` Queue consumer (Phase 7) |
| O-016 | How long should an undelivered phone push alert be held (TTL)? Not stated in brief section 9.5 | `core/push` Queue consumer (Phase 7) |
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
2. Core modules: ~~`errors`~~ (T-051), ~~`money`/`dates`~~ (T-052), ~~`security-headers`~~ (T-053), ~~`maintenance-mode`~~ (T-054), ~~`events-bus`~~ (T-055), ~~`files`~~ (`buildObjectKey()` only, T-056), ~~`notifications`~~ (in-portal inbox only, T-057), ~~`push`~~ (subscription storage + single-delivery primitive, T-059) — all done, each its own commit.
   - **`core/pdf`** — **blocked, not silently skipped.** A feasibility check this session (T-058) found local Browser Rendering hangs during Chromium extraction in this dev environment (confirmed not T-030's symlink advisory; real cause still unknown). Building the module without being able to run it isn't allowed by this project's own rules. Waiting on the owner's answer to O-014 before picking this up again — do not re-attempt the same spike without a reason to think the environment has changed.
3. **T-016's cron/queue dispatchers** (empty registries; each job records its own last-run time and outcome, brief section 11) — a named Phase 0 item, not yet built. Do this next, before the Clerk middleware, since it's a small, self-contained core-adjacent piece (no `index.ts` needed, the same way `handleAppError` wasn't wired to an app before one existed) and nothing later depends on it being deferred.
4. Clerk middleware, webhook, `/api/me`. Applies D-024's privacy-notice gate to everyone, including administrators (D-027 — no exemption). Then write the permission sweep's behavioural half for real (fixture routes that call `can()`, signed in as officers of two different branches, over HTTP).
5. Frontend shell, `vite.config.ts`, then the rest of `wrangler.jsonc` (D1/R2/Queues/assets/`env.preview`/`env.production` with real resources), preview resources, and the deploy-preview CI job.

### How to resume this exact stopping point, without breaking the chain

1. `git status` — should be clean (every session ends on a commit, nothing staged or dangling).
2. `git log --oneline -8` — the top commit describes the last core module finished; cross-check it against this file's "Order of work" above.
3. Read `CLAUDE.md`, then the relevant section of `system build prompt.md`, then `docs/decisions.md` (check the highest T-/O-numbers for the newest entries), then this file — exactly the order CLAUDE.md already prescribes.
4. Go straight to "Order of work" above, step 2's `core/pdf`/`core/push` bullet. Nothing else is mid-flight.

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read or write `.dev.vars`/`.env*` (the harness itself blocks this). Never force push.
- Commit after every piece of finished work that passes lint, typecheck and tests (D-018).
- Use the scratchpad directory for temporary files.
