# Phase 6 report: Calendar

**Status:** approved 2026-09-26 (D-152); five choices confirmed and one changed (D-151).

- **Started:** 2026-09-26, when Phase 5 was approved (D-144).
- **Scope** (brief section 26, Phase 6): "Community dates, read-model, views, filters, `checkClashes()`, phone feed." Service 5, brief 19, with 6.4 (phone calendar access) and 25 A2 (revoking a feed link).

**Before starting:**
- **P-items:** none for Phase 6 in brief 31.
- **Owner inputs:** none for Phase 6 in brief 30.
- **Questions:** O-084 to O-089 were asked and answered, all as recommended except O-086 (D-145 to D-150).

## 1. What was built, by sub-point

| # | Built | Where recorded |
|---|---|---|
| A1 Meetings | Read from the read-model table, which only the Meeting recorder will write, in its own batch (Phase 9). Read-only in the calendar. | T-140, T-141 |
| A2 Events | The same, written by the Event organiser when an event is published (Phase 8). Read-only in the calendar. | T-140, T-141 |
| A3 Community dates | A title; one day, or a first and last day; an optional time and description (D-145). Units add their own; only the General Council adds dates for all branches, which show in every branch's calendar (D-146). Removed dates are retired and can be brought back, never deleted (D-147). | T-141 |
| B1 Branch view | The branch's own meetings, events and community dates, with the General Council's all-branches dates, by month, week or list. | T-141 |
| B2 All-branches view | Every branch's dates together, each in its branch's colour (set on the unit, 15 B1). Anyone who reads their unit's calendar can switch to it (D-150). | T-141 |
| B3 Filters | Show or hide meetings, events and community dates; across all branches, choose which branches to include. | T-141 |
| B4 Date clash notice | `checkClashes(unitId, date)` is exported for the Event organiser and Meeting recorder, and returns notices, never errors. It counts the same unit's meetings and events on the same day (D-149), on every day a date covers (D-151). The community date form shows the notice, and nothing is blocked. | T-141 |
| C1 Phone calendar link | Each officer makes a private link once and subscribes on their phone. The feed has their own units' meetings, events and community dates, plus the General Council's all-branches dates when the setting is on (D-148). Making a new link stops the old one, and the administrator can revoke it from Officer accounts (25 A2). | T-140, T-141 |

**Brief 19's rules, all held:**
- Meetings and events are read-only in the calendar and change only in their own services.
- Community dates are the only items entered in the calendar.
- Each branch sees its own calendar by default, with the all-branches view one click away.
- Clashes are a notice only.
- The Calendar has no interaction with the Communication hub (tested, 10.2).

**Setting:** "Phone feed includes all-branches community dates", in the Administration panel. It has no default: until it is set, the Calendar can't be switched on, and the feed says it isn't set up.

**Screens:**
- The calendar, with month, week and list views, earlier and later, this branch or all branches, and the filters.
- Choosing an item shows its details. The unit's own community dates can be changed, retired and brought back there.
- Adding a community date, with the clash notice.
- The phone calendar panel: whether a link exists and since when, and making a link, shown once.
- **Texts:** every text is in English and Arabic. The Arabic ones are drafts for your review (`docs/arabic-texts-review.md`).

## 2. Test and lint results

At the Phase 6 commit, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including the file-size and import-boundary rules. No rule is disabled.
- **Formatting:** passes.
- **Tests:** 671 pass, none skipped (647 at the end of Phase 5).
- **Permission sweep:** passes, with every Calendar route and the feed in it.
- **Build:** passes.

**New checks:**
- **Immutability:** a community date can't be deleted, and a save from an older version is refused.
- **Permissions:** a branch never sees another branch's dates in its own view. Only the General Council's dates can be for all branches, refused both by the service and by the database.
- **The feed:** it holds only the officer's own units' dates, follows the setting, and stops working once replaced.
- **10.2:** a structure test shows the Calendar imports nothing from the Communication hub.
- **A test updated:** an older service-switch test switches the Calendar on as its example. It now sets the Calendar's required setting first, as the Treasury and Task tracker tests do.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-143:** the three Phase 5 choices confirmed.
- **D-144:** Phase 5 approved.
- **D-145 to D-150:** all as recommended, except O-086:
  - a community date's details;
  - units add their own dates, and only the General Council adds dates for all branches;
  - removed dates are retired and can be brought back (your answer to O-086);
  - what the phone feed holds;
  - what counts as a clash;
  - the all-branches view needs no separate permission.

## 4. Uncertain or not finished

**Choices of mine, to confirm or change:**
1. **Times in the phone feed:** a date on one day with a time is sent at its London time, written in UTC, so phones show it correctly in any season. A date on several days, or with no time, is sent as whole days, and its time is not shown on the phone.
2. **No time window:** the feed sends all past and future dates. Retired dates are left out.
3. **The feed's language:** the calendar's name on the phone follows the officer's language, as D-026 sets it.
4. **Clashes for a date on several days:** the notice checked the first day only. **Changed by D-151:** it now checks every day the date covers, and each notice names its day.
5. **Opening view:** the calendar opens on this month, in the month view, for this branch.
6. **"For all branches" on screen:** only the General Council's form offers it; the portal refuses it from anyone else anyway.

**Waiting on later phases:** meetings (Phase 9) and events (Phase 8) will appear once those services write them. Until then the calendar shows community dates only, and clash notices are empty.

**Still to try in a real browser:** the end-to-end journeys. They need matching people and terms for the test officers in the local database.

## 5. Questions for the owner, and what Phase 7 needs

**Questions:** none open, apart from confirming the six choices above.

**Phase 7 (Communication hub):** brief 31 lists four proposals for it, which need your confirmation before Phase 7 starts:
- **P11:** eligible voters are chosen when a vote is created: all officers of the unit, officers holding chosen roles, or named officers.
- **P12:** a vote cannot be changed once cast, and results are hidden until the vote closes.
- **P13:** a request can be sent to one branch, several branches, or all branches.
- **P14:** a branch counts as having opened a circular the first time any of its officers opens it.

Brief 30 lists no owner inputs for Phase 7.
