# Phase 0 report — DRAFT, in progress, not for approval

**Status:** In progress, resumed 2026-09-22. The tooling scaffold and the first core module are built and verified; most of Phase 0 (Clerk middleware, remaining core modules, the route registry and permission sweep, the frontend shell, CI, preview resources) is not yet built. This file will be rewritten as the final Phase 0 report when the phase is complete.

**Start here when resuming:** read `CLAUDE.md`, then `system build prompt.md`, then `docs/decisions.md`, then this file, in that order.

## 1. What was built, by sub-point

Sub-points are from brief section 26, Phase 0.

| Sub-point | State |
|---|---|
| Repository | `git init` done, branch `main`, still no commits and no remote (O-002 unanswered). Everything below is unstaged, pending the owner's answer on commit cadence. |
| TypeScript, ESLint, Prettier, Vitest, Playwright | **TypeScript, ESLint, Prettier and Vitest are built and green.** `package.json` with all scripts named in CLAUDE.md's Commands section; runtime and dev dependencies installed (exact versions in T-024). Three separate `tsconfig.*.json` files (worker, web, node — T-026), `eslint.config.js` (import boundaries, T-008 size limits, T-009 RTL-class rule), `.prettierrc.json`/`.prettierignore`, and three Vitest projects (`worker` via `@cloudflare/vitest-plugin`'s `cloudflareTest()`, `web` via jsdom, `structure` plain Node — T-007). Playwright is installed but has no config or tests yet (comes with the frontend shell, order-of-work step 6). |
| `wrangler.jsonc` | **Started, minimal, earlier than planned (T-027).** Only `name`, `compatibility_date` (`2026-09-21`, corrected — T-022) and `compatibility_flags`. No D1, R2, Queues, static assets, cron triggers, or `env.preview`/`env.production` yet; those need a real worker entry point and are still step 7. |
| Clerk: middleware, signed webhook, invite-only, access-not-active page | Not started. |
| Core modules | **`ids` built and tested (T-028).** `src/worker/core/ids/generate-id.ts` + `index.ts`, 5 tests in `tests/core/ids/generate-id.test.ts`, all passing. Permissions, settings, service switches, audit, notifications, files, PDF, push, dates, money, events bus, errors, security headers, maintenance mode: not started. |
| Frontend shell | Not started. |
| CI | Not started. |
| Documentation | `docs/decisions.md`: T-022 to T-030 added this session; O-009 updated (owner pasted the Clerk keys into chat, but Claude Code's own permission settings block it from writing `.dev.vars`/`.env.local`, so the owner needs to create them — see below); Open-items framing corrected (O-003–O-008 were actually asked this session, not just drafted). This file. |

Files that exist that Claude Code created this session, beyond the previous session's `.gitignore`/`docs/`: `package.json`, `package-lock.json`, `tsconfig.base.json`, `tsconfig.worker.json`, `tsconfig.web.json`, `tsconfig.node.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `wrangler.jsonc`, `vitest.config.ts` + 3 project configs, `src/worker/core/ids/`, `tests/core/ids/`, `tests/structure/` (3 files). `.gitignore` was corrected (a `.dev.vars.*` glob was silently also excluding the `.dev.vars.example` template it's meant to allow; fixed with a negation line, and `worker-configuration.d.ts` added).

**Clerk keys (O-009):** the owner pasted the publishable and secret key values directly into chat this session. Claude Code could not write `.dev.vars`/`.env.local`: the project's own `.claude/settings.json` denies `Read` on those paths, and the harness applies that deny to `Write`/`Edit` too, consistent with D-009 ("Claude Code never reads those files"). The owner was given the exact file contents to create by hand; not yet confirmed done. Flagged to the owner in-session that the secret key is now in this conversation's transcript.

## 2. Test and lint results

All green as of this session, run in this order:

- `npm run lint` — 0 errors. (3 non-fatal deprecation warnings from `eslint-plugin-boundaries` about its `entry-point` rule — see T-025 — do not fail the build.)
- `npm run typecheck` — 0 errors (`tsconfig.worker.json` + `tsconfig.node.json`; `tsconfig.web.json` is not yet wired in, see T-026).
- `npm test` — 3 test files, 7 tests, all passing (`worker` project: `ids`; `structure` project: file-size and file-naming checks; `web` project: no tests yet, `passWithNoTests`).
- `npm run format:check` — clean.
- `npm run test:permissions` — **currently reports "no test files found" (exit code 1).** This is expected, not hidden: no capability routes exist yet, and the route registry / permission-sweep harness with fixture routes (design plan, "Route access classes") has not been built yet. It is real remaining work for this phase, not a passing check to claim.

