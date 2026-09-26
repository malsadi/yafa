import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { FILE_USES } from '../../../shared/core/file-uses';

// Brief 9.3: every object in R2 has one record here, written only after the
// object is in R2 and checked ("R2 first, then D1"). A locked file is never
// deleted or overwritten (a trigger refuses). `unit_id` is the owner unit.
export const files = sqliteTable(
  'files',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    unitId: text('unit_id').notNull(),
    service: text('service').notNull(),
    recordId: text('record_id').notNull(),
    use: text('use', { enum: FILE_USES }).notNull(),
    fileName: text('file_name').notNull(),
    uploadedBy: text('uploaded_by').notNull(),
    size: integer('size').notNull(),
    contentType: text('content_type').notNull(),
    checksum: text('checksum').notNull(),
    locked: integer('locked', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('files_unit_id').on(table.unitId),
    index('files_record').on(table.service, table.recordId),
  ],
);
