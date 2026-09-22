# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress, resumed 2026-09-22. Tooling scaffold, `ids`, the route registry + permission sweep (structural half), CI, and a real D1-backed slice (`units`, `settings`, `service-switches`, `audit`, with migrations and immutability triggers) are built and green. Not yet built: Clerk middleware, `people`/`terms`/`roles`/`permission_grants` and `can()` (the sweep's behavioural half), the remaining core modules, the frontend shell, preview resources and deploy.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 0. Read this first: `.dev.vars`/`.env.local` are not where the owner said

Said to be in place twice now (2026-09-20 originally, 2026-09-22 again); checked by name only both times (`ls -la` on the project root; contents never read, never will be): **neither file is present in `/home/albions/Yafa`.** Blocks running the app locally against Clerk and the eventual preview deploy — nothing else. Needs the owner to check where they were actually created.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | Committed and pushed to `git@github.com:malsadi/yafa.git` (D-017), three commits on `main`. |
| TypeScript, ESLint, Prettier, Vitest, Playwright | Built and green. One dependency removed this session: `eslint-plugin-boundaries`, after two rounds of fixing still left a real false-positive (T-025) — replaced entirely with `no-restricted-imports`, which needed its own fix once a matching surprise was found (T-037). Playwright still has no config or tests (step 6). |
| `wrangler.jsonc` | Minimal, dev/test-only (T-027), now also carrying a local-only D1 binding (T-027 addendum below). |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | Not started. |
| Core modules | `ids` (previous draft). Route registry / permission sweep structural half (previous draft). **New this session, all D1-backed and tested for real (not mocked) via the `worker` Vitest project:** `core/settings` (registry, `getSetting`, `setSetting` with history + audit in one batch, unit-override resolution), `core/service-switches` (the twelve stage-one services, the three that can't be switched off, the one stated dependency, required-settings and unit-override checks), `core/audit` (append-only statement builder, no consumers besides settings/switches yet). `people`/`terms`/`roles`/`permission_grants` and `can()`: not started — see section 4. |
| Frontend shell | Not started. |
| CI | Unchanged from the previous draft (verify job only; deploy-preview intentionally not added). |
| Documentation | `docs/decisions.md`: D-017 to D-022 (previous draft), T-031 to T-037 (this session's route registry/CI/D1 work). This file. |

**Database, new this session:**
- `migrations/0000_units_settings_switches_audit.sql` (Drizzle-generated from `src/db/schema/`): `units` (D-003 minimal columns), `settings`, `settings_history`, `service_switches`, `audit_log`.
- `migrations/0001_immutability_triggers.sql` (hand-written): blocks `UPDATE`/`DELETE` on `settings_history` and `audit_log` (brief section 9.1). Verified by a real test that attempts both and expects them to fail — not just that the migration applies (`tests/integrity/append-only-tables.test.ts`).
- The `worker` Vitest project now applies both migrations to an isolated D1 instance before every test file, via `readD1Migrations` (Node) feeding a test-only `TEST_MIGRATIONS` binding into `applyD1Migrations` (workerd) — Cloudflare's own documented pattern for this, fetched from their fixture examples and followed exactly, and it worked first try.

## 2. Test and lint results

All green:

- `npm run lint` — 0 errors, 0 warnings (the `eslint-plugin-boundaries` deprecation warnings are gone along with the package).
- `npm run typecheck` — 0 errors.
- `npm test` — **8 test files, 36 tests, all passing** (was 5 files / 16 tests in the previous draft).
- `npm run format:check` — clean.
- `npm run test:permissions` — passes (1 file, 2 tests, structural half only — see section 4).

## 3. Owner answers received and recorded

Unchanged from the previous draft (D-017 to D-022, all from 2026-09-22). Nothing new was asked this session; this session's work was building against those answers plus finishing what was already asked for.

## 4. Anything uncertain or not finished

- **A known automated-enforcement gap, found and then deliberately left open rather than risk a silent false-positive or false-negative (T-037):** "a core module may import another core module only through its `index.ts`" is enforced by `no-restricted-imports` for services importing core (`**/core/*/*`), but *not* for one core module importing a sibling core module directly (e.g. `core/settings` reaching into `core/audit`'s internals) — every glob shape tried for that specific direction either matched too little or (via a `no-restricted-imports` matching quirk described in T-037) matched unrelated, legitimate imports too. All of this session's own core-to-core imports go through the sibling's `index.ts` correctly, checked by hand; there is no automated check for the next one written.
- **`eslint-plugin-boundaries` was tried in real depth and removed** (T-025) — worth reading before reaching for it again, or for a different boundaries-style plugin, in a later phase.
- Everything from the previous draft's "still open" list is unchanged: O-009 (see section 0), O-003 (privacy notice before any notice exists), O-004 (manifest route class), O-007 (officer language fallback), and O-005's remainder (full service dependency list, non-blocking).
- **`npm audit`** still reports the same advisories as the previous draft (T-030); unchanged, not revisited this session.

## 5. Secrets for GitHub Actions

Unchanged from the previous draft — see that section; nothing needed today, the list for when the deploy job is added is already recorded there and in `docs/decisions.md`.

**P-items needed for Phase 1** (unchanged): P1, P3, P4, P5, P21, P22.

**Owner inputs needed for Phase 1** (unchanged): General Council name and code; first system administrators and the national register officer (names and emails); standard roles list and which roles are the register officer roles; branches (name, code, area) — as files in `seed/`.

## Resume notes

### Order of work — where this session stopped

Steps 1–2 done (previous draft). This session did the structural half of "route registry + sweep" and CI (previous draft), then a real D1-backed vertical slice: `units`, `core/settings`, `core/service-switches`, `core/audit`, migrations, and the immutability triggers. Next, in order:

1. **`people`/`terms`/`roles`/`permission_grants`** (D-003 minimal columns, using the D-019 term-currency rule — no stored status column, current-vs-past computed from `end_date` on read), the request-context loader, and `can()`. This is what the permission sweep's *behavioural* half (T-031) has been waiting on.
2. Remaining core modules not yet touched: `errors`, `dates`, `money` (`src/shared/core/`, T-017), `files` (object-key builder), `events-bus`, `pdf`, `push`, `notifications`, maintenance mode, security headers.
3. Clerk middleware, webhook, `/api/me`.
4. Frontend shell, `vite.config.ts`, then the rest of `wrangler.jsonc` (D1/R2/Queues/assets/`env.preview`/`env.production` with real resources), preview resources, and the deploy-preview CI job.

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read or write `.dev.vars`/`.env*` (the harness itself blocks this). Never force push.
- Commit after every piece of finished work that passes lint, typecheck and tests (D-018).
- Use the scratchpad directory for temporary files.
