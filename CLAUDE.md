# CLAUDE.md — Yafa General Council UK Committee Portal

Read this file at the start of every session. The complete brief is `system build prompt.md` in the repository root.

## The owner's critical rules

These override everything. Breaking any of them means the work is not done.

1. **Never make assumptions.** If something is not stated in `system build prompt.md`, stop and ask the owner. Never guess, never fill a gap with a "sensible default", never choose on the owner's behalf. Record every answer in `docs/decisions.md`.
2. **Never hard-code values.** Roles, role names, unit codes, amounts, thresholds, dates, time windows, lists, categories, formats, limits and texts all come from data. The code contains logic and rules, never configuration.
3. **Never work outside the scope.** Build only what the brief describes. No extra features, no "nice to haves", no placeholders for future services.
4. **Pay attention to every detail.** Names, statuses, sub-points, rules and links must match the brief exactly. Before finishing any work, check it line by line against the relevant section.
5. **Everything configurable is controlled by the data administrator.** Configurable values are managed in the Administration panel and read from the database. If a value is not set, the portal says so and the action waits. Settings have no default values in code.
6. **Proper file naming and a modular structure.** Follow the naming rules and size limits below. Small, single-purpose files organised by service and feature. No long files that mix several jobs.

## File naming and structure (summary of brief section 5)

- Folders and files: kebab-case, using the exact service and feature names from the brief.
- Worker feature files: `<feature>.routes.ts`, `<feature>.service.ts`, `<feature>.repo.ts`, `<feature>.schema.ts`.
- Each service has one `index.ts`. Other services import only from it.
- React: one component per file, kebab-case file name, PascalCase component. Hooks are `use-<name>.ts`.
- Tests mirror the source path and end in `.test.ts`.
- Never use vague names: no `utils.ts`, `helpers.ts`, `misc.ts`, `common.ts`. Name files by their job.
- Files under 250 lines (lint fails at 300). Functions under 50 lines. Components under 150 lines.
- When a file grows, split it by responsibility. Never raise a limit or disable a lint rule.
- User-facing text lives in `src/web/text/` or the database, never inline.

## Source of truth

- `system build prompt.md` is the complete and only specification. If it is not there, it does not exist.
- Never edit `system build prompt.md`. If you think it is wrong, unclear or contradicts itself, stop and ask.
- Items marked **P1, P2 …** are proposals. Never build one until the owner has confirmed it and it is recorded in `docs/decisions.md`.
- Seed data comes only from files the owner puts in `seed/`. Never invent seed values.

## Current phase

<!-- The owner updates these lines when a phase is approved. -->
**Current phase:** Phase 6 — Calendar (5)
**Approved phases:** Phase 0 (2026-09-24, D-041), Phase 1 (2026-09-25, D-078), Phase 2 (2026-09-26, D-094), Phase 3 (2026-09-26, D-115), Phase 4 (2026-09-26, D-136), Phase 5 (2026-09-26, D-144)
**Confirmed proposals:** P1, P3, P4, P5, P21, P22 (2026-09-24, D-042); P23 (2026-09-25, D-079); P2, P19, P20 (2026-09-26, D-095); P6, P7, P8, P9, P10 (2026-09-26, D-116)

Work only on the current phase. Do not start the next phase until the owner approves it here.

## How every session works

1. Read this file, then the relevant sections of `system build prompt.md`.
2. Read `docs/decisions.md` and the latest report in `docs/phase-reports/`.
3. Before starting a phase, list the owner inputs and P-items it needs. If any are missing, stop and ask.
4. Say briefly what you are about to do before doing it.
5. Work in small steps. Run lint and tests after each meaningful change.
6. Before finishing, check your work against the brief line by line.
7. End with a short summary: what changed, test results, anything uncertain.

## Build rules

1. Every route declares a capability. Every query on unit data filters by the unit scope from the request context.
2. Never check role names in code. Check capabilities with `can()`. Never assign capabilities to roles; that is the data administrator's job.
3. Money is integer pence, GBP only. Never floats.
4. Treasury entries are never updated or deleted. Corrections are reversing entries.
5. Locked means locked: check in the service and block with a database trigger.
6. Cross-service writes that must be consistent go in one D1 batch, with any logic that depends on current data written in SQL.
7. Files are written to R2 first, then the D1 batch records them.
8. Notifications go through the Queue. Task reminders are in-portal only.
9. Every new dependency must run on Cloudflare Workers. Check first and list it in the phase report.
10. Never weaken, skip or delete a test, and never disable a lint rule, to make something pass.
11. Never put secrets in the repository. Use `wrangler secret` and `.dev.vars`.
12. No personal data in logs.

## What to ask the owner, and what to decide yourself

The owner wants to be asked only about critical things. Batch questions: raise them once, at the start or end of a phase, never one by one.

**Stop and ask (critical):**
- What the portal does: any behaviour, rule or feature not stated in the brief.
- Who can see or do what: permissions and visibility.
- Money, and anything that changes, locks or deletes records.
- Anything irreversible: a database change that cannot be undone, EU jurisdiction choices, production.
- Anything that costs money or needs an account.
- A configuration value that belongs to the data administrator.

**Decide yourself, record it in `docs/decisions.md`, and list it in the phase report (not critical):**
- Technical implementation choices within the fixed stack: package versions, config files, internal module design, test setup, build tooling.
- Resource names that follow an agreed pattern.
- Small UI interaction details that do not change what the portal does.

If unsure which group something belongs to, treat it as critical.

## Definition of done

- Type check passes.
- Lint passes, including file size and import boundary rules.
- All tests pass, none skipped.
- The permission sweep passes; new routes have sweep entries.
- Locked or never-deleted things have immutability tests.
- No hard-coded configuration values.
- Every owner answer is recorded in `docs/decisions.md`.

## Commands

<!-- Claude Code: fill these in during Phase 0 and keep them accurate. -->
- Install: `npm install`
- Dev server: `npm run dev`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- All tests: `npm test`
- Permission sweep: `npm run test:permissions`
- End-to-end tests: `npm run test:e2e`
- PDF check through Browser Rendering (paid, opt-in, never in CI): `npm run test:pdf-remote`
- Regenerate `docs/permissions.md` from the capability catalogue: `npm run permissions-doc`
- Regenerate `docs/arabic-texts-review.md` from the text files: `npm run arabic-texts-review`
- New migration: `npm run db:generate`
- Apply migrations locally: `npm run db:migrate:local`
- Apply migrations to preview: `npm run db:migrate:preview` (CI does this on every push to `main`)
- Deploy preview: `npm run deploy:preview` (ask first; CI deploys on every push to `main`)

## Never

- Deploy to production or run anything against the production database.
- Edit a migration that has already been applied. Add a new one.
- Store roles or unit membership in Clerk.
- Create delete endpoints for Treasury entries, archive items, past officers, or anything locked.
- Write a default value for a setting in code.

## Phase report format

Save as `docs/phase-reports/phase-NN.md`:

1. What was built, by sub-point.
2. Test and lint results, including the permission sweep.
3. Owner answers received and recorded.
4. Anything uncertain or not finished.
5. Questions for the owner, and P-items needed for the next phase.
