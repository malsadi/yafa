# Phase 12 report: Operations and launch

**Status:** built straight through, as instructed ("proceed with work, until finishing phase 12"). The choices I made for you are in section 4, each marked "(D-213 choice)". Production itself is yours: nothing has been run against it (O-170).

**Brief section 26, Phase 12 (15 D):**
- system health, audit viewer, backups, data import, file housekeeping, maintenance mode;
- a full permission sweep review and a written security review of every route;
- an immutability review;
- a hard-coding review;
- an accessibility and phone layout pass;
- indexes for every list and search, and pagination everywhere;
- production;
- `docs/operations.md`.

## Before starting

- **Questions:** O-161 to O-172, answered 2026-09-28 (D-217). All as recommended, except O-166: opening balances are not imported, and each branch's treasurer enters their own.
- **Your two D-216 changes, built first:**
  - a letter in's link can be corrected while it is open (migration 0055);
  - any ended year's annual report can be started.
- **Owner inputs still to come:**
  - the domain name;
  - the Clerk production instance;
  - the real branches and officers files in `seed/` (O-171).

## 1. What was built, by sub-point

**Stage D: Operations** (Administration panel, six new portal-wide capabilities that system administrators hold, none giving content, P22)
- **D1 System health:**
  - every scheduled job, with its last run and outcome, and "Run again";
  - undelivered phone alerts (by kind only);
  - storage used per unit.

  There is no queue backlog, since that needs an API token (O-168).
- **D2 Audit log:**
  - search by person, service, kind of record, record id and date (London dates), a page at a time;
  - a CSV export of every match;
  - read-only;
  - before and after values only for the panel's own changes, and for units and standard roles (O-167).
- **D3 Backups:**
  - a nightly job dumps every table, row, index and trigger to one SQL file in the backups bucket;
  - "Back up now";
  - a list of backups;
  - backups older than "Backup retention" are removed.

  There is no restore button. Restoring, and D1 Time Travel, are in `docs/operations.md` (O-161, O-162).
- **D4 Data import:**
  - `units.csv`, `people.csv` (current and past terms) and `accounts.csv`;
  - the dry run always comes first, with a validation report;
  - it is safe to run again: units match by code, people by email, terms by person, role, unit and start date, and accounts by unit and name;
  - one batch, with an audit entry.

  Opening balances are not imported (O-166): an imported account offers "Enter the opening balance", once.
- **D5 File housekeeping:** storage per unit, and the objects in the files bucket that have no record, with the orphan age.
- **D6 Maintenance mode:** the portal becomes read-only with a banner. The switch itself always works, so the portal can leave maintenance mode.

**Reviews and launch preparation**
- **Rate limits (brief 12, O-163):** Workers rate limiting in every environment:
  - uploads: 30 a minute per officer;
  - session calls: 60 a minute per officer;
  - the calendar feed: 60 a minute per link;
  - the Clerk webhook: 120 a minute.

  Over the limit, the portal says "Too many requests" in the reader's language.
- **Permission sweep review and security review:** `docs/security-review.md` covers:
  - all 315 routes, by access kind;
  - the service-level check behind each of the 53 routes with no capability;
  - authentication, files, headers, logs and secrets;
  - the D-197 sandbox check and the T-045 hand check;
  - what remains before launch.
- **Immutability review:** every table the brief locks or keeps was checked for its triggers, and every `DELETE` in the Worker was read.
  - **One gap was found and closed:** past officers were kept only by the service. Migration 0057 now refuses to delete a term or a person, or to change an ended term, in the database (T-160).
  - Each locked thing already has route tests trying to change it, from its own phase.
- **Hard-coding review:** two display limits were a fixed 20: the latest undelivered alerts and the latest files with no record. They now use "Rows per page". The other constants are technical and already recorded (T-160). No new setting was needed.
- **Accessibility and phone layout:**
  - the three wide tables scroll inside their own box, so the page never scrolls sideways;
  - on touch screens, every button and field is at least 44px high;
  - every field has a label;
  - layouts use logical properties only (T-160).
- **Indexes and pagination:** every long list is paged by "Rows per page" (O-169). Migration 0056 adds the missing indexes (T-159).
- **Production preparation:**
  - production's bindings and required secrets are in `wrangler.jsonc`, including the R2 signing keys;
  - its database id stays an invalid marker until you create the database, so nothing can be created by accident;
  - `docs/operations.md` covers deploying, restoring (from a backup file or Time Travel), rotating secrets, adding the first officers, and recovering if every administrator loses access.

## 2. Test and lint results

These figures come from the final gate on 2026-09-28. Every step is judged by its exit code.

- **Type check, lint, formatting, build:** pass. No rule is disabled.
- **Tests:** 865 pass in 218 files, none skipped (842 at the end of Phase 11).
- **Permission sweep:** passes (7 tests). Every new route has its entry.
- **Browser journeys:** all 18 runs pass: the 4 sign-ins, then 7 journeys in English and Arabic.
- **Generated documents:** `docs/permissions.md` and `docs/arabic-texts-review.md` are current.

**New checks:**
- **Operations:** maintenance mode and backups; the audit log, health and housekeeping; data import (dry run, re-run and refusals).
- **The rate limiters.**
- **The audit service table**, which must cover every action.
- **The register history triggers.**
- **The paging of every list**, including how each list waits for "Rows per page".

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-216:** Phases 10 and 11 approved, with your two changes, both built.
- **D-217:** O-161 to O-172, as above.

## 4. Choices I made for you (D-213), and what is not finished

**Choices, to confirm or change:**
1. **Imported accounts' opening balance:** "Enter the opening balance" appears once on an imported account with none. It is for those who manage accounts, and dated as any entry may be. This is my reading of O-166.
2. **Audit values:** "the panel's own changes" includes units and standard roles, whose screens live in the panel (brief 25's rules).
3. **Run again:** a job run from System health records its outcome as a scheduled run would.
4. **What counts toward the limits:** for uploads, any request that starts an upload. For sessions, the session and "me" calls.
5. **Import:** a system administrator can't be imported, since they are appointed on the A1 screen. New people start in "Language new officers start with", and the import waits until that is set.
6. **The lists in System health and File housekeeping** show the latest "Rows per page" items, with the full count.
7. **The inbox's unread count** comes from its own call, so the header is right whatever page is shown.
8. **Ended terms:** the database refuses any change to a term whose end date has passed, not only deleting it (T-085's rule).
9. **Touch targets:** 44px on touch screens only. Desktop keeps its current look.

**Not checked here:**
- **The rate-limit bindings on the preview:** the CI deploy that carries them has not been seen to succeed yet.
- **On the preview:** uploading a photo, and generating a real letter PDF. The browser tool here could not start, so I checked both locally instead.
- **Production:** it waits for the domain and your Clerk production instance. The import waits for your real files.

## 5. Questions for the owner

1. **Set on the preview's checklist:** "Rows per page" and "Backup retention (days)". Lists and backups wait until they are set.
2. **File types:** keep each use's "File types" to passive formats (PDF, images, office documents), never HTML or SVG (security review, section 3).
3. **The choices above.**
4. **Phase 12 approval.**
5. **When ready:**
   - the domain;
   - the Clerk production instance;
   - the real files in `seed/`, for a local dry run.
