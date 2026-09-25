import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../src/shared/committee-register/role-designation';
import { PermissionScope } from '../../../src/shared/core/permission-scope';
import {
  getTodayInLondon,
  loadRequestContext,
  registerCapability,
  resetCapabilityCatalogueForTests,
} from '../../../src/worker/core/permissions';
import {
  insertGrant,
  insertPerson,
  insertRole,
  insertSystemAdministrator,
  insertTerm,
  insertUnit,
} from './permission-fixtures';

const BRANCH_A = '01ARZ3NDEKTSV4RRFFQ69CTXA';

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

describe('loadRequestContext', () => {
  // A matrix capability and a fixed one (brief 7.3), as the catalogue holds them.
  beforeAll(() => {
    resetCapabilityCatalogueForTests();
    registerCapability({
      capability: 'treasury.entries.read',
      label: 'Read entries',
      description: 'Fixture.',
      allowedScopes: [PermissionScope.OwnUnit],
    });
    registerCapability({
      capability: 'committee-register.officers.manage',
      label: 'Manage officers',
      description: 'Fixture.',
      allowedScopes: [PermissionScope.OwnUnit],
      fixedGrants: [
        { designation: RoleDesignation.BranchRegisterOfficer, scope: PermissionScope.OwnUnit },
      ],
    });
  });

  it('is not-active for a Clerk user with no linked person', async () => {
    expect(await loadRequestContext(env.DB, 'clerk-unlinked')).toEqual({ status: 'not-active' });
  });

  it('is not-active for a linked person holding no current term', async () => {
    const personId = 'p-no-term';
    await insertPerson(env.DB, {
      id: personId,
      email: `${personId}@example.org`,
      clerkUserId: 'clerk-no-term',
    });

    expect(await loadRequestContext(env.DB, 'clerk-no-term')).toEqual({ status: 'not-active' });
  });

  it("is not-active once a person's only term has ended", async () => {
    const personId = 'p-ended-term';
    await insertUnit(env.DB, { id: BRANCH_A, type: 'branch', code: 'ctx-ended', name: 'Branch A' });
    await insertPerson(env.DB, {
      id: personId,
      email: `${personId}@example.org`,
      clerkUserId: 'clerk-ended',
    });
    await insertRole(env.DB, { id: 'role-ctx-ended', name: 'Treasurer' });
    await insertTerm(env.DB, {
      id: 'term-ctx-ended',
      personId,
      roleId: 'role-ctx-ended',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
      endDate: '2020-06-01',
    });

    expect(await loadRequestContext(env.DB, 'clerk-ended')).toEqual({ status: 'not-active' });
  });

  it("is not-active before a person's only term has started (D-029: fails closed)", async () => {
    const personId = 'p-future-term';
    await insertUnit(env.DB, {
      id: BRANCH_A,
      type: 'branch',
      code: 'ctx-future',
      name: 'Branch A',
    });
    await insertPerson(env.DB, {
      id: personId,
      email: `${personId}@example.org`,
      clerkUserId: 'clerk-future',
    });
    await insertRole(env.DB, { id: 'role-ctx-future', name: 'Treasurer' });
    await insertTerm(env.DB, {
      id: 'term-ctx-future',
      personId,
      roleId: 'role-ctx-future',
      unitId: BRANCH_A,
      startDate: addDays(getTodayInLondon(), 1),
    });

    expect(await loadRequestContext(env.DB, 'clerk-future')).toEqual({ status: 'not-active' });
  });

  it('builds the context from current terms, with capabilities as a flat UI hint', async () => {
    const personId = 'p-active';
    await insertUnit(env.DB, {
      id: BRANCH_A,
      type: 'branch',
      code: 'ctx-active',
      name: 'Branch A',
    });
    await insertPerson(env.DB, {
      id: personId,
      email: `${personId}@example.org`,
      clerkUserId: 'clerk-active',
    });
    await insertRole(env.DB, { id: 'role-ctx-active', name: 'Treasurer' });
    await insertTerm(env.DB, {
      id: 'term-ctx-active',
      personId,
      roleId: 'role-ctx-active',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
    });
    await insertGrant(env.DB, {
      id: 'grant-ctx-active',
      roleId: 'role-ctx-active',
      capability: 'treasury.entries.read',
      scope: PermissionScope.OwnUnit,
    });

    const result = await loadRequestContext(env.DB, 'clerk-active');

    expect(result).toEqual({
      status: 'active',
      context: {
        personId,
        units: [BRANCH_A],
        roles: ['role-ctx-active'],
        capabilities: ['treasury.entries.read'],
        isSystemAdmin: false,
      },
    });
  });

  it('reports isSystemAdmin for a person on the system_administrators list', async () => {
    const personId = 'p-admin';
    await insertUnit(env.DB, { id: BRANCH_A, type: 'branch', code: 'ctx-admin', name: 'Branch A' });
    await insertPerson(env.DB, {
      id: personId,
      email: `${personId}@example.org`,
      clerkUserId: 'clerk-admin',
    });
    await insertRole(env.DB, { id: 'role-ctx-admin', name: 'Administrator' });
    await insertTerm(env.DB, {
      id: 'term-ctx-admin',
      personId,
      roleId: 'role-ctx-admin',
      unitId: BRANCH_A,
      startDate: '2020-01-01',
    });
    await insertSystemAdministrator(env.DB, personId);

    const result = await loadRequestContext(env.DB, 'clerk-admin');

    expect(result.status).toBe('active');
    expect(result.status === 'active' && result.context.isSystemAdmin).toBe(true);
  });

  it('hints a fixed capability from a designated role, never from the matrix (D-072)', async () => {
    const unitId = '01ARZ3NDEKTSV4RRFFQ69CTXF';
    await insertUnit(env.DB, { id: unitId, type: 'branch', code: 'ctx-fixed', name: 'F' });
    for (const [suffix, designation] of [
      ['bro', RoleDesignation.BranchRegisterOfficer],
      ['matrix', undefined],
    ] as const) {
      await insertPerson(env.DB, {
        id: `p-${suffix}`,
        email: `${suffix}@example.org`,
        clerkUserId: `clerk-${suffix}`,
      });
      await insertRole(env.DB, { id: `role-${suffix}`, name: suffix, designation });
      await insertTerm(env.DB, {
        id: `term-${suffix}`,
        personId: `p-${suffix}`,
        roleId: `role-${suffix}`,
        unitId,
        startDate: '2020-01-01',
      });
    }
    await insertGrant(env.DB, {
      id: 'grant-ctx-fixed',
      roleId: 'role-matrix',
      capability: 'committee-register.officers.manage',
      scope: PermissionScope.OwnUnit,
    });
    const hint = async (clerkUserId: string) => {
      const result = await loadRequestContext(env.DB, clerkUserId);
      return result.status === 'active' ? result.context.capabilities : null;
    };

    expect(await hint('clerk-bro')).toEqual(['committee-register.officers.manage']);
    expect(await hint('clerk-matrix')).toEqual([]);
  });
});
