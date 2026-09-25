import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { buildSeedSql } from '../../scripts/seed/build-seed-sql.ts';
import { checkSeed } from '../../scripts/seed/check-seed.ts';
import { generateId } from '../../src/worker/core/ids';
import { loadRequestContext } from '../../src/worker/core/permissions';
import { TODAY, VALID_SEED } from '../structure/seed/seed-fixtures.ts';

describe('the seed SQL loads into the real schema (docs/seed-files.md)', () => {
  it('loads units, roles, people, terms, administrators and the notice, and nothing else', async () => {
    const { input, errors } = checkSeed(VALID_SEED, TODAY);
    const statements = buildSeedSql(input, {
      language: 'en',
      now: '2026-09-25T09:00:00.000Z',
      newId: generateId,
    });
    await env.DB.batch(statements.map((statement) => env.DB.prepare(statement)));
    const count = async (table: string) =>
      (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${table}`).first<{ n: number }>())?.n;
    const sami = await env.DB.prepare(
      "SELECT id, clerk_user_id AS clerkUserId, language FROM people WHERE email = 'sami.example@example.org'",
    ).first<{ id: string; clerkUserId: string | null; language: string }>();

    expect(errors).toEqual([]);
    expect(await count('units')).toBe(3);
    expect(await count('roles')).toBe(4);
    expect(await count('terms')).toBe(3);
    expect(await count('system_administrators')).toBe(2);
    expect(await count('privacy_notice_versions')).toBe(1);
    expect(await count('invitations')).toBe(0);
    expect(sami).toMatchObject({ clerkUserId: null, language: 'en' });
  });

  it('keeps Arabic text and the notice exactly as written', async () => {
    const notice = await env.DB.prepare(
      'SELECT text_en, text_ar FROM privacy_notice_versions',
    ).first<{
      text_en: string;
      text_ar: string;
    }>();
    const role = await env.DB.prepare(
      "SELECT name_ar FROM roles WHERE name_en = 'Secretary'",
    ).first<{ name_ar: string }>();

    expect(notice).toEqual({ text_en: VALID_SEED.noticeEn, text_ar: VALID_SEED.noticeAr });
    expect(role?.name_ar).toBe('أمين السر');
  });

  it('gives a seeded administrator access once their account links (D-027)', async () => {
    await env.DB.prepare(
      "UPDATE people SET clerk_user_id = 'clerk_seed_ada' WHERE email = 'ada.example@example.org'",
    ).run();
    const result = await loadRequestContext(env.DB, 'clerk_seed_ada');

    expect(result.status).toBe('active');
    expect(result.status === 'active' && result.context.isSystemAdmin).toBe(true);
  });
});
