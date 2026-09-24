import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { people } from './people';

// Brief 6.2 and 25 A2 (T-086): every Clerk invitation the portal sends, or
// tried to send. Clerk and D1 are not atomic together, so a failed send is
// recorded as `failed` and can be resent; nothing here is ever changed or
// deleted (a trigger, migration 0016).
export const invitations = sqliteTable('invitations', {
  id: text('id').primaryKey(),
  personId: text('person_id')
    .notNull()
    .references(() => people.id),
  status: text('status', { enum: ['sent', 'failed'] }).notNull(),
  clerkInvitationId: text('clerk_invitation_id'),
  sentAt: text('sent_at').notNull(),
  sentBy: text('sent_by')
    .notNull()
    .references(() => people.id),
});
