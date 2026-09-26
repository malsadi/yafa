# Resume notes


**The public progress page was removed on 2026-09-25 at the owner's request (D-069).**

## Phase 1: where it stands (paused 2026-09-24 for the progress page redesign)

**Done in Phase 1 so far:**
- The start-of-phase checks: P1, P3, P4, P5, P21 and P22 are confirmed (D-042).
- `docs/seed-files.md`: the three seed files, field by field.
- Four open questions raised: O-021 (role names, one language or two), O-022 (contact details), O-023 (unit names, one language or two), O-024 (what an election result records).
- `docs/phase-reports/phase-01.md` drafted, with its progress summary.

**No Phase 1 code has been written yet.** The last Phase 1 commit is `e6b4fdb`. Nothing is half-built.

**Next, in this order.** These are the parts that don't depend on O-021 to O-024:
1. The Phase 1 capability catalogue entries, and `docs/permissions.md` (names and meanings, no role assignments).
2. System administrators (15 A1): appoint and remove, with P21 (the last two can't be removed) enforced in the service and by a database trigger.
3. The permissions matrix (15 A3): roles × capabilities × scope, fixed rules shown locked, every change versioned and restorable. Then the access check (15 A4).
4. Lists (15 B3): event types, meeting types, achievement categories, equipment conditions, handover checklist items. They start empty; archive categories are fixed.
5. Handovers (14 C2), built on the handover checklist list.
6. The set-up checklist (15 C6).

**No longer waiting (2026-09-24):**
- O-021 to O-024 are answered (D-052 to D-055), so units, roles and designations, people with email and phone, elections with vote counts, invitations and officer accounts can all be built.
- D-046: system administrators hold every Administration panel capability.
- D-051: the first privacy notice comes in the seed files.
- Only loading `seed/` waits, for the owner's files (spec in `docs/seed-files.md`).

**Step 1a done (T-074):** role designations (a `designation` column on `roles`; values are the brief's exact labels) and fixed grants in the capability catalogue, so `can()` honours the brief section 7.3 fixed rules by designation, and the matrix editor shows them locked. **Step 1b done (T-075):** the Phase 1 capabilities (committee register: fixed, by designation, per brief 7.3 and 14's "Who does what"; election confirmation and register reading: matrix; Administration panel: D-046), registered from `src/shared/<service>/capabilities.ts`, and `docs/permissions.md` generated from the catalogue and kept in step by a test.

**Step 2a done (T-076):** system administrators' API: appoint, list, remove, with P21 in the service and a trigger.

**Step 2b done (T-077):** system administrators need a second factor, gated in the session.

**Step 3a done (T-078):** the permissions matrix API: versioned, restorable, fixed rules locked, races refused in SQL.

**Step 3b done (T-079):** the matrix screen at `/admin/access-and-permissions/permissions-matrix`.

**Reordered, agreed with the owner 2026-09-24:** the register core comes before the access check, so pickers can show names.

**Step 4a done (T-080):** the units and people schema.

**Step 4b done (T-081):** the branches API.

**Step 4c done (T-082):** roles, standard and branch.

**Step 4d done (T-083):** role designations.

**Step 4e done (T-085):** officers, people and terms, past officers.

**Step 4f done (T-086):** invitations and account states.

**Step 4g done (T-087):** account actions and the automatic lock. O-025 asked (future-dated term ends).

**D-062 applies to the seed loader:** it never invites. A separate list command, then a confirmed send, only with the owner's yes.

**Next, in order:**
1. Elections come after items 2–4, per D-066's order. Answers are recorded in D-066.
2. ~~Lists (15 B3)~~ done (T-088; O-026, O-027 asked). ~~Handovers (14 C2)~~ done (T-089, D-067).
3. ~~The access check (15 A4)~~ done (T-090).
4. ~~The set-up checklist (15 C6)~~ done (T-091). ~~Elections~~ done (T-092).
5. ~~Admin screens~~ done 2026-09-25: A1 (T-093), A2 (T-094), A4 (T-095), B1 (T-096), B2 (T-097), B3 (T-098), C6 (T-099). O-028, O-029 and O-030 asked.
   ~~Register pages~~ done 2026-09-25 (T-100 to T-107), and the A2 link.
6. ~~Seed loader~~ built 2026-09-25 (T-108). Not run: waits for the owner's files, O-030 and O-031.
7. **Phase 1 report written** (`docs/phase-reports/phase-01.md`). O-026 to O-032 were answered on 2026-09-25 (D-070 to D-077) and built (T-109 to T-114). Waiting for the owner's review, the seed files, and approval of Phase 2 in CLAUDE.md. Don't start Phase 2 until then.

Before resuming, check `docs/decisions.md` for owner answers that arrived in the meantime.

## Phase 2: where it stands (2026-09-26)

- **Phase 1 approved** (D-078). Phase 2 is current in CLAUDE.md, and P23 is confirmed (D-079).
- **Owner answers:** O-033 to O-038, recorded as D-079 to D-084 (fonts uploaded, one fixed letterhead design, main and accent colours with contrast checked against white, one help text per language on a Help page, a separate square icon).
- **Done:** C1 to C5 (T-116 to T-124), the file layer brought forward from Phase 3 (T-122, D-087), and the Phase 2 report (`docs/phase-reports/phase-02.md`).
- **Waiting on the owner:**
  - the review of Phase 2;
  - the R2 API token and three secrets for uploads on the preview;
  - the go-ahead to apply `r2/cors-preview.json` to the preview bucket;
  - approval of Phase 3 in CLAUDE.md, and P2, P19 and P20 before it starts.
