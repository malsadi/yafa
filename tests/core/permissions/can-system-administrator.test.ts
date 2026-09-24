import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { PermissionScope } from '../../../src/shared/core/permission-scope';
import {
  can,
  loadRequestContext,
  registerCapability,
  resetCapabilityCatalogueForTests,
  type RequestContext,
} from '../../../src/worker/core/permissions';
import {
  insertPerson,
  insertRole,
  insertSystemAdministrator,
  insertTerm,
  insertUnit,
} from './permission-fixtures';

const ADMIN_CAPABILITY = 'administration-panel.fixture.manage';
const CONTENT_CAPABILITY = 'treasury.fixture.read';
const BRANCH = '01ARZ3NDEKTSV4RRFFQ69SAUB';

function contextFor(personId: string, isSystemAdmin: boolean): RequestContext {
  return { personId, units: [], roles: [], capabilities: [], isSystemAdmin };
}

async function seedPerson(personId: string, clerkUserId: string): Promise<void> {
  await insertUnit(env.DB, { id: BRANCH, type: 'branch', code: 'sa-branch', name: 'x' });
  await insertRole(env.DB, { id: `${personId}R`, name: 'x', unitId: BRANCH });
  await insertPerson(env.DB, { id: personId, email: `${personId}@example.org`, clerkUserId });
  await insertTerm(env.DB, {
    id: `${personId}T`,
    personId,
    roleId: `${personId}R`,
    unitId: BRANCH,
    startDate: '2026-01-01',
  });
}

describe('can — system administrators (D-046)', () => {
  beforeEach(() => {
    resetCapabilityCatalogueForTests();
    for (const capability of [ADMIN_CAPABILITY, CONTENT_CAPABILITY]) {
      registerCapability({
        capability,
        label: 'x',
        description: 'x',
        allowedScopes: [PermissionScope.OwnUnit, PermissionScope.AllUnits],
      });
    }
  });

  it('gives a system administrator every Administration panel capability, with no grant', async () => {
    await seedPerson('01ARZ3NDEKTSV4RRFFQ69SAP1', 'clerk_sa_1');
    await insertSystemAdministrator(env.DB, '01ARZ3NDEKTSV4RRFFQ69SAP1');

    const ctx = contextFor('01ARZ3NDEKTSV4RRFFQ69SAP1', true);

    expect(await can(env.DB, ctx, ADMIN_CAPABILITY, { unitId: BRANCH })).toBe(true);
  });

  it('gives a system administrator no content capability (P22)', async () => {
    await seedPerson('01ARZ3NDEKTSV4RRFFQ69SAP2', 'clerk_sa_2');
    await insertSystemAdministrator(env.DB, '01ARZ3NDEKTSV4RRFFQ69SAP2');

    const ctx = contextFor('01ARZ3NDEKTSV4RRFFQ69SAP2', true);

    expect(await can(env.DB, ctx, CONTENT_CAPABILITY, { unitId: BRANCH })).toBe(false);
  });

  it('never trusts the context flag: only the system administrators table counts', async () => {
    await seedPerson('01ARZ3NDEKTSV4RRFFQ69SAP3', 'clerk_sa_3');

    const forged = contextFor('01ARZ3NDEKTSV4RRFFQ69SAP3', true);

    expect(await can(env.DB, forged, ADMIN_CAPABILITY, { unitId: BRANCH })).toBe(false);
  });

  it('shows the Administration panel capabilities in the context hint for the admin area', async () => {
    await seedPerson('01ARZ3NDEKTSV4RRFFQ69SAP4', 'clerk_sa_4');
    await insertSystemAdministrator(env.DB, '01ARZ3NDEKTSV4RRFFQ69SAP4');

    const result = await loadRequestContext(env.DB, 'clerk_sa_4');

    expect(result.status === 'active' && result.context.capabilities).toEqual([ADMIN_CAPABILITY]);
  });
});
