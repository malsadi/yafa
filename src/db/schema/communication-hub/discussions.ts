import { index, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 20 B2 and D-159: a topic discussion, open to the officers invited
// to it, from any unit; its starter invites, at the start or later, and
// everyone invited sees the whole discussion. D-168: the starter removes a
// member, or a member leaves; each is recorded, and the messages stay.
export const discussions = sqliteTable(
  'discussions',
  {
    id: text('id').primaryKey(),
    subject: text('subject').notNull(),
    startedBy: text('started_by').notNull(),
    startedAt: text('started_at').notNull(),
  },
  (table) => [index('discussions_started_at').on(table.startedAt)],
);

export const discussionMembers = sqliteTable(
  'discussion_members',
  {
    discussionId: text('discussion_id').notNull(),
    personId: text('person_id').notNull(),
    invitedBy: text('invited_by').notNull(),
    invitedAt: text('invited_at').notNull(),
    /** D-168: when they were removed or left; null while they are in it. Invited back, it is cleared. */
    leftAt: text('left_at'),
  },
  (table) => [
    primaryKey({ columns: [table.discussionId, table.personId] }),
    index('discussion_members_person').on(table.personId),
  ],
);

/** D-168: each removal or leaving, kept for good; `removed_by` is null when the member left. */
export const discussionDepartures = sqliteTable('discussion_departures', {
  id: text('id').primaryKey(),
  discussionId: text('discussion_id').notNull(),
  personId: text('person_id').notNull(),
  departedAt: text('departed_at').notNull(),
  removedBy: text('removed_by'),
});
