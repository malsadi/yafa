import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { setSetting } from '../../../../src/worker/core/settings';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const ROLES = `${ORIGIN}/api/committee-register/roles`;
const branchRoles = (unitId: string) => `${ORIGIN}/api/committee-register/branches/${unitId}/roles`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69RLNV';
const ALLOWED = `${ORIGIN}/api/committee-register/branch-roles-allowed`;

let nro: { clerkUserId: string; personId: string };
let bro: { clerkUserId: string; personId: string; unitId: string };
let otherBranch: { unitId: string };

async function active(suffix: string, unitType: 'national' | 'branch', designation?: string) {
  const officer = await seedOfficer({ suffix, unitType, designation });
  await acknowledgeNotice(officer.personId, NOTICE);
  return officer;
}

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

async function allowBranchRoles(value: boolean): Promise<void> {
  await buildTestApp();
  await setSetting(env.DB, {
    key: 'committee-register.branches_may_add_roles',
    value,
    actorPersonId: nro.personId,
  });
}

// Tests build on each other in order within this file's shared storage.
describe('roles (brief 14 B2, 25 B2)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    nro = await active('RL1', 'national', RoleDesignation.NationalRegisterOfficer);
    bro = await active('RL2', 'branch', RoleDesignation.BranchRegisterOfficer);
    otherBranch = await active('RL3', 'branch');
  });

  it('lets the national register officer add and rename standard roles, names unique', async () => {
    const created = await call(nro.clerkUserId, 'POST', ROLES, {
      nameEn: 'Treasurer',
      nameAr: 'أمين الصندوق',
    });
    const role = await created.json<{ id: string }>();
    const duplicate = await call(nro.clerkUserId, 'POST', ROLES, {
      nameEn: 'treasurer',
      nameAr: 'آخر',
    });
    const renamed = await call(nro.clerkUserId, 'PATCH', `${ROLES}/${role.id}`, {
      nameAr: 'أمين المال',
    });

    expect(created.status).toBe(201);
    expect(await duplicate.json()).toEqual({ error: { code: 'roles.name-taken' } });
    expect(await renamed.json()).toMatchObject({ nameEn: 'Treasurer', nameAr: 'أمين المال' });
  });

  it('refuses the standard roles to a branch register officer', async () => {
    expect((await call(bro.clerkUserId, 'POST', ROLES, { nameEn: 'X', nameAr: 'س' })).status).toBe(
      403,
    );
  });

  it('shows the national register officer that whether branches may add roles is not set yet', async () => {
    expect(await (await call(nro.clerkUserId, 'GET', ALLOWED)).json()).toEqual({ allowed: null });
  });

  it('waits for the administrator to decide whether branches may add roles (rule 5)', async () => {
    const res = await call(bro.clerkUserId, 'POST', branchRoles(bro.unitId), {
      nameEn: 'Youth lead',
      nameAr: 'مسؤول الشباب',
    });

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: { code: 'setting.not-configured' } });
  });

  it('refuses branch roles when the administrator has said no', async () => {
    await allowBranchRoles(false);

    const res = await call(bro.clerkUserId, 'POST', branchRoles(bro.unitId), {
      nameEn: 'Youth lead',
      nameAr: 'مسؤول الشباب',
    });

    expect(await res.json()).toEqual({ error: { code: 'roles.branch-roles-not-allowed' } });
  });

  it("lets a branch register officer add their own branch's role once allowed, and no other's", async () => {
    await allowBranchRoles(true);

    const own = await call(bro.clerkUserId, 'POST', branchRoles(bro.unitId), {
      nameEn: 'Youth lead',
      nameAr: 'مسؤول الشباب',
    });
    const other = await call(bro.clerkUserId, 'POST', branchRoles(otherBranch.unitId), {
      nameEn: 'Youth lead',
      nameAr: 'مسؤول الشباب',
    });
    const clash = await call(bro.clerkUserId, 'POST', branchRoles(bro.unitId), {
      nameEn: 'Treasurer',
      nameAr: 'مختلف',
    });
    const list = await (
      await call(bro.clerkUserId, 'GET', branchRoles(bro.unitId))
    ).json<{ nameEn: string }[]>();

    expect(own.status).toBe(201);
    expect(other.status).toBe(403);
    expect(await clash.json()).toEqual({ error: { code: 'roles.name-taken' } });
    expect(list.map((role) => role.nameEn)).toContain('Youth lead');
    expect(list.map((role) => role.nameEn)).toContain('Treasurer');
  });

  it('refuses a new role in an inactive branch (P4)', async () => {
    await env.DB.prepare("UPDATE units SET status = 'inactive' WHERE id = ?")
      .bind(bro.unitId)
      .run();

    const res = await call(nro.clerkUserId, 'POST', branchRoles(bro.unitId), {
      nameEn: 'Events lead',
      nameAr: 'مسؤول الفعاليات',
    });

    expect(await res.json()).toEqual({ error: { code: 'branches.inactive' } });
  });

  it('lets the national register officer, and no one else, set whether branches may add roles (D-073)', async () => {
    const byBro = await call(bro.clerkUserId, 'PUT', ALLOWED, { allowed: false });
    const byNro = await call(nro.clerkUserId, 'PUT', ALLOWED, { allowed: false });
    const history = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM settings_history WHERE key = 'committee-register.branches_may_add_roles' AND changed_by = ?",
    )
      .bind(nro.personId)
      .first<{ n: number }>();

    expect(byBro.status).toBe(403);
    expect((await call(bro.clerkUserId, 'GET', ALLOWED)).status).toBe(403);
    expect(await byNro.json()).toEqual({ allowed: false });
    expect(await (await call(nro.clerkUserId, 'GET', ALLOWED)).json()).toEqual({ allowed: false });
    expect(history?.n).toBeGreaterThan(0);
  });

  it('puts the standard roles in the national register officer’s order, and only theirs (D-071)', async () => {
    const standard = async () =>
      (await (await call(nro.clerkUserId, 'GET', ROLES)).json<{ id: string }[]>()).map((r) => r.id);
    const reversed = [...(await standard())].reverse();
    const order = (who: string, roleIds: string[]) =>
      call(who, 'PUT', `${ROLES}/order`, { roleIds });

    expect((await order(bro.clerkUserId, reversed)).status).toBe(403);
    expect(await (await order(nro.clerkUserId, reversed.slice(1))).json()).toEqual({
      error: { code: 'roles.order-must-name-every-role' },
    });
    expect((await order(nro.clerkUserId, reversed)).status).toBe(204);
    expect(await standard()).toEqual(reversed);
  });

  it('puts a new standard role last', async () => {
    const created = await (
      await call(nro.clerkUserId, 'POST', ROLES, { nameEn: 'Auditor', nameAr: 'المدقق' })
    ).json<{ id: string }>();
    const ids = (await (await call(nro.clerkUserId, 'GET', ROLES)).json<{ id: string }[]>()).map(
      (r) => r.id,
    );

    expect(ids.at(-1)).toBe(created.id);
  });
});
