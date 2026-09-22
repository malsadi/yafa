# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress, resumed twice now (2026-09-22, 2026-09-22 again same day). Tooling scaffold, `ids`, the route registry, CI, and two real D1-backed slices — `units`/`settings`/`service-switches`/`audit`, and now `people`/`terms`/`roles`/`permission_grants`/`system_administrators` with the request-context loader and `can()` — are built and green. Not yet built: Clerk middleware itself (the context loader it will call is done), the remaining core modules, the frontend shell, preview resources and deploy. The permission sweep's *route-level* behavioural half (signing in over HTTP as an officer of Branch A, etc.) still waits on that middleware — see section 4.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 0. `.dev.vars`/`.env.local` — resolved (D-023)

Reported missing twice (2026-09-20, 2026-09-22). Owner, 2026-09-22 (same day, later): confirmed fixed. Checked by name only (`ls -la` on the project root; contents never read, never will be): **both files are now present.** Nothing further blocked by this.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | Committed and pushed to `git@github.com:malsadi/yafa.git` (D-017), three commits on `main`. |
| TypeScript, ESLint, Prettier, Vitest, Playwright | Built and green. One dependency removed this session: `eslint-plugin-boundaries`, after two rounds of fixing still left a real false-positive (T-025) — replaced entirely with `no-restricted-imports`, which needed its own fix once a matching surprise was found (T-037). Playwright still has no config or tests (step 6). |
| `wrangler.jsonc` | Minimal, dev/test-only (T-027), now also carrying a local-only D1 binding (T-027 addendum below). |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | Not started. |
| Core modules | `ids`, route registry (previous drafts). `core/settings`, `core/service-switches`, `core/audit` (earlier this session). **New this session's second pass, D1-backed and tested for real via the `worker` Vitest project:** `people`/`terms`/`roles`/`permission_grants`/`system_administrators` (minimal columns, D-003), the capability catalogue (`registerCapability`/`getCapabilityDefinition`/`listCapabilityDefinitions`, empty of real entries — T-039), the request-context loader (`loadRequestContext`, brief section 6.2/6.3), and `can()` (brief section 7.2) — see section 4 for exactly what this does and doesn't prove yet. |
| Frontend shell | Not started. |
| CI | Unchanged (verify job only; deploy-preview intentionally not added — reconfirmed by the owner this session, T-046). |
| Documentation | `docs/decisions.md`: D-017 to D-022 (earlier), **D-023 to D-026 (this session: O-009/O-003/O-004/O-007 answered for real), T-038 to T-047 (this session's identity-tables/can()/scope work and two small fixes)**. This file. |

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
- `npm test` — **13 test files, 59 tests, all passing** (was 8 files / 36 tests earlier this session).
- `npm run format:check` — clean.
- `npm run test:permissions` — passes (1 file, 2 tests — **still structural half only**, unchanged by this session's work. `can()`/`loadRequestContext()` are proven directly by unit tests against D1 (`tests/core/permissions/can.test.ts`, `load-request-context.test.ts`), including the cross-unit leak case, all three scopes, and the D-019 currency boundary. That is not the same claim as brief section 7.4's sweep, which is *route-level*: sign in over HTTP as an officer of Branch A, attempt Branch B's records, expect 403/404. That still needs the Clerk middleware (not built) to call `loadRequestContext()` and routes that call `can()` (none exist yet). Do not read this session's work as having closed the sweep's behavioural half — it has built and proven the two pieces that half depends on).
- `npm run db:migrate:local` — all three migrations (0000–0002) applied cleanly to the local dev D1, after fixing T-047.

## 3. Owner answers received and recorded

New this session: **D-023** (O-009: `.dev.vars`/`.env.local` confirmed present), **D-024** (O-003: privacy notice gate before any notice exists — answered for real this time, but see the new O-010 below), **D-025** (O-004: PWA manifest is public with no access class — not a fifth route-class kind), **D-026** (O-007 (a)/(b): officer language fallback, digits part (c) still open as O-007 remainder). Also reconfirmed, no change: git identity, and the CI deploy-job timing (T-046); and the core-to-core import gap accepted as a known limitation with a Phase 12 pointer added (T-045).

## 4. Anything uncertain or not finished

- **Two new open items found while acting on this session's answers, both non-blocking — see `docs/decisions.md` "Open" for full text:**
  - **O-010**: D-024 doesn't say whether system administrators are exempt from the privacy-notice gate, and the first ones arrive via Phase 1 seed, not an in-portal invite — worth confirming before Phase 1's first-sign-in screen is built.
  - **O-011**: permission scope semantics (`all units` vs `national content`) — T-041 implements a literal, tested reading, but the brief doesn't define the comparison rules and the matrix stays empty until Phase 1, so nothing is at stake yet. Confirm before 15 A3 is filled in.
- **Two technical readings recorded, not asked about, flagged for the batch anyway (T-040):** which civil timezone "today" uses for term currency (Europe/London, not UTC), and that a future-dated `start_date` doesn't gate currency (D-019 only defines it by `end_date`). Neither can occur yet — Phase 0 seeds no terms.
- **A known automated-enforcement gap (T-037), owner confirmed 2026-09-22: accept it, and cover it explicitly in the Phase 12 security review** (T-045) — "a core module may import another core module only through its `index.ts`" has no automated check in the one direction (core-to-core) that `eslint-plugin-boundaries`'s removal (T-025) left uncovered. This session's own core-to-core imports (`core/permissions` reaching `core/settings`/`core/service-switches`? — checked: it does not; it only reaches its own files and db/schema) go through `index.ts` correctly where they cross a module boundary at all, checked by hand.
- O-007 (remainder): Arabic-digits fallback when unset — still open, narrowed (see `docs/decisions.md`).
- O-005 (remainder): full service-switch dependency list — still open, non-blocking.
- **`npm audit`** still reports the same advisories (T-030); unchanged, not revisited this session.

## 5. Secrets for GitHub Actions

Unchanged from the previous draft — see that section; nothing needed today, the list for when the deploy job is added is already recorded there and in `docs/decisions.md`.

**P-items needed for Phase 1** (unchanged): P1, P3, P4, P5, P21, P22.

**Owner inputs needed for Phase 1** (unchanged): General Council name and code; first system administrators and the national register officer (names and emails); standard roles list and which roles are the register officer roles; branches (name, code, area) — as files in `seed/`.

## Resume notes

### Order of work — where this session stopped

Steps 1–2 done (earlier drafts). Step 1's list item done this session's second pass: `people`/`terms`/`roles`/`permission_grants`/`system_administrators`, the capability catalogue, the request-context loader, and `can()` — all D1-backed, tested, green. Next, in order:

1. ~~`people`/`terms`/`roles`/`permission_grants`, the request-context loader, and `can()`~~ — done this session. **Not done: the Clerk middleware that calls `loadRequestContext()` on every request** — that's step 3 below, and it's what the permission sweep's route-level behavioural half (T-031) still actually needs before it can be written.
2. Remaining core modules not yet touched: `errors`, `dates`, `money` (`src/shared/core/`, T-017), `files` (object-key builder), `events-bus`, `pdf`, `push`, `notifications`, maintenance mode, security headers.
3. Clerk middleware, webhook, `/api/me`. Then write the sweep's behavioural half for real (fixture routes that call `can()`, signed in as officers of two different branches, over HTTP).
4. Frontend shell, `vite.config.ts`, then the rest of `wrangler.jsonc` (D1/R2/Queues/assets/`env.preview`/`env.production` with real resources), preview resources, and the deploy-preview CI job.

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read or write `.dev.vars`/`.env*` (the harness itself blocks this). Never force push.
- Commit after every piece of finished work that passes lint, typecheck and tests (D-018).
- Use the scratchpad directory for temporary files.
