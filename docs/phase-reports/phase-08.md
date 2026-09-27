# Phase 8 report: Event organiser

**Status:** built, awaiting your review. Section 4 lists what isn't finished, and my choices for you to confirm.

- **Started:** 2026-09-27, when Phase 7 was approved (D-170).
- **Scope** (brief section 26, Phase 8): "Wires Treasury, Task tracker, Calendar, Noticeboard and Archive. Full lifecycle end-to-end test." Service 1, brief 21, with 10.1 (four rows), 9.3 (files), 9.4 (the post-event report PDF) and 27 (testing).

**Before starting:**
- **P-items:** P10 (D-116), P15 and P16 (D-171), all confirmed.
- **Owner inputs:** none in brief 30 beyond the data administrator's own: the event types list (15 B3) and the two settings.
- **Questions:** O-102 to O-116 before building (D-172 to D-186), and O-117 to O-121 found while building (D-187 to D-191). All as recommended except:
  - O-105: the creator can't approve their own event (D-175);
  - O-111: a Cancelled status, with a reason, closed normally but recorded and reported as cancelled (D-181);
  - O-116: the Event organiser depends on the Treasury and Task tracker only; the Calendar and Noticeboard are publishing targets (D-186), each published to once, and later if it was off (D-182);
  - O-120: a cancelled event leaves the Calendar and gets a new automatic "cancelled" post (D-190). This adds a fourth automatic post beyond 10.1 and 20 A1, by your decision.
- Your template choice is confirmed: retired and brought back, never deleted (D-192).

## 1. What was built, by sub-point

Every sub-point has its Worker routes, permission sweep entries, screens in English and Arabic, and tests. Migrations 0047 to 0049 belong to Phase 8 (T-146).

