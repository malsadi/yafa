import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  can,
  getTodayInLondon,
  registerCapability,
  resetCapabilityCatalogueForTests,
} from '../../../src/worker/core/permissions';
import { PermissionScope } from '../../../src/shared/core/permission-scope';
import {
  insertGrant,
  insertPerson,
  insertRole,
  insertSystemAdministrator,
  insertTerm,
  insertUnit,
} from './permission-fixtures';

const BRANCH_A = '01ARZ3NDEKTSV4RRFFQ69UNAA';
const BRANCH_B = '01ARZ3NDEKTSV4RRFFQ69UNAB';
const NATIONAL = '01ARZ3NDEKTSV4RRFFQ69NATL';
const CAPABILITY = 'treasury.entries.read';

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function setUpUnitsAndPerson(personId: string): Promise<void> {
  await insertUnit(env.DB, {
    id: BRANCH_A,
    type: 'branch',
    code: 'can-test-branch-a',
    name: 'Branch A',
  });
  await insertUnit(env.DB, {
    id: BRANCH_B,
    type: 'branch',
    code: 'can-test-branch-b',
    name: 'Branch B',
  });
  await insertUnit(env.DB, {
    id: NATIONAL,
    type: 'national',
    code: 'can-test-national',
    name: 'GC',
  });
  await insertPerson(env.DB, { id: personId, email: `${personId}@example.org` });
}

