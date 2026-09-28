# Immutability review (Phase 12)

Brief section 26, Phase 12: "Immutability review: try to change every locked thing through every route." Done on 2026-09-28.

## How it was tried

- **The sweep:** `tests/immutability/try-every-route.ts` takes a locked record, finds every registered route that could change it (every method but GET under the record's path), and calls each one. The caller is an officer who holds every capability involved, and each call carries a valid body, so the lock itself is what has to refuse it.
- **What it checks:**
  - no route succeeds;
  - none fails with a 500, which would mean the service missed the lock and only the database stopped it (build rule 5 wants both);
  - every row of the record is exactly as it was.
- **The database:** each locked thing also has a test that changes or deletes it directly in the database, and the trigger refuses. Those tests were written in each thing's own phase.

## Results

| Locked thing | Routes tried | Where | Database test |
|---|---|---|---|
| A closed event: details, status, tasks, budget lines, files, publishing (D-184) | all 16 event routes, and the Task tracker's 2 task routes | `tests/immutability/closed-event.test.ts` | `event-lifecycle.test.ts` |
| A meeting whose report is logged (brief 22) | all 14 meeting routes | `meeting-lifecycle.test.ts` | the same |
| A cancelled meeting (D-202) | all 14 meeting routes | `meetings.routes.test.ts` | the same |
| A confirmed election (brief 14 B3) | all 6 election routes | `elections.routes.test.ts` | the same |
| A completed handover | all 4 handover routes, as the register officer and as both named officers | `handovers.routes.test.ts` | the same |
| A finalised annual report, and its year's achievements (O-158) | all 7 achievement routes and all 3 report routes | `annual-report.test.ts` | the same |
| A letter in marked Replied (O-144, O-145) | all 4 letter-in routes, as the recorder and as the handler | `letters-in.test.ts` | the same |
| A generated letter out (O-142) | none exist: there is no route that changes a letter out | not applicable | `letters-out.test.ts` |
| The entries of a closed financial year (D-128) | approve, decline, reverse, and adding receipts. New credits, debits and transfers dated in that year are refused as well. | `year-end-close.service.test.ts` | the same |
| A closed account (D-118) | its 3 account routes, plus debits and transfers to or from it | `accounts.routes.test.ts` | `treasury-integrity.test.ts` |
| An automatic Noticeboard post (20 rules) | all 5 notice routes | `noticeboard.routes.test.ts` | the same |
| A vote once cast (P12, D-155, D-166) | changing the notice, a second ballot, and moving the closing date earlier | `notice-votes.routes.test.ts` | the same |
| A closed request (D-160) | closing again, and replying | `requests.routes.test.ts` | the same |
| A sent circular (D-157) | none exist: a circular has no route that changes it | not applicable | `circulars.routes.test.ts` |
| An automatic archive filing (brief 15 rules) | all 3 document routes | `versions.routes.test.ts` | `filing.service.test.ts` |
| A returned equipment loan (D-109) | changing it, and returning it again | `equipment.routes.test.ts` | the same |
| A past officer's ended term (brief 14; T-085) | changing the term again | `officers.routes.test.ts` | `register-history.test.ts` (migration 0057) |
| The audit log, settings history, privacy notice versions and acknowledgements | none exist | not applicable | `append-only-tables.test.ts` |

## What the review found

1. **A closed event's tasks, changed through the Task tracker, crashed instead of refusing** (T-162). The event's own routes refused the change, but the Task tracker's two routes (change a task, change its status) reached the database. The trigger stopped the change, so nothing changed, but the officer saw an error instead of a refusal. The action list and My tasks also still showed the controls.
   - **Fixed:** the Task tracker refuses with "This task belongs to a closed event, so it is locked" (409).
   - **On screen:** each task carries `locked`; a locked task is marked "Locked: its event is closed." and shows no status choice or "Change" button (brief 28).
2. **A closed year's entry can be corrected by a reversing entry dated today** (O-173, answered as D-219: keep it).
   - Under D-126, a correction is a new entry dated the day it is made. So an entry from a closed year can be reversed by an entry in the open year.
   - The closed year's own entries are untouched, and its statements and totals stay as they were.
   - The owner confirmed it: a correction goes in the current year, and a closed year is never reached back into.
