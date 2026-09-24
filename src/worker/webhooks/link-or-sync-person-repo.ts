/**
 * Raw SQL against `people` — Committee register's own service/repo layer
 * doesn't exist yet (Phase 1), the same reasoning T-043 already applies to
 * `core/permissions`' own `people-repo.ts`: this is the working code until
 * then, not a placeholder for it.
 *
 * Matches case-insensitively (T-049): every write here also lowercases, so
 * a casing difference between Clerk and a register officer's typed email
 * can never silently fail to link.
 */
export async function findPersonIdByEmail(db: D1Database, email: string): Promise<string | null> {
  const row = await db
    .prepare('SELECT id FROM people WHERE lower(email) = lower(?)')
    .bind(email)
    .first<{ id: string }>();
  return row?.id ?? null;
}

/**
 * A separate query from `core/permissions`' own `findPersonByClerkUserId`
 * (which is internal to that module — `loadRequestContext`'s concern, not
 * exported) rather than reaching into it: same reasoning as this file's own
 * doc comment, each consumer queries `people` directly until Phase 1's
 * Committee register service owns it.
 */
export async function findPersonIdByClerkUserId(
  db: D1Database,
  clerkUserId: string,
): Promise<string | null> {
  const row = await db
    .prepare('SELECT id FROM people WHERE clerk_user_id = ?')
    .bind(clerkUserId)
    .first<{ id: string }>();
  return row?.id ?? null;
}

export function buildLinkPersonStatement(
  db: D1Database,
  params: { personId: string; clerkUserId: string },
): D1PreparedStatement {
  return db
    .prepare('UPDATE people SET clerk_user_id = ?, clerk_unlinked_at = NULL WHERE id = ?')
    .bind(params.clerkUserId, params.personId);
}

/**
 * Brief section 6.2: "a deleted Clerk user leaves the person record in
 * place, unlinked" — and records when, which is the "Not linked" account
 * state (brief 25 A2, D-061).
 */
export function buildUnlinkPersonStatement(
  db: D1Database,
  clerkUserId: string,
): D1PreparedStatement {
  return db
    .prepare(
      'UPDATE people SET clerk_user_id = NULL, clerk_unlinked_at = ? WHERE clerk_user_id = ?',
    )
    .bind(new Date().toISOString(), clerkUserId);
}

/** Brief section 6.2: "email changes in Clerk are synced by webhook." */
export function buildSyncPersonEmailStatement(
  db: D1Database,
  params: { clerkUserId: string; email: string },
): D1PreparedStatement {
  return db
    .prepare('UPDATE people SET email = lower(?) WHERE clerk_user_id = ?')
    .bind(params.email, params.clerkUserId);
}
