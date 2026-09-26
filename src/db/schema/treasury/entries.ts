import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 17 B1 to B6, P6, P7 and D-117 to D-126: every movement of money —
// an opening balance, a credit, a debit, or a transfer from `account_id` to
// `to_account_id`, all in integer pence (9.1). One above the threshold
// waits for a second officer's decision; that decision is the only change
// an entry ever takes. A reversal is the opposite entry, linked to the one
// it undoes. Never deleted; nothing is entered into a closed year (triggers).
export const treasuryEntries = sqliteTable(
  'treasury_entries',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    type: text('type', { enum: ['opening-balance', 'credit', 'debit', 'transfer'] }).notNull(),
    accountId: text('account_id').notNull(),
    toAccountId: text('to_account_id'),
    amountPence: integer('amount_pence').notNull(),
    entryDate: text('entry_date').notNull(),
    counterparty: text('counterparty'),
    description: text('description'),
    budgetLineId: text('budget_line_id'),
    approvalStatus: text('approval_status', {
      enum: ['Not needed', 'Awaiting approval', 'Approved', 'Declined'],
    }).notNull(),
    reversesEntryId: text('reverses_entry_id'),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    decidedBy: text('decided_by'),
    decidedAt: text('decided_at'),
    declineReason: text('decline_reason'),
  },
  (table) => [
    index('treasury_entries_unit_id').on(table.unitId),
    index('treasury_entries_account_id').on(table.accountId, table.entryDate),
    index('treasury_entries_to_account_id').on(table.toAccountId, table.entryDate),
  ],
);

// Brief 17 B4 and D-123: a credit's or debit's receipt photos, added with
// it or later; locked files, never removed (triggers).
export const treasuryEntryReceipts = sqliteTable(
  'treasury_entry_receipts',
  {
    id: text('id').primaryKey(),
    entryId: text('entry_id').notNull(),
    unitId: text('unit_id').notNull(),
    fileId: text('file_id').notNull(),
    addedBy: text('added_by').notNull(),
    addedAt: text('added_at').notNull(),
  },
  (table) => [
    index('treasury_entry_receipts_unit_id').on(table.unitId),
    index('treasury_entry_receipts_entry_id').on(table.entryId),
  ],
);

// Brief 17 C3 and D-128: a closed financial year. Its entries are locked;
// the row itself is never changed or deleted.
export const treasuryFinancialYears = sqliteTable(
  'treasury_financial_years',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    closedBy: text('closed_by').notNull(),
    closedAt: text('closed_at').notNull(),
  },
  (table) => [index('treasury_financial_years_unit_id').on(table.unitId, table.startDate)],
);
