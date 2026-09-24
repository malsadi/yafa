import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { people } from '../../../../db/schema/committee-register/people';

export interface AccountRecord {
  clerkUserId: string | null;
  accountLockedAt: string | null;
}

export async function findAccount(db: D1Database, personId: string): Promise<AccountRecord | null> {
  const rows = await drizzle(db)
    .select({ clerkUserId: people.clerkUserId, accountLockedAt: people.accountLockedAt })
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);
  return rows[0] ?? null;
}

export function buildSetLockedStatement(
  db: D1Database,
  personId: string,
  lockedAt: string | null,
): D1PreparedStatement {
  return db
    .prepare('UPDATE people SET account_locked_at = ? WHERE id = ?')
    .bind(lockedAt, personId);
}

/** Brief 25 A2: "remove push devices" — the person's phone subscriptions (9.5). */
export function buildRemovePushDevicesStatement(
  db: D1Database,
  personId: string,
): D1PreparedStatement {
  return db.prepare('DELETE FROM push_subscriptions WHERE person_id = ?').bind(personId);
}
