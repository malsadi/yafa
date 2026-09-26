import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 20 B3, P13 and D-160: one branch asks one, several or all other
// branches; Open → Answered (at a receiving branch's first reply) →
// Closed (by the asking branch), never back. The branches it went to are
// recorded when it is sent.
export const hubRequests = sqliteTable(
  'hub_requests',
  {
    id: text('id').primaryKey(),
    fromUnitId: text('from_unit_id').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    toAllBranches: integer('to_all_branches', { mode: 'boolean' }).notNull(),
    status: text('status').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    answeredAt: text('answered_at'),
    closedBy: text('closed_by'),
    closedAt: text('closed_at'),
  },
  (table) => [index('hub_requests_from').on(table.fromUnitId, table.createdAt)],
);

export const hubRequestRecipients = sqliteTable(
  'hub_request_recipients',
  { requestId: text('request_id').notNull(), unitId: text('unit_id').notNull() },
  (table) => [
    primaryKey({ columns: [table.requestId, table.unitId] }),
    index('hub_request_recipients_unit').on(table.unitId),
  ],
);
