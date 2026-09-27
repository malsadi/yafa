import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { NoticeRecord } from '../../../src/shared/communication-hub/notice-records';
import { postAutomatic } from '../../../src/worker/services/communication-hub';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  colleagueOf,
  hubOfficer,
  MANAGE,
  noticeBody,
  READ,
  readyHub,
  unitHub,
  type Officer,
} from './hub-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69NBNTV';
let manager: Officer;
let reader: Officer;
let other: Officer;

const board = async (o: Officer, unitId = o.unitId) =>
  call(o.clerkUserId, 'GET', `${unitHub(unitId)}/notices`);
const notices = async (o: Officer) => (await board(o)).json<NoticeRecord[]>();
const post = (o: Officer, body: object) =>
  call(o.clerkUserId, 'POST', `${unitHub(o.unitId)}/notices`, body);

describe('the Noticeboard (brief 20 A1; D-154, D-155)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await hubOfficer({ suffix: 'NB1', notice: NOTICE, capabilities: [READ, MANAGE] });
    reader = await colleagueOf(manager, { suffix: 'NB2', notice: NOTICE, capabilities: [READ] });
    other = await hubOfficer({ suffix: 'NB3', notice: NOTICE, capabilities: [READ, MANAGE] });
    for (const o of [manager, other]) await readyHub(o.unitId);
  });

  it("is read by the unit's own officers only, and posted to by those who manage it (D-154)", async () => {
    expect((await post(manager, noticeBody('Hall booked'))).status).toBe(201);
    expect((await post(reader, noticeBody('Not allowed'))).status).toBe(403);
    expect((await notices(reader)).map((n) => [n.title, n.postedByName !== null])).toEqual([
      ['Hall booked', true],
    ]);
    expect((await board(other, manager.unitId)).status).toBe(403);
    expect(await notices(other)).toEqual([]);
  });

  it('changes a notice from the version read, and retires it — hidden, kept, brought back (D-155)', async () => {
    const [hall] = await notices(manager);
    const one = `${unitHub(manager.unitId)}/notices/${hall?.id ?? ''}`;
    const change = { version: 1, notice: { title: 'Hall booked for May', body: 'Main hall.' } };
    expect((await call(manager.clerkUserId, 'PUT', one, change)).status).toBe(204);
    expect((await call(manager.clerkUserId, 'PUT', one, change)).status).toBe(409);
    expect((await call(manager.clerkUserId, 'POST', `${one}/retire`, { version: 2 })).status).toBe(
      204,
    );
    expect(await notices(reader)).toEqual([]);
    expect((await notices(manager))[0]?.retiredAt).not.toBeNull();
    expect((await call(manager.clerkUserId, 'POST', `${one}/restore`, { version: 3 })).status).toBe(
      204,
    );
    expect((await notices(reader)).map((n) => n.title)).toEqual(['Hall booked for May']);
    await expect(
      env.DB.prepare('DELETE FROM notices WHERE id = ?')
        .bind(hall?.id ?? '')
        .run(),
    ).rejects.toThrow(/never deleted/);
  });

  it('shows an automatic post marked as automatic, which is never changed (20 A1, rules)', async () => {
    await env.DB.batch([
      postAutomatic(env.DB, manager.unitId, 'meeting-scheduled', {
        sourceRecordId: 'meeting-1',
        title: 'Committee meeting',
        date: '2026-12-01',
        actorPersonId: manager.personId,
      }).statement,
    ]);
    const automatic = (await notices(reader)).find((n) => n.source === 'automatic');
    expect(automatic).toMatchObject({
      automaticKind: 'meeting-scheduled',
      title: 'Committee meeting',
      aboutDate: '2026-12-01',
      postedByName: null,
    });
    const one = `${unitHub(manager.unitId)}/notices/${automatic?.id ?? ''}`;
    const change = { version: 1, notice: { title: 'Changed', body: 'Changed.' } };
    expect((await call(manager.clerkUserId, 'PUT', one, change)).status).toBe(409);
    await expect(
      env.DB.prepare("UPDATE notices SET title = 'Changed', version = version + 1 WHERE id = ?")
        .bind(automatic?.id ?? '')
        .run(),
    ).rejects.toThrow(/never changed/);
  });
});
