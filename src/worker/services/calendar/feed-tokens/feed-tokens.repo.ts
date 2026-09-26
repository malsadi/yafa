/** Brief 6.4: the officer's token, replaced if they had one — the old one stops working. */
export function buildSetFeedTokenStatement(
  db: D1Database,
  row: { personId: string; tokenHash: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO calendar_feed_tokens (person_id, token_hash, created_at) VALUES (?, ?, ?)
       ON CONFLICT(person_id) DO UPDATE SET token_hash = excluded.token_hash, created_at = excluded.created_at`,
    )
    .bind(row.personId, row.tokenHash, row.at);
}

/** Brief 6.4 and 25 A2: revoke an officer's token; their feed stops working until they make a new one. */
export function buildRevokeFeedTokenStatement(
  db: D1Database,
  personId: string,
): D1PreparedStatement {
  return db.prepare('DELETE FROM calendar_feed_tokens WHERE person_id = ?').bind(personId);
}

export async function feedTokenCreatedAt(db: D1Database, personId: string): Promise<string | null> {
  const row = await db
    .prepare('SELECT created_at AS createdAt FROM calendar_feed_tokens WHERE person_id = ?')
    .bind(personId)
    .first<{ createdAt: string }>();
  return row?.createdAt ?? null;
}

/** Brief 6.4: whose feed a token opens, by its hash; null for an unknown or revoked one. */
export async function personOfFeedTokenHash(
  db: D1Database,
  tokenHash: string,
): Promise<string | null> {
  const row = await db
    .prepare('SELECT person_id AS personId FROM calendar_feed_tokens WHERE token_hash = ?')
    .bind(tokenHash)
    .first<{ personId: string }>();
  return row?.personId ?? null;
}
