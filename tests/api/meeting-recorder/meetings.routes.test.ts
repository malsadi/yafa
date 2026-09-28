import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { MeetingDetail } from '../../../src/shared/meeting-recorder/meeting-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  addMeetingType,
  call,
  colleagueOf,
  hubPosts,
  MANAGE,
  meetingBody,
  meetingOfficer,
  READ,
  readyMeetings,
  switchService,
  unitMeetings,
  type Officer,
} from './meeting-fixtures';
import { tryEveryRoute } from '../../immutability/try-every-route';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69MSNTV';
const TYPE = 'type-MS-committee';
let manager: Officer;
let secretary: Officer;
let reader: Officer;

const meetings = () => `${unitMeetings(manager.unitId)}/meetings`;
const read = async (id: string) =>
  (await call(reader.clerkUserId, 'GET', `${meetings()}/${id}`)).json<MeetingDetail>();
const calendarRows = (id: string) =>
  env.DB.prepare(
    "SELECT date FROM calendar_entries WHERE kind = 'meeting' AND source_record_id = ?",
  )
    .bind(id)
    .all();

async function schedule(date = '2099-03-10', attendees: string[] = []): Promise<string> {
  const res = await call(manager.clerkUserId, 'POST', meetings(), {
    meeting: meetingBody({
      typeItemId: TYPE,
      chair: manager.personId,
      secretary: secretary.personId,
      date,
    }),
    attendeePersonIds: attendees,
  });
  expect(res.status).toBe(201);
  return (await res.json<{ id: string }>()).id;
}

