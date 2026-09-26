import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { setSetting } from '../../../src/worker/core/settings';
import { prunePush, queueVoteResults } from '../../../src/worker/services/communication-hub';
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

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69JBNTV';
let manager: Officer;
let voter: Officer;

describe("the hub's scheduled jobs (brief 11: Close votes, Push pruning; D-050)", () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await hubOfficer({ suffix: 'JB1', notice: NOTICE, capabilities: [READ, MANAGE] });
    voter = await colleagueOf(manager, { suffix: 'JB2', notice: NOTICE, capabilities: [READ] });
    await readyHub(manager.unitId);
    const vote = {
      question: 'Which date?',
      options: ['May', 'June'],
      closesOn: '2099-06-30',
      eligibility: { kind: 'unit' },
    };
    expect(
      (
        await call(
          manager.clerkUserId,
          'POST',
          `${unitHub(manager.unitId)}/notices`,
          noticeBody('Hall', vote),
        )
      ).status,
    ).toBe(201);
  });

  it("queues a closed vote's result alerts once, however often the job runs", async () => {
    const { queue, sent } = fakeQueue();
    expect(await queueVoteResults(env.DB, queue, '2099-06-30T22:59:59.000Z')).toBe(0);
    expect(await queueVoteResults(env.DB, queue, '2099-06-30T23:00:00.000Z')).toBe(1);
    expect(await queueVoteResults(env.DB, queue, '2099-07-01T00:15:00.000Z')).toBe(0);
    expect(sent.map((m) => (m.type === 'alert' ? m.event.kind : m.type))).toEqual(['vote-result']);
  });

  it('removes expired devices, and undelivered alerts older than the period set (D-050)', async () => {
    await registerDevice('expired', voter.personId, 'https://push.example.org/expired');
    await registerDevice('current', voter.personId, 'https://push.example.org/current');
    await env.DB.prepare(
      "UPDATE push_subscriptions SET expiration_time = 1000 WHERE id = 'expired'",
    ).run();
    await env.DB.prepare(
      "INSERT INTO push_delivery_failures (id, person_id, alert_kind, last_status, failed_at) VALUES ('old', ?1, 'notices', '503', '2026-01-01T00:00:00.000Z'), ('new', ?1, 'notices', '503', '2026-03-09T00:00:00.000Z')",
    )
      .bind(voter.personId)
      .run();
    const now = new Date('2026-03-10T00:00:00.000Z');
    await expect(prunePush(env.DB, now)).rejects.toThrow();
    const ids = async (table: string) =>
      (
        await env.DB.prepare(`SELECT id FROM ${table} WHERE person_id = ?`)
          .bind(voter.personId)
          .all<{ id: string }>()
      ).results.map((r) => r.id);
    expect(await ids('push_subscriptions')).toEqual(['current']);
    expect((await ids('push_delivery_failures')).sort()).toEqual(['new', 'old']);
    await setSetting(env.DB, {
      key: 'communication-hub.undelivered_alert_retention_days',
      value: 30,
      actorPersonId: manager.personId,
    });
    await prunePush(env.DB, now);
    expect(await ids('push_delivery_failures')).toEqual(['new']);
  });
});
