import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { LETTER_IN_STATUSES } from '../../../shared/correspondence-and-letters/letter-in-statuses';

// Brief 23 B1 and D-214 (O-137): each unit's two sequences, letters out and
// letters in, restarting at 1 each calendar year. The number is taken in
// SQL, in the same batch as the register entry (23 build notes).
export const letterCounters = sqliteTable(
  'letter_counters',
  {
    unitId: text('unit_id').notNull(),
    direction: text('direction', { enum: ['out', 'in'] }).notNull(),
    year: integer('year').notNull(),
    lastNumber: integer('last_number').notNull(),
  },
  (table) => [primaryKey({ columns: [table.unitId, table.direction, table.year] })],
);

// Brief 23 A2, B2 and D-214: a letter generated from a template, on the
// unit's letterhead, signed by the officer who generated it in the role
// they chose. Its PDF is filed under Letters out (16 D2). Locked forever
// (O-142): never changed, never deleted.
export const lettersOut = sqliteTable(
  'letters_out',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    referenceNumber: text('reference_number').notNull(),
    sequenceYear: integer('sequence_year').notNull(),
    sequenceNumber: integer('sequence_number').notNull(),
    letterDate: text('letter_date').notNull(),
    templateId: text('template_id').notNull(),
    language: text('language', { enum: ['en', 'ar'] }).notNull(),
    recipientName: text('recipient_name').notNull(),
    recipientAddress: text('recipient_address'),
    subject: text('subject').notNull(),
    fieldValues: text('field_values').notNull(),
    signerPersonId: text('signer_person_id').notNull(),
    signerRoleId: text('signer_role_id').notNull(),
    replyToLetterInId: text('reply_to_letter_in_id'),
    fileId: text('file_id').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('letters_out_unit_reference').on(table.unitId, table.referenceNumber),
    uniqueIndex('letters_out_unit_sequence').on(
      table.unitId,
      table.sequenceYear,
      table.sequenceNumber,
    ),
    index('letters_out_unit_date').on(table.unitId, table.letterDate),
    index('letters_out_reply_to').on(table.replyToLetterInId),
  ],
);

// Brief 23 B3, B4 and D-214: a letter received, its scan or photo filed
// under Letters in (16 D3). Received → Awaiting reply → Replied, or No
// reply needed (O-144). Never deleted; only its status and handling
// officer change, each save sending its version (9.1).
export const lettersIn = sqliteTable(
  'letters_in',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    referenceNumber: text('reference_number').notNull(),
    sequenceYear: integer('sequence_year').notNull(),
    sequenceNumber: integer('sequence_number').notNull(),
    dateReceived: text('date_received').notNull(),
    sender: text('sender').notNull(),
    subject: text('subject').notNull(),
    handlerPersonId: text('handler_person_id').notNull(),
    status: text('status', {
      enum: LETTER_IN_STATUSES as unknown as [string, ...string[]],
    }).notNull(),
    answersLetterOutId: text('answers_letter_out_id'),
    fileId: text('file_id').notNull(),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('letters_in_unit_reference').on(table.unitId, table.referenceNumber),
    uniqueIndex('letters_in_unit_sequence').on(
      table.unitId,
      table.sequenceYear,
      table.sequenceNumber,
    ),
    index('letters_in_unit_received').on(table.unitId, table.dateReceived),
    index('letters_in_answers').on(table.answersLetterOutId),
  ],
);
