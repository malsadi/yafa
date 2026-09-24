import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { insertSystemAdministrator } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const PATH = `${ORIGIN}/api/committee-register/branches`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69BRNV';
const BRANCH = {
  code: 'EX-N',
  nameEn: 'Example North',
  nameAr: 'الشمال التجريبي',
  area: 'Northtown',
  status: 'active',
};

let nro: { clerkUserId: string; personId: string; unitId: string };
let bro: { clerkUserId: string; personId: string };
let admin: { clerkUserId: string; personId: string };

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

describe('branches (brief 14 A1, 25 B1; fixed rule: the national register officer alone)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    nro = await active('BR1', 'national', RoleDesignation.NationalRegisterOfficer);
    bro = await active('BR2', 'branch', RoleDesignation.BranchRegisterOfficer);
    admin = await active('BR3', 'national');
    await insertSystemAdministrator(env.DB, admin.personId);
  });

  it('lets the national register officer add a branch, audited', async () => {
    const res = await call(nro.clerkUserId, 'POST', PATH, BRANCH);
    const unit = await res.json<{ id: string; type: string }>();
    const audit = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM audit_log WHERE action = 'unit.created' AND entity_id = ?",
    )
      .bind(unit.id)
      .first<{ n: number }>();

    expect(res.status).toBe(201);
    expect(unit).toMatchObject({ ...BRANCH, type: 'branch' });
    expect(audit?.n).toBe(1);
  });

  it('refuses a code already in use', async () => {
    const res = await call(nro.clerkUserId, 'POST', PATH, { ...BRANCH, nameEn: 'Another' });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: { code: 'branches.code-taken' } });
  });

  it('changes a branch, including making it inactive (P4)', async () => {
    const list = await (
      await call(nro.clerkUserId, 'GET', PATH)
    ).json<{ id: string; code: string }[]>();
    const branch = list.find((unit) => unit.code === BRANCH.code);

    const res = await call(nro.clerkUserId, 'PATCH', `${PATH}/${branch?.id ?? ''}`, {
      nameAr: 'فرع الشمال',
      status: 'inactive',
    });

    expect(await res.json()).toMatchObject({ nameAr: 'فرع الشمال', status: 'inactive' });
  });

  it('keeps the General Council active and without an area', async () => {
    const inactive = await call(nro.clerkUserId, 'PATCH', `${PATH}/${nro.unitId}`, {
      status: 'inactive',
    });
    const area = await call(nro.clerkUserId, 'PATCH', `${PATH}/${nro.unitId}`, {
      area: 'Anywhere',
    });

    expect(await inactive.json()).toEqual({
      error: { code: 'branches.general-council-always-active' },
    });
    expect(await area.json()).toEqual({ error: { code: 'branches.general-council-has-no-area' } });
  });

  it('refuses a branch register officer and a system administrator (fixed rule, P22)', async () => {
    for (const person of [bro, admin]) {
      expect((await call(person.clerkUserId, 'GET', PATH)).status).toBe(403);
      expect(
        (await call(person.clerkUserId, 'POST', PATH, { ...BRANCH, code: 'EX-X' })).status,
      ).toBe(403);
      expect(
        (await call(person.clerkUserId, 'PATCH', `${PATH}/${nro.unitId}`, { nameEn: 'x' })).status,
      ).toBe(403);
    }
  });
});
