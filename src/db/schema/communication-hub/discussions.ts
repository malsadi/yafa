import { index, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 20 B2 and D-159: a topic discussion, open to the officers invited
// to it, from any unit; its starter invites, at the start or later, and
// everyone invited sees the whole discussion.
export const discussions = sqliteTable('discussions', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  startedBy: text('started_by').notNull(),
  startedAt: text('started_at').notNull(),
});

export const discussionMembers = sqliteTable(
  'discussion_members',
  {
    discussionId: text('discussion_id').notNull(),
    personId: text('person_id').notNull(),
    invitedBy: text('invited_by').notNull(),
    invitedAt: text('invited_at').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.discussionId, table.personId] }),
    index('discussion_members_person').on(table.personId),
  ],
);
