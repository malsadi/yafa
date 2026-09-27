# Phase 9 report: Meeting recorder (DRAFT, in progress)

**Status:** Phase 8 approved 2026-09-27 (D-197); Phase 9 is current.

**Brief section 26, Phase 9:** "Full lifecycle end-to-end test, exactly two hub messages, locked and filed report." Service 2, brief 22, with 10.1 (two rows), 10.2 (the Meeting recorder's two messages, no actions to the Task tracker, its votes separate from Noticeboard votes), 9.4 (the meeting report PDF) and 27 (the "hold and log a meeting" journey).

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** none for Phase 9 in brief 31.
- **Owner inputs:** none in brief 30 beyond the data administrator's own: the meeting types list (15 B3) and the autosave interval for minutes.
- **Already built for this phase:** `postAutomatic` with the "meeting scheduled" and "meeting has taken place" kinds (Phase 7); the Calendar's read-model writers and `checkClashes` (Phase 6); the archive's `fileRecord` and its Meetings category (Phase 3); `renderBrandedPdf` (Phase 2).
- **Questions before building:** O-122 to O-134, below, each with my recommendation.

## Questions for the owner (O-122 to O-134)

**The meeting**
- **O-122 Details (A1).** The brief lists type, date, time, place or online link, chair and secretary. Recommended:
  - the type comes from the meeting types list;
  - a date and a start time, both required;
  - a place, an online link, or both, with at least one;
  - the chair and the secretary are current officers of the unit, and are attendees automatically.
- **O-123 Who sees meetings.** Recommended: the unit's own officers, through a "See meetings" capability. The General Council sees a branch's meeting reports once filed in the archive (P2), as with events (D-173).
- **O-124 Who does what.** Recommended:
  - "Manage meetings" (a capability) sets a meeting up: details, attendees and the agenda;
  - the meeting's chair and secretary, with no capability, mark it held, record attendance and minutes, add points raised in the meeting, and log the report, as the lead officer does for an event (D-174);
  - so does anyone with "Manage meetings".
- **O-125 Status moves.** Scheduled → Held → Report logged. Recommended:
  - "Held" is marked when the meeting starts, from its date onwards;
  - before that, only the details, attendees and agenda are set;
  - from "Held", attendance, points raised in the meeting, comments, and votes or decisions are recorded;
  - "Report logged" happens only by logging the report (C1). No step goes back.
- **O-126 Changes, and a meeting that doesn't happen.** Recommended:
  - the details can change while Scheduled, and the Calendar entry follows, with no second hub message (the brief allows only two);
  - a meeting that doesn't happen can be cancelled from Scheduled, with a reason; it leaves the Calendar and is never deleted. It sends no hub message, since brief 22 limits the hub to its two messages.
  - The brief has no Cancelled status, so this adds one, as D-181 did for events. The alternative is to build nothing and leave the meeting Scheduled.

**Attendees and agenda**
- **O-127 Attendees (A2).** Recommended:
  - chosen from the unit's current officers only (the brief's "officers list");
  - changeable until the report is logged;
  - on the day, each is marked present or sending apologies, and every attendee must be marked before the report can be logged.
- **O-128 Agenda (A3).** Recommended:
  - each item has a title and an optional note;
  - before "Held", items are added, changed, removed and reordered freely;
  - from "Held", the original items stay as they were, and new items are added marked "raised in meeting", so the original and updated agendas are both clear.

**Minutes**
- **O-129 Comments (B1).** Recommended: under each agenda item, one comment per officer marked present, recorded against their name by whoever records the minutes (O-124). Comments can be changed until the report is logged.
- **O-130 Vote or decision (B2).** Recommended:
  - each item concludes with one or the other;
  - a vote records the numbers for, against and abstaining, which together can't exceed the officers present, and its result in words;
  - a decision is written text;
  - every item needs its vote or decision before the report can be logged;
  - these are formal meeting votes, separate from Noticeboard votes (10.2).
- **O-131 Autosave.** The brief asks for minutes to autosave, at an interval the administrator sets, with the version check. Recommended: if two people change the same minutes, the second save is refused, and the screen shows the other's change and keeps the officer's own text so nothing is lost.

**Report and connections**
- **O-132 The full report (C1).** Recommended:
  - logged by the chair, the secretary or someone who manages meetings;
  - its PDF is made in the logging officer's language, with the meeting details, attendees and apologies, the original and updated agendas, every comment, and every vote and decision;
  - it is written to R2 first, then in one batch it is locked, filed to the archive's Meetings category dated the meeting's date, and the meeting is locked, with the "meeting has taken place" post (10.1).
- **O-133 Service dependencies.** Recommended, as D-186 did for events:
  - the Meeting recorder depends on no other switchable service;
  - the Calendar and the Communication hub are targets: if either is off, its entry or message is skipped, the screen says so, and it can be sent once, later, when the service is back on.
- **O-134 A meeting's calendar entry after the report is logged.** Recommended: it stays, showing the meeting on its date, read-only as always.
