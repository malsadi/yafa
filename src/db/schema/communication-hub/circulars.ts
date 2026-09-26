import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 20 A3, A4, P14 and D-157: a national circular, sent by the General
// Council to all branches or to selected ones, never changed once sent.
// The branches it went to are recorded when it is sent; a branch counts as
// having opened it the first time any of its officers opens it.
export const circulars = sqliteTable(
  'circulars',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    toAllBranches: integer('to_all_branches', { mode: 'boolean' }).notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('circulars_created').on(table.createdAt)],
);

export const circularRecipients = sqliteTable(
  'circular_recipients',
  { circularId: text('circular_id').notNull(), unitId: text('unit_id').notNull() },
  (table) => [
    primaryKey({ columns: [table.circularId, table.unitId] }),
    index('circular_recipients_unit').on(table.unitId),
  ],
);

/** P14: the first time any officer of the branch opened the circular. */
export const circularOpens = sqliteTable(
  'circular_opens',
  {
    circularId: text('circular_id').notNull(),
    unitId: text('unit_id').notNull(),
    openedAt: text('opened_at').notNull(),
    openedBy: text('opened_by').notNull(),
  },
  (table) => [primaryKey({ columns: [table.circularId, table.unitId] })],
);