## 3. Owner answers received and recorded

Everything through 2026-09-20 is unchanged (D-001 to D-016; see the previous report). This session (2026-09-22):

- The owner pasted the Clerk publishable and secret keys into chat (handled per section 1 above; no owner decision recorded, since no owner judgement call was involved — it's operational, not a D-item).
- O-002, O-009, O-003 to O-008, and one workflow question (commit cadence) were batched and asked for real this session. **Not yet answered as of this report.**

## 4. Anything uncertain or not finished

- **Everything not marked done in section 1 is still to build.** In particular: Clerk integration, the remaining core modules, the route registry and permission sweep, the frontend shell, CI, and the preview Cloudflare resources.
- **O-002, O-009, and O-003 to O-008 are still open**, including the ones that gate real work: O-006 (current term) feeds the request-context loader and `can()`; O-008 feeds the admin layout; O-004 feeds the route registry; O-005 feeds `core/service-switches` and navigation; O-003 feeds the privacy-notice gate; O-007 feeds the frontend shell's language selection. None of the tooling/`ids` work in this report depended on them.
- **Corrections to the previous session's assumptions**, now verified rather than guessed (see T-022, T-023, T-025 in `docs/decisions.md`): the compatibility date, the actual `@cloudflare/vitest-plugin` config API, and that `eslint-plugin-boundaries` does work on ESLint 10 flat config.
- **`npm audit`** reports 7 advisories (3 high via `@cloudflare/puppeteer`'s local-extraction path, 4 moderate elsewhere in the dev toolchain). Not remediated this session (T-030); worth a proper pass once `core/pdf` and the rest of the dev toolchain are in place, rather than reacting file-by-file.
- **No commit has been made.** The owner was asked (this session) whether to commit at checkpoints going forward; not yet answered, so nothing is staged or committed.

## 5. Questions for the owner (asked this session, not yet answered)

Full wording and each proposed handling are in `docs/decisions.md`'s "Open" table, and were also sent directly in chat:

1. O-002 / O-009: GitHub repository path, and confirmation the Clerk key files are now created (Claude Code cannot create them itself — see section 1).
2. O-003: privacy-notice gate before any notice text exists.
3. O-004: a fifth "public" route class for the PWA manifest.
4. O-005: service-switch defaults/override, and the full cross-service dependency list (only one dependency is stated in the brief).
5. O-006: what counts as a "current" term.
6. O-007: language fallback order.
7. O-008: system administrators as a plain list, and who sees `/admin`.
8. Workflow: commit at checkpoints as the phase progresses, or hold everything uncommitted until told otherwise.

**P-items needed for Phase 1** (unchanged from the previous report): P1, P3, P4, P5, P21, P22.

**Owner inputs needed for Phase 1** (unchanged): General Council name and code; first system administrators and the national register officer (names and emails); standard roles list and which roles are the register officer roles; branches (name, code, area) — as files in `seed/`.

## Resume notes

### Order of work — where this session stopped

Resume-plan steps 1 and 2 (dependencies; tsconfigs, `ids`, Vitest projects, lint, Prettier) are done and green. Next, in order:

1. **Route registry + permission sweep machinery with fixture routes** (design plan, "Route access classes") — this needs O-004, O-006 and O-008 answered first, since the fixture routes and sweep scenarios are built around exactly those rules.
2. Remaining core modules that don't depend on any open question: `errors`, `dates`, `money` (`src/shared/core/`, per T-017), `audit`, the `settings` registry mechanism (`getSetting`/`setSetting`, no real settings yet), `files` (object-key builder only), `events-bus` (typed subscribers, no events registered).
3. Then Clerk middleware, the webhook, `/api/me`, and the rest of step 5 onward from the previous report's order of work (unchanged, see git history of this file if needed — the full original step list is preserved in version control once committed).

### Rules of the road (unchanged)

- Ask only critical things, batched. Decide technical details, record them in `docs/decisions.md`, list them in the report.
- Do not touch production. Do not read `.dev.vars`/`.env*` (this session confirmed the harness also blocks *writing* them — see section 1). Do not add a git remote until O-002 is answered. No commits without the owner's steer on cadence (asked, unanswered).
- Use the scratchpad directory for temporary files.
