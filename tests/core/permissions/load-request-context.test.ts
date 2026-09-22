import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { loadRequestContext } from '../../../src/worker/core/permissions';
import { PermissionScope } from '../../../src/shared/core/permission-scope';
import {
  insertGrant,
  insertPerson,
  insertRole,
  insertSystemAdministrator,
  insertTerm,
  insertUnit,
} from './permission-fixtures';

const BRANCH_A = '01ARZ3NDEKTSV4RRFFQ69CTXA';

describe('loadRequestContext', () => {
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
});
