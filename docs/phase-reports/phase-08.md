# Phase 8 report: Event organiser (DRAFT, in progress)

**Status:** Phase 7 approved 2026-09-27 (D-170); Phase 8 is current.

**Brief section 26, Phase 8:** "Wires Treasury, Task tracker, Calendar, Noticeboard and Archive. Full lifecycle end-to-end test." Service 1, brief 21, with 10.1 (four rows), 9.3 (files), 9.4 (post-event report PDF) and 27 (the end-to-end journey).

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** P10 (D-116), P15 and P16 (D-171), all confirmed.
- **Owner inputs:** none in brief 30 beyond the data administrator's own: the event types list (15 B3) and the two settings (whether event status may move backwards; whether cancelled tasks count in progress).
- **Already built for this phase:**
  - Treasury: `openEventAccount` and `closeEventAccount` (T-137, D-131).
  - Task tracker: the `tasks` table with `event_id` (T-138 area).
  - Calendar: the read-model writers and `checkClashes` with a last day (D-151).
  - Communication hub: `postAutomatic` and `queueHubAlert`.
  - Documents archive: `fileRecord`.
- **Questions before building:** O-102 to O-116, asked and answered 2026-09-27 (D-172 to D-186). All as recommended except three:
  - O-105: the creator can't approve their own event (D-175);
  - O-111: a Cancelled status, with a reason, closed normally but recorded and reported as cancelled (D-181);
  - O-116: the Event organiser depends on the Treasury and Task tracker only; the Calendar and Noticeboard are publishing targets, skipped when off and publishable later, once each (D-182, D-186).

## Progress

- **Done: Stage A** (migration 0047): event templates (A3), creating an event with its Treasury account and its template's tasks in one batch (A1, 10.1), approval by a second officer (A4, D-175), changing details (D-176). The Event organiser depends on the Treasury and Task tracker (D-186).
- **Done: status moves and cancelling** (D-180, D-181), **event tasks, progress and task history** (B1 to B3, D-179), and **publishing** to the Calendar and Noticeboard, once each, skipping a target that is off (B4, D-182, D-186).
- **Next:** event files (F1, F2), the post-event report (C1), closing (C2), the screens, and the end-to-end journey.

## Questions found while building (O-117 to O-121)

- **O-117 Removing a budget line in Draft.** D-176 lets budget lines be removed in Draft, but Phase 4 made Treasury budget lines never deleted (a database trigger). Recommended: a new migration lets a line be removed only while its event is in Draft and no entry is tagged to it; after approval, nothing changes.
- **O-118 The account's name.** An event can be renamed until closed (D-176), but a Treasury account's name can never change (Phase 4 trigger), so the Treasury would keep the old name. Recommended: a new migration lets an open event account's name follow its event's name, in the same batch; branch accounts stay as they are.
- **O-119 Events over several days in the Calendar.** The Calendar holds one date per meeting or event, so an event over several days (D-172) would show on its first day only. Recommended: the Calendar's entry gains an optional last day, so the event shows on every day it covers and the clash check sees every day.
- **O-120 A published event that is cancelled.** Recommended: cancelling removes its Calendar entry in the same batch; the Noticeboard's automatic post stays (automatic posts never change) and no new post is made. A cancelled event can't be published.
- **O-121 Cancelled tasks in progress.** When the setting says cancelled tasks count, recommended: they count in the total but never as done. When it says they don't, they are left out of both.

## Questions asked before building (O-102 to O-116, answered: see above)

**The event**
- **O-102 Details (A1).** The brief lists name, type, date and time, branch and lead officer. Recommended:
  - the type comes from the event types list;
  - the lead officer is one of the unit's current officers;
  - there is a first day with an optional start time, and an optional last day for an event over several days (the clash check already supports this, D-151);
  - nothing else is added (no venue or description).
