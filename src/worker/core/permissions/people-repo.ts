import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { people } from '../../../db/schema/committee-register/people';

/** Used by the request-context loader to resolve a Clerk session to a person. */
export async function findPersonByClerkUserId(
  db: D1Database,
  clerkUserId: string,
): Promise<{ id: string } | null> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ id: people.id })
    .from(people)
    .where(eq(people.clerkUserId, clerkUserId))
    .limit(1);

  return rows[0] ?? null;
}