describe('meetings: scheduled, changed and cancelled (brief 22 A1, A2; 10.1; D-198, D-202, D-209)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await meetingOfficer({
      suffix: 'MS1',
      notice: NOTICE,
      capabilities: [READ, MANAGE, 'communication-hub.noticeboard.read'],
    });
    secretary = await colleagueOf(manager, { suffix: 'MS2', notice: NOTICE, capabilities: [READ] });
    reader = await colleagueOf(manager, { suffix: 'MS3', notice: NOTICE, capabilities: [READ] });
    await readyMeetings(manager.unitId, manager.personId);
    await addMeetingType(TYPE, 'Committee meeting');
  });

  it('schedules a meeting: chair and secretary attend, the Calendar shows it, "meeting scheduled" is posted once', async () => {
    const id = await schedule('2099-03-10', [reader.personId]);
    const detail = await read(id);
    expect(detail.meeting.status).toBe('Scheduled');
    expect(detail.attendees.map((a) => a.personId).sort()).toEqual(
      [manager.personId, secretary.personId, reader.personId].sort(),
    );
    expect((await calendarRows(id)).results).toEqual([{ date: '2099-03-10' }]);
    expect(await hubPosts(id)).toEqual(['meeting-scheduled']);
  });

  it("titles the Calendar entry and the post with the type's name in both languages (D-211)", async () => {
    const id = await schedule('2099-03-11');
    const titles = (table: string, column: string) =>
      env.DB.prepare(`SELECT title, title_ar AS titleAr FROM ${table} WHERE ${column} = ?`)
        .bind(id)
        .first();
    const both = { title: 'Committee meeting', titleAr: 'Committee meeting (ar)' };
    expect(await titles('calendar_entries', 'source_record_id')).toEqual(both);
    expect(await titles('notices', 'source_record_id')).toEqual(both);
  });

  it('refuses a type not in the list, someone not an officer, or no place or link', async () => {
    const body = (patch: object) => ({
      meeting: {
        ...meetingBody({
          typeItemId: TYPE,
          chair: manager.personId,
          secretary: secretary.personId,
        }),
        ...patch,
      },
      attendeePersonIds: [],
    });
    expect(
      (await call(manager.clerkUserId, 'POST', meetings(), body({ typeItemId: 'nope' }))).status,
    ).toBe(409);
    expect(
      (await call(manager.clerkUserId, 'POST', meetings(), body({ chairPersonId: 'nobody' })))
        .status,
    ).toBe(409);
    expect(
      (await call(manager.clerkUserId, 'POST', meetings(), body({ place: null }))).status,
    ).toBe(400);
    expect((await call(reader.clerkUserId, 'POST', meetings(), body({}))).status).toBe(403);
  });

  it('changes its details while scheduled; the Calendar follows, with no second message (D-202)', async () => {
    const id = await schedule();
    const changed = meetingBody({
      typeItemId: TYPE,
      chair: manager.personId,
      secretary: secretary.personId,
      date: '2099-04-01',
    });
    const res = await call(manager.clerkUserId, 'PUT', `${meetings()}/${id}`, {
      meeting: changed,
      version: (await read(id)).meeting.version,
    });
    expect(res.status).toBe(204);
    expect((await calendarRows(id)).results).toEqual([{ date: '2099-04-01' }]);
    expect(await hubPosts(id)).toEqual(['meeting-scheduled']);
  });

  it('is cancelled with a reason: it leaves the Calendar, sends nothing, and is locked (D-202)', async () => {
    const id = await schedule();
    const cancel = (reason: string) =>
      read(id).then((d) =>
        call(manager.clerkUserId, 'POST', `${meetings()}/${id}/cancel`, {
          reason,
          version: d.meeting.version,
        }),
      );
    expect((await cancel('')).status).toBe(400);
    expect((await cancel('Hall flooded')).status).toBe(204);
    const detail = await read(id);
    expect([detail.meeting.status, detail.meeting.cancelReason]).toEqual([
      'Cancelled',
      'Hall flooded',
    ]);
    expect((await calendarRows(id)).results).toEqual([]);
    expect(await hubPosts(id)).toEqual(['meeting-scheduled']);
    await expect(
      env.DB.prepare('DELETE FROM meetings WHERE id = ?').bind(id).run(),
    ).rejects.toThrow();
    await expect(
      env.DB.prepare("UPDATE meetings SET status = 'Scheduled', version = version + 1 WHERE id = ?")
        .bind(id)
        .run(),
    ).rejects.toThrow();
  });

  it('refuses every change to a cancelled meeting through every route (brief 26; D-202)', async () => {
    const M = '/api/meeting-recorder/units/:unitId/meetings/:meetingId';
    const cancelled = await env.DB.prepare(
      "SELECT id, version FROM meetings WHERE unit_id = ? AND status = 'Cancelled' LIMIT 1",
    )
      .bind(manager.unitId)
      .first<{ id: string; version: number }>();
    expect(cancelled).not.toBeNull();
    const id = cancelled?.id ?? '';
    const v = cancelled?.version ?? 1;
    const result = await tryEveryRoute(
      (method, path, body) => call(manager.clerkUserId, method, path, body),
      {
        prefixes: [M],
        params: {
          unitId: manager.unitId,
          meetingId: id,
          itemId: 'none',
          personId: reader.personId,
        },
        bodies: {
          [`PUT ${M}`]: {
            meeting: meetingBody({
              typeItemId: TYPE,
              chair: manager.personId,
              secretary: secretary.personId,
            }),
            version: v,
          },
          [`POST ${M}/hold`]: { version: v },
          [`POST ${M}/cancel`]: { reason: 'Again', version: v },
          [`POST ${M}/attendees`]: { personIds: [reader.personId] },
          [`PUT ${M}/attendees/:personId/attendance`]: { attendance: 'Absent' },
          [`POST ${M}/agenda`]: { title: 'Late point', note: null },
          [`POST ${M}/log-report`]: { language: 'en', version: v },
          [`POST ${M}/send-later`]: { target: 'calendar' },
        },
        rows: [
          { sql: 'SELECT * FROM meetings WHERE id = ?', binds: [id] },
          {
            sql: 'SELECT * FROM meeting_attendees WHERE meeting_id = ? ORDER BY person_id',
            binds: [id],
          },
          { sql: 'SELECT * FROM agenda_items WHERE meeting_id = ? ORDER BY id', binds: [id] },
        ],
      },
    );
    expect(result.tried.length).toBeGreaterThanOrEqual(14);
    expect(result.failed).toEqual([]);
    expect(result.accepted).toEqual([]);
    expect(result.rowsChanged).toBe(false);
  });

  it('skips the Calendar and the hub while off, and sends each once, later (D-209)', async () => {
    await switchService('calendar', manager.unitId, false);
    await switchService('communication-hub', manager.unitId, false);
    const id = await schedule();
    expect((await calendarRows(id)).results).toEqual([]);
    expect(await hubPosts(id)).toEqual([]);
    const later = (target: string) =>
      call(manager.clerkUserId, 'POST', `${meetings()}/${id}/send-later`, { target });
    expect((await later('calendar')).status).toBe(409);
    await switchService('calendar', manager.unitId, true);
    await switchService('communication-hub', manager.unitId, true);
    expect((await later('calendar')).status).toBe(204);
    expect((await later('meeting-scheduled')).status).toBe(204);
    expect((await later('meeting-scheduled')).status).toBe(409);
    expect((await calendarRows(id)).results).toHaveLength(1);
    expect(await hubPosts(id)).toEqual(['meeting-scheduled']);
  });
});
