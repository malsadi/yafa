import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  HubMessage,
  RoleNetwork,
} from '../../../src/shared/communication-hub/conversation-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call, officerInSharedRole, type Officer } from './hub-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69RNNTV';
const TREASURER = '01ARZ3NDEKTSV4RRFFQ69RNTRS';
const SECRETARY = '01ARZ3NDEKTSV4RRFFQ69RNSEC';
const NETWORKS = '/api/communication-hub/role-networks';
let north: Officer;
let south: Officer;
let secretary: Officer;

const messages = async (o: Officer, roleId = TREASURER) =>
  call(o.clerkUserId, 'GET', `${NETWORKS}/${roleId}/messages`);

describe('role networks and removing a message (brief 20 B1; D-158, D-161)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    north = await officerInSharedRole({
      suffix: 'RN1',
      notice: NOTICE,
      roleId: TREASURER,
      capabilities: [],
    });
    south = await officerInSharedRole({
      suffix: 'RN2',
      notice: NOTICE,
      roleId: TREASURER,
      capabilities: [],
    });
    secretary = await officerInSharedRole({
      suffix: 'RN3',
      notice: NOTICE,
      roleId: SECRETARY,
      capabilities: [],
    });
  });

  it('puts everyone holding a role now, in any unit, in its one shared conversation (D-158)', async () => {
    const mine = await (await call(north.clerkUserId, 'GET', NETWORKS)).json<RoleNetwork[]>();
    expect(mine.map((n) => n.roleId)).toEqual([TREASURER]);
    const post = await call(north.clerkUserId, 'POST', `${NETWORKS}/${TREASURER}/messages`, {
      body: 'Year-end is close.',
    });
    expect(post.status).toBe(201);
    const seen = await (await messages(south)).json<HubMessage[]>();
    expect(seen.map((m) => [m.authorUnitsEn, m.body, m.mine])).toEqual([
      ['Unit RN1', 'Year-end is close.', false],
    ]);
    expect((await messages(secretary)).status).toBe(403);
    expect(
      (
        await call(secretary.clerkUserId, 'POST', `${NETWORKS}/${TREASURER}/messages`, {
          body: 'Hi',
        })
      ).status,
    ).toBe(403);
  });

  it('lets only the author remove a message, leaving a mark and deleting nothing (D-161)', async () => {
    const [message] = await (await messages(north)).json<HubMessage[]>();
    const remove = (o: Officer) =>
      call(
        o.clerkUserId,
        'POST',
        `/api/communication-hub/messages/${message?.id ?? ''}/remove`,
        {},
      );
    expect((await remove(south)).status).toBe(403);
    expect((await remove(north)).status).toBe(204);
    expect((await remove(north)).status).toBe(409);
    const [removed] = await (await messages(south)).json<HubMessage[]>();
    expect([removed?.removed, removed?.body]).toEqual([true, null]);
    await expect(
      env.DB.prepare("UPDATE hub_messages SET body = 'Changed' WHERE id = ?")
        .bind(message?.id ?? '')
        .run(),
    ).rejects.toThrow(/never changed/);
    await expect(
      env.DB.prepare('DELETE FROM hub_messages WHERE id = ?')
        .bind(message?.id ?? '')
        .run(),
    ).rejects.toThrow(/never deleted/);
  });
});
