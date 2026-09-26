import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { setSetting } from '../../../src/worker/core/settings';
import { deliverAlert } from '../../../src/worker/services/communication-hub';
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
} from '../../api/communication-hub/hub-fixtures';
import { fakeQueue, registerDevice } from './alert-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ALNTV';
let author: Officer;
let voter: Officer;
let reader: Officer;
let quiet: Officer;
let noticeId = '';

const inbox = async (personId: string) =>
  (
    await env.DB.prepare('SELECT kind FROM notifications WHERE person_id = ?')
      .bind(personId)
      .all<{ kind: string }>()
  ).results.map((row) => row.kind);

describe('alerts: in the portal and on the phone (brief 20 C1, C2; 10.1; D-162, D-163)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    author = await hubOfficer({ suffix: 'AL1', notice: NOTICE, capabilities: [READ, MANAGE] });
    voter = await colleagueOf(author, { suffix: 'AL2', notice: NOTICE, capabilities: [READ] });
    reader = await colleagueOf(author, { suffix: 'AL3', notice: NOTICE, capabilities: [READ] });
    quiet = await colleagueOf(author, { suffix: 'AL4', notice: NOTICE, capabilities: [READ] });
    await readyHub(author.unitId);
    await setSetting(env.DB, {
      key: 'communication-hub.alert_types_for_new_officers',
      value: ['notices', 'votes', 'replies', 'requests'],
      actorPersonId: author.personId,
    });
    expect(
      (
        await call(quiet.clerkUserId, 'PUT', '/api/communication-hub/alert-choices', {
          alertTypes: ['votes'],
        })
      ).status,
    ).toBe(204);
    const vote = {
      question: 'Which date?',
      options: ['May', 'June'],
      closesOn: '2099-06-30',
      eligibility: { kind: 'named', personIds: [voter.personId] },
    };
    const posted = await call(
      author.clerkUserId,
      'POST',
      `${unitHub(author.unitId)}/notices`,
      noticeBody('Hall', vote),
    );
    noticeId = (await posted.json<{ id: string }>()).id;
    await registerDevice('device-AL3', reader.personId, 'https://push.example.org/AL3');
  });

  it("alerts the unit's readers — the chosen voters to the vote — by their own choices, never the author", async () => {
    const { queue } = fakeQueue();
    await deliverAlert(env.DB, queue, {
      eventId: 'event-1',
      event: { kind: 'notice', unitId: author.unitId, noticeId, authorPersonId: author.personId },
    });
    expect(await inbox(voter.personId)).toEqual(['communication-hub.vote']);
    expect(await inbox(reader.personId)).toEqual(['communication-hub.notice']);
    expect(await inbox(quiet.personId)).toEqual([]);
    expect(await inbox(author.personId)).toEqual([]);
  });

  it('writes each notification once, however often the message is retried', async () => {
    const { queue } = fakeQueue();
    await deliverAlert(env.DB, queue, {
      eventId: 'event-1',
      event: { kind: 'notice', unitId: author.unitId, noticeId, authorPersonId: author.personId },
    });
    expect(await inbox(reader.personId)).toEqual(['communication-hub.notice']);
  });

  it('sends each device a phone alert naming only its kind and the unit (D-162)', async () => {
    const { queue, sent } = fakeQueue();
    await deliverAlert(env.DB, queue, {
      eventId: 'event-2',
      event: { kind: 'notice', unitId: author.unitId, noticeId, authorPersonId: author.personId },
    });
    expect(sent).toHaveLength(1);
    const push = sent[0];
    expect(push?.type).toBe('push');
    if (push?.type !== 'push') return;
    expect(push.subscriptionId).toBe('device-AL3');
    expect(push.payload.en).toEqual({ title: 'New notice', body: 'Branch AL1' });
    expect(push.payload.ar.title).toBe('إعلان جديد');
    expect(JSON.stringify(push.payload)).not.toContain('Hall');
  });
});
