import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { MeetingReportDocument } from '../../../src/pdf-templates/meeting-report/meeting-report-document';
import type { MeetingDetail } from '../../../src/shared/meeting-recorder/meeting-records';
import { logMeetingReport } from '../../../src/worker/services/meeting-recorder';
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
  unitMeetings,
  type Officer,
} from '../../api/meeting-recorder/meeting-fixtures';
import { fakeQueue } from '../communication-hub/alert-fixtures';
import { contextOf, nameOrganisation, storage } from '../treasury/treasury-service-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69MLNTV';
const TYPE = 'type-ML-committee';
let manager: Officer;
let secretary: Officer;
let present: Officer;
let apologies: Officer;
let absent: Officer;
let id = '';

const rendered: MeetingReportDocument[] = [];
const render = (document: MeetingReportDocument) => {
  rendered.push(document);
  return Promise.resolve(new TextEncoder().encode(`%PDF ${document.title}`));
};
const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
const path = (rest = '') => `${unitMeetings(manager.unitId)}/meetings/${id}${rest}`;
const read = async () => (await call(manager.clerkUserId, 'GET', path())).json<MeetingDetail>();
const version = async () => (await read()).meeting.version;
const log = async () =>
  logMeetingReport(
    env.DB,
    fakeQueue().queue,
    contextOf(secretary),
    { storage, render },
    {
      unitId: manager.unitId,
      meetingId: id,
      version: await version(),
      language: 'en',
    },
  );

