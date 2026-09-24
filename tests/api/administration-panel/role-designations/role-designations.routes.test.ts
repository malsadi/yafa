import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  insertRole,
  insertSystemAdministrator,
  insertTerm,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const PATH = `${ORIGIN}/api/administration-panel/role-designations`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69RDNV';
const ROLE_A = '01ARZ3NDEKTSV4RRFFQ69RDRA';
const ROLE_B = '01ARZ3NDEKTSV4RRFFQ69RDRB';
const NRO = 'National register officer';

let admin: { clerkUserId: string; personId: string };
let holder: { clerkUserId: string; personId: string; unitId: string };

async function call(clerkUserId: string, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const designate = (designation: string, roleId: string | null) =>
  call(admin.clerkUserId, 'PUT', PATH, { designation, roleId });

async function holderOf(designation: string): Promise<string | null> {
  const view = await (
    await call(admin.clerkUserId, 'GET', PATH)
  ).json<{
    designations: { designation: string; roleId: string | null }[];
  }>();
  return view.designations.find((d) => d.designation === designation)?.roleId ?? null;
}

// Tests build on each other in order within this file's shared storage.
describe('role designations (brief 7.2, 25 B2)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'RD1', unitType: 'national' });
    await acknowledgeNotice(admin.personId, NOTICE);
    await insertSystemAdministrator(env.DB, admin.personId);
    await insertRole(env.DB, { id: ROLE_A, name: 'Role A' });
    await insertRole(env.DB, { id: ROLE_B, name: 'Role B' });
    holder = await seedOfficer({ suffix: 'RD2', unitType: 'national' });
    await acknowledgeNotice(holder.personId, NOTICE);
    await insertTerm(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69RDTA',
      personId: holder.personId,
      roleId: ROLE_A,
      unitId: holder.unitId,
      startDate: '2026-01-01',
    });
  });

  it("designates a standard role, and its holders gain the role's fixed powers at once", async () => {
    const branches = `${ORIGIN}/api/committee-register/branches`;
    expect((await call(holder.clerkUserId, 'GET', branches)).status).toBe(403);

    expect((await designate(NRO, ROLE_A)).status).toBe(204);

    expect(await holderOf(NRO)).toBe(ROLE_A);
    expect((await call(holder.clerkUserId, 'GET', branches)).status).toBe(200);
  });

  it('never gives one role both designations', async () => {
    const res = await designate('Branch register officer', ROLE_A);

    expect(await res.json()).toEqual({
      error: { code: 'role-designations.role-already-designated' },
    });
  });

  it('moves a designation, clearing the previous holder, audited', async () => {
    await designate(NRO, ROLE_B);
    const audit = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM audit_log WHERE action = 'role-designation.changed'",
    ).first<{ n: number }>();

    expect(await holderOf(NRO)).toBe(ROLE_B);
    expect(audit?.n).toBe(2);
  });

  it("refuses a branch's own role, and clears with null", async () => {
    const branchRole = '01ARZ3NDEKTSV4RRFFQ69RDRC';
    await insertRole(env.DB, { id: branchRole, name: 'Branch role', unitId: holder.unitId });

    expect((await designate(NRO, branchRole)).status).toBe(404);
    expect((await designate(NRO, null)).status).toBe(204);
    expect(await holderOf(NRO)).toBeNull();
  });

  it('refuses an officer without the capability', async () => {
    expect((await call(holder.clerkUserId, 'GET', PATH)).status).toBe(403);
    expect(
      (await call(holder.clerkUserId, 'PUT', PATH, { designation: NRO, roleId: ROLE_A })).status,
    ).toBe(403);
  });
});
