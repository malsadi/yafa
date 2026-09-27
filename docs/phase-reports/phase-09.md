# Phase 9 report: Meeting recorder

**Status:** approved (D-211), with your two changes built (T-152).

**Brief section 26, Phase 9:** "Full lifecycle end-to-end test, exactly two hub messages, locked and filed report." Service 2, brief 22, with 10.1 (two rows), 10.2 (the Meeting recorder's two messages, no actions to the Task tracker, its votes separate from Noticeboard votes), 9.4 (the meeting report PDF) and 27 (the "hold and log a meeting" journey).

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** none for Phase 9 in brief 31.
- **Owner inputs:** none in brief 30 beyond the data administrator's own: the meeting types list (15 B3) and the autosave interval for minutes.
- **Already built for this phase:** `postAutomatic` with the "meeting scheduled" and "meeting has taken place" kinds (Phase 7); the Calendar's read-model writers and `checkClashes` (Phase 6); the archive's `fileRecord` and its Meetings category (Phase 3); `renderBrandedPdf` (Phase 2).
- **Questions before building:** O-122 to O-134, asked and answered 2026-09-27 (D-198 to D-210). All as recommended except O-127: attendance has a third mark, "did not attend", besides present and apologies (D-203).

## 1. What was built, by sub-point

Every sub-point has its Worker routes, permission sweep entries, screens in English and Arabic, and tests. Migration 0051 belongs to Phase 9.

**Stage A: Set up the meeting**
- **A1 Meeting details:** type (from the meeting types list), date and start time, place and/or online link, chair and secretary (D-198). Saving shows the meeting in the Calendar and posts "meeting scheduled", in the same batch, with the alert through the Queue (10.1). The form shows date clashes as a notice. Details change while Scheduled; the Calendar follows, and no second message is sent (D-202).
- **A2 Attendees:** chosen from the unit's current officers; the chair and secretary always attend. While held, each is marked present, sending apologies, or did not attend (D-203).
- **A3 Agenda:** set, changed, removed and ordered before the meeting. While held, points raised are added and marked "raised in meeting"; the original items stay as they were (D-204).
- **Status:** Scheduled → Held (from the meeting's date) → Report logged, never back (D-201). A meeting that doesn't happen is cancelled with a reason: it leaves the Calendar and sends no message (D-202).

**Stage B: Minutes**
- **B1 Officer comments:** one per officer marked present, per item, recorded against their name (D-205). Comments save themselves at the administrator's interval; a save that crosses someone else's is refused, their text is shown, and the officer's own stays on screen (D-207).
- **B2 Vote or decision:** a vote's numbers for, against and abstaining (together no more than those present) and its result, or a decision (D-206).

**Stage C: Meeting report**
- **C1 Full report:** the details, attendees and attendance, the original and updated agendas, every comment, and every vote and decision. It is logged by the chair, secretary or a manager once every attendee is marked and every item has its outcome. Its PDF is written to R2 first, in the logging officer's language; then one batch files it to the archive's Meetings category, dated the meeting, logs and locks the meeting, and posts "meeting has taken place" (10.1, D-208).

**Connections:**
- The Calendar and Communication hub are targets, not dependencies: while one is off, its entry or message is skipped, the screen says so, and it can be sent once later (D-209).
- The Calendar now links each of the unit's own meetings and events to its page in its own service (10.3; waiting since Phase 6).
- `postAutomatic` gained no new kinds: the Meeting recorder uses its two (Phase 7).

## 2. Test and lint results

Judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including the file-size and import-boundary rules. No rule is disabled.
- **Formatting:** passes.
- **Tests:** 793 pass, none skipped (771 at the end of Phase 8; 789 before D-211's changes).
- **Permission sweep:** passes, with every Meeting recorder route in it.
- **Build:** passes.
- **Browser journeys:** all 16 pass (8 journeys, each in English and Arabic): sign-in, event, meeting, notice and vote, debit approval, and setting change. After D-211, one run timed out loading the first page of the Arabic setting change (a stalled local dev server, before any step ran). Re-run on its own, it passed. The meeting journey now also checks the "Recorded for" line.
- **Generated documents:** `docs/permissions.md` and `docs/arabic-texts-review.md` are current.

**New checks:**
- **The brief's Phase 9 line:** the lifecycle test runs scheduling to logging and checks exactly two hub messages, and a locked report filed to Meetings. The browser journey "hold and log a meeting" passes in English and Arabic.
- **10.2 and build notes:** structure tests show that:
  - only the Meeting recorder's targets file calls `postAutomatic`, with only its two kinds;
  - only A1, C1 and D-209's later sending use it;
  - the Meeting recorder imports nothing from the Task tracker;
  - its votes touch no Noticeboard vote table, and the hub imports nothing from it.
- **Immutability (database triggers):**
  - a meeting is never deleted, and moves only forward;
  - its details change only while Scheduled;
  - attendance, raised points, comments and outcomes are recorded only while Held;
  - the original agenda is fixed from Held;
  - the report is logged only when complete;
  - once logged or cancelled, everything is locked;
  - comments are never deleted.
- **Permissions:** the chair and secretary act with no capability; others need "Manage meetings"; another unit's meetings are not found.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-197:** Phase 8 approved; the test Chrome's sandbox to be checked in Phase 12.
- **D-198 to D-210:** O-122 to O-134, all as recommended except O-127: attendance has a third mark, "did not attend" (D-203).
- **D-211:** the ten choices below: eight confirmed, choice 1 changed and choice 8 with an addition, both now built (T-152). Phase 9 approved.

## 4. Uncertain or not finished

**Choices of mine** (answered in D-211):
1. *Changed (D-211):* the Calendar entry and both hub messages name the meeting by its type's name in the reader's language. Originally: always the English name.
2. Attendees can be added and removed while the meeting is held, as well as before (D-203: until the report is logged). Someone whose comments are in the minutes can't be removed, and stays marked present.
3. A comment is changed, never deleted.
4. Only comments save themselves. A vote or decision saves with its button.
5. Cancelling needs "Manage meetings"; the chair and secretary can't cancel.
6. A meeting can be marked held from its date (London time), not before.
7. A vote's result is written in words, as the brief says, with no fixed list.
8. Officers' comments are written by the chair, secretary or a manager, against each officer's name. Attendees don't write their own. *Added (D-211):* each comment shows "Recorded for {officer} by {recorder}", on screen and in the report PDF.
9. The report PDF is made during the logging request, not through a Queue job (9.4 allows either).
10. The Calendar's link to a meeting or event shows only for the unit's own items, which are the ones its officers can open.

**Not checked here:** the report PDF's look (the browser journey makes one locally; nobody has looked at it yet).

## 5. Questions for the owner, and what Phase 10 needs

**Questions:** none. The ten choices and Phase 9 were answered in D-211.

**Phase 10 (Correspondence and letters):** brief 31 lists no open proposals for it (P19, letter templates, was confirmed in D-095). I will read brief 23 and bring any questions before starting.

## Questions asked before building (O-122 to O-134, answered: see above)

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
