import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 20 B1 to B3 and D-161: a message in a role network, a topic
// discussion or a request between branches (its replies). Never changed;
// its author can remove it, which leaves a "removed" mark and deletes
// nothing.
export const hubMessages = sqliteTable(
  'hub_messages',
  {
    id: text('id').primaryKey(),
    /** 'role-network' (the role's id), 'discussion' or 'request'. */
    conversationKind: text('conversation_kind').notNull(),
    conversationId: text('conversation_id').notNull(),
    authorPersonId: text('author_person_id').notNull(),
    /** For a request's reply: the branch the author wrote for. */
    authorUnitId: text('author_unit_id'),
    body: text('body').notNull(),
    sentAt: text('sent_at').notNull(),
    removedAt: text('removed_at'),
  },
  (table) => [
    index('hub_messages_conversation').on(
      table.conversationKind,
      table.conversationId,
      table.sentAt,
    ),
  ],
);
