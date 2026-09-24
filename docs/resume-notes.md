# Resume notes

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

**Waiting on O-021 to O-024:** units and branches (14 A1, 15 B1), roles and designations (14 B2, 15 B2), people and contact details (14 B1), elections (14 C1), invitations and officer accounts (15 A2), then loading `seed/`.

Before resuming, check `docs/decisions.md` for owner answers that arrived in the meantime.
