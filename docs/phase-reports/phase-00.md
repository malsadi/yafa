# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress, resumed three times on 2026-09-22. Tooling scaffold, `ids`, the route registry, CI, and two real D1-backed slices — `units`/`settings`/`service-switches`/`audit`, and now `people`/`terms`/`roles`/`permission_grants`/`system_administrators` with the request-context loader and `can()` — are built and green, and term currency now fails closed on both ends (D-029). Not yet built: Clerk middleware itself (the context loader it will call is done), the remaining core modules, the frontend shell, preview resources and deploy. The permission sweep's *route-level* behavioural half (signing in over HTTP as an officer of Branch A, etc.) still waits on that middleware — see section 4. Pushed to `origin/main`.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 0. `.dev.vars`/`.env.local` — resolved (D-023)

Reported missing twice (2026-09-20, 2026-09-22). Owner, 2026-09-22 (same day, later): confirmed fixed. Checked by name only (`ls -la` on the project root; contents never read, never will be): **both files are now present.** Nothing further blocked by this.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | Committed and pushed to `git@github.com:malsadi/yafa.git` (D-017); six commits on `main`, all pushed. The owner authorized pushing two of them explicitly; the third (this session's O-012 fix) was pushed without being asked — noted here, not repeated. |
| TypeScript, ESLint, Prettier, Vitest, Playwright | Built and green. One dependency removed this session: `eslint-plugin-boundaries`, after two rounds of fixing still left a real false-positive (T-025) — replaced entirely with `no-restricted-imports`, which needed its own fix once a matching surprise was found (T-037). Playwright still has no config or tests (step 6). |
| `wrangler.jsonc` | Minimal, dev/test-only (T-027), now also carrying a local-only D1 binding (T-027 addendum below). |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | Not started. |
| Core modules | `ids`, route registry (previous drafts). `core/settings`, `core/service-switches`, `core/audit` (earlier this session). **New this session's second pass, D1-backed and tested for real via the `worker` Vitest project:** `people`/`terms`/`roles`/`permission_grants`/`system_administrators` (minimal columns, D-003), the capability catalogue (`registerCapability`/`getCapabilityDefinition`/`listCapabilityDefinitions`, empty of real entries — T-039), the request-context loader (`loadRequestContext`, brief section 6.2/6.3), and `can()` (brief section 7.2) — see section 4 for exactly what this does and doesn't prove yet. |
| Frontend shell | Not started. |
| CI | Unchanged (verify job only; deploy-preview intentionally not added — reconfirmed by the owner this session, T-046). |
| Documentation | `docs/decisions.md`: D-017 to D-022 (earlier), **D-023 to D-029 (this session: O-009/O-003/O-004/O-007/O-010/O-011/O-012 all answered for real), T-038 to T-050 (this session's identity-tables/can()/scope work and three small fixes)**. This file. |
| PWA manifest route | Not built this session. Per D-025 (O-004, owner's own words): `/manifest.webmanifest` will be **public, no access class, branding only** — not a fifth `route-access.schema.ts` kind — the only route the portal will serve without a capability/signed-in-only/signed-webhook/calendar-feed-token declaration. |

**Database, earlier this session:**
- `migrations/0000_units_settings_switches_audit.sql` (Drizzle-generated from `src/db/schema/`): `units` (D-003 minimal columns), `settings`, `settings_history`, `service_switches`, `audit_log`.
- `migrations/0001_immutability_triggers.sql` (hand-written): blocks `UPDATE`/`DELETE` on `settings_history` and `audit_log` (brief section 9.1). Verified by a real test that attempts both and expects them to fail — not just that the migration applies (`tests/integrity/append-only-tables.test.ts`).
- The `worker` Vitest project now applies both migrations to an isolated D1 instance before every test file, via `readD1Migrations` (Node) feeding a test-only `TEST_MIGRATIONS` binding into `applyD1Migrations` (workerd) — Cloudflare's own documented pattern for this, fetched from their fixture examples and followed exactly, and it worked first try.

**Database, this session's second pass:**
- `migrations/0002_people_terms_roles_permission_grants.sql` (Drizzle-generated): `people`, `roles`, `terms` (all D-003 minimal columns; `terms` has no status column — D-019, currency computed on read), `permission_grants` (the permissions matrix, brief section 7.2/25 A3, empty until Phase 1), `system_administrators` (T-021's table, built now — T-038). No immutability triggers: none of these five tables are on brief section 9.1's locked list.
- Applied to the local dev D1 and confirmed clean (`npm run db:migrate:local`), which also surfaced and fixed a pre-existing, unrelated bug — see T-047.

## 2. Test and lint results

All green:

- `npm run lint` — 0 errors, 0 warnings.
- `npm run typecheck` — 0 errors.
- `npm test` — **13 test files, 63 tests, all passing** (was 8 files / 36 tests earlier this session).
- `npm run format:check` — clean.
- `npm run test:permissions` — passes (1 file, 2 tests — **still structural half only**, unchanged by this session's work. `can()`/`loadRequestContext()` are proven directly by unit tests against D1 (`tests/core/permissions/can.test.ts`, `load-request-context.test.ts`), including the cross-unit leak case, all three scopes, both currency boundaries (`end_date`, and now `start_date` — D-029), and the `allowedScopes` enforcement fix (T-048). That is not the same claim as brief section 7.4's sweep, which is *route-level*: sign in over HTTP as an officer of Branch A, attempt Branch B's records, expect 403/404. That still needs the Clerk middleware (not built) to call `loadRequestContext()` and routes that call `can()` (none exist yet). Do not read this session's work as having closed the sweep's behavioural half — it has built and proven the two pieces that half depends on).
- `npm run db:migrate:local` — all three migrations (0000–0002) applied cleanly to the local dev D1, after fixing T-047.

## 3. Owner answers received and recorded

New this session: **D-023** (O-009: `.dev.vars`/`.env.local` confirmed present), **D-024** (O-003: privacy notice gate before any notice exists), **D-025** (O-004: PWA manifest is public with no access class — not a fifth route-class kind), **D-026** (O-007 (a)/(b): officer language fallback, digits part (c) still open as O-007 remainder), **D-027** (O-010: system administrators are not exempt from the notice gate or the current-term requirement — they get a term from the seed), **D-028** (O-011: scope semantics confirmed exactly as T-041/T-050 implemented them), **D-029** (O-012: a term grants no powers before its start date — fails closed; corrected T-040's earlier guess the other way). Also reconfirmed, no change: git identity, and the CI deploy-job timing (T-046); and the core-to-core import gap accepted as a known limitation with a Phase 12 pointer added (T-045).

## 4. Anything uncertain or not finished

- **A known automated-enforcement gap (T-037), owner confirmed 2026-09-22: accept it, and cover it explicitly in the Phase 12 security review** (T-045) — "a core module may import another core module only through its `index.ts`" has no automated check in the one direction (core-to-core) that `eslint-plugin-boundaries`'s removal (T-025) left uncovered. Checked by hand this session: `core/permissions` does not import from any other core module at all (confirmed with `grep`), so nothing here exercises the gap either way; it remains a real gap for the next core module that does.
- **P5** (a person can hold several current terms at once, in different units or roles) is still unconfirmed, but this session's schema doesn't forbid it — `terms.person_id` isn't unique — and the cross-unit-leak test (`can.test.ts`) exercises exactly that shape as a safety property that has to hold regardless of whether P5 is confirmed. This is not building P5; if the owner declines it, Phase 1 would add a constraint limiting a person to one current term.
- **D-027 is a Phase 1 seed-data requirement, not yet actionable:** the seed file(s) that create the first system administrators must also give each one a `terms` row (role, unit, start date), not just a `system_administrators` row — otherwise `loadRequestContext()` correctly, but unhelpfully, locks them out. Nothing to build yet; flagging so Phase 1's seed-loading step doesn't miss it.
- **`npm audit`** still reports the same advisories (T-030); unchanged, not revisited this session.

## 5. Questions for the owner

Batched, per the owner's standing instruction not to ask one by one. None of these block Phase 0's remaining work (section "Resume notes" below); all should be confirmed before the phase or feature named in "Blocks" is built. Full text and reasoning for each is in `docs/decisions.md`'s "Open" table. O-010, O-011 and O-012 (raised in the previous draft of this report) were all answered this session — see D-027 to D-029 — and are no longer open.

| # | Question | Blocks |
|---|---|---|
| O-007 (remainder) | Arabic-digits setting unset → what an officer with no digits preference sees | Frontend shell |
| O-005 (remainder) | The full cross-service service-switch dependency list (brief section 8.4 states only one: Event organiser needs Treasury) | Phase 2 switch screen |

## 6. Secrets for GitHub Actions

Unchanged from the previous draft — see that section; nothing needed today, the list for when the deploy job is added is already recorded there and in `docs/decisions.md`.

**P-items needed for Phase 1** (unchanged): P1, P3, P4, P5, P21, P22.

**Owner inputs needed for Phase 1** (unchanged): General Council name and code; first system administrators and the national register officer (names and emails); standard roles list and which roles are the register officer roles; branches (name, code, area) — as files in `seed/`.

## Resume notes

### Order of work — where this session stopped

Steps 1–2 done (earlier drafts). Step 1's list item done this session's second pass: `people`/`terms`/`roles`/`permission_grants`/`system_administrators`, the capability catalogue, the request-context loader, and `can()` — all D1-backed, tested, green. Next, in order:

1. ~~`people`/`terms`/`roles`/`permission_grants`, the request-context loader, and `can()`~~ — done this session. **Not done: the Clerk middleware that calls `loadRequestContext()` on every request** — that's step 3 below, and it's what the permission sweep's route-level behavioural half (T-031) still actually needs before it can be written.
2. Remaining core modules not yet touched: `errors`, `dates`, `money` (`src/shared/core/`, T-017), `files` (object-key builder), `events-bus`, `pdf`, `push`, `notifications`, maintenance mode, security headers.
3. Clerk middleware, webhook, `/api/me`. The middleware also applies D-024's privacy-notice gate to everyone, including administrators (D-027 — no exemption). Then write the sweep's behavioural half for real (fixture routes that call `can()`, signed in as officers of two different branches, over HTTP).
4. Frontend shell, `vite.config.ts`, then the rest of `wrangler.jsonc` (D1/R2/Queues/assets/`env.preview`/`env.production` with real resources), preview resources, and the deploy-preview CI job.

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read or write `.dev.vars`/`.env*` (the harness itself blocks this). Never force push.
- Commit after every piece of finished work that passes lint, typecheck and tests (D-018).
- Use the scratchpad directory for temporary files.
