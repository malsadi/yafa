import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EquipmentView } from '../../../src/shared/resources-library/equipment';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call } from '../documents-archive/archive-fixtures';
import { libraryOfficer, type Officer } from './library-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LQNV';
const READ = 'resources-library.library.read';
const MANAGE = 'resources-library.equipment.manage';
let national: Officer;
let branch: Officer;

const equipment = (unitId: string) => `/api/resources-library/units/${unitId}/equipment`;
const view = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', equipment(o.unitId))).json<EquipmentView>();
const LOAN = {
  borrower: 'A. Borrower',
  quantity: 3,
  borrowedOn: '2026-09-01',
  dueBack: '2026-09-10',
};

describe('equipment and loans (brief 16 C1, C2; P20; D-099, D-106, D-108, D-109)', () => {
  let itemPath = '';

  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    await env.DB.prepare(
      `INSERT INTO list_items (id, list, name_en, name_ar, position, retired_at, colour, created_at)
       VALUES ('cond-good', 'equipment-conditions', 'Good', 'جيد', 1, NULL, NULL, '2026-01-01')`,
    ).run();
    national = await libraryOfficer({
      suffix: 'LQ1',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [READ, MANAGE],
    });
    branch = await libraryOfficer({ suffix: 'LQ2', notice: NOTICE, capabilities: [READ] });
    const res = await call(national.clerkUserId, 'POST', equipment(national.unitId), {
      item: 'Folding chairs',
      quantity: 5,
      location: 'Store room',
      conditionId: 'cond-good',
    });
    expect(res.status).toBe(201);
    itemPath = `${equipment(national.unitId)}/${(await res.json<{ id: string }>()).id}`;
  });

  it('refuses a condition the list does not offer', async () => {
    const res = await call(national.clerkUserId, 'POST', equipment(national.unitId), {
      item: 'Tables',
      quantity: 1,
      location: 'Hall',
      conditionId: 'made-up',
    });
    expect(res.status).toBe(409);
  });

  it('lends up to what is left, and refuses more, saying the numbers (D-108)', async () => {
    expect((await call(national.clerkUserId, 'POST', `${itemPath}/loans`, LOAN)).status).toBe(201);
    const over = await call(national.clerkUserId, 'POST', `${itemPath}/loans`, {
      ...LOAN,
      quantity: 3,
    });
    expect(over.status).toBe(409);
    expect(await over.json()).toEqual({
      error: {
        code: 'resources-library.over-lent',
        values: { requested: 3, quantity: 5, out: 3, left: 2 },
      },
    });
    const early = await call(national.clerkUserId, 'POST', `${itemPath}/loans`, {
      ...LOAN,
      quantity: 1,
      dueBack: '2026-08-01',
    });
    expect(early.status).toBe(400);
  });

  it('refuses lowering the quantity below what is out on loan (D-108)', async () => {
    const res = await call(national.clerkUserId, 'PUT', itemPath, {
      version: 1,
      equipment: {
        item: 'Folding chairs',
        quantity: 2,
        location: 'Store room',
        conditionId: 'cond-good',
      },
    });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: { code: 'resources-library.below-loans', values: { quantity: 2, out: 3 } },
    });
  });

  it('shows what is out; who borrowed only to the unit that owns the item (D-099, D-106)', async () => {
    const own = (await view(national)).items[0];
    expect(own).toMatchObject({ outOnLoan: 3, conditionNameEn: 'Good' });
    expect(own?.loans).toMatchObject([{ borrower: 'A. Borrower', quantity: 3, returnedOn: null }]);
    const shared = (await view(branch)).items[0];
    expect(shared).toMatchObject({ national: true, outOnLoan: 3, loans: null });
  });

  it('corrects a loan until its return, keeping each state; a returned loan is fixed (D-109)', async () => {
    const loan = (await view(national)).items[0]?.loans?.[0];
    const one = `${itemPath}/loans/${loan?.id ?? ''}`;
    expect(
      (await call(national.clerkUserId, 'PUT', one, { version: 1, loan: { ...LOAN, quantity: 4 } }))
        .status,
    ).toBe(204);
    expect(
      (await call(national.clerkUserId, 'PUT', one, { version: 1, loan: { ...LOAN, quantity: 2 } }))
        .status,
    ).toBe(409);
    expect(
      (
        await call(national.clerkUserId, 'POST', `${one}/return`, {
          version: 2,
          returnedOn: '2026-08-30',
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await call(national.clerkUserId, 'POST', `${one}/return`, {
          version: 2,
          returnedOn: '2026-09-09',
        })
      ).status,
    ).toBe(204);
    const closed = (await view(national)).items[0];
    expect(closed?.outOnLoan).toBe(0);
    expect(closed?.loans?.[0]?.history.map((h) => [h.change, h.quantity, h.returnedOn])).toEqual([
      ['lent', 3, null],
      ['corrected', 4, null],
      ['returned', 4, '2026-09-09'],
    ]);
    const res = await call(national.clerkUserId, 'PUT', one, { version: 3, loan: LOAN });
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: { code: 'resources-library.loan-returned' } });
  });

  it('never deletes a loan or its history, never changes a returned one, and never lends beyond stock in the database', async () => {
    const loanId = (await view(national)).items[0]?.loans?.[0]?.id ?? '';
    const run = (sql: string) => env.DB.prepare(sql).bind(loanId).run();
    await expect(run('DELETE FROM library_equipment_loans WHERE id = ?')).rejects.toThrow(
      /never deleted/,
    );
    await expect(
      run("UPDATE library_equipment_loans SET borrower = 'x', version = version + 1 WHERE id = ?"),
    ).rejects.toThrow(/fixed/);
    await expect(
      run('DELETE FROM library_equipment_loan_history WHERE loan_id = ?'),
    ).rejects.toThrow(/never deleted/);
    await expect(
      run("UPDATE library_equipment_loan_history SET borrower = 'x' WHERE loan_id = ?"),
    ).rejects.toThrow(/never changed/);
    const equipmentId = itemPath.split('/').pop() ?? '';
    await expect(
      env.DB.prepare(
        `INSERT INTO library_equipment_loans (id, equipment_id, unit_id, borrower, quantity, borrowed_on, due_back, returned_on, version, created_by, created_at, updated_by, updated_at)
         VALUES ('too-many', ?, ?, 'B', 6, '2026-09-01', '2026-09-02', NULL, 1, 'p', 'now', 'p', 'now')`,
      )
        .bind(equipmentId, national.unitId)
        .run(),
    ).rejects.toThrow(/over-lent/);
  });

  it('lends no retired item, and brings it back (D-100)', async () => {
    expect(
      (await call(national.clerkUserId, 'POST', `${itemPath}/retire`, { version: 1 })).status,
    ).toBe(204);
    const res = await call(national.clerkUserId, 'POST', `${itemPath}/loans`, {
      ...LOAN,
      quantity: 1,
    });
    expect(await res.json()).toMatchObject({
      error: { code: 'resources-library.equipment-retired' },
    });
    expect(
      (await call(national.clerkUserId, 'POST', `${itemPath}/restore`, { version: 2 })).status,
    ).toBe(204);
    expect((await view(branch)).items).toHaveLength(1);
  });
});
