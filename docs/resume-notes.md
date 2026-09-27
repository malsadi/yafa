# Resume notes

Written 2026-09-27, 00:30 BST, before the owner restarted their laptop. (The earlier notes, from Phase 1, are in git history.)

## Where things stand

- **Current phase:** Phase 8, Event organiser (CLAUDE.md). Phases 0 to 7 are approved (D-170 for Phase 7). P15 and P16 are confirmed (D-171).
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

## Next, in this order

1. **Phase 7 is approved** (D-170). Choices 23 to 31 are confirmed, with 28 changed and built (D-169). P15 and P16 are confirmed (D-171).
2. **Phase 8, Event organiser** (brief 21, with 10.1): read the brief, list the owner inputs and choices, and ask the owner in one batch before building.
3. **Check the preview:** confirm that `d1_migrations` on `yafa-portal-preview-db` lists `0046_alerts.sql`.

## Still open from earlier phases

- The end-to-end journeys need local people and terms for the four test officers (see `phase-05.md`).
- The Calendar should link meetings and events to their own services (10.3), once Phases 8 and 9 build them.
- Choices awaiting the owner's confirmation: only the Stage C ones above. All earlier ones are confirmed (D-166 to D-168).
