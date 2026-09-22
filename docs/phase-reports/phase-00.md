# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress, resumed 2026-09-22. Tooling scaffold, the `ids` core module, the route registry + permission sweep (structural half), and CI are built and green. Most of Phase 0 (Clerk middleware, `people`/`terms`/`roles`/`permission_grants` and `can()`, `settings`/`service-switches`/`audit`/other core modules, the frontend shell, preview resources and deploy) is not yet built.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 0. Read this first: `.dev.vars`/`.env.local` are not where the owner said

The owner said (2026-09-22) that `.dev.vars` and `.env.local` are in place. Checked by name only (`ls -la` on the project root; contents never read, never will be): **neither file is present in `/home/albions/Yafa`.** This is the same finding as the original O-009. It blocks running the app locally against Clerk and the eventual preview deploy — nothing else. Possibly created in a different directory, or the create command didn't target this one. Needs the owner to check.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | Committed and pushed to `git@github.com:malsadi/yafa.git` (D-017). Two commits on `main` so far. Local git identity was set repo-scoped (`user.name "malsadi"`, inferred from the GitHub username — correct it if wrong; `user.email` set to the owner's own address for commit attribution). |
| TypeScript, ESLint, Prettier, Vitest, Playwright | Built and green (see previous draft for detail). One correctness fix this session: `eslint-plugin-boundaries`'s `entry-point` rule was silently not enforcing anything (verified by testing a deliberate violation, not just checking for config errors) — root-caused to a missing import-resolver extension config and a legacy selector shape; both fixed, then the violation was confirmed to actually fail lint before reverting the test fixture (T-025). Playwright still has no config or tests (step 6). |
| `wrangler.jsonc` | Unchanged from the previous draft: minimal, dev/test-only (T-027). |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | Not started. |
| Core modules | `ids` (previous draft). **New this session:** `src/worker/core/permissions/` — the route registry and the four D-004 access classes as a Zod schema, proven against fixture routes in `tests/permissions/route-sweep.test.ts` (T-031). This is the *structural* half of the permission sweep (every route declares one of the four fixed classes; a capability name is well-formed). The *behavioural* half (cross-branch/national/admin-content attempts failing 403/404) needs `people`/`terms`/`roles`/`permission_grants` and `can()` — not built this session; it's the next core-module slice. `settings`, `service-switches`, `audit`, and the rest: not started. |
| Frontend shell | Not started. |
| CI | **Built.** `.github/workflows/ci.yml` runs install, `wrangler types`, typecheck, lint, format check, tests, and the permission sweep on every push — fully self-contained, no secrets needed. The deploy-preview job is deliberately not added: it needs `vite.config.ts`, a full `wrangler.jsonc` (`env.preview`, D1, R2, Queues, assets) and the created preview resources, none of which exist yet (T-032). See "Secrets" below for what to have ready once it is added. |
| Documentation | `docs/decisions.md`: D-017 to D-022 (owner answers received this session), T-031, T-032 (route registry/sweep, CI). This file. |

## 2. Test and lint results

All green:

- `npm run lint` — 0 errors (the 2 non-fatal `eslint-plugin-boundaries` deprecation warnings remain; tracked, not a failure).
- `npm run typecheck` — 0 errors.
- `npm test` — **5 test files, 16 tests, all passing** (was 3 files / 7 tests in the previous draft).
- `npm run format:check` — clean.
- `npm run test:permissions` — **now genuinely passes** (1 file, 2 tests) — was "no test files found, exit 1" in the previous draft.

## 3. Owner answers received and recorded

Everything through 2026-09-20 is unchanged (D-001 to D-016). This session (2026-09-22), recorded in `docs/decisions.md`:

- **D-017** GitHub repository confirmed and pushed to.
- **D-018** Commit cadence: after every piece of finished work that passes lint/typecheck/tests, short plain messages.
- **D-019** What counts as a "current" term: no end date → current until ended; a past end date → Past from that date, calculated on read, never stored. Corrects the draft schema's earlier "status column" sketch.
- **D-020** Service switches: build the `core/service-switches` module in Phase 0 now; admin screens are Phase 2.
- **D-021** Admin area and its navigation: visible only to holders of ≥1 administration capability; each screen checks its own capability separately.
- **D-022** A missing Arabic value in a database-stored bilingual admin text (privacy notice, help text, branding) falls back to English and is recorded as missing — separate from, and not a relaxation of, the static `src/web/text/{en,ar}` parity test, which still fails the build on a missing key.

