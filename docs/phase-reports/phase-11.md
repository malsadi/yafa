# Phase 11 report: Achievements and reports

**Status:** built straight through after Phase 10, under D-213. Both reports are for your review together. The choices I made for you are in section 4, each marked "(D-213 choice)".

**Brief section 26, Phase 11:** "Achievements, timeline, all-branches view, contributions, annual report draft and finalise." This is service 12, brief 24. It also covers:
- 10.1: the row "Annual report finalised";
- 10.2: no interaction with the Communication hub;
- 9.4: the annual report PDF;
- P17 and P18.

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** P17 and P18, both confirmed as written (D-215).
- **Owner inputs:** none in brief 30 beyond the data administrator's own: the achievement categories list (15 B3), and the report year setting.
- **Already built for this phase:**
  - the Treasury's `yearEndSummary`, including whether the year is closed (Phase 5);
  - the archive's Annual reports category and `fileRecord` (Phase 3);
  - the branded PDF (Phase 2).
- **Questions before building:** O-148 to O-160, answered 2026-09-28 (D-215). All as recommended, except O-150: branches also see the General Council's achievements.

## 1. What was built, by sub-point

Every sub-point has its Worker routes, permission sweep entries, screens in English and Arabic, and tests. Migration 0054 belongs to Phase 11.

**Stage A: Achievements**
- **A1 Record achievement:** title, date (up to today), category from the list, description, and at least one officer involved. The officers can be anyone who has served in the unit, past officers included (O-151). Photos are optional, made JPEG and resized on the phone under the "media images" rules (9.3). An achievement can be changed, or withdrawn and brought back, until its year's report is finalised (O-152).
- **A2 Branch timeline:** the unit's achievements in date order. Branches also see the General Council's achievements, on a view of their own (O-150).
- **A3 All-branches view:** every unit's achievements together, each marked with its unit. Only the General Council's readers have it.

**Stage B: Recognition and reporting**
- **B1 Officer contributions:** everyone who has served, past officers included. Each person's page lists the roles they've held, with dates, and the achievements credited to them. The General Council's readers see a person's contributions across every branch (O-153).
- **B2 Annual report:**
  - **Starting a draft:** only once the report's year has ended, and one per unit and year (O-157). The year runs from the administrator's start day (O-154).
  - **What the draft shows:** the latest figures from the records:
    - the year's achievements, withdrawn ones excluded;
    - events completed (P17: reached Completed or Closed in the year, never a cancelled one);
    - meetings held (Held or Report logged, dated in the year);
    - the Treasury's financial year that ends within the report year (O-155), marked "Provisional" while that year is open (P18);
    - the current officers.

    A section whose service is switched off for the unit says it isn't in use (O-160).
  - **The review:** the branch writes one optional summary. The assembled sections can't be edited.
  - **Finalising:** after a confirmation, which shows P18's warning when it applies but never blocks:
    - the content is frozen;
    - the PDF is made in the finalising officer's language;
    - it is filed to the archive under Annual reports;
    - everything is locked by triggers, including the year's achievements.

    It is never reopened.

**Rules**
- The General Council's own report covers its own records only (O-159).
- There is no interaction with the Communication hub. The links to other services are for the annual report only, and a structure test holds this.

## 2. Test and lint results

These are the final figures for both phases, taken from this phase's gate. Everything is judged by exit code.

- **Type check, lint, formatting, build:** pass. No rule is disabled.
- **Tests:** 842 pass, none skipped (793 at the end of Phase 9, 824 after Phase 10).
- **Permission sweep:** passes. All 18 Achievements routes and all 14 Correspondence routes are in it.
- **Browser journeys:** all 18 runs pass: the 4 sign-ins, then 7 journeys in English and Arabic (sign-in, event, letter, meeting, notice and vote, debit approval, setting change). The brief lists no journey for Phase 11, so none was added.
- **Generated documents:** `docs/permissions.md` and `docs/arabic-texts-review.md` are current.

**New checks:**
- **The brief's Phase 11 line:**
  - recording, the timeline in each view, the all-branches view for the General Council only, and contributions with a past officer;
  - the report started only once its year has ended;
  - its sections, with P17's events (a cancelled event is excluded, and so is one completed the next year), meetings held, and P18's provisional mark;
  - a switched-off service's section;
  - the summary by version, and finalising, filing and locking.
- **Immutability (database triggers):**
  - achievements are never deleted;
  - achievements in a finalised year can't be changed or added;
  - a finalised report can't be changed, reopened or deleted.
- **The report's words:** tested in English and Arabic.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-215:** O-148 to O-160, all as recommended, with O-150 widened so branches see the General Council's achievements. P17 and P18 confirmed as written.

## 4. Choices I made for you (D-213), and what is not finished

**Choices, to confirm or change:**
1. **When an event counts as completed (P17):** the event keeps no completion date of its own, so the day it was completed is its last move to Completed in the audit log (London time).
2. **Timeline order:** latest first. The brief says "in date order".
3. **Views:**
   - a branch's timeline has two views, "This unit" and "General Council", rather than one mixed list;
   - the General Council has "This unit" and "All branches".

   The General Council's achievements show only where the service is switched on for the General Council.
4. **Withdrawn achievements** show, marked, only to those who record the unit's achievements, so they can bring them back.
5. **Categories:** a changed achievement can keep a category that has since been retired from the list. A new or changed one otherwise needs a current category.
6. **Photos:** a photo taken off an achievement is retired (kept in storage), and only until the report is finalised. Photos are opened with a "View" button, which downloads them. There are no thumbnails, since the brief names none.
7. **Late achievements:** an achievement dated in a year whose report is finalised is refused, so the report and the timeline always agree.
8. **Starting a report:** the screen offers the latest ended year that has no report yet. The Worker accepts any ended year, so an earlier year's report could be started too, but no screen offers it.
9. **Making the PDF:** it is made during the finalising request, as the meeting report and post-event report are. 9.4 allows a Queue job "if it takes too long"; one year's report renders within the request. The button shows "Finalising…" meanwhile.
10. **The Treasury section:** the balance at the start, any opening balances entered, money in, money out, and the balance at the end. Transfers between the unit's own accounts are left out, since they cancel out in its totals. Dates are written with Western digits, as in the other PDFs.
11. **A switched-off service** is judged when the content is assembled: live for a draft, and on the finalising day for the frozen report.
12. **Contributions list:** the General Council's readers see everyone who has served anywhere; a branch's readers see those who served in that branch.
13. **What the screen shows:** the report on screen is written by the same function as the PDF, in the reader's language. The PDF is in the finalising officer's language (9.4).

**Not checked here:**
- **The annual report PDF's look:** nobody has looked at one yet. The tests use a stand-in renderer.
- **Uploading a photo through the browser:** the real upload to R2 can be checked on the preview, as with letters in.

## 5. Questions for the owner, and what Phase 12 needs

**Questions:** the choices above for both phases (this report and the Phase 10 report), and approval of Phases 10 and 11.

**Phase 12 (Operations and launch, 15 D):** brief 31's remaining proposals and brief 30's launch inputs will be listed before it starts. The Chrome sandbox note from D-197 is due in its security review.