**Stage A: Create and approve**
- **A1 Create event:** name, type (from the event types list), lead officer (a current officer of the unit), first day with an optional time, and an optional last day (D-172). Creating an event also creates its Treasury account and its task list, in one batch (10.1). The form shows date clashes as a notice, never a block (19 B4).
- **A2 Event account:** the event screen shows the budget lines, income, spending, balance and receipts, worked out by the Treasury, with a link to the account there (D-177). Money is recorded through the Treasury under its own rules. Budget lines are added, changed and removed only in Draft, and a line with money tagged to it is never removed (D-176, D-187). The account's name follows the event's (D-188).
- **A3 Event templates:** national (the General Council's) or branch, with default tasks (due a set number of days before the first day, owned by the lead officer) and default budget lines (P15, D-178). A template is retired and brought back, never deleted (D-192).
- **A4 Committee approval:** an officer with "Approve events", never the event's creator, approves the event and its budget together (D-175). Both the service and the database refuse a self-approval.

**Stage B: Prepare and track**
- **B1 Event tasks:** added, edited, reassigned, rescheduled or removed (set to Cancelled) until the event is closed (D-179). They are the same records the Task tracker shows, which now names each task's event and links to it, and filters by event (18 A1, B2).
- **B2 Progress tracker:** done against total, worked out on every read, following the cancelled-tasks setting (D-191). Overdue tasks are highlighted; nothing is blocked.
- **B3 Task history:** each task's history of who added, changed or completed it, from the event screen too.
- **B4 Publish:** to the Calendar and the Noticeboard, once each, from Approved. The Calendar entry and the automatic post are written in one batch, and the alert goes through the Queue. A target whose service is off is skipped, the screen says so, and it can be published to later (D-182, D-186). An event over several days shows on every day in the Calendar (D-189). Details changed after publishing update the Calendar entry.
- **B5 Volunteers:** shown on the event screen as "Coming soon", disabled. Nothing is built.
- **Status:** the lead officer, or anyone with "Manage events", moves the event one step at a time. Moving back is allowed where the setting permits, never to Draft (D-180). Cancelling needs a reason, can't be undone, and removes the Calendar entry. If the event was announced on the Noticeboard, a "cancelled" post is made, or offered once the hub is back on (D-181, D-190).

**Stage C: Close and report**
- **C1 Post-event report:** shown on screen from Completed or Cancelled. It holds the tasks done against the total, each task's status, and each budget line's budget against actual income and spending, plus "Unallocated", the totals and the final balance (P10, D-183). A cancelled event's report is headed as cancelled. A Treasury correction is netted against the entry it reverses, not counted as new money.
- **C2 Close event:** only from Completed or Cancelled, by an officer with "Close events" (D-184). They choose which branch account receives the balance, and an overspend is warned of clearly on screen (P16, D-131). The report PDF is written to R2 first, in the closing officer's language. Then one batch:
  - moves the balance and closes the event account;
  - locks the report and every event file and files them to the archive's Events category;
  - closes the event, which locks it, its tasks and its files (10.1).

**Event files (F1, F2):** Documents and Media, at every stage. The lead officer and anyone with "Manage events" add files; photos are resized on the device (9.3). Files can be removed before close; after close, nothing can be removed (D-185).

## 2. Test and lint results

At the current commit, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including the file-size and import-boundary rules. No rule is disabled.
- **Formatting:** passes.
- **Tests:** 766 pass, none skipped (720 at the end of Phase 7). The run takes about 15 minutes.
- **Permission sweep:** passes, with every Event organiser route in it.
- **Build:** passes.
- **Generated documents:** `docs/permissions.md` and `docs/arabic-texts-review.md` are current.

**New checks:**
- **Immutability (database triggers, each tested):**
  - an event or a template is never deleted;
  - a closed event, its tasks and its files never change;
  - approval by the creator is refused;
  - an approval, a publication or a cancel is recorded once;
  - a cancel is never undone;
  - an event closes only from Completed or Cancelled;
  - a budget line changes only in Draft and is never removed once tagged.
- **Permissions:** each capability refuses those without it; another unit's events are not found; the lead officer moves the status and adds files with no capability.
- **Money:** the budget figures net reversals; closing leaves the event account at zero and moves the receiving branch account by exactly the balance, up or down.
- **The lifecycle** (brief 21 build note), at Worker level: from a template, approve, tasks, publish, spend, complete, report, close; then the account is at zero, the receiving account is up by the balance, the archive is filed and the event is locked.
- **Settings (27):** each setting changes behaviour, and while unset, progress and moving back refuse with the "not configured" message.
- **The Noticeboard rebuild** (T-146): checked on a database built to 0047 with a notice, a vote and a ballot, and every row, key and trigger survived.

**Tests changed, keeping their guarantees:**
- Three service-switch tests (D-186: the Task tracker now has a dependant).
- The Calendar read-model tests pass `lastDate: null` for meetings.
- The automatic post test reads `postAutomatic(...).statement`.
- **T-147:** the test app now makes its throwaway sign-in key once per test worker instead of on every request. The extra requests in Phase 8's tests had pushed other test files past the 5-second limit under load. Every token is still signed and checked for real. The Treasury test that saves 24 entries at once has its own 15-second limit.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-169 to D-171:** the Phase 7 choices, the new discussion alert, Phase 7 approved, P15 and P16 confirmed.
- **D-172 to D-186:** O-102 to O-116.
- **D-187 to D-191:** O-117 to O-121.
- **D-192:** templates are retired, never deleted.

## 4. Uncertain or not finished

**Not finished: the end-to-end journey in a browser** (brief 26: "Full lifecycle end-to-end test"; brief 27). The Playwright journeys need the setup that creates local people, terms and grants for the four test officers, which has been waiting since Phase 5. The whole lifecycle is tested at Worker level; the browser journey is not written yet.

**Not checked here:**
- The PDF itself: Browser Rendering works only on the preview (`npm run test:pdf-remote`, paid, opt-in). The tests check the report's content through a stand-in renderer.
- Migrations 0046 to 0049 on the preview database: nothing has been pushed since 0046.

**The test run is getting slow:** about 15 minutes, most of it per-file setup. The Treasury test that saves 24 entries at once took about 5.4 seconds in a full run against the default 5-second limit, so it now has its own 15-second limit (T-147), as the setup-checklist test already had. Its assertions are unchanged.

**Choices of mine, to confirm or change:**
1. Media takes photos and videos; Documents takes everything else. A flyer saved as a PDF goes under Documents.
2. The lead officer acts on their event (status, cancel, files) with no capability, as D-174 and D-185 say, but needs "See events" to open the event screen.
3. On the event screen, those who manage events change tasks. A task's owner changes its status in the Task tracker, as before (D-137).
4. The closing transfer has no description of its own; the Treasury shows it as the event account's closing transfer.
5. Each event file is filed to the archive as its own document, under its file name. It and the report are dated the event's last day (or its only day).
6. A removed file's storage object is deleted straight after its records. If that fails, the nightly orphan clean-up removes it (9.3).
7. The post-event report PDF is made during the close request, not through a Queue job (9.4 allows either; a report is short).
8. "Move back" is offered on screen, and refused with a message when the setting doesn't allow it.
9. A skipped "cancelled" post can be made until the event is closed. After that the event is locked.
10. A default task's due date can fall in the past, if the event is sooner than the template expects.

## 5. Questions for the owner, and what Phase 9 needs

**Questions:** the ten choices above, and whether to build the end-to-end setup and journeys now or as their own step.

**Phase 9 (Meeting recorder):** brief 31 lists no proposals for it. Brief 30 lists no owner inputs beyond the data administrator's (the meeting types list and settings). I will read brief 22 and ask any questions before starting.
