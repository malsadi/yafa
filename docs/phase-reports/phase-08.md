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
- **Questions before building:** O-102 to O-116, asked 2026-09-27. They are listed below, each with my recommendation.

## Questions for the owner (O-102 to O-116)

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
