import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 9.5, 15 D1 and D-033: a phone alert never delivered through every
// attempt (D-164) — kept for the health screen for the period the
// administrator sets (D-050), then removed by Push pruning (brief 11).
// Only the alert's kind: no personal data beyond whose device it was.
export const pushDeliveryFailures = sqliteTable(
  'push_delivery_failures',
  {
    id: text('id').primaryKey(),
    personId: text('person_id').notNull(),
    alertKind: text('alert_kind').notNull(),
    lastStatus: text('last_status').notNull(),
    failedAt: text('failed_at').notNull(),
  },
  (table) => [index('push_delivery_failures_failed').on(table.failedAt)],
);
