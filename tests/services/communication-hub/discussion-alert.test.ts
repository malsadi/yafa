import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { setSetting } from '../../../src/worker/core/settings';
import { deliverAlert } from '../../../src/worker/services/communication-hub';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  officerInSharedRole,
  unitHub,
  type Officer,
} from '../../api/communication-hub/hub-fixtures';
import { fakeQueue, registerDevice } from './alert-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69DANTV';
const START = 'communication-hub.discussions.start';
let starter: Officer;
let member: Officer;
let quiet: Officer;
let discussionId = '';

const inbox = async (personId: string) =>
  (
    await env.DB.prepare('SELECT kind FROM notifications WHERE person_id = ?')
      .bind(personId)
      .all<{ kind: string }>()
  ).results.map((row) => row.kind);

describe('a new discussion alerts its members as a new discussion (brief 20 C1; D-169)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    const shared = { notice: NOTICE, capabilities: [] };
    starter = await officerInSharedRole({
      ...shared,
      suffix: 'DA1',
      roleId: 'role-da-chair',
      capabilities: [START],
    });
    member = await officerInSharedRole({ ...shared, suffix: 'DA2', roleId: 'role-da-member' });
    quiet = await officerInSharedRole({ ...shared, suffix: 'DA3', roleId: 'role-da-quiet' });
    await setSetting(env.DB, {
      key: 'communication-hub.alert_types_for_new_officers',
      value: ['replies'],
      actorPersonId: starter.personId,
    });
    await call(quiet.clerkUserId, 'PUT', '/api/communication-hub/alert-choices', {
      alertTypes: ['notices'],
    });
    const started = await call(
      starter.clerkUserId,
      'POST',
      `${unitHub(starter.unitId)}/discussions`,
      { subject: 'Youth camp', body: 'Ideas?', personIds: [member.personId, quiet.personId] },
    );
    discussionId = (await started.json<{ id: string }>()).id;
    await registerDevice('device-DA2', member.personId, 'https://push.example.org/DA2');
  });

  it('tells its members, never the starter, and follows their choice for replies', async () => {
    const { queue, sent } = fakeQueue();
    await deliverAlert(env.DB, queue, {
      eventId: 'event-DA1',
      event: { kind: 'discussion', discussionId, authorPersonId: starter.personId },
    });
    expect(await inbox(member.personId)).toEqual(['communication-hub.discussion']);
    expect(await inbox(quiet.personId)).toEqual([]);
    expect(await inbox(starter.personId)).toEqual([]);
    const push = sent[0];
    expect(push?.type).toBe('push');
    if (push?.type !== 'push') return;
    expect(push.alertType).toBe('replies');
    expect(push.payload.en.title).toBe('New discussion');
    expect(push.payload.ar.title).toBe('نقاش جديد');
  });
});
