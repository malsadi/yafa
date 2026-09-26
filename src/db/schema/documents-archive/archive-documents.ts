import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 15: one archived document. An automatic filing (A1) comes only
// through fileRecord(), in its own service's batch, into its category; an
// upload (A2) only into Governance or General (D-096). Each has the
// document's own date and the date it was filed (D-097). A document is
// never changed or deleted (triggers); its file is its versions' (A4).
export const archiveDocuments = sqliteTable(
  'archive_documents',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    categoryId: text('category_id').notNull(),
    source: text('source', { enum: ['automatic', 'upload'] }).notNull(),
    sourceService: text('source_service'),
    sourceRecordId: text('source_record_id'),
    title: text('title').notNull(),
    description: text('description'),
    documentDate: text('document_date').notNull(),
    filedAt: text('filed_at').notNull(),
    filedBy: text('filed_by').notNull(),
  },
  (table) => [
    index('archive_documents_unit_id').on(table.unitId),
    index('archive_documents_filed_at').on(table.filedAt),
    index('archive_documents_document_date').on(table.documentDate),
    uniqueIndex('archive_documents_source').on(table.sourceService, table.sourceRecordId),
  ],
);

// Brief 15 A4: each version of a document, never changed or deleted; an
// automatic filing has exactly one.
export const archiveDocumentVersions = sqliteTable(
  'archive_document_versions',
  {
    id: text('id').primaryKey(),
    documentId: text('document_id').notNull(),
    version: integer('version').notNull(),
    fileId: text('file_id').notNull(),
    addedBy: text('added_by').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [uniqueIndex('archive_document_versions_number').on(table.documentId, table.version)],
);
