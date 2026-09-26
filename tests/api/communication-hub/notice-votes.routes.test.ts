import { env } from 'cloudflare:workers';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { NoticeRecord } from '../../../src/shared/communication-hub/notice-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  colleagueOf,
  hubOfficer,
  MANAGE,
  noticeBody,
  READ,
  readyHub,
  roleOf,
  unitHub,
  type Officer,
} from './hub-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69NVNTV';
const CLOSES_ON = '2099-06-30';
let manager: Officer;
let voter: Officer;
let bystander: Officer;

const notices = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', `${unitHub(o.unitId)}/notices`)).json<NoticeRecord[]>();
const voteOf = async (o: Officer, title: string) =>
  (await notices(o)).find((n) => n.title === title)?.vote;
const vote = (eligibility: object, closesOn = CLOSES_ON) => ({
  question: 'Which date?',
  options: ['May', 'June'],
  closesOn,
  eligibility,
});
const post = (body: object) =>
  call(manager.clerkUserId, 'POST', `${unitHub(manager.unitId)}/notices`, body);
const ballot = (o: Officer, noticeId: string, optionId: string) =>
  call(o.clerkUserId, 'POST', `${unitHub(o.unitId)}/notices/${noticeId}/ballot`, { optionId });

describe('Noticeboard votes (brief 20 A2; P11, P12; D-155, D-156)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await hubOfficer({ suffix: 'NV1', notice: NOTICE, capabilities: [READ, MANAGE] });
    voter = await colleagueOf(manager, { suffix: 'NV2', notice: NOTICE, capabilities: [READ] });
    bystander = await colleagueOf(manager, { suffix: 'NV3', notice: NOTICE, capabilities: [READ] });
    await readyHub(manager.unitId);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens a vote to the voters chosen when it is created — named, or by role (P11)', async () => {
    expect(
      (await post(noticeBody('Named', vote({ kind: 'named', personIds: [voter.personId] }))))
        .status,
    ).toBe(201);
    expect(
      (await post(noticeBody('By role', vote({ kind: 'roles', roleIds: [roleOf('NV3')] })))).status,
    ).toBe(201);
    expect((await voteOf(voter, 'Named'))?.mayVote).toBe(true);
    expect((await voteOf(bystander, 'Named'))?.mayVote).toBe(false);
    expect((await voteOf(bystander, 'By role'))?.mayVote).toBe(true);
    expect((await voteOf(voter, 'By role'))?.mayVote).toBe(false);
  });

  it('refuses a closing date in the past, and a named voter who is not a current officer', async () => {
    expect((await post(noticeBody('Past', vote({ kind: 'unit' }, '2020-01-01')))).status).toBe(409);
    const stranger = vote({ kind: 'named', personIds: ['not-an-officer'] });
    expect((await post(noticeBody('Stranger', stranger))).status).toBe(409);
  });

  it('takes one vote per eligible person, never changed, and locks the vote once cast (P12; D-155)', async () => {
    const named = (await notices(voter)).find((n) => n.title === 'Named');
    const [may, june] = named?.vote?.options ?? [];
    const id = named?.id ?? '';
    expect((await ballot(bystander, id, may?.id ?? '')).status).toBe(403);
    expect((await ballot(voter, id, may?.id ?? '')).status).toBe(204);
    expect((await ballot(voter, id, june?.id ?? '')).status).toBe(409);
    expect((await voteOf(voter, 'Named'))?.myOptionId).toBe(may?.id);
    const change = { version: 1, notice: { ...noticeBody('Named'), vote: vote({ kind: 'unit' }) } };
    const one = `${unitHub(manager.unitId)}/notices/${id}`;
    expect((await call(manager.clerkUserId, 'PUT', one, change)).status).toBe(409);
    await expect(
      env.DB.prepare('DELETE FROM notice_ballots WHERE notice_id = ?').bind(id).run(),
    ).rejects.toThrow(/cannot be changed/);
    await expect(
      env.DB.prepare("UPDATE notice_votes SET question = 'Other?' WHERE notice_id = ?")
        .bind(id)
        .run(),
    ).rejects.toThrow(/vote locked/);
  });

  it('moves a closing date later after voting starts, never earlier (D-166)', async () => {
    const byRole = (await notices(bystander)).find((n) => n.title === 'By role');
    const id = byRole?.id ?? '';
    expect((await ballot(bystander, id, byRole?.vote?.options[0]?.id ?? '')).status).toBe(204);
    const closing = `${unitHub(manager.unitId)}/notices/${id}/closing-date`;
    const move = (closesOn: string) => call(manager.clerkUserId, 'PUT', closing, { closesOn });
    expect((await move('2099-06-29')).status).toBe(409);
    expect((await move(CLOSES_ON)).status).toBe(409);
    expect((await call(voter.clerkUserId, 'PUT', closing, { closesOn: '2099-07-15' })).status).toBe(
      403,
    );
    expect((await move('2099-07-15')).status).toBe(204);
    expect((await voteOf(bystander, 'By role'))?.closesOn).toBe('2099-07-15');
    await expect(
      env.DB.prepare(
        "UPDATE notice_votes SET closes_on = '2099-07-01', closes_at = '2099-06-30T23:00:00.000Z' WHERE notice_id = ?",
      )
        .bind(id)
        .run(),
    ).rejects.toThrow(/only be moved later/);
  });

  it('hides the results until the vote closes, then shows counts only, to every reader (P12; D-156)', async () => {
    expect((await voteOf(bystander, 'Named'))?.results).toBeNull();
    vi.useFakeTimers({ toFake: ['Date'] });
    // The end of 30 June in London (BST) is 23:00 UTC.
    vi.setSystemTime(new Date('2099-06-30T22:59:59.000Z'));
    expect((await voteOf(bystander, 'Named'))?.results).toBeNull();
    vi.setSystemTime(new Date('2099-06-30T23:00:00.000Z'));
    const closed = await voteOf(bystander, 'Named');
    expect(closed?.closed).toBe(true);
    expect(closed?.results?.map((r) => r.count)).toEqual([1, 0]);
    expect((await voteOf(bystander, 'By role'))?.mayVote).toBe(false);
  });
});
