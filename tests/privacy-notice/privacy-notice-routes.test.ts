import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { buildTestApp, insertNoticeVersion, ORIGIN, seedOfficer } from '../app/app-fixtures';

async function acknowledge(clerkUserId: string, noticeVersionId: string): Promise<Response> {
  const { app, tokenFor } = await buildTestApp();
  return app.request(`${ORIGIN}/api/privacy-notice/acknowledgements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ noticeVersionId }),
  });
}

async function countAcknowledgements(personId: string): Promise<number> {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM privacy_notice_acknowledgements WHERE person_id = ?',
  )
    .bind(personId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// Tests run in order and share this file's D1 storage: the first runs
// before any notice exists.
describe('privacy notice routes (D-005, D-024)', () => {
  it('reports not-set before any notice exists, and refuses to acknowledge', async () => {
    const officer = await seedOfficer({ suffix: 'PN1' });
    const { app, tokenFor } = await buildTestApp();

    const get = await app.request(`${ORIGIN}/api/privacy-notice`, {
      headers: { Authorization: `Bearer ${await tokenFor(officer.clerkUserId)}` },
    });
    const post = await acknowledge(officer.clerkUserId, 'anything');

    expect(get.status).toBe(404);
    expect(await get.json()).toEqual({ error: { code: 'privacy-notice.not-set' } });
    expect(post.status).toBe(404);
  });

  it('returns the current notice in both languages to a linked officer', async () => {
    await insertNoticeVersion('01ARZ3NDEKTSV4RRFFQ69PNV1', '2026-01-01T00:00:00.000Z');
    const officer = await seedOfficer({ suffix: 'PN2' });
    const { app, tokenFor } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/privacy-notice`, {
      headers: { Authorization: `Bearer ${await tokenFor(officer.clerkUserId)}` },
    });

    expect(await res.json()).toEqual({
      id: '01ARZ3NDEKTSV4RRFFQ69PNV1',
      textEn: 'Fictional notice',
      textAr: 'إشعار تجريبي',
    });
  });

  it('hides the notice from a signed-in user who is not active', async () => {
    const { app, tokenFor } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/privacy-notice`, {
      headers: { Authorization: `Bearer ${await tokenFor('clerk_app_nobody')}` },
    });

    expect(res.status).toBe(404);
  });

  it('records who acknowledged which version, once', async () => {
    const officer = await seedOfficer({ suffix: 'PN3' });

    const first = await acknowledge(officer.clerkUserId, '01ARZ3NDEKTSV4RRFFQ69PNV1');
    const second = await acknowledge(officer.clerkUserId, '01ARZ3NDEKTSV4RRFFQ69PNV1');

    expect(first.status).toBe(204);
    expect(second.status).toBe(409);
    expect(await countAcknowledgements(officer.personId)).toBe(1);
  });

  it('refuses an acknowledgement of a version that is no longer current', async () => {
    await insertNoticeVersion('01ARZ3NDEKTSV4RRFFQ69PNV2', '2026-02-01T00:00:00.000Z');
    const officer = await seedOfficer({ suffix: 'PN4' });

    const res = await acknowledge(officer.clerkUserId, '01ARZ3NDEKTSV4RRFFQ69PNV1');

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: { code: 'privacy-notice.version-changed' } });
    expect(await countAcknowledgements(officer.personId)).toBe(0);
  });
});
