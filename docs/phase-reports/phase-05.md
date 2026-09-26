# Phase 5 report: Task tracker

**Status:** approved 2026-09-26 (D-144); the three choices confirmed (D-143).

- **Started:** 2026-09-26, when Phase 4 was approved (D-136).
- **Scope** (brief section 26, Phase 5): "Branch tasks, My tasks, action list, reminders, history. Table supports `event_id`." Service 9, brief 18.

**Before starting:**
- **P-items:** none for Phase 5 in brief 31.
- **Owner inputs:** none for Phase 5 in brief 30.
- **Questions:** O-078 to O-083 were asked and answered, all as recommended (D-137 to D-142).

## 1. What was built, by sub-point

| # | Built | Where recorded |
|---|---|---|
| A1 Create task | A title, optional description, owner and due date, in the unit (D-139). The table carries `event_id`; an event task shows marked as one (its records arrive in Phase 8). | T-139 |
| A2 Assign owner | Chosen from the unit's current officers, and reassigned at any time by those who manage tasks (D-138, D-139). | T-139 |
| A3 Due date | Set at creation, changed at any time. | T-139 |
| A4 Status | To do, In progress, Done or Cancelled, by the brief's names, changed by the owner or a manager (D-137, D-138). A task is never deleted; it is Cancelled (D-140). | T-139 |
| B1 My tasks | Each officer's own tasks, in every unit of theirs, with due soon and overdue highlighted; nothing to grant (D-137). | T-139 |
| B2 Branch action list | All the unit's tasks, filtered by owner and status; the unit's own only, the General Council included (D-141). Filtering by event is in the API and comes to the screen with events (Phase 8). | T-139 |
| B3 Reminders | Daily, in the portal only: before the due date and once overdue, for open tasks, once per due date (D-142). The in-portal inbox they appear in is built too (9.5, D-031). | T-138, T-139 |
| B4 Task history | Who created and changed each task, field by field, from the audit log. | T-139 |

**Brief 18's rules, all held:**
- Event and branch tasks sit in one table.
- Tasks are fully flexible; locking a closed event's tasks comes with events (Phase 8).
- Reminders are in the portal only, with no link to the Communication hub (tested, 10.2).

**Screens:**
- My tasks.
- The action list, with filters, adding and changing tasks.
- Status and history on every task.
- The inbox, with the unread count in the header.
- **Texts:** every text is in English and Arabic. The Arabic ones are drafts for your review.

## 2. Test and lint results

At the Phase 5 commit, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including the file-size and import-boundary rules. No rule is disabled.
- **Formatting:** passes.
- **Tests:** 647 pass, none skipped (628 at the end of Phase 4).
- **Permission sweep:** passes, with the Task tracker's and the inbox's routes in it.
- **Build:** passes.

**New checks:**
- **Immutability:** a task can't be deleted, and a sent reminder can't be changed.
- **Stale saves:** a save made from an older version is refused.
- **10.2:** a structure test shows the Task tracker and its job import nothing from the Communication hub or push, and equipment loans reach no other service. The reminder test shows nothing goes to push.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-134:** the five Phase 4 choices confirmed.
- **D-135:** fictional test officers created (listed below).
- **D-136:** Phase 4 approved.
- **D-137 to D-142:** all as recommended:
  - own tasks with no capability;
  - managers change anything, owners the status;
  - a task has a title, an optional description, an owner and a due date;
  - never deleted, Cancelled instead;
  - each unit sees its own tasks;
  - reminders before the due date and when overdue, again for a new date.

## 4. Uncertain or not finished

**Choices of mine, to confirm or change:**
- A task can move from any status to any other, since the brief calls tasks fully flexible.
- A task keeps its owner after they stop being an officer, and can still be given back to them when changed.
- "Due soon" and the before-due reminder count today in the window.

**Still to try in a real browser:** the end-to-end journeys, now that the test officers exist. They also need matching people and terms in the local database, which the end-to-end setup will create.

## 5. Questions for the owner, and what Phase 6 needs

**Questions:** none open.

**Phase 6 (Calendar):** brief 31 lists no proposals for it, and brief 30 no owner inputs.

## Fictional test officers (D-135)

Created 2026-09-26 by the owner running `npm run e2e:create-test-officers`, in the Clerk development instance only. Clerk sends nothing to these addresses or numbers, and they have no password: they sign in with Clerk's test code.

| Officer | Email | Phone | Clerk id |
|---|---|---|---|
| Fictional Treasurer (test) | e2e.treasurer+clerk_test@example.com | +15555550100 | user_3JsUmOxVoG4j3GuU2ixakLRSfhx |
| Fictional Approver (test) | e2e.approver+clerk_test@example.com | +15555550101 | user_3JsUmXthbqmpiwSAUPRbbeo6ott |
| Fictional Administrator (test) | e2e.administrator+clerk_test@example.com | +15555550102 | user_3JsUmTwwVLqkpkuecDmPsiyoF93 |
| Fictional Officer (test) | e2e.officer+clerk_test@example.com | +15555550103 | user_3JsUmggydo0OYYDIhIVZAVL8X5L |
