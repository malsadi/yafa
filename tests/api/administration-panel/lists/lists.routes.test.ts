import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { insertSystemAdministrator } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const PATH = `${ORIGIN}/api/administration-panel/lists`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LSNV';

let admin: { clerkUserId: string; personId: string };
let officer: { clerkUserId: string; personId: string };

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

// Tests build on each other in order within this file's shared storage.
describe('lists (brief 8.2, 25 B3)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'LS1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'LS2' });
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);
  });

  it('starts every list empty, and shows the six fixed archive categories in order', async () => {
    const lists = await (
      await call(admin.clerkUserId, 'GET', PATH)
    ).json<{
      items: unknown[];
      archiveCategories: { nameEn: string }[];
    }>();

    expect(lists.items).toEqual([]);
    expect(lists.archiveCategories.map((c) => c.nameEn)).toEqual([
      'Events',
      'Meetings',
      'Finance',
      'Annual reports',
      'Governance',
      'General',
    ]);
  });

  it('adds an item, audited, with names unique within its list', async () => {
    const res = await call(admin.clerkUserId, 'POST', `${PATH}/event-types/items`, {
      nameEn: 'Fundraiser',
      nameAr: 'حملة تبرعات',
    });
    const duplicate = await call(admin.clerkUserId, 'POST', `${PATH}/event-types/items`, {
      nameEn: 'fundraiser',
      nameAr: 'آخر',
    });
    const otherList = await call(admin.clerkUserId, 'POST', `${PATH}/meeting-types/items`, {
      nameEn: 'Fundraiser',
      nameAr: 'حملة تبرعات',
    });

    expect(res.status).toBe(201);
    expect(await duplicate.json()).toEqual({ error: { code: 'lists.name-taken' } });
    expect(otherList.status).toBe(201);
  });

  it('renames an item, and refuses a list the brief does not name', async () => {
    const lists = await (
      await call(admin.clerkUserId, 'GET', PATH)
    ).json<{ items: { id: string; list: string }[] }>();
    const item = lists.items.find((i) => i.list === 'event-types');

    const renamed = await call(
      admin.clerkUserId,
      'PATCH',
      `${PATH}/event-types/items/${item?.id ?? ''}`,
      { nameAr: 'جمع تبرعات' },
    );
    const unknown = await call(admin.clerkUserId, 'POST', `${PATH}/colours/items`, {
      nameEn: 'Red',
      nameAr: 'أحمر',
    });

    expect(await renamed.json()).toMatchObject({ nameEn: 'Fundraiser', nameAr: 'جمع تبرعات' });
    expect(unknown.status).toBe(400);
  });

  it('refuses an officer without the capability', async () => {
    expect((await call(officer.clerkUserId, 'GET', PATH)).status).toBe(403);
    expect(
      (
        await call(officer.clerkUserId, 'POST', `${PATH}/event-types/items`, {
          nameEn: 'X',
          nameAr: 'س',
        })
      ).status,
    ).toBe(403);
  });

  it('keeps the archive categories fixed in the database', async () => {
    await expect(
      env.DB.prepare("INSERT INTO archive_categories VALUES ('x', 7, 'X', 'س')").run(),
    ).rejects.toThrow(/fixed/);
    await expect(
      env.DB.prepare("UPDATE archive_categories SET name_en = 'X'").run(),
    ).rejects.toThrow(/fixed/);
    await expect(env.DB.prepare('DELETE FROM archive_categories').run()).rejects.toThrow(/fixed/);
  });

  it('adds new items last, and puts a list in the order the administrator sets (D-071)', async () => {
    const add = (nameEn: string, nameAr: string) =>
      call(admin.clerkUserId, 'POST', `${PATH}/equipment-conditions/items`, { nameEn, nameAr });
    const ids: string[] = [];
    for (const [en, ar] of [
      ['New', 'جديد'],
      ['Good', 'جيد'],
      ['Worn', 'مستهلك'],
    ] as const)
      ids.push((await (await add(en, ar)).json<{ id: string }>()).id);
    const names = async () =>
      (
        await (
          await call(admin.clerkUserId, 'GET', PATH)
        ).json<{ items: { list: string; nameEn: string; position: number }[] }>()
      ).items
        .filter((i) => i.list === 'equipment-conditions')
        .map((i) => i.nameEn);
    const order = (itemIds: string[]) =>
      call(admin.clerkUserId, 'PUT', `${PATH}/equipment-conditions/order`, { itemIds });

    expect(await names()).toEqual(['New', 'Good', 'Worn']);
    expect((await order([ids[2] ?? '', ids[0] ?? '', ids[1] ?? ''])).status).toBe(204);
    expect(await names()).toEqual(['Worn', 'New', 'Good']);
    expect(await (await order([ids[0] ?? '', ids[1] ?? ''])).json()).toEqual({
      error: { code: 'lists.order-must-name-every-item' },
    });
    expect(
      (
        await call(officer.clerkUserId, 'PUT', `${PATH}/equipment-conditions/order`, {
          itemIds: ids,
        })
      ).status,
    ).toBe(403);
  });

  it('retires an item once, keeps it, and never deletes it (D-070)', async () => {
    const lists = await (
      await call(admin.clerkUserId, 'GET', PATH)
    ).json<{ items: { id: string; nameEn: string }[] }>();
    const worn = lists.items.find((i) => i.nameEn === 'Worn');
    const retire = () =>
      call(
        admin.clerkUserId,
        'POST',
        `${PATH}/equipment-conditions/items/${worn?.id ?? ''}/retire`,
      );

    expect((await retire()).status).toBe(204);
    expect(await (await retire()).json()).toEqual({
      error: { code: 'lists.item-already-retired' },
    });
    const after = await (
      await call(admin.clerkUserId, 'GET', PATH)
    ).json<{ items: { id: string; retiredAt: string | null }[] }>();
    expect(after.items.find((i) => i.id === worn?.id)?.retiredAt).not.toBeNull();
    await expect(
      env.DB.prepare('DELETE FROM list_items WHERE id = ?').bind(worn?.id).run(),
    ).rejects.toThrow(/never deleted/);
  });

  it('gives a calendar colour a colour, and no other item one (D-076)', async () => {
    const add = (list: string, body: object) =>
      call(admin.clerkUserId, 'POST', `${PATH}/${list}/items`, body);

    expect(
      (await add('calendar-colours', { nameEn: 'Blue', nameAr: 'أزرق', colour: '#1D4ED8' })).status,
    ).toBe(201);
    expect(await (await add('calendar-colours', { nameEn: 'Red', nameAr: 'أحمر' })).json()).toEqual(
      {
        error: { code: 'lists.colour-required' },
      },
    );
    expect(
      await (
        await add('meeting-types', { nameEn: 'AGM', nameAr: 'عمومي', colour: '#000000' })
      ).json(),
    ).toEqual({
      error: { code: 'lists.colour-only-for-calendar-colours' },
    });
    expect(
      (await add('calendar-colours', { nameEn: 'Green', nameAr: 'أخضر', colour: 'green' })).status,
    ).toBe(400);
  });
});
