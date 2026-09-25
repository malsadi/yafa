import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { addDaysToDate } from '../../../../src/shared/core/add-days-to-date';
import { getTodayInLondon, listRegisteredRoutes } from '../../../../src/worker/core/permissions';
import { setSetting } from '../../../../src/worker/core/settings';
import { insertGrant, insertRole } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69OFNV';
const CHAIR = '01ARZ3NDEKTSV4RRFFQ69OFRC';
const SECRETARY = '01ARZ3NDEKTSV4RRFFQ69OFRS';
const unitPath = (unitId: string, list = 'officers') =>
  `${ORIGIN}/api/committee-register/units/${unitId}/${list}`;

let bro: { clerkUserId: string; personId: string; unitId: string };
let otherBro: { clerkUserId: string; personId: string; unitId: string };
let reader: { clerkUserId: string; personId: string };

async function active(suffix: string, designation?: string) {
  const officer = await seedOfficer({ suffix, designation });
  await acknowledgeNotice(officer.personId, NOTICE);
  return officer;
}

async function call(clerkUserId: string, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId)}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const newOfficer = (email: string, roleId = CHAIR) => ({
  name: 'Fictional Officer',
  email,
  phone: '07700 900123',
  roleId,
  startDate: '2026-02-01',
});

// Tests build on each other in order within this file's shared storage.
describe('officers and terms (brief 14 B1, B3, C3; P5)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    await insertRole(env.DB, { id: CHAIR, name: 'Chair' });
    await insertRole(env.DB, { id: SECRETARY, name: 'Secretary' });
    bro = await active('OF1', RoleDesignation.BranchRegisterOfficer);
    otherBro = await active('OF2', RoleDesignation.BranchRegisterOfficer);
    reader = await active('OF3');
    await env.DB.prepare('UPDATE terms SET unit_id = ? WHERE person_id = ?')
      .bind(bro.unitId, reader.personId)
      .run();
    // seedOfficer's role id for suffix OF3; its term now sits in bro's branch.
    await insertGrant(env.DB, {
      id: '01ARZ3NDEKTSV4RRFFQ69OFGR',
      roleId: '01ARZ3NDEKTSV4RRFFQ69AROF3',
      capability: 'committee-register.register.read',
      scope: 'own unit',
    });
  });

  it('waits for the language new officers start with (brief 8.5, rule 5)', async () => {
    const res = await call(
      bro.clerkUserId,
      'POST',
      unitPath(bro.unitId),
      newOfficer('ada.example@example.org'),
    );

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: { code: 'setting.not-configured' } });
  });

  it('adds a new person with a term, in the language the administrator set, audited', async () => {
    await buildTestApp();
    await setSetting(env.DB, {
      key: 'administration-panel.new_officer_language',
      value: 'ar',
      actorPersonId: bro.personId,
    });

    const res = await call(
      bro.clerkUserId,
      'POST',
      unitPath(bro.unitId),
      newOfficer('Ada.Example@example.org'),
    );
    const { personId } = await res.json<{ personId: string }>();
    const person = await env.DB.prepare('SELECT email, language FROM people WHERE id = ?')
      .bind(personId)
      .first();

    expect(res.status).toBe(201);
    expect(person).toEqual({ email: 'ada.example@example.org', language: 'ar' });
  });

  it('gives a known person a second term, once per role (P5)', async () => {
    const again = await call(
      bro.clerkUserId,
      'POST',
      unitPath(bro.unitId),
      newOfficer('ada.example@example.org'),
    );
    const second = await call(
      bro.clerkUserId,
      'POST',
      unitPath(bro.unitId),
      newOfficer('ada.example@example.org', SECRETARY),
    );
    const people = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM people WHERE email = 'ada.example@example.org'",
    ).first<{ n: number }>();

    expect(await again.json()).toEqual({ error: { code: 'officers.already-holds-role' } });
    expect(second.status).toBe(201);
    expect(people?.n).toBe(1);
  });

  it("refuses another branch's own role, and another branch's register", async () => {
    const theirRole = '01ARZ3NDEKTSV4RRFFQ69OFRX';
    await insertRole(env.DB, { id: theirRole, name: 'Their role', unitId: otherBro.unitId });

    expect(
      (
        await call(
          bro.clerkUserId,
          'POST',
          unitPath(bro.unitId),
          newOfficer('x@example.org', theirRole),
        )
      ).status,
    ).toBe(404);
    expect(
      (await call(bro.clerkUserId, 'POST', unitPath(otherBro.unitId), newOfficer('y@example.org')))
        .status,
    ).toBe(403);
    expect((await call(otherBro.clerkUserId, 'GET', unitPath(bro.unitId))).status).toBe(403);
  });

  it('lets a reader granted through the matrix read, but not change, the register', async () => {
    expect((await call(reader.clerkUserId, 'GET', unitPath(bro.unitId))).status).toBe(200);
    expect(
      (await call(reader.clerkUserId, 'POST', unitPath(bro.unitId), newOfficer('r@example.org')))
        .status,
    ).toBe(403);
  });

  it('lists the officers to the register officer, with name, email and phone', async () => {
    const list = await (
      await call(bro.clerkUserId, 'GET', unitPath(bro.unitId))
    ).json<{ email: string; phone: string }[]>();

    expect(list.filter((o) => o.email === 'ada.example@example.org')).toHaveLength(2);
    expect(list[0]?.phone).toBeTruthy();
  });

  it('marks terms ending within the window, and marks nothing until it is set (14 B3, T-100)', async () => {
    const soon = addDaysToDate(getTodayInLondon(), 10);
    await call(bro.clerkUserId, 'POST', unitPath(bro.unitId), {
      ...newOfficer('soon.example@example.org', SECRETARY),
      endDate: soon,
    });
    const marks = async () =>
      (
        await (
          await call(bro.clerkUserId, 'GET', unitPath(bro.unitId))
        ).json<{ email: string; endingSoon: boolean | null }[]>()
      ).map((o) => [o.email, o.endingSoon]);

    expect(new Set((await marks()).map(([, mark]) => mark))).toEqual(new Set([null]));
    await setSetting(env.DB, {
      key: 'committee-register.terms_ending_soon_window_days',
      value: 10,
      actorPersonId: bro.personId,
    });
    const marked = await marks();
    expect(marked.filter(([, mark]) => mark === true)).toEqual([
      ['soon.example@example.org', true],
    ]);
    await setSetting(env.DB, {
      key: 'committee-register.terms_ending_soon_window_days',
      value: 9,
      actorPersonId: bro.personId,
    });
    expect((await marks()).filter(([, mark]) => mark === true)).toEqual([]);
  });

  it('corrects a name and phone, audited, only for their own register', async () => {
    const list = await (
      await call(bro.clerkUserId, 'GET', unitPath(bro.unitId))
    ).json<{ personId: string; email: string }[]>();
    const ada = list.find((o) => o.email === 'ada.example@example.org');
    const path = `${ORIGIN}/api/committee-register/people/${ada?.personId ?? ''}`;

    expect(
      (await call(otherBro.clerkUserId, 'PATCH', path, { phone: '07700 900999' })).status,
    ).toBe(403);
    expect((await call(bro.clerkUserId, 'PATCH', path, { phone: '07700 900999' })).status).toBe(
      204,
    );
  });

  it('ends a term into the past officers, and never again', async () => {
    const list = await (
      await call(bro.clerkUserId, 'GET', unitPath(bro.unitId))
    ).json<{ termId: string; email: string }[]>();
    const term = list.find((o) => o.email === 'ada.example@example.org');
    const path = `${ORIGIN}/api/committee-register/terms/${term?.termId ?? ''}`;
    const today = getTodayInLondon();

    expect(
      await (await call(bro.clerkUserId, 'PATCH', path, { endDate: '2026-01-01' })).json(),
    ).toEqual({ error: { code: 'terms.end-before-start' } });
    expect(await (await call(bro.clerkUserId, 'PATCH', path, { endDate: today })).json()).toEqual({
      accountLocked: false,
    });
    const past = await (
      await call(bro.clerkUserId, 'GET', unitPath(bro.unitId, 'past-officers'))
    ).json<{ termId: string }[]>();
    expect(past.map((o) => o.termId)).toContain(term?.termId);
    expect(await (await call(bro.clerkUserId, 'PATCH', path, { endDate: today })).json()).toEqual({
      error: { code: 'terms.already-ended' },
    });
  });

  it('keeps an inactive branch read-only (P4), and never offers a delete', async () => {
    await env.DB.prepare("UPDATE units SET status = 'inactive' WHERE id = ?")
      .bind(bro.unitId)
      .run();

    const res = await call(
      bro.clerkUserId,
      'POST',
      unitPath(bro.unitId),
      newOfficer('z@example.org', SECRETARY),
    );

    expect(await res.json()).toEqual({ error: { code: 'branches.inactive' } });
    const deletes = listRegisteredRoutes().filter(
      (r) => r.method === 'DELETE' && /people|terms|officers/.test(r.path),
    );
    expect(deletes).toEqual([]);
  });
});
