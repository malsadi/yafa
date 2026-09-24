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

/**
 * People whose account should lock now that their last term has ended
 * (brief 6.2, D-063): a linked, unlocked account; at least one term that
 * has ended by `today`; and no term current or starting later.
 */
export async function findAccountsWhoseLastTermEnded(
  db: D1Database,
  today: string,
  personId?: string,
): Promise<string[]> {
  const result = await db
    .prepare(
      `SELECT p.id AS id FROM people p
       WHERE p.clerk_user_id IS NOT NULL AND p.account_locked_at IS NULL
         AND (?1 IS NULL OR p.id = ?1)
         AND EXISTS (SELECT 1 FROM terms t WHERE t.person_id = p.id AND t.end_date IS NOT NULL AND t.end_date <= ?2)
         AND NOT EXISTS (SELECT 1 FROM terms t WHERE t.person_id = p.id AND (t.end_date IS NULL OR t.end_date > ?2))`,
    )
    .bind(personId ?? null, today)
    .all<{ id: string }>();
  return result.results.map((row) => row.id);
}
