import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 16 D2 and D3, 23 B2 and B3: every letter sent (its PDF) and received
// (its scan or photo), filed under its reference number. Written only by the
// Correspondence service (Phase 10), shown read-only in the library to the
// unit's own officers (7.3). Never changed or deleted (triggers).
const filedLetter = {
  id: text('id').primaryKey(),
  unitId: text('unit_id').notNull(),
  referenceNumber: text('reference_number').notNull(),
  letterId: text('letter_id').notNull(),
  fileId: text('file_id').notNull(),
  filedAt: text('filed_at').notNull(),
};

export const lettersOut = sqliteTable('library_letters_out', filedLetter, (table) => [
  index('library_letters_out_unit_id').on(table.unitId),
  uniqueIndex('library_letters_out_reference').on(table.unitId, table.referenceNumber),
]);

export const lettersIn = sqliteTable('library_letters_in', filedLetter, (table) => [
  index('library_letters_in_unit_id').on(table.unitId),
  uniqueIndex('library_letters_in_reference').on(table.unitId, table.referenceNumber),
]);
