import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  OpenedCircular,
  ReceivedCircular,
  SentCircular,
} from '../../../src/shared/communication-hub/circular-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call, colleagueOf, hubOfficer, readyHub, unitHub, type Officer } from './hub-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69CRNTV';
const SEND = 'communication-hub.circulars.send';
let council: Officer;
let councilReader: Officer;
let north: Officer;
let northColleague: Officer;
let south: Officer;

const send = (o: Officer, body: object) =>
  call(o.clerkUserId, 'POST', `${unitHub(o.unitId)}/circulars`, body);
const received = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', `${unitHub(o.unitId)}/circulars`)).json<ReceivedCircular[]>();
const sent = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', `${unitHub(o.unitId)}/sent-circulars`)).json<SentCircular[]>();
const open = async (o: Officer, id: string) =>
  (await call(o.clerkUserId, 'GET', `${unitHub(o.unitId)}/circulars/${id}`)).json<OpenedCircular>();
const circular = (title: string, to: object) => ({ title, body: `About ${title}.`, ...to });

describe('national circulars and read confirmation (brief 20 A3, A4; P14; D-157)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    council = await hubOfficer({
      suffix: 'CR1',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [SEND],
    });
    councilReader = await colleagueOf(council, { suffix: 'CR2', notice: NOTICE, capabilities: [] });
    north = await hubOfficer({ suffix: 'CR3', notice: NOTICE, capabilities: [SEND] });
    northColleague = await colleagueOf(north, { suffix: 'CR4', notice: NOTICE, capabilities: [] });
    south = await hubOfficer({ suffix: 'CR5', notice: NOTICE, capabilities: [] });
    for (const o of [council, north, south]) await readyHub(o.unitId);
  });

  it('is sent by the General Council only, to all branches or to chosen ones', async () => {
    expect((await send(north, circular('From a branch', { toAllBranches: true }))).status).toBe(
      409,
    );
    expect(
      (await send(councilReader, circular('No permission', { toAllBranches: true }))).status,
    ).toBe(403);
    expect(
      (await send(council, circular('Unknown', { toAllBranches: false, unitIds: ['nowhere'] })))
        .status,
    ).toBe(409);
    expect(
      (await send(council, circular('To North', { toAllBranches: false, unitIds: [north.unitId] })))
        .status,
    ).toBe(201);
    expect((await send(council, circular('To all', { toAllBranches: true }))).status).toBe(201);
  });

  it('is read by every officer of a branch it went to, and nobody else (D-157)', async () => {
    expect((await received(northColleague)).map((c) => c.title)).toEqual(['To all', 'To North']);
    expect((await received(south)).map((c) => c.title)).toEqual(['To all']);
    const toNorth = (await received(north)).find((c) => c.title === 'To North');
    expect(
      (await call(south.clerkUserId, 'GET', `${unitHub(north.unitId)}/circulars`)).status,
    ).toBe(403);
    expect(
      (
        await call(
          south.clerkUserId,
          'GET',
          `${unitHub(south.unitId)}/circulars/${toNorth?.id ?? ''}`,
        )
      ).status,
    ).toBe(404);
  });

  it('counts a branch as having opened it the first time any of its officers does (A4; P14)', async () => {
    const toNorth = (await received(north)).find((c) => c.title === 'To North');
    const first = await open(northColleague, toNorth?.id ?? '');
    expect(first.body).toBe('About To North.');
    expect(first.openedAt).not.toBeNull();
    expect((await open(north, toNorth?.id ?? '')).openedAt).toBe(first.openedAt);
    const confirmation = (await sent(councilReader)).find((c) => c.title === 'To all');
    expect(confirmation?.recipients.map((r) => [r.unitId, r.openedAt])).toEqual(
      expect.arrayContaining([
        [north.unitId, null],
        [south.unitId, null],
      ]),
    );
    expect((await sent(council)).find((c) => c.title === 'To North')?.recipients[0]?.openedAt).toBe(
      first.openedAt,
    );
    expect(
      (await call(north.clerkUserId, 'GET', `${unitHub(north.unitId)}/sent-circulars`)).status,
    ).toBe(409);
  });

  it('is never changed or removed once sent, nor its read confirmation (D-157)', async () => {
    const id = (await received(north)).find((c) => c.title === 'To North')?.id ?? '';
    for (const sql of [
      "UPDATE circulars SET title = 'Changed' WHERE id = ?",
      'DELETE FROM circulars WHERE id = ?',
      'DELETE FROM circular_recipients WHERE circular_id = ?',
      'DELETE FROM circular_opens WHERE circular_id = ?',
    ]) {
      await expect(env.DB.prepare(sql).bind(id).run()).rejects.toThrow(/never changed/);
    }
  });
});
