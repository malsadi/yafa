# Phase 5 report: Task tracker (DRAFT, in progress)

**Status:** Phase 4 approved 2026-09-26 (D-136); Phase 5 is current in CLAUDE.md.

**Brief section 26, Phase 5:** "Branch tasks, My tasks, action list, reminders, history. Table supports `event_id`." Service 9, brief 18.

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** none for Phase 5 in brief 31.
- **Owner inputs:** none for Phase 5 in brief 30.
- **Questions before building** (asked 2026-09-26): O-078 to O-083 in `docs/decisions.md`, "Open".
- **Built meanwhile:** the in-portal inbox (9.5, D-031) and the test-officer script (D-135), which don't depend on them.

## Fictional test officers (D-135)

Created 2026-09-26 by the owner running `npm run e2e:create-test-officers`, in the Clerk development instance only. Clerk sends nothing to these addresses or numbers, and they have no password: they sign in with Clerk's test code.

| Officer | Email | Phone | Clerk id |
|---|---|---|---|
| Fictional Treasurer (test) | e2e.treasurer+clerk_test@example.com | +15555550100 | user_3JsUmOxVoG4j3GuU2ixakLRSfhx |
| Fictional Approver (test) | e2e.approver+clerk_test@example.com | +15555550101 | user_3JsUmXthbqmpiwSAUPRbbeo6ott |
| Fictional Administrator (test) | e2e.administrator+clerk_test@example.com | +15555550102 | user_3JsUmTwwVLqkpkuecDmPsiyoF93 |
| Fictional Officer (test) | e2e.officer+clerk_test@example.com | +15555550103 | user_3JsUmggydo0OYYDIhIVZAVL8X5L |
