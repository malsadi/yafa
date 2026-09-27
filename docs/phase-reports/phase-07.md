# Phase 7 report: Communication hub

**Status:** approved 2026-09-27 (D-170). Choices 23 to 31 confirmed, with 28 changed (D-169): starting a discussion now alerts its members as a new discussion.

- **Started:** 2026-09-26, when Phase 6 was approved (D-152).
- **Scope** (brief section 26, Phase 7): "Noticeboard, votes, circulars, read confirmation, role networks, topic discussions, requests, notifications, notification settings, push, queues, `postAutomatic()`." Service 4, brief 20, with 9.5 (notifications), 10.1 and 10.2 (how services connect) and 11 (Close votes and Push pruning).

**Before starting:**
- **P-items:** P11, P12, P13 and P14, all confirmed (D-153).
- **Owner inputs:** none for Phase 7 in brief 30. The settings (below) are entered by the data administrator.
- **Questions:** O-090 to O-101 were asked and answered, all as recommended (D-154 to D-165). O-095 has an addition: the invite screen says plainly that a new member sees everything said so far (D-159). O-100 corrects D-032 (D-164).
- **Push keys:** set on the preview by `npm run push:create-preview-keys` (D-165). Local development has none; production is Phase 12.

## 1. What was built, by sub-point

Every sub-point has its Worker routes, permission sweep entries, screens, texts in English and Arabic, and tests. Migrations 0040 to 0046 belong to Phase 7.

**Stage A: Announcements** (T-142, T-143; migrations 0040 to 0042)
- **A1 Noticeboard:** officers post notices with a title and text. Notices are retired and brought back, never deleted (database trigger). `postAutomatic(unitId, kind, payload)` is exported from `communication-hub/index.ts` for the Event organiser and Meeting recorder; its posts are marked as automatic and can't be changed.
- **A2 Noticeboard voting:** a vote has a question, options, voters and a closing date. Voters are chosen when the vote is created: all officers of the unit, officers holding chosen roles, or named officers (P11). One vote per person, enforced by the ballot table's primary key. A vote can't be changed once cast, and results are hidden until the vote closes (P12). Once anyone has voted, the question, options and voters are locked; the closing date can only be moved later while the vote is open (D-166, migration 0041).
- **A3 National circulars:** sent by the General Council to all branches or to chosen branches.
- **A4 Read confirmation:** a branch's first opening is recorded (P14). Only the General Council sees which branches have opened a circular (D-167).

**Stage B: Conversations** (T-144; migrations 0043 to 0045)
- **B1 Role networks:** officers holding the same role across units share a space. Membership is worked out live from current terms and never stored, so it follows an election automatically (10.1).
- **B2 Topic discussions:** a starter invites officers to a thread on a subject. The starter can remove a member and a member can leave; both are recorded and the messages stay (D-168).
- **B3 Requests between branches:** a unit asks one, several or all other units (P13). The General Council sends and receives requests like any unit (D-168). Status runs Open → Answered → Closed.

**Stage C: Notifications** (T-145; migration 0046)
- **C1 Notifications:** a new notice, vote, vote result, circular, request or reply writes an in-portal notification and sends a phone alert, through the notifications Queue (10.1). Nobody is alerted about their own post, or about a unit where the hub is off. Phone alerts say only the kind and the unit (D-162).
- **C2 Notification settings:** each officer chooses their alert types. National circulars always notify; the server ignores any choice for them. The screen also turns phone alerts on or off for this device. On an iPhone not yet on the home screen, it shows the install guide text from 15 C4 instead.
- **Push (9.5):** failed phone alerts are tried again up to the administrator's "Phone alert attempts", then recorded as undelivered for the health screen (Phase 12). A device the push service reports gone is removed at once.
- **Scheduled jobs (11):** Close votes queues each closed vote's result alerts once. Push pruning removes expired devices, then undelivered alerts older than the administrator's period.

## 2. Test and lint results

At the current commit, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including the file-size and import-boundary rules. No rule is disabled.
- **Formatting:** passes.
- **Tests:** 720 pass, none skipped (671 at the end of Phase 6), including the D-169 change.
- **Permission sweep:** passes, with every Communication hub route in it.
- **Build:** passes.
- **Generated documents:** `docs/permissions.md` and `docs/arabic-texts-review.md` are current.

