import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  DiscussionInvitee,
  DiscussionSummary,
  HubMessage,
} from '../../../src/shared/communication-hub/conversation-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { call, officerInSharedRole, unitHub, type Officer } from './hub-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69DSNTV';
const START = 'communication-hub.discussions.start';
const DISCUSSIONS = '/api/communication-hub/discussions';
let starter: Officer;
let member: Officer;
let late: Officer;
let discussionId = '';

const mine = async (o: Officer) =>
  (await (await call(o.clerkUserId, 'GET', DISCUSSIONS)).json<{ items: DiscussionSummary[] }>())
    .items;
const messages = (o: Officer) =>
  call(o.clerkUserId, 'GET', `${DISCUSSIONS}/${discussionId}/messages`);
const invite = (o: Officer, personIds: string[]) =>
  call(o.clerkUserId, 'POST', `${DISCUSSIONS}/${discussionId}/members`, { personIds });

describe('topic discussions (brief 20 B2; D-159)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    starter = await officerInSharedRole({
      suffix: 'DS1',
      notice: NOTICE,
      roleId: 'role-ds-chair',
      capabilities: [START],
    });
    member = await officerInSharedRole({
      suffix: 'DS2',
      notice: NOTICE,
      roleId: 'role-ds-member',
      capabilities: [],
    });
    late = await officerInSharedRole({
      suffix: 'DS3',
      notice: NOTICE,
      roleId: 'role-ds-late',
      capabilities: [],
    });
  });

  it('is started with a permission, inviting officers from any unit', async () => {
    const invitees = await (
      await call(starter.clerkUserId, 'GET', `${unitHub(starter.unitId)}/discussion-invitees`)
    ).json<DiscussionInvitee[]>();
    expect(invitees.map((i) => i.personId)).toEqual(
      expect.arrayContaining([member.personId, late.personId]),
    );
    const body = {
      subject: 'Youth programme',
      body: 'Ideas, please.',
      personIds: [member.personId],
    };
    expect(
      (await call(member.clerkUserId, 'POST', `${unitHub(member.unitId)}/discussions`, body))
        .status,
    ).toBe(403);
    const started = await call(
      starter.clerkUserId,
      'POST',
      `${unitHub(starter.unitId)}/discussions`,
      body,
    );
    expect(started.status).toBe(201);
    discussionId = (await started.json<{ id: string }>()).id;
    expect((await mine(member)).map((d) => [d.subject, d.members.length, d.startedByMe])).toEqual([
      ['Youth programme', 2, false],
    ]);
  });

  it('is open only to those invited, and only its starter invites (D-159)', async () => {
    expect(await mine(late)).toEqual([]);
    expect((await messages(late)).status).toBe(404);
    expect(
      (
        await call(member.clerkUserId, 'POST', `${DISCUSSIONS}/${discussionId}/messages`, {
          body: 'A camp?',
        })
      ).status,
    ).toBe(201);
    expect((await invite(member, [late.personId])).status).toBe(403);
    expect((await invite(starter, ['not-an-officer'])).status).toBe(409);
  });

  it('shows someone invited late everything said so far (D-159)', async () => {
    expect((await invite(starter, [late.personId])).status).toBe(204);
    const seen = await (await messages(late)).json<HubMessage[]>();
    expect(seen.map((m) => m.body)).toEqual(['Ideas, please.', 'A camp?']);
    await expect(
      env.DB.prepare('DELETE FROM discussion_members WHERE discussion_id = ?')
        .bind(discussionId)
        .run(),
    ).rejects.toThrow(/never changed or deleted/);
  });

  it('lets the starter remove a member and a member leave — recorded, messages kept, invited back later (D-168)', async () => {
    const remove = (o: Officer, personId: string) =>
      call(o.clerkUserId, 'POST', `${DISCUSSIONS}/${discussionId}/members/${personId}/remove`, {});
    const leave = (o: Officer) =>
      call(o.clerkUserId, 'POST', `${DISCUSSIONS}/${discussionId}/leave`, {});
    expect((await remove(member, late.personId)).status).toBe(403);
    expect((await remove(starter, starter.personId)).status).toBe(409);
    expect((await leave(starter)).status).toBe(409);
    expect((await remove(starter, late.personId)).status).toBe(204);
    expect(await mine(late)).toEqual([]);
    expect((await messages(late)).status).toBe(404);
    expect((await leave(member)).status).toBe(204);
    expect((await mine(starter))[0]?.members.map((m) => m.personId)).toEqual([starter.personId]);
    const kept = await (await messages(starter)).json<HubMessage[]>();
    expect(kept.map((m) => m.body)).toEqual(['Ideas, please.', 'A camp?']);
    expect((await invite(starter, [member.personId])).status).toBe(204);
    expect((await messages(member)).status).toBe(200);
    const departures = await env.DB.prepare(
      'SELECT person_id AS personId, removed_by AS removedBy FROM discussion_departures WHERE discussion_id = ? ORDER BY departed_at',
    )
      .bind(discussionId)
      .all<{ personId: string; removedBy: string | null }>();
    expect(departures.results).toEqual([
      { personId: late.personId, removedBy: starter.personId },
      { personId: member.personId, removedBy: null },
    ]);
    await expect(
      env.DB.prepare('DELETE FROM discussion_departures WHERE discussion_id = ?')
        .bind(discussionId)
        .run(),
    ).rejects.toThrow(/recorded for good/);
  });
});