- **O-103 Who sees events.** Recommended: the unit's own officers, through a "See events" capability. The General Council sees a branch's events only once they are filed in the archive (P2), as with Treasury (D-132).
- **O-104 Who does what.** Recommended capabilities, granted by the data administrator:
  - Create events;
  - Approve events (A4);
  - Manage events: details, tasks from the event screen, files, publishing;
  - Close events.
  The brief says the lead officer moves the event forward, so the lead officer does that without a capability, and so does anyone with "Manage events".
- **O-105 Committee approval (A4).** Recommended: an officer with "Approve events" records the committee's approval of the event and its budget together, which moves the event from Draft to Approved. The creator may do it too, since they are recording the committee's decision. There is no "decline": a draft stays a draft until it is approved.
- **O-106 Changes after approval.** Recommended:
  - budget lines are added, changed and removed only in Draft, and are fixed once approved, because the approval covers them;
  - the name, type, dates and lead officer can change until the event is closed;
  - after publishing, the Calendar entry follows any change in the same batch, and no second notice is posted.

**Money**
- **O-107 The event account.** 10.1 creates it with the event, in Draft. Recommended:
  - income and spending are recorded through the Treasury, from creation until the event is closed, under the Treasury's own capabilities and rules (threshold approval, receipts);
  - the event screen shows the account's budget lines, income, spending, balance and receipts, with a link to the account in the Treasury.
- **O-108 Templates (A3, P15).** Recommended:
  - a template has a name, default tasks and default budget lines;
  - a default task has a title, an optional description, and how many days before the event's first day it is due, with the lead officer as its owner (a task needs an owner and a due date, D-139);
  - a default budget line has a name and an amount (D-131);
  - national templates are managed by General Council officers with "Manage event templates" and seen by every branch; a branch's own templates are managed and seen by that branch;
  - changing a template doesn't change events already created from it.

**Tasks and status**
- **O-109 Removing an event task (B1).** D-140 left this to Phase 8. Recommended: "remove" sets the task to Cancelled; it is never deleted and its history stays. An event task can be changed from either the event or the Task tracker, under the Task tracker's rules (D-137, D-138). Its event link can't be changed (10.3).
- **O-110 Status moves.** Recommended:
  - Draft to Approved happens only by approval (A4);
  - the lead officer moves Approved → In preparation → Ready → Completed one step at a time;
  - Completed to Closed happens only by closing (C2);
  - where the setting allows moving backwards, it is one step at a time between Approved and Completed, never back to Draft and never out of Closed.
- **O-111 An event that doesn't go ahead.** The brief has no Cancelled status and no deleting. Recommended: build nothing extra. The event is taken to Completed and closed, and its report shows what happened; any money is returned to the branch.

**Publishing, report and close**
- **O-112 Publish (B4).** Recommended: from Approved until Closed, and once only. Publishing adds the Calendar entry and the automatic Noticeboard post in one batch, with the alert through the Queue. There is no unpublishing.
- **O-113 Post-event report (C1).** Recommended:
  - it is shown on screen from Completed;
  - its PDF is made at close, in the closing officer's language (9.4), and filed;
  - it contains tasks done against total (following the cancelled-tasks setting), each task with its status, and for each budget line the budget against actual income and spending, plus "Unallocated" (P10), the totals and the final balance.
- **O-114 Close (C2, P16).** Recommended:
  - only from Completed, by an officer with "Close events";
  - they choose which of the unit's branch accounts receives the balance, with a clear warning if the event is overspent (D-131);
  - the report and every event file are filed to the archive's Events category and locked;
  - tasks still open stay as they are and are locked with the event (brief 18 rules).
- **O-115 Event files (F1, F2).** Recommended:
  - the lead officer and anyone with "Manage events" upload files;
  - everyone who sees the event sees its files;
  - before close, a file can be removed (the object and its record deleted, with an audit entry);
  - after close, nothing can be removed (9.3).
- **O-116 Service switch dependencies.** 8.4 names only Treasury, and D-049 asks that any real dependency be raised first. The Event organiser also writes to the Task tracker, the Calendar and the Communication hub. Recommended: it depends on all four, so none of them can be off while it is on in a unit.