**New checks:**
- **Immutability:** notices can't be deleted; a vote is locked once anyone has voted, apart from moving the closing date later; a ballot can't be changed; vote result alerts are queued once and never changed.
- **Permissions:** branches can't see another branch's Noticeboard or who opened a circular; only discussion members see a discussion; someone removed or who left no longer sees it.
- **Notifications:** circulars reach everyone whatever they chose; a retried alert writes its in-portal notification once; a gone device is removed; an alert is recorded as undelivered after the last attempt; nothing is sent while a setting or push key is missing.
- **10.2:** structure tests show that the Task tracker and Calendar import nothing from the hub, task reminders never use push, and only the Event organiser and Meeting recorder may call `postAutomatic`.

**Two tests changed, and why (T-145):**
- The 10.2 test now checks the task-reminders job file rather than the whole `cron` folder, because that folder also holds the hub's two jobs. The guarantee is unchanged.
- The archive finding test now uses London's date, as the portal does. It failed between midnight and 1 a.m. BST.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-152:** Phase 6 approved. **D-151:** the Phase 6 choices.
- **D-153:** P11 to P14 confirmed.
- **D-154 to D-165:** O-090 to O-101, all as recommended, with the addition to O-095 and the correction to D-032 above.
- **D-166:** six Noticeboard choices confirmed; a closing date can be extended, never shortened, once voting starts.
- **D-167:** five vote and circular choices confirmed.
- **D-168:** eight conversation choices confirmed; the General Council takes part in requests; discussion members can be removed or leave.
- **D-169:** choices 23 to 31 confirmed; 28 changed, so a new discussion alerts as "New discussion", switched on and off with replies.
- **D-170:** Phase 7 approved. **D-171:** P15 and P16 confirmed.

## 4. Uncertain or not finished

**Choices of mine, to confirm or change** (1 to 22 are settled by D-166 to D-168):

From conversations:
23. For a branch, a request to "all other units" includes the General Council; for the General Council, it means every branch.
24. The starter of a discussion can't be removed and can't leave, since only they invite and remove members.

From notifications:
25. An officer's alert choice covers both in-portal and phone alerts; there is no separate choice for each.
26. An officer who has never saved a choice follows the "Alert types switched on for new officers" setting, even if it changes later.
27. Adding a vote to an existing notice, or inviting someone to a discussion later, sends no alert.
28. ~~Starting a discussion alerts its members as a "new reply".~~ Changed by D-169: it alerts them as a "New discussion", switched on and off with replies.
29. Phone alerts for role networks and discussions name no unit, as they don't belong to one (D-162: kind and unit only).
30. A phone belongs to whichever officer registered it last.
31. A phone alert waits up to 24 hours for a phone that is off, which outlasts the Queue's retries.

**Settings the data administrator must set before the hub can be switched on** (15 C6 lists them):
- Alert types switched on for new officers.
- Phone alert attempts (1 to 100).
- Undelivered phone alerts kept (days).
- The iPhone install guide text (15 C4, D-086).

**Waiting on later phases:**
- Automatic posts: the Event organiser (Phase 8) and Meeting recorder (Phase 9) will call `postAutomatic`.
- 10.2 tests for the Meeting recorder (only its two messages; its votes separate from Noticeboard votes), Correspondence, and Achievements and reports come with Phases 9 to 11.
- Undelivered phone alerts are shown on the health screen in Phase 12.

**Not checked this session:** whether migration 0046 has reached the preview database. The read-only query was declined here, and the GitHub CLI isn't installed. You can check with `! npx wrangler d1 execute yafa-portal-preview-db --remote --command "SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 1"`.

**Still to try in a real browser:** the end-to-end journeys. They need matching people and terms for the four test officers in the local database (`phase-05.md`).

**Arabic texts:** every new text is in English and Arabic. The Arabic ones are drafts for your review (`docs/arabic-texts-review.md`).

## 5. Questions for the owner, and what Phase 8 needs

**Questions:** none open, apart from confirming choices 23 to 31 above, and approving Phase 7.

**Phase 8 (Event organiser):** brief 31 lists two proposals for it, which need your confirmation before Phase 8 starts:
- **P15:** event templates are national or branch, and are managed in the Event organiser.
- **P16:** when an event closes, the officer closing it chooses which branch account receives the balance.

Brief section 21 also lists P10, already confirmed (D-116). Brief 30 lists no owner inputs for Phase 8 beyond the settings and lists the data administrator enters before the service is switched on.
