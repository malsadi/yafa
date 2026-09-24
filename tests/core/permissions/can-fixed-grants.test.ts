import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../src/shared/committee-register/role-designation';
import { PermissionScope } from '../../../src/shared/core/permission-scope';
import {
  can,
  registerCapability,
  resetCapabilityCatalogueForTests,
  type RequestContext,
} from '../../../src/worker/core/permissions';
import {
  insertGrant,
  insertPerson,
  insertRole,
  insertTerm,
  insertUnit,
} from './permission-fixtures';

const FIXED = 'committee-register.fixture.manage';
const BRANCH_A = '01ARZ3NDEKTSV4RRFFQ69FGUA';
const BRANCH_B = '01ARZ3NDEKTSV4RRFFQ69FGUB';
const NATIONAL = '01ARZ3NDEKTSV4RRFFQ69FGUN';
const BRO_ROLE = '01ARZ3NDEKTSV4RRFFQ69FGRB';
const NRO_ROLE = '01ARZ3NDEKTSV4RRFFQ69FGRN';
const PLAIN_ROLE = '01ARZ3NDEKTSV4RRFFQ69FGRP';

function ctx(personId: string): RequestContext {
  return { personId, units: [], roles: [], capabilities: [], isSystemAdmin: false };
}

async function officer(personId: string, roleId: string, unitId: string): Promise<void> {
  await insertPerson(env.DB, { id: personId, email: `${personId}@example.org` });
  await insertTerm(env.DB, {
    id: `${personId}T`,
    personId,
    roleId,
    unitId,
    startDate: '2026-01-01',
  });
}

describe('can — fixed grants by role designation (brief 7.3)', () => {
  beforeEach(async () => {
    resetCapabilityCatalogueForTests();
    registerCapability({
      capability: FIXED,
      label: 'x',
      description: 'x',
      allowedScopes: [PermissionScope.OwnUnit, PermissionScope.AllUnits],
      fixedGrants: [
        { designation: RoleDesignation.BranchRegisterOfficer, scope: PermissionScope.OwnUnit },
        { designation: RoleDesignation.NationalRegisterOfficer, scope: PermissionScope.AllUnits },
      ],
    });
    await insertUnit(env.DB, { id: BRANCH_A, type: 'branch', code: 'fg-a', name: 'A' });
    await insertUnit(env.DB, { id: BRANCH_B, type: 'branch', code: 'fg-b', name: 'B' });
    await insertUnit(env.DB, { id: NATIONAL, type: 'national', code: 'fg-n', name: 'N' });
    for (const [id, designation] of [
      [BRO_ROLE, RoleDesignation.BranchRegisterOfficer],
      [NRO_ROLE, RoleDesignation.NationalRegisterOfficer],
      [PLAIN_ROLE, undefined],
    ] as const) {
      const exists = await env.DB.prepare('SELECT 1 FROM roles WHERE id = ?').bind(id).first();
      if (!exists) await insertRole(env.DB, { id, name: id, designation });
    }
  });

  it('gives a branch register officer their own branch only', async () => {
    await officer('01ARZ3NDEKTSV4RRFFQ69FGP1', BRO_ROLE, BRANCH_A);

    expect(await can(env.DB, ctx('01ARZ3NDEKTSV4RRFFQ69FGP1'), FIXED, { unitId: BRANCH_A })).toBe(
      true,
    );
    expect(await can(env.DB, ctx('01ARZ3NDEKTSV4RRFFQ69FGP1'), FIXED, { unitId: BRANCH_B })).toBe(
      false,
    );
  });

  it('gives the national register officer every branch', async () => {
    await officer('01ARZ3NDEKTSV4RRFFQ69FGP2', NRO_ROLE, NATIONAL);

    expect(await can(env.DB, ctx('01ARZ3NDEKTSV4RRFFQ69FGP2'), FIXED, { unitId: BRANCH_B })).toBe(
      true,
    );
  });

  it('ignores a matrix grant for a fixed capability', async () => {
    await officer('01ARZ3NDEKTSV4RRFFQ69FGP3', PLAIN_ROLE, BRANCH_A);
    await insertGrant(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69FGG1',
      roleId: PLAIN_ROLE,
      capability: FIXED,
      scope: PermissionScope.AllUnits,
    });

    expect(await can(env.DB, ctx('01ARZ3NDEKTSV4RRFFQ69FGP3'), FIXED, { unitId: BRANCH_A })).toBe(
      false,
    );
  });

  it('refuses to register a fixed grant at a scope the capability does not allow', () => {
    expect(() => {
      registerCapability({
        capability: 'committee-register.fixture.other',
        label: 'x',
        description: 'x',
        allowedScopes: [PermissionScope.OwnUnit],
        fixedGrants: [
          { designation: RoleDesignation.NationalRegisterOfficer, scope: PermissionScope.AllUnits },
        ],
      });
    }).toThrow(/not allowed/);
  });
});
