import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { setSetting } from '../../../src/worker/core/settings';
import { buildTestApp, insertNoticeVersion, ORIGIN } from '../../app/app-fixtures';
import {
  calendarOfficer,
  call,
  readyCalendar,
  scheduleMeeting,
  unitCalendar,
  type Officer,
} from './calendar-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69CFDNV';
let council: Officer;
let north: Officer;
let south: Officer;
let token = '';

async function feed(t = token): Promise<Response> {
  const { app } = await buildTestApp();
  return app.request(`${ORIGIN}/calendar/feed/${t}`);
}

describe('the phone calendar feed (brief 6.4, 19 C1; D-148)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    const caps = ['calendar.calendar.read', 'calendar.community-dates.manage'];
    council = await calendarOfficer({
      suffix: 'FD1',
      notice: NOTICE,
      unitType: 'national',
      capabilities: caps,
    });
    north = await calendarOfficer({ suffix: 'FD2', notice: NOTICE, capabilities: caps });
    south = await calendarOfficer({ suffix: 'FD3', notice: NOTICE, capabilities: caps });
    for (const o of [council, north, south]) await readyCalendar(o.unitId, council.personId, false);
    await scheduleMeeting(
      north.unitId,
      'fm-north',
      'North committee; budget, plans',
      '2026-07-15',
      '19:00',
    );
    await scheduleMeeting(south.unitId, 'fm-south', 'South committee', '2026-07-16');
    const day = {
      startDate: '2026-12-01',
      endDate: '2026-12-02',
      startTime: null,
      description: 'Bring food',
      forAllBranches: false,
    };
    await call(north.clerkUserId, 'POST', `${unitCalendar(north.unitId)}/community-dates`, {
      ...day,
      title: 'North fair',
    });
    await call(council.clerkUserId, 'POST', `${unitCalendar(council.unitId)}/community-dates`, {
      ...day,
      title: 'National day',
      forAllBranches: true,
    });
    token = (
      await (
        await call(north.clerkUserId, 'POST', '/api/calendar/feed-token', {})
      ).json<{ token: string }>()
    ).token;
  });

  it("gives the officer's own units' dates as iCalendar — times in UTC, several days as whole days — and nothing of other branches'", async () => {
    const res = await feed();
    expect(res.headers.get('Content-Type')).toContain('text/calendar');
    const ics = await res.text();
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toContain('SUMMARY:North committee\\; budget\\, plans');
    expect(ics).toContain('DTSTART:20260715T180000Z');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261201\r\nDTEND;VALUE=DATE:20261203');
    expect(ics).not.toContain('South committee');
  });

  it("includes the General Council's dates for all branches only when the setting says so (D-148)", async () => {
    expect(await (await feed()).text()).not.toContain('National day');
    await setSetting(env.DB, {
      key: 'calendar.feed_includes_all_branch_dates',
      value: true,
      actorPersonId: council.personId,
    });
    expect(await (await feed()).text()).toContain('National day');
  });

  it('stops working once the token is replaced or unknown', async () => {
    const old = token;
    token = (
      await (
        await call(north.clerkUserId, 'POST', '/api/calendar/feed-token', {})
      ).json<{ token: string }>()
    ).token;
    expect((await feed(old)).status).toBe(404);
    expect((await feed()).status).toBe(200);
    expect((await feed('made-up')).status).toBe(404);
  });
});
