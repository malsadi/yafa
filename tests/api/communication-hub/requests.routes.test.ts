import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { HubRequestRecord } from '../../../src/shared/communication-hub/conversation-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call, colleagueOf, hubOfficer, readyHub, unitHub, type Officer } from './hub-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69RQNTV';
const SEND = 'communication-hub.requests.send';
let asker: Officer;
let askerColleague: Officer;
let helper: Officer;
let other: Officer;
let council: Officer;
let requestId = '';

const requests = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', `${unitHub(o.unitId)}/requests`)).json<HubRequestRecord[]>();
const reply = (o: Officer, body: string) =>
  call(o.clerkUserId, 'POST', `${unitHub(o.unitId)}/requests/${requestId}/replies`, { body });
const status = async (o: Officer) => (await requests(o)).find((r) => r.id === requestId)?.status;
const ask = (o: Officer, body: object) =>
  call(o.clerkUserId, 'POST', `${unitHub(o.unitId)}/requests`, {
    subject: 'Chairs',
    body: 'Can we borrow 50 chairs?',
    ...body,
  });

describe('requests between units (brief 20 B3; P13; D-160, D-168)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    asker = await hubOfficer({ suffix: 'RQ1', notice: NOTICE, capabilities: [SEND] });
    askerColleague = await colleagueOf(asker, { suffix: 'RQ2', notice: NOTICE, capabilities: [] });
    helper = await hubOfficer({ suffix: 'RQ3', notice: NOTICE, capabilities: [] });
    other = await hubOfficer({ suffix: 'RQ4', notice: NOTICE, capabilities: [] });
    council = await hubOfficer({
      suffix: 'RQ5',
      notice: NOTICE,
      unitType: 'national',
      capabilities: [SEND],
    });
    for (const o of [asker, helper, other, council]) await readyHub(o.unitId);
  });

  it('is sent by any unit, with permission, to one, several or all other units (P13; D-168)', async () => {
    // D-168: the General Council sends and receives requests like any unit.
    expect((await ask(council, { toAllBranches: false, unitIds: [asker.unitId] })).status).toBe(
      201,
    );
    expect((await requests(asker)).find((r) => r.fromUnitId === council.unitId)?.direction).toBe(
      'received',
    );
    expect((await ask(askerColleague, { toAllBranches: true })).status).toBe(403);
    expect((await ask(asker, { toAllBranches: false, unitIds: [asker.unitId] })).status).toBe(409);
    const sent = await ask(asker, { toAllBranches: false, unitIds: [helper.unitId] });
    expect(sent.status).toBe(201);
    requestId = (await sent.json<{ id: string }>()).id;
    expect((await ask(asker, { toAllBranches: true })).status).toBe(201);
    const toAll = (await requests(asker)).find((r) => r.toAllBranches);
    expect(toAll?.recipients.map((r) => r.unitId)).toEqual(
      expect.arrayContaining([helper.unitId, other.unitId]),
    );
    expect(toAll?.recipients.map((r) => r.unitId)).not.toContain(asker.unitId);
    expect(toAll?.recipients.map((r) => r.unitId)).toContain(council.unitId);
  });

  it("is seen by every officer of its branches only, and becomes Answered at the receiving branch's first reply (D-160)", async () => {
    expect((await requests(other)).map((r) => r.subject)).toEqual(['Chairs']);
    expect(
      (
        await call(
          other.clerkUserId,
          'GET',
          `${unitHub(other.unitId)}/requests/${requestId}/replies`,
        )
      ).status,
    ).toBe(404);
    expect((await reply(askerColleague, 'For our fair on 1 May.')).status).toBe(201);
    expect(await status(helper)).toBe('Open');
    expect((await reply(helper, 'Yes, collect on Friday.')).status).toBe(201);
    expect(await status(asker)).toBe('Answered');
  });

  it('is closed only by the asking branch, and then takes no more replies, never going back (D-160)', async () => {
    const close = (o: Officer) =>
      call(o.clerkUserId, 'POST', `${unitHub(o.unitId)}/requests/${requestId}/close`, {});
    expect((await close(helper)).status).toBe(403);
    expect((await close(askerColleague)).status).toBe(403);
    expect((await close(asker)).status).toBe(204);
    expect(await status(helper)).toBe('Closed');
    expect((await reply(helper, 'One more thing.')).status).toBe(409);
    await expect(
      env.DB.prepare("UPDATE hub_requests SET status = 'Open' WHERE id = ?").bind(requestId).run(),
    ).rejects.toThrow(/never back/);
    await expect(
      env.DB.prepare('DELETE FROM hub_requests WHERE id = ?').bind(requestId).run(),
    ).rejects.toThrow(/never deleted/);
  });
});
