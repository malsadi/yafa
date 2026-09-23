import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { buildRemovePushSubscriptionStatement } from '../../../src/worker/core/push';

async function insertPerson(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('INSERT INTO people (id, email, clerk_user_id, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, `${id}@example.org`, null, new Date().toISOString())
    .run();
}

async function insertPushSubscription(
  db: D1Database,
  params: { id: string; personId: string },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO push_subscriptions
         (id, person_id, endpoint, p256dh, auth, expiration_time, created_at)
       VALUES (?, ?, ?, ?, ?, NULL, ?)`,
    )
    .bind(
      params.id,
      params.personId,
      `https://push.example.org/subscription/${params.id}`,
      'fake-p256dh',
      'fake-auth',
      new Date().toISOString(),
    )
    .run();
}

describe('buildRemovePushSubscriptionStatement', () => {
  it("composes into a caller's own batch, and removes only the named subscription", async () => {
    const personId = '01ARZ3NDEKTSV4RRFFQ69PSHA';
    await insertPerson(env.DB, personId);
    await insertPushSubscription(env.DB, { id: '01ARZ3NDEKTSV4RRFFQ69PS01', personId });
    await insertPushSubscription(env.DB, { id: '01ARZ3NDEKTSV4RRFFQ69PS02', personId });

    await env.DB.batch([buildRemovePushSubscriptionStatement(env.DB, '01ARZ3NDEKTSV4RRFFQ69PS01')]);

    const rows = await env.DB.prepare('SELECT id FROM push_subscriptions WHERE person_id = ?')
      .bind(personId)
      .all<{ id: string }>();
    expect(rows.results.map((row) => row.id)).toEqual(['01ARZ3NDEKTSV4RRFFQ69PS02']);
  });
});
