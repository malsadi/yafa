import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import {
  can,
  listCapabilityDefinitions,
  type AccessGrant,
} from '../../../../src/worker/core/permissions';
import {
  insertGrant,
  insertSystemAdministrator,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ACNV';
const PATH = `${ORIGIN}/api/administration-panel/access-check/people`;

let admin: { clerkUserId: string; personId: string };
let bro: { clerkUserId: string; personId: string; unitId: string };

async function call(clerkUserId: string, path: string) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(path, {
    headers: { Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}` },
  });
}

async function checkOf(
  personId: string,
): Promise<{ grants: AccessGrant[]; currentTerms: { unitId: string }[] }> {
  return (await call(admin.clerkUserId, `${PATH}/${personId}`)).json();
}

describe('access check (brief 25 A4)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'AC1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    bro = await seedOfficer({ suffix: 'AC2', designation: RoleDesignation.BranchRegisterOfficer });
    for (const person of [admin, bro]) await acknowledgeNotice(person.personId, NOTICE);
    await insertGrant(env.DB, {
      id: 'ac-grant',
      roleId: 'designated-branch-register-officer',
      capability: 'committee-register.register.read',
      scope: 'own unit',
    });
  });

  it('reports exactly what can() allows: every grant it lists is allowed, and nothing else', async () => {
    const check = await checkOf(bro.personId);
    const ctx = {
      personId: bro.personId,
      units: [],
      roles: [],
      capabilities: [],
      isSystemAdmin: false,
    };

    expect(check.currentTerms.map((t) => t.unitId)).toEqual([bro.unitId]);
    expect(check.grants).toContainEqual({
      capability: 'committee-register.officers.manage',
      scope: 'own unit',
      unitId: bro.unitId,
      source: 'fixed rule',
    });
    expect(check.grants).toContainEqual({
      capability: 'committee-register.register.read',
      scope: 'own unit',
      unitId: bro.unitId,
      source: 'matrix',
    });
    await buildTestApp();
    for (const { capability } of listCapabilityDefinitions()) {
      const listed = check.grants.some((grant) => grant.capability === capability);
      expect(await can(env.DB, ctx, capability, { unitId: bro.unitId }), capability).toBe(listed);
    }
  });

  it("shows a system administrator's panel powers as coming from being one", async () => {
    const check = await checkOf(admin.personId);

    expect(check.grants.filter((g) => g.source === 'system administrator').length).toBeGreaterThan(
      0,
    );
    expect(check.grants.every((g) => g.capability.startsWith('administration-panel.'))).toBe(true);
  });

  it('refuses an officer without the capability', async () => {
    expect((await call(bro.clerkUserId, PATH)).status).toBe(403);
    expect((await call(bro.clerkUserId, `${PATH}/${admin.personId}`)).status).toBe(403);
  });
});
