import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { CalendarView, ClashNotice } from '../../../src/shared/calendar/calendar-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  calendarOfficer,
  call,
  readyCalendar,
  scheduleMeeting,
  unitCalendar,
  type Officer,
} from './calendar-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69CALNV';
const READ = 'calendar.calendar.read';
const MANAGE = 'calendar.community-dates.manage';
let council: Officer;
let north: Officer;
let south: Officer;

const view = async (o: Officer, query: string) =>
  (
    await call(
      o.clerkUserId,
      'GET',
      `${unitCalendar(o.unitId)}/items?from=2026-11-01&to=2026-11-30&${query}`,
    )
  ).json<CalendarView>();
const titles = (v: CalendarView) => v.items.map((i) => i.title);
const addDate = (o: Officer, body: object) =>
  call(o.clerkUserId, 'POST', `${unitCalendar(o.unitId)}/community-dates`, body);
const DAY = {
  startDate: '2026-11-10',
  endDate: '2026-11-10',
  startTime: null,
  description: '',
  forAllBranches: false,
};

describe('the Calendar (brief 19 A to B4; D-145 to D-150)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    council = await calendarOfficer({
      suffix: 'CL1',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [READ, MANAGE],
    });
    north = await calendarOfficer({ suffix: 'CL2', notice: NOTICE, capabilities: [READ, MANAGE] });
    south = await calendarOfficer({ suffix: 'CL3', notice: NOTICE, capabilities: [READ] });
    for (const o of [council, north, south]) await readyCalendar(o.unitId, council.personId, true);
    await scheduleMeeting(north.unitId, 'm-north', 'North committee', '2026-11-05', '19:00');
    await scheduleMeeting(south.unitId, 'm-south', 'South committee', '2026-11-06');
    expect(
      (await addDate(council, { ...DAY, title: 'Community day', forAllBranches: true })).status,
    ).toBe(201);
    expect(
      (
        await addDate(north, {
          ...DAY,
          title: 'North fair',
          startDate: '2026-11-20',
          endDate: '2026-11-21',
        })
      ).status,
    ).toBe(201);
  });

  it("shows a branch its own dates and the General Council's for all branches, never another branch's (B1; D-146)", async () => {
    expect(titles(await view(north, 'scope=branch'))).toEqual([
      'North committee',
      'Community day',
      'North fair',
    ]);
    expect(titles(await view(south, 'scope=branch'))).toEqual(['South committee', 'Community day']);
  });

  it('shows every branch to anyone who reads their own, each in its colour, with filters (B2, B3; D-150)', async () => {
    const all = await view(south, 'scope=all');
    expect(titles(all)).toEqual([
      'North committee',
      'South committee',
      'Community day',
      'North fair',
    ]);
    expect(all.units.map((u) => u.id)).toContain(north.unitId);
    expect(titles(await view(south, 'scope=all&kinds=community'))).toEqual([
      'Community day',
      'North fair',
    ]);
    expect(titles(await view(south, `scope=all&units=${north.unitId}`))).toEqual([
      'North committee',
      'North fair',
    ]);
  });

  it('lets only the General Council add a date for all branches, in the service and the database (D-146)', async () => {
    const res = await addDate(north, { ...DAY, title: 'Not allowed', forAllBranches: true });
    expect(await res.json()).toMatchObject({
      error: { code: 'calendar.all-branches-general-council-only' },
    });
    await expect(
      env.DB.prepare(
        `INSERT INTO community_dates (id, unit_id, title, start_date, end_date, for_all_branches, version, created_by, created_at, updated_by, updated_at)
         VALUES ('x', ?, 'X', '2026-11-01', '2026-11-01', 1, 1, 'p', 'n', 'p', 'n')`,
      )
        .bind(north.unitId)
        .run(),
    ).rejects.toThrow(/General Council/);
    expect((await addDate(south, { ...DAY, title: 'No capability' })).status).toBe(403);
  });

  it('changes a date from the version read, retires it (hidden but for its managers) and brings it back (D-147)', async () => {
    const fair = (await view(north, 'scope=branch')).items.find((i) => i.title === 'North fair');
    const one = `${unitCalendar(north.unitId)}/community-dates/${fair?.id ?? ''}`;
    const body = {
      version: 1,
      date: { ...DAY, title: 'North fair', startDate: '2026-11-22', endDate: '2026-11-23' },
    };
    expect((await call(north.clerkUserId, 'PUT', one, body)).status).toBe(204);
    expect((await call(north.clerkUserId, 'PUT', one, body)).status).toBe(409);
    expect((await call(north.clerkUserId, 'POST', `${one}/retire`, { version: 2 })).status).toBe(
      204,
    );
    expect(titles(await view(south, 'scope=all'))).not.toContain('North fair');
    expect(
      (await view(north, 'scope=branch')).items.find((i) => i.title === 'North fair')?.retiredAt,
    ).not.toBeNull();
    expect((await call(north.clerkUserId, 'POST', `${one}/restore`, { version: 3 })).status).toBe(
      204,
    );
    expect(titles(await view(south, 'scope=all'))).toContain('North fair');
    await expect(
      env.DB.prepare('DELETE FROM community_dates WHERE id = ?')
        .bind(fair?.id ?? '')
        .run(),
    ).rejects.toThrow(/never deleted/);
  });

  it("notices the same unit's other meetings and events on any day a date covers — never another unit's, never blocking (B4; D-149, D-151)", async () => {
    const clashes = async (o: Officer, query: string) =>
      (await call(o.clerkUserId, 'GET', `${unitCalendar(o.unitId)}/clashes?${query}`)).json<
        ClashNotice[]
      >();
    const meeting = {
      kind: 'meeting',
      title: 'North committee',
      date: '2026-11-05',
      startTime: '19:00',
    };
    expect(await clashes(north, 'date=2026-11-05')).toEqual([meeting]);
    expect(await clashes(north, 'date=2026-11-06')).toEqual([]);
    // A three-day date with the meeting on its second day.
    expect(await clashes(north, 'date=2026-11-04&lastDate=2026-11-06')).toEqual([meeting]);
    expect(
      (await clashes(south, 'date=2026-11-04&lastDate=2026-11-06')).map((c) => c.title),
    ).toEqual(['South committee']);
    const backwards = `${unitCalendar(north.unitId)}/clashes?date=2026-11-06&lastDate=2026-11-04`;
    expect((await call(north.clerkUserId, 'GET', backwards)).status).toBe(400);
  });
});