## 4. Anything uncertain or not finished — restated once, as asked, not re-raised item by item

Per the owner's instruction: each remaining open item in one line, with why it's critical, and no repeats of anything already in `docs/decisions.md`.

- **O-009 (reopened).** The owner says the Clerk key files are in place; they are not found in the project root. Critical because it blocks local Clerk testing and the eventual preview deploy, and because "in place" vs "not found" is a factual disagreement worth resolving rather than assuming either way.
- **O-003 (narrowed).** What the portal shows before *any* privacy notice has ever been entered (not after one exists and changes — D-005/D-016 already cover that). Critical because it's a "what the portal does before it's configured" question (brief rule 5), and guessing wrong could either lock out the very administrator who needs to enter the notice, or show real officers content that was never approved.
- **O-004.** Whether a fifth, unauthenticated "public" route class is added for the PWA manifest (D-004's three existing classes — signed webhook, signed-in only, calendar feed token — don't fit it: the browser fetches the manifest without an Authorization header). Critical because it's "who can see what" — an unauthenticated route is a permissions decision, not a technical one Claude Code can just decide.
- **O-007 (narrowed).** What an officer's screen language is before they've chosen one and the "new officer language" setting is unset (browser language vs. a fixed default). Critical because it affects what content every new officer sees on their very first screen, in which language.
- **O-005 (remainder, non-blocking).** The full cross-service dependency list for service switches (brief section 8.4 states only one: Event organiser needs Treasury). Not critical to Phase 0 (the module is built with just that one dependency, per D-020) — needed before Phase 2 builds the switch-editing screen.

**Corrections to prior assumptions, now verified rather than guessed** (T-022, T-023, T-025 in `docs/decisions.md`): the compatibility date, the real `@cloudflare/vitest-plugin` config API, and — found only by deliberately testing a violation — that `eslint-plugin-boundaries`'s `entry-point` rule needed two config fixes before it actually enforced anything.

## 5. Secrets for GitHub Actions — for when the deploy job is added (step 7–8), not needed today

The current CI workflow needs none. Once the deploy-preview job is added:

- **Repository secrets:** `CLOUDFLARE_API_TOKEN` (scope it to the preview D1/R2/Queues/Worker only, never account-wide or production), `CLOUDFLARE_ACCOUNT_ID`.
- **Repository variable (not a secret — publishable keys are meant to be public):** the Clerk publishable key, e.g. `CLERK_PUBLISHABLE_KEY`.
- **Not in GitHub at all:** `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SIGNING_SECRET` go on the Worker itself via `wrangler secret`, set from a machine that has them, not from CI. The webhook secret doesn't exist yet — it's only issued once a webhook endpoint is added in the Clerk dashboard pointing at a deployed preview URL, so it comes after the first preview deploy, not before.

**P-items needed for Phase 1** (unchanged): P1, P3, P4, P5, P21, P22.

**Owner inputs needed for Phase 1** (unchanged): General Council name and code; first system administrators and the national register officer (names and emails); standard roles list and which roles are the register officer roles; branches (name, code, area) — as files in `seed/`.

## Resume notes

### Order of work — where this session stopped

Steps 1–2 (tooling, `ids`) done. This session added the structural half of step "route registry + sweep" and CI ahead of the original order, since they were unblocked by D-019/D-021 and directly asked for. Next, in order:

1. **`core/settings` + `core/service-switches`**, explicitly asked for this session (D-020) — needs a real D1-backed slice: `units` (minimal, D-003), `settings`, `settings_history`, `service_switches` tables, migrations, and the `worker` Vitest project's D1 test setup (`readD1Migrations`/`applyD1Migrations`, T-023). Not built yet as of this report — the next piece of work.
2. `people`/`terms`/`roles`/`permission_grants` (using the D-019 term-currency rule), the request-context loader, and `can()` — needed to build the *behavioural* half of the permission sweep (T-031).
3. Remaining core modules: `errors`, `dates`, `money`, `audit`, `files` (object-key builder), `events-bus`.
4. Clerk middleware, webhook, `/api/me`.
5. Frontend shell, `vite.config.ts`, then the rest of `wrangler.jsonc` (D1/R2/Queues/assets/`env.preview`/`env.production`), then preview resources and the deploy-preview CI job.

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read or write `.dev.vars`/`.env*` (the harness itself blocks this). Never force push.
- Commit after every piece of finished work that passes lint, typecheck and tests (D-018).
- Use the scratchpad directory for temporary files.
