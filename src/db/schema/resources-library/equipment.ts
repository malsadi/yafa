import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 16 C1, D-106, D-108, D-100 and D-114: an item the unit owns — its
// quantity, and, once known, where it is kept and its condition (15 B3). The quantity
// never falls below what is out on loan. Retired, never deleted.
export const equipment = sqliteTable(
  'library_equipment',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    item: text('item').notNull(),
    quantity: integer('quantity').notNull(),
    /** D-114: optional, like the condition — only the item and quantity are required. */
    location: text('location'),
    conditionId: text('condition_id'),
    retiredAt: text('retired_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('library_equipment_unit_id').on(table.unitId)],
);

// Brief 16 C2, P20, D-099, D-108 and D-109: a loan of a quantity of an item
// to a borrower named in free text, from the date borrowed until the date
// due back; closed by the date it came back, after which it is fixed.
export const equipmentLoans = sqliteTable(
  'library_equipment_loans',
  {
    id: text('id').primaryKey(),
    equipmentId: text('equipment_id').notNull(),
    unitId: text('unit_id').notNull(),
    borrower: text('borrower').notNull(),
    quantity: integer('quantity').notNull(),
    borrowedOn: text('borrowed_on').notNull(),
    dueBack: text('due_back').notNull(),
    returnedOn: text('returned_on'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('library_equipment_loans_unit_id').on(table.unitId),
    index('library_equipment_loans_equipment_id').on(table.equipmentId),
  ],
);

// D-109: each state of a loan — as lent, each correction, and its return —
// kept in order, never changed or deleted.
export const equipmentLoanHistory = sqliteTable(
  'library_equipment_loan_history',
  {
    id: text('id').primaryKey(),
    loanId: text('loan_id').notNull(),
    unitId: text('unit_id').notNull(),
    change: text('change', { enum: ['lent', 'corrected', 'returned'] }).notNull(),
    borrower: text('borrower').notNull(),
    quantity: integer('quantity').notNull(),
    borrowedOn: text('borrowed_on').notNull(),
    dueBack: text('due_back').notNull(),
    returnedOn: text('returned_on'),
    recordedBy: text('recorded_by').notNull(),
    recordedAt: text('recorded_at').notNull(),
  },
  (table) => [
    index('library_equipment_loan_history_unit_id').on(table.unitId),
    index('library_equipment_loan_history_loan_id').on(table.loanId),
  ],
);