describe('a meeting from scheduling to its logged report (brief 22; 10.1; 26 Phase 9)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await meetingOfficer({ suffix: 'ML1', notice: NOTICE, capabilities: [READ, MANAGE] });
    secretary = await colleagueOf(manager, { suffix: 'ML2', notice: NOTICE, capabilities: [READ] });
    present = await colleagueOf(manager, { suffix: 'ML3', notice: NOTICE, capabilities: [] });
    apologies = await colleagueOf(manager, { suffix: 'ML4', notice: NOTICE, capabilities: [] });
    absent = await colleagueOf(manager, { suffix: 'ML5', notice: NOTICE, capabilities: [] });
    await readyMeetings(manager.unitId, manager.personId);
    await nameOrganisation(manager.personId);
    await addMeetingType(TYPE, 'Committee meeting');
    const res = await call(
      manager.clerkUserId,
      'POST',
      `${unitMeetings(manager.unitId)}/meetings`,
      {
        meeting: meetingBody({
          typeItemId: TYPE,
          chair: manager.personId,
          secretary: secretary.personId,
          date: today(),
        }),
        attendeePersonIds: [present.personId, apologies.personId, absent.personId],
      },
    );
    id = (await res.json<{ id: string }>()).id;
    for (const title of ['Minutes of the last meeting', 'Summer fair'])
      await call(manager.clerkUserId, 'POST', path('/agenda'), { title, note: null });
  });

  it('records nothing of the meeting itself until it is held (D-201)', async () => {
    const [item] = (await read()).agenda;
    const mark = await call(
      secretary.clerkUserId,
      'PUT',
      path(`/attendees/${present.personId}/attendance`),
      { attendance: 'Present' },
    );
    expect(mark.status).toBe(409);
    const comment = await call(
      secretary.clerkUserId,
      'PUT',
      path(`/agenda/${item?.id ?? ''}/comments/${present.personId}`),
      { comment: 'Early', version: null },
    );
    expect(comment.status).toBe(409);
    expect(
      (await call(present.clerkUserId, 'POST', path('/hold'), { version: await version() })).status,
    ).toBe(403);
    expect(
      (await call(secretary.clerkUserId, 'POST', path('/hold'), { version: await version() }))
        .status,
    ).toBe(204);
  });

  it('marks attendance three ways, and fixes the original agenda while adding points raised (D-203, D-204)', async () => {
    for (const [who, attendance] of [
      [present, 'Present'],
      [apologies, 'Apologies'],
      [absent, 'Did not attend'],
      [manager, 'Present'],
      [secretary, 'Present'],
    ] as const)
      expect(
        (
          await call(secretary.clerkUserId, 'PUT', path(`/attendees/${who.personId}/attendance`), {
            attendance,
          })
        ).status,
      ).toBe(204);
    const [first] = (await read()).agenda;
    const change = await call(secretary.clerkUserId, 'PUT', path(`/agenda/${first?.id ?? ''}`), {
      item: { title: 'Changed', note: null },
      version: first?.version,
    });
    expect(await change.json()).toEqual({
      error: { code: 'meeting-recorder.original-agenda-fixed' },
    });
    expect(
      (
        await call(secretary.clerkUserId, 'POST', path('/agenda'), {
          title: 'Hall repairs',
          note: null,
        })
      ).status,
    ).toBe(201);
    expect((await read()).agenda.map((i) => [i.title, i.raisedInMeeting])).toEqual([
      ['Minutes of the last meeting', false],
      ['Summer fair', false],
      ['Hall repairs', true],
    ]);
  });

  it('records comments of officers present only, and each vote within those present (D-205, D-206, D-207)', async () => {
    const [first, second, raised] = (await read()).agenda;
    const comment = (item: typeof first, who: Officer, text: string, v: number | null) =>
      call(
        secretary.clerkUserId,
        'PUT',
        path(`/agenda/${item?.id ?? ''}/comments/${who.personId}`),
        { comment: text, version: v },
      );
    expect((await comment(first, present, 'Agreed as a true record.', null)).status).toBe(204);
    expect((await comment(first, absent, 'Not here.', null)).status).toBe(409);
    expect((await comment(first, present, 'Crossed save.', null)).status).toBe(409);
    expect((await comment(first, present, 'Agreed, with one correction.', 1)).status).toBe(204);
    const outcome = (item: typeof first, body: object) =>
      call(secretary.clerkUserId, 'PUT', path(`/agenda/${item?.id ?? ''}/outcome`), {
        outcome: body,
        version: item?.version,
      });
    const tooMany = {
      kind: 'vote',
      votesFor: 3,
      votesAgainst: 1,
      votesAbstain: 0,
      voteResult: 'Carried',
    };
    expect(await (await outcome(first, tooMany)).json()).toEqual({
      error: { code: 'meeting-recorder.too-many-votes' },
    });
    expect((await outcome(first, { ...tooMany, votesFor: 2 })).status).toBe(204);
    expect(
      (await outcome(second, { kind: 'decision', decision: 'Hold the fair on 5 July.' })).status,
    ).toBe(204);
    await expect(log()).rejects.toThrow('meeting-recorder.item-without-outcome');
    expect(
      (await outcome(raised, { kind: 'decision', decision: 'Get three quotes.' })).status,
    ).toBe(204);
  });

  it('logs the report: filed to Meetings, locked, comments marked as recorded for the officer, and "meeting has taken place" posted — two messages in all (C1; D-208, D-211)', async () => {
    await log();
    const detail = await read();
    expect(detail.meeting.status).toBe('Report logged');
    expect(rendered.at(-1)?.title).toBe('Meeting report: Committee meeting');
    expect(rendered.at(-1)?.originalAgenda.items).toEqual([
      'Minutes of the last meeting',
      'Summer fair',
    ]);
    expect(rendered.at(-1)?.updatedAgenda.items.at(-1)).toBe('Hall repairs (raised in meeting)');
    const names = await env.DB.prepare('SELECT id, name FROM people WHERE id IN (?, ?)')
      .bind(present.personId, secretary.personId)
      .all<{ id: string; name: string }>();
    const nameOf = (who: Officer) => names.results.find((p) => p.id === who.personId)?.name;
    expect(rendered.at(-1)?.minutes.items[0]?.comments).toEqual([
      {
        name: nameOf(present),
        comment: 'Agreed, with one correction.',
        recordedFor: `Recorded for ${nameOf(present) ?? ''} by ${nameOf(secretary) ?? ''}`,
      },
    ]);
    const filed = await env.DB.prepare(
      'SELECT d.category_id AS category, d.document_date AS date, f.locked FROM archive_documents d JOIN archive_document_versions v ON v.document_id = d.id JOIN files f ON f.id = v.file_id WHERE d.source_record_id = ?',
    )
      .bind(id)
      .all();
    expect(filed.results).toEqual([{ category: 'meetings', date: today(), locked: 1 }]);
    expect(await hubPosts(id)).toEqual(['meeting-scheduled', 'meeting-held']);
  });

  it('is locked once logged, in the service and the database (brief 22 rules)', async () => {
    const [first] = (await read()).agenda;
    const late = await call(
      secretary.clerkUserId,
      'PUT',
      path(`/agenda/${first?.id ?? ''}/comments/${present.personId}`),
      { comment: 'Late', version: 2 },
    );
    expect(late.status).toBe(409);
    await expect(log()).rejects.toThrow('meeting-recorder.wrong-status');
    for (const sql of [
      "UPDATE agenda_items SET decision = 'X', version = version + 1 WHERE meeting_id = ?",
      "UPDATE meeting_attendees SET attendance = 'Apologies' WHERE meeting_id = ?",
      "UPDATE meetings SET status = 'Held', version = version + 1 WHERE id = ?",
    ])
      await expect(env.DB.prepare(sql).bind(id).run()).rejects.toThrow();
  });
});
