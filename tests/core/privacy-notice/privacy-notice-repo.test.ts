import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import {
  buildAcknowledgePrivacyNoticeStatement,
  getCurrentPrivacyNoticeVersion,
  hasAcknowledgedVersion,
} from '../../../src/worker/core/privacy-notice';

async function insertPerson(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('INSERT INTO people (id, email, clerk_user_id, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, `${id}@example.org`, null, new Date().toISOString())
    .run();
}

function insertNoticeVersionStatement(
  db: D1Database,
  params: { id: string; createdAt: string; textAr?: string | null },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, ?, ?)',
    )
    .bind(params.id, 'English notice text', params.textAr ?? null, params.createdAt);
}

describe('getCurrentPrivacyNoticeVersion', () => {
  it('returns null when no version has ever been set', async () => {
    expect(await getCurrentPrivacyNoticeVersion(env.DB)).toBeNull();
  });

  it('returns the most recently created version', async () => {
    await env.DB.batch([
      insertNoticeVersionStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69PNV1',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      insertNoticeVersionStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69PNV2',
        createdAt: '2026-02-01T00:00:00.000Z',
        textAr: 'Arabic notice text',
      }),
    ]);

    const current = await getCurrentPrivacyNoticeVersion(env.DB);
    expect(current).toEqual({
      id: '01ARZ3NDEKTSV4RRFFQ69PNV2',
      textEn: 'English notice text',
      textAr: 'Arabic notice text',
    });
  });
});

describe('hasAcknowledgedVersion / buildAcknowledgePrivacyNoticeStatement', () => {
  it('is false before acknowledging, true after, and only for that version', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69PNVP';
    await insertPerson(env.DB, personId);
    await env.DB.batch([
      insertNoticeVersionStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69PNV3',
        createdAt: new Date().toISOString(),
      }),
      insertNoticeVersionStatement(env.DB, {
        id: '01ARZ3NDEKTSV4RRFFQ69PNV4',
        createdAt: new Date().toISOString(),
      }),
    ]);

    expect(
      await hasAcknowledgedVersion(env.DB, {
        personId,
        noticeVersionId: '01ARZ3NDEKTSV4RRFFQ69PNV3',
      }),
    ).toBe(false);

    await env.DB.batch([
      buildAcknowledgePrivacyNoticeStatement(env.DB, {
        personId,
        noticeVersionId: '01ARZ3NDEKTSV4RRFFQ69PNV3',
      }),
    ]);

    expect(
      await hasAcknowledgedVersion(env.DB, {
        personId,
        noticeVersionId: '01ARZ3NDEKTSV4RRFFQ69PNV3',
      }),
    ).toBe(true);
    expect(
      await hasAcknowledgedVersion(env.DB, {
        personId,
        noticeVersionId: '01ARZ3NDEKTSV4RRFFQ69PNV4',
      }),
    ).toBe(false);
  });
});