describe('can', () => {
  beforeEach(() => {
    resetCapabilityCatalogueForTests();
    registerCapability({
      capability: CAPABILITY,
      label: 'Read entries',
      description: 'x',
      allowedScopes: [
        PermissionScope.OwnUnit,
        PermissionScope.AllUnits,
        PermissionScope.NationalContent,
      ],
    });
  });

  it('throws on a capability that is not registered', async () => {
    const ctx = {
      personId: 'nobody',
      units: [],
      roles: [],
      capabilities: [],
      isSystemAdmin: false,
    };
    await expect(can(env.DB, ctx, 'not.in.catalogue', { unitId: BRANCH_A })).rejects.toThrow();
  });

  it('is false when the person holds no grant for the capability at all', async () => {
    const personId = 'p-no-grants';
    await setUpUnitsAndPerson(personId);
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };

    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_A })).toBe(false);
  });

  it('does not leak a capability into a unit granted by a different current term', async () => {
    // The discriminating case: one person, two terms in two units under two
    // roles, the capability granted only to the Branch A role. Branch B
    // must not inherit it just because the same person also serves there.
    const personId = 'p-two-terms';
    await setUpUnitsAndPerson(personId);
    await insertRole(env.DB, { id: 'role-treasurer-a', name: 'Treasurer' });
    await insertRole(env.DB, { id: 'role-secretary-b', name: 'Secretary' });
    await insertTerm(env.DB, {
      id: 'term-a',
      personId,
      roleId: 'role-treasurer-a',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
    });
    await insertTerm(env.DB, {
      id: 'term-b',
      personId,
      roleId: 'role-secretary-b',
      unitId: BRANCH_B,
      startDate: '2020-01-01',
    });
    await insertGrant(env.DB, {
      id: 'grant-a',
      roleId: 'role-treasurer-a',
      capability: CAPABILITY,
      scope: PermissionScope.OwnUnit,
    });
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };

    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_A })).toBe(true);
    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_B })).toBe(false);
  });

  it('all units scope covers a unit the person holds no term in', async () => {
    const personId = 'p-all-units';
    await setUpUnitsAndPerson(personId);
    await insertRole(env.DB, { id: 'role-national-officer', name: 'National register officer' });
    await insertTerm(env.DB, {
      id: 'term-national',
      personId,
      roleId: 'role-national-officer',
      unitId: NATIONAL,
      startDate: '2020-01-01',
    });
    await insertGrant(env.DB, {
      id: 'grant-all',
      roleId: 'role-national-officer',
      capability: CAPABILITY,
      scope: PermissionScope.AllUnits,
    });
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };

    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_B })).toBe(true);
  });

  it('national content scope covers only the national unit', async () => {
    const personId = 'p-national-content';
    await setUpUnitsAndPerson(personId);
    await insertRole(env.DB, { id: 'role-gc-officer', name: 'GC officer' });
    await insertTerm(env.DB, {
      id: 'term-gc',
      personId,
      roleId: 'role-gc-officer',
      unitId: NATIONAL,
      startDate: '2020-01-01',
    });
    await insertGrant(env.DB, {
      id: 'grant-national-content',
      roleId: 'role-gc-officer',
      capability: CAPABILITY,
      scope: PermissionScope.NationalContent,
    });
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };

    expect(await can(env.DB, ctx, CAPABILITY, { unitId: NATIONAL })).toBe(true);
    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_A })).toBe(false);
  });

  it('excludes a past term (end_date today or earlier — D-019)', async () => {
    const personId = 'p-past-term';
    await setUpUnitsAndPerson(personId);
    await insertRole(env.DB, { id: 'role-ended', name: 'Treasurer' });
    const today = getTodayInLondon();
    await insertTerm(env.DB, {
      id: 'term-ended-today',
      personId,
      roleId: 'role-ended',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
      endDate: today,
    });
    await insertGrant(env.DB, {
      id: 'grant-ended',
      roleId: 'role-ended',
      capability: CAPABILITY,
      scope: PermissionScope.OwnUnit,
    });
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };

    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_A })).toBe(false);
  });

  it('includes a term ending tomorrow, and one with no end date', async () => {
    const personId = 'p-still-current';
    await setUpUnitsAndPerson(personId);
    await insertRole(env.DB, { id: 'role-ending-soon', name: 'Treasurer' });
    await insertRole(env.DB, { id: 'role-open-ended', name: 'Secretary' });
    const tomorrow = addDays(getTodayInLondon(), 1);
    await insertTerm(env.DB, {
      id: 'term-ending-soon',
      personId,
      roleId: 'role-ending-soon',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
      endDate: tomorrow,
    });
    await insertTerm(env.DB, {
      id: 'term-open-ended',
      personId,
      roleId: 'role-open-ended',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
    });
    await insertGrant(env.DB, {
      id: 'grant-ending-soon',
      roleId: 'role-ending-soon',
      capability: CAPABILITY,
      scope: PermissionScope.OwnUnit,
    });
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };

    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_A })).toBe(true);
  });

  it('gives a system administrator no automatic access to content (no isSystemAdmin shortcut)', async () => {
    const personId = 'p-admin-no-grants';
    await setUpUnitsAndPerson(personId);
    await insertSystemAdministrator(env.DB, personId);
    // No term, no grant at all — an administrator with zero permissions matrix entries.
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: true };

    expect(await can(env.DB, ctx, CAPABILITY, { unitId: BRANCH_A })).toBe(false);
  });

  it('ignores a grant stored at a scope the capability catalogue does not allow (T-048)', async () => {
    const restrictedCapability = 'treasury.entries.approve';
    registerCapability({
      capability: restrictedCapability,
      label: 'Approve entry',
      description: 'x',
      allowedScopes: [PermissionScope.OwnUnit],
    });
    const personId = 'p-scope-not-allowed';
    await setUpUnitsAndPerson(personId);
    await insertRole(env.DB, { id: 'role-over-scoped', name: 'Treasurer' });
    await insertTerm(env.DB, {
      id: 'term-over-scoped',
      personId,
      roleId: 'role-over-scoped',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
    });
    // Stored at "all units", which restrictedCapability's catalogue entry does not allow.
    await insertGrant(env.DB, {
      id: 'grant-over-scoped',
      roleId: 'role-over-scoped',
      capability: restrictedCapability,
      scope: PermissionScope.AllUnits,
    });
    const ctx = { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };

    expect(await can(env.DB, ctx, restrictedCapability, { unitId: BRANCH_B })).toBe(false);
  });
});
