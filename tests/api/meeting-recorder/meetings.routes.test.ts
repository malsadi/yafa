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
