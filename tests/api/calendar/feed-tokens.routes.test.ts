import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { FeedTokenStatus } from '../../../src/shared/calendar/feed-path';
import { acknowledgeNotice, insertNoticeVersion, seedOfficer } from '../../app/app-fixtures';
import { call } from '../documents-archive/archive-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69CFTNV';
let officer: Awaited<ReturnType<typeof seedOfficer>>;

const status = async () =>
  (await call(officer.clerkUserId, 'GET', '/api/calendar/feed-token')).json<FeedTokenStatus>();
const make = async () =>
  (await call(officer.clerkUserId, 'POST', '/api/calendar/feed-token', {})).json<{
    token: string;
  }>();
const stored = async () =>
  env.DB.prepare('SELECT token_hash AS hash FROM calendar_feed_tokens WHERE person_id = ?')
    .bind(officer.personId)
    .first<{ hash: string }>();

describe('phone calendar feed tokens (brief 6.4, 19 C1)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    officer = await seedOfficer({ suffix: 'CF1' });
    await acknowledgeNotice(officer.personId, NOTICE);
  });

  it('gives an officer a long random token once, and stores only its hash', async () => {
    expect(await status()).toEqual({ createdAt: null });
    const { token } = await make();
    expect(token.length).toBeGreaterThanOrEqual(40);
    const row = await stored();
    expect(row?.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(row?.hash).not.toContain(token);
    expect((await status()).createdAt).not.toBeNull();
  });

  it('replaces the token when the officer makes a new one, so the old one stops working', async () => {
    const before = (await stored())?.hash;
    const { token } = await make();
    const after = (await stored())?.hash;
    expect(after).not.toBe(before);
    const count = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM calendar_feed_tokens WHERE person_id = ?',
    )
      .bind(officer.personId)
      .first<{ n: number }>();
    expect(count?.n).toBe(1);
    expect(token).not.toBe('');
  });
});
