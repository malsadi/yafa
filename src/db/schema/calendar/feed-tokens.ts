import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 6.4: each officer's phone calendar feed token — long and random,
// stored only as its SHA-256 hash. Regenerating replaces it (revoking the
// old one); an administrator can revoke it (25 A2).
export const calendarFeedTokens = sqliteTable(
  'calendar_feed_tokens',
  {
    personId: text('person_id').primaryKey(),
    tokenHash: text('token_hash').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [uniqueIndex('calendar_feed_tokens_hash').on(table.tokenHash)],
);
