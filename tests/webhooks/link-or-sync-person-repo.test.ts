import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import {
  buildLinkPersonStatement,
  buildSyncPersonEmailStatement,
  buildUnlinkPersonStatement,
  findPersonIdByClerkUserId,
  findPersonIdByEmail,
} from '../../src/worker/webhooks/link-or-sync-person-repo';

async function insertPerson(
  db: D1Database,
  params: { id: string; email: string; clerkUserId?: string },
): Promise<void> {
  await db
    .prepare('INSERT INTO people (id, email, clerk_user_id, created_at) VALUES (?, ?, ?, ?)')
    .bind(params.id, params.email, params.clerkUserId ?? null, new Date().toISOString())
    .run();
}

describe('findPersonIdByEmail', () => {
  it('matches case-insensitively (T-049)', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHP1';
    await insertPerson(env.DB, { id: personId, email: 'Officer.One@Example.org' });

    expect(await findPersonIdByEmail(env.DB, 'officer.one@example.org')).toBe(personId);
  });

  it('returns null for no match', async () => {
    expect(await findPersonIdByEmail(env.DB, 'nobody-at-all@example.org')).toBeNull();
  });
});

describe('buildLinkPersonStatement / findPersonIdByClerkUserId', () => {
  it('links a person to a Clerk user id', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHP2';
    await insertPerson(env.DB, { id: personId, email: 'p2@example.org' });

    await env.DB.batch([
      buildLinkPersonStatement(env.DB, { personId, clerkUserId: 'clerk_user_2' }),
    ]);

    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_user_2')).toBe(personId);
  });
});

describe('buildUnlinkPersonStatement', () => {
  it('clears clerk_user_id without touching the person record', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHP3';
    await insertPerson(env.DB, {
      id: personId,
      email: 'p3@example.org',
      clerkUserId: 'clerk_user_3',
    });

    await env.DB.batch([buildUnlinkPersonStatement(env.DB, 'clerk_user_3')]);

    expect(await findPersonIdByClerkUserId(env.DB, 'clerk_user_3')).toBeNull();
    const row = await env.DB.prepare('SELECT id FROM people WHERE id = ?').bind(personId).first();
    expect(row).not.toBeNull();
  });
});

describe('buildSyncPersonEmailStatement', () => {
  it('updates the stored email, lowercased, for the linked Clerk user', async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69WHP4';
    await insertPerson(env.DB, {
      id: personId,
      email: 'old@example.org',
      clerkUserId: 'clerk_user_4',
    });

    await env.DB.batch([
      buildSyncPersonEmailStatement(env.DB, {
        clerkUserId: 'clerk_user_4',
        email: 'New.Address@Example.org',
      }),
    ]);

    const row = await env.DB.prepare('SELECT email FROM people WHERE id = ?')
      .bind(personId)
      .first<{ email: string }>();
    expect(row?.email).toBe('new.address@example.org');
  });
});
