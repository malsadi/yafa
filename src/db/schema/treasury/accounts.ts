import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 17 A1, A2 and D-117 to D-119: a unit's accounts. A branch account
// has a name and is a bank or cash account; an event account belongs to one
// event and is opened and closed by the Event organiser only. Open → Closed,
// never reopened, never deleted (triggers).
export const treasuryAccounts = sqliteTable(
  'treasury_accounts',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    kind: text('kind', { enum: ['branch', 'event'] }).notNull(),
    name: text('name').notNull(),
    branchType: text('branch_type', { enum: ['bank', 'cash'] }),
    eventId: text('event_id'),
    status: text('status', { enum: ['Open', 'Closed'] }).notNull(),
    openedBy: text('opened_by').notNull(),
    openedAt: text('opened_at').notNull(),
    closedBy: text('closed_by'),
    closedAt: text('closed_at'),
  },
  (table) => [
    index('treasury_accounts_unit_id').on(table.unitId),
    uniqueIndex('treasury_accounts_event_id').on(table.eventId),
  ],
);

// Brief 17 A2, P10 and D-131: an event account's budget lines, each a name
// and a budgeted amount in pence; entries in the account may be tagged to one.
export const treasuryBudgetLines = sqliteTable(
  'treasury_budget_lines',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    unitId: text('unit_id').notNull(),
    name: text('name').notNull(),
    amountPence: integer('amount_pence').notNull(),
    position: integer('position').notNull(),
  },
  (table) => [
    index('treasury_budget_lines_unit_id').on(table.unitId),
    index('treasury_budget_lines_account_id').on(table.accountId),
  ],
);
