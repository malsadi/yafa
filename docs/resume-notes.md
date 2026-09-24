# Resume notes


**Progress page freshness fixed (D-057, `0848c50`).**

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
2. ~~Lists (15 B3)~~ done (T-088; O-026, O-027 asked). Then handovers (14 C2), which build on the handover checklist items list.
3. The access check (15 A4).
4. The set-up checklist (15 C6).
5. The screens not built yet: A1 system administrators, A2 officer accounts, B1 units, B2 roles and designations, and the register pages in the portal.
6. The seed loader, following D-062: it never invites; a list command, then a confirmed send, only with the owner's yes.

Before resuming, check `docs/decisions.md` for owner answers that arrived in the meantime.
