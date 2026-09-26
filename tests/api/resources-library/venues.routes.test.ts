import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { VenueRecord } from '../../../src/shared/resources-library/venue';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call } from '../documents-archive/archive-fixtures';
import { libraryOfficer, type Officer } from './library-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LENV';
const READ = 'resources-library.library.read';
const MANAGE = 'resources-library.venues.manage';
let national: Officer;
let branch: Officer;

const venues = (unitId: string) => `/api/resources-library/units/${unitId}/venues`;
const list = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', venues(o.unitId))).json<VenueRecord[]>();

describe('venues (brief 16 B1; D-098, D-100, D-105 to D-107)', () => {
  let hallId = '';

  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    national = await libraryOfficer({
      suffix: 'LE1',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [READ, MANAGE],
    });
    branch = await libraryOfficer({ suffix: 'LE2', notice: NOTICE, capabilities: [READ] });
    const res = await call(national.clerkUserId, 'POST', venues(national.unitId), {
      name: 'Community Hall',
      address: ' ',
    });
    expect(res.status).toBe(201);
    hallId = (await res.json<{ id: string }>()).id;
  });

  it("records a venue by its name alone, and shares the General Council's with every branch (D-105, D-106)", async () => {
    const [hall] = await list(branch);
    expect(hall).toMatchObject({
      name: 'Community Hall',
      national: true,
      address: null,
      capacity: null,
      typicalCostPence: null,
      notes: [],
    });
  });

  it('changes its details from the version read, the cost in pence', async () => {
    const venue = {
      name: 'Community Hall',
      capacity: 120,
      contactName: 'A. Contact',
      contactPhone: '0000',
      contactEmail: 'not checked',
      typicalCostPence: 15050,
      typicalCostNote: 'per evening',
    };
    const put = (version: number) =>
      call(national.clerkUserId, 'PUT', `${venues(national.unitId)}/${hallId}`, { version, venue });
    expect((await put(1)).status).toBe(204);
    expect((await put(1)).status).toBe(409);
    expect((await list(branch))[0]).toMatchObject({
      capacity: 120,
      typicalCostPence: 15050,
      typicalCostNote: 'per evening',
      version: 2,
    });
    const badCost = await call(
      national.clerkUserId,
      'PUT',
      `${venues(national.unitId)}/${hallId}`,
      { version: 2, venue: { ...venue, typicalCostPence: 1.5 } },
    );
    expect(badCost.status).toBe(400);
  });

  it('keeps dated notes, each with who wrote it; a note is retired and brought back, never changed (D-098, D-107, D-114)', async () => {
    const notes = `${venues(national.unitId)}/${hallId}/notes`;
    expect(
      (await call(national.clerkUserId, 'POST', notes, { text: 'Good parking.' })).status,
    ).toBe(201);
    expect(
      (await call(national.clerkUserId, 'POST', notes, { text: 'Kitchen closes at 9.' })).status,
    ).toBe(201);
    const shown = (await list(branch))[0]?.notes ?? [];
    expect(shown.map((n) => n.text)).toEqual(['Kitchen closes at 9.', 'Good parking.']);
    const [latest] = shown;
    expect(latest?.writtenAt).toMatch(/^\d{4}-/);
    expect(
      (await call(national.clerkUserId, 'POST', `${notes}/${latest?.id ?? ''}/retire`, {})).status,
    ).toBe(204);
    expect(((await list(branch))[0]?.notes ?? []).map((n) => n.text)).toEqual(['Good parking.']);
    const again = await call(
      national.clerkUserId,
      'POST',
      `${notes}/${latest?.id ?? ''}/retire`,
      {},
    );
    expect(again.status).toBe(409);
    expect(await again.json()).toMatchObject({
      error: { code: 'resources-library.already-retired' },
    });
    const row = await env.DB.prepare(
      'SELECT retired_by AS retiredBy FROM library_venue_notes WHERE id = ?',
    )
      .bind(latest?.id ?? '')
      .first<{ retiredBy: string }>();
    expect(row?.retiredBy).toBe(national.personId);
    // D-114: the venue's managers still see it, marked retired, to bring it back.
    const managed = (await list(national))[0]?.notes ?? [];
    expect(managed.map((n) => [n.text, n.retiredAt !== null])).toEqual([
      ['Kitchen closes at 9.', true],
      ['Good parking.', false],
    ]);
    expect(
      (await call(national.clerkUserId, 'POST', `${notes}/${latest?.id ?? ''}/restore`, {})).status,
    ).toBe(204);
    expect(((await list(branch))[0]?.notes ?? []).map((n) => n.text)).toEqual([
      'Kitchen closes at 9.',
      'Good parking.',
    ]);
    expect(
      (
        await call(
          branch.clerkUserId,
          'POST',
          `${venues(national.unitId)}/${hallId}/notes/${latest?.id ?? ''}/retire`,
          {},
        )
      ).status,
    ).toBe(403);
    await expect(
      env.DB.prepare("UPDATE library_venue_notes SET text = 'x' WHERE venue_id = ?")
        .bind(hallId)
        .run(),
    ).rejects.toThrow(/never changed/);
    await expect(
      env.DB.prepare('DELETE FROM library_venue_notes WHERE venue_id = ?').bind(hallId).run(),
    ).rejects.toThrow(/never deleted/);
  });

  it("refuses a branch changing the General Council's venue, and retires and brings one back (D-100)", async () => {
    expect(
      (await call(branch.clerkUserId, 'POST', venues(branch.unitId), { name: 'Other' })).status,
    ).toBe(403);
    const one = `${venues(national.unitId)}/${hallId}`;
    expect((await call(national.clerkUserId, 'POST', `${one}/retire`, { version: 2 })).status).toBe(
      204,
    );
    expect(await list(branch)).toEqual([]);
    expect(
      (await call(national.clerkUserId, 'POST', `${one}/restore`, { version: 3 })).status,
    ).toBe(204);
    expect(await list(branch)).toHaveLength(1);
  });
});
