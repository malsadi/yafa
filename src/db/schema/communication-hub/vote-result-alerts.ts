import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 11 (Close votes) and 10.1: a closed vote whose result alerts have
// been queued — once each, however often the job runs.
export const voteResultAlerts = sqliteTable('vote_result_alerts', {
  noticeId: text('notice_id').primaryKey(),
  queuedAt: text('queued_at').notNull(),
});
