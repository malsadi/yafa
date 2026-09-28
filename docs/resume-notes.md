# Resume notes

Written 2026-09-27, 00:30 BST, before the owner restarted their laptop. (The earlier notes, from Phase 1, are in git history.)

## Where things stand

- **Current phase:** Phase 8, Event organiser (CLAUDE.md), built and awaiting approval. Phases 0 to 7 are approved (D-170). P15 and P16 are confirmed (D-171).
- **Last commit:** `6567f2c`, "Phase 7 Stage C: notifications and phone push (work in progress)", pushed. The records (T-145 and these notes) come in the next commit.
- **Gate at the last commit:** type check, lint, formatting, 719 tests (none skipped), the permission sweep and the build all pass.
- **Preview database:** migrations up to 0045 are applied. 0046 (alerts) was still waiting for CI when this was written. The first thing to do is check that it arrived; see "Next" step 1.
- **Preview secrets:** the three push keys are set (D-165). Production has none (Phase 12).

## Phase 7: built

Everything in brief 20 is built, with Worker routes, sweep entries, screens, texts in English and Arabic, and tests:

| Stage | Built | Records |
|---|---|---|
| A1 Noticeboard, A2 voting | Notices, automatic posts (`postAutomatic`), votes with voters chosen at creation, one vote each, results once closed; a closing date can be moved later after voting starts | T-142, D-154 to D-156, D-166 |
| A3 circulars, A4 read confirmation | Sent by the General Council; read by every officer of the receiving branches; a branch's first opening recorded | T-143, D-157, D-167 |
| B1 to B3 conversations | Role networks, topic discussions (remove and leave), requests between any units | T-144, D-158 to D-161, D-168 |
| C1, C2 notifications | Alert choices, the notifications Queue, phone push, Close votes and Push pruning jobs, the Notification settings screen | T-145, D-162 to D-165 |

Migrations 0040 to 0046 belong to Phase 7.

## Working without the owner, 06:56 to 08:20, 2026-09-27 (D-195)

**What I did:**
- **Pushed** Phase 8 as far as `2e44e0a`, as asked earlier (D-194). Then committed the closing transfer's description (`0064412`, D-193), which is local, like everything after it.
- **Built the browser test setup** (T-149):
  - the tests' own local database and seed, in a new `e2e` Wrangler environment with local Browser Rendering;
  - the sign-in step for the four test officers;
  - five journeys, each in English and Arabic.
- **Fixed a dev-server fault** (T-150): Vite could run the Worker's entry file twice, and the second run threw "Cron job already registered". Start-up registration now runs once. This has a unit test.

**Browser test results** (last full run):
- 12 of 14 pass: sign-in, the notice and vote with a closed vote's results, the debit approved by a second officer, and the setting change, in both languages.
- The event journey passes every step up to "Close" in both languages, then fails. Closing makes the report PDF on a local Chrome, which Wrangler installs the first time. Wrangler found its cached Chrome damaged and reinstalls it on each run, and the install didn't finish in five minutes. The download is in `~/.cache/.wrangler/chrome/`; the unpacked copy is incomplete.

**Decisions I took for you:** none of substance. Everything I decided was technical and is recorded as T-149 and T-150.

**Not done:**
- Committed locally, not pushed. The full gate passed at 08:32 (770 tests, sweep, lint, types, format, build), after the window closed, so pushing waits for the owner.
- The event journey's close step (above).

## Next, in this order

1. **Phase 9 is approved** (2026-09-27, D-211), with the owner's two changes built (T-152): meetings' Arabic titles, and "Recorded for {officer} by {recorder}" under comments. All commits pushed.
2. **Preview:** the owner is signed in (the smallest seed, D-212, loaded by the owner). File settings and service switches are still to be set on the set-up checklist. Clerk telemetry is off (T-153).
3. **Phases 10 and 11 are built** (D-213, D-214, D-215): reports in `docs/phase-reports/phase-10.md` and `phase-11.md`, each with a section 4 of choices made for the owner. Waiting on the owner: those choices, and approval of both phases. CLAUDE.md shows Phase 11 current; once approved, set Phase 12 current and add Phases 10 and 11 to the approved list. Next decision number is D-216; next technical T-157.

## Still open from earlier phases

- **Phase 12 security review:** check that no Chrome runs without its sandbox outside the browser tests' dev server (D-197, T-149).

- The end-to-end journeys need local people and terms for the four test officers (see `phase-05.md`).
- Choices awaiting the owner's confirmation: only the Stage C ones above. All earlier ones are confirmed (D-166 to D-168).
