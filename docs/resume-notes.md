# Resume notes

Written 2026-09-27, 00:30 BST, before the owner restarted their laptop. (The earlier notes, from Phase 1, are in git history.)

## Where things stand

- **Current phase:** Phase 7, Communication hub (CLAUDE.md). Phases 0 to 6 are approved (D-152 for Phase 6). P11 to P14 are confirmed (D-153).
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

1. **Check the preview:** confirm that `d1_migrations` on `yafa-portal-preview-db` lists `0046_alerts.sql`. This is a read-only query.
2. **Check the brief line by line** (CLAUDE.md, step 6), for sections 20, 9.5, 10.1, 10.2 and 11 against what is built.
3. **Write the Phase 7 report,** `docs/phase-reports/phase-07.md`. The draft there already has "Before starting", "Progress" and choices 1 to 24. Add:
   - sections 1 to 5 in the usual format;
   - the test count;
   - the two test changes (see T-145);
   - the dependencies (none added);
   - the new settings the data administrator must set before the hub can be switched on: "Phone alert attempts" and "Undelivered phone alerts kept (days)".
4. **The Stage C choices,** for the owner to confirm, in the report:
   - An alert choice covers both in-portal and phone alerts.
   - An officer who never chose follows the "new officers" setting, even if it changes later.
   - Adding a vote to an existing notice, or inviting someone to a discussion later, sends no alert.
   - Starting a discussion alerts its members as a "new reply".
   - Phone alerts for role networks and discussions name no unit (D-162: kind and unit only; there is no single unit).
   - A device belongs to whoever registered it last.
   - The push time-to-live is 24 hours.
5. **Ask the owner to approve Phase 7.** Phase 8 (Event organiser) comes next and needs P15 and P16, which are not yet confirmed.

## Still open from earlier phases

- The end-to-end journeys need local people and terms for the four test officers (see `phase-05.md`).
- The Calendar should link meetings and events to their own services (10.3), once Phases 8 and 9 build them.
- Choices awaiting the owner's confirmation: only the Stage C ones above. All earlier ones are confirmed (D-166 to D-168).
