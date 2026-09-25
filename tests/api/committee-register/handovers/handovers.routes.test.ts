import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { insertGrant, insertRole } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69HONV';
const ROLE = '01ARZ3NDEKTSV4RRFFQ69HORL';

interface Person {
  clerkUserId: string;
  personId: string;
  unitId: string;
}
let bro: Person;
let outgoing: Person;
let incoming: Person;
let bystander: Person;
let stranger: Person;
let handoverId = '';

async function call(person: Person, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(`${ORIGIN}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(person.clerkUserId)}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function officerOfBroUnit(suffix: string, takesPart: boolean): Promise<Person> {
  const officer = await seedOfficer({ suffix });
  await acknowledgeNotice(officer.personId, NOTICE);
  const role = takesPart ? ROLE : `01ARZ3NDEKTSV4RRFFQ69AR${suffix}`;
  await env.DB.prepare('UPDATE terms SET unit_id = ?, role_id = ? WHERE person_id = ?')
    .bind(bro.unitId, role, officer.personId)
    .run();
  if (!takesPart)
    await env.DB.prepare('UPDATE roles SET unit_id = NULL WHERE id = ?').bind(role).run();
  return { ...officer, unitId: bro.unitId };
}

interface Handover {
  items: { id: string; tickedAt: string | null }[];
  outgoingConfirmedAt: string | null;
  incomingConfirmedAt: string | null;
}

// Tests build on each other in order within this file's shared storage.
describe('handovers (brief 14 C2, D-067)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    await insertRole(env.DB, { id: ROLE, name: 'Treasurer' });
    await insertGrant(env.DB, {
      id: 'ho-grant',
      roleId: ROLE,
      capability: 'committee-register.handovers.confirm',
      scope: 'own unit',
    });
    bro = await seedOfficer({ suffix: 'HO1', designation: RoleDesignation.BranchRegisterOfficer });
    await acknowledgeNotice(bro.personId, NOTICE);
    outgoing = await officerOfBroUnit('HO2', true);
    incoming = await officerOfBroUnit('HO3', true);
    bystander = await officerOfBroUnit('HO4', false);
    stranger = await seedOfficer({ suffix: 'HO5' });
    await env.DB.prepare(
      "INSERT INTO list_items (id, list, name_en, name_ar, created_at) VALUES ('li-1', 'handover-checklist-items', 'Bank mandate', 'تفويض البنك', 'now')",
    ).run();
  });

  it('sets up a handover between two officers of the unit, its checklist from the list', async () => {
    const refused = await call(
      bro,
      'POST',
      `/api/committee-register/units/${bro.unitId}/handovers`,
      {
        roleId: ROLE,
        outgoingPersonId: outgoing.personId,
        incomingPersonId: stranger.personId,
      },
    );
    const res = await call(bro, 'POST', `/api/committee-register/units/${bro.unitId}/handovers`, {
      roleId: ROLE,
      outgoingPersonId: outgoing.personId,
      incomingPersonId: incoming.personId,
    });
    const handover = await res.json<{ id: string; items: { nameEn: string }[] }>();
    handoverId = handover.id;

    expect(await refused.json()).toEqual({ error: { code: 'handovers.not-officers-of-unit' } });
    expect(res.status).toBe(201);
    expect(handover.items.map((i) => i.nameEn)).toEqual(['Bank mandate']);
  });

  it('lets the register officer add items, and the named officers tick them off', async () => {
    const added = await (
      await call(bro, 'POST', `/api/committee-register/handovers/${handoverId}/items`, {
        nameEn: 'Keys',
        nameAr: 'المفاتيح',
      })
    ).json<Handover>();
    const itemId = added.items[0]?.id ?? '';

    const ticked = await (
      await call(
        outgoing,
        'POST',
        `/api/committee-register/handovers/${handoverId}/items/${itemId}/tick`,
        { ticked: true },
      )
    ).json<Handover>();
    const bystanderTick = await call(
      bystander,
      'POST',
      `/api/committee-register/handovers/${handoverId}/items/${itemId}/tick`,
      { ticked: true },
    );

    expect(added.items).toHaveLength(2);
    expect(ticked.items[0]?.tickedAt).not.toBeNull();
    expect(bystanderTick.status).toBe(403);
  });

  it('fixes the checklist once the first officer confirms, and each confirms once', async () => {
    const first = await (
      await call(outgoing, 'POST', `/api/committee-register/handovers/${handoverId}/confirm`)
    ).json<Handover>();

    expect(first.outgoingConfirmedAt).not.toBeNull();
    expect(
      await (
        await call(bro, 'POST', `/api/committee-register/handovers/${handoverId}/items`, {
          nameEn: 'Late',
          nameAr: 'متأخر',
        })
      ).json(),
    ).toEqual({ error: { code: 'handovers.checklist-fixed' } });
    expect(
      await (
        await call(outgoing, 'POST', `/api/committee-register/handovers/${handoverId}/confirm`)
      ).json(),
    ).toEqual({ error: { code: 'handovers.already-confirmed' } });
    expect(
      (await call(bro, 'POST', `/api/committee-register/handovers/${handoverId}/confirm`)).status,
    ).toBe(403);
  });

  it('completes when the incoming officer confirms, and the database locks it', async () => {
    const done = await (
      await call(incoming, 'POST', `/api/committee-register/handovers/${handoverId}/confirm`)
    ).json<Handover>();

    expect(done.incomingConfirmedAt).not.toBeNull();
    await expect(
      env.DB.prepare('UPDATE handovers SET role_id = role_id WHERE id = ?').bind(handoverId).run(),
    ).rejects.toThrow(/locked/);
    await expect(
      env.DB.prepare('DELETE FROM handovers WHERE id = ?').bind(handoverId).run(),
    ).rejects.toThrow(/never deleted/);
    await expect(
      env.DB.prepare('DELETE FROM handover_items WHERE handover_id = ?').bind(handoverId).run(),
    ).rejects.toThrow(/fixed/);
  });

  it('lists each named officer the handovers they take part in, and no one else (D-067)', async () => {
    const mine = async (person: Person) =>
      (
        await (
          await call(person, 'GET', '/api/committee-register/my-handovers')
        ).json<{ id: string; outgoingName: string; roleNameEn: string }[]>()
      ).map((h) => h.id);

    expect(await mine(outgoing)).toEqual([handoverId]);
    expect(await mine(incoming)).toEqual([handoverId]);
    expect(await mine(bystander)).toEqual([]);
  });

  it('shows the unit its handovers', async () => {
    const list = await (
      await call(bro, 'GET', `/api/committee-register/units/${bro.unitId}/handovers`)
    ).json<{ id: string }[]>();

    expect(list.map((h) => h.id)).toEqual([handoverId]);
  });
});
