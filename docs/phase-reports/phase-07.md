# Phase 7 report: Communication hub (DRAFT, in progress)

**Status:** Phase 6 approved 2026-09-26 (D-152); Phase 7 is current.

**Brief section 26, Phase 7:** "Noticeboard, votes, circulars, read confirmation, role networks, topic discussions, requests, notifications, notification settings, push, queues, `postAutomatic()`." Service 4, brief 20, with 9.5 and 10.1.

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** P11, P12, P13 and P14, all confirmed (D-153).
- **Owner inputs:** none for Phase 7 in brief 30. The settings (alert types for new officers; the iPhone install guide, D-086) are entered by the data administrator.
- **Questions before building:** O-090 to O-101, asked and answered 2026-09-26, all as recommended (D-154 to D-165). O-095 has an addition: the invite screen says plainly that a new member sees everything said so far (D-159). O-100 corrects D-032 (D-164).
- **Push keys:** set on the preview by `npm run push:create-preview-keys` (D-165). Local development has none yet.

## Progress

- **Done: A1 Noticeboard and A2 Noticeboard voting** (T-142, migration 0040), with the Worker routes, sweep entries, screens, texts in English and Arabic, and tests. `postAutomatic` is exported for Phases 8 and 9.
- **Done: a vote's closing date moves later after voting starts** (D-166, migration 0041).
- **Done: A3 national circulars and A4 read confirmation** (T-143, migration 0042).
- **Next:** conversations (B1 to B3), then notifications and push (C1, C2).

## Choices of mine

**Confirmed (D-166):** choices 1 and 3 to 7 of the Noticeboard below. Choice 2 was changed: once anyone has voted, the closing date can still be moved later, never earlier (migration 0041); the question, options and voters stay locked.

1. An officer's notice has a title and text, both required.
2. ~~The whole vote locks at the first vote.~~ Changed by D-166, as above.
3. Until the first vote, a vote can be added to a notice, changed, or taken off.
4. The voters are fixed when the vote is created (P11). Someone who takes office later is not a voter. Someone who leaves office can no longer vote, because they no longer read the unit's Noticeboard (D-154).
5. A voter sees which option they chose. Nobody sees anyone else's choice.
6. An automatic post can be retired and brought back like any notice; it just can't be changed.
7. A closing date must be today or later.

**New, to confirm or change:**

8. A closing date can be moved later only while the vote is still open. Once it has closed, its results are shown (P12), so reopening it would let late voters see them first.
9. "All branches" means every branch that exists when the circular is sent, active or inactive. A branch added later does not receive earlier circulars.
10. An inactive branch's opening is still recorded: reading isn't a change to its records (P4).
11. The list shows titles only; a branch counts as having opened a circular when an officer reads its text.
12. Branches don't see which other branches have opened a circular; only the General Council does.
