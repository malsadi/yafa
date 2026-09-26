import { generateId } from '../../../core/ids';

export interface AutomaticFilingRow {
  unitId: string;
  categoryId: string;
  sourceService: string;
  sourceRecordId: string;
  title: string;
  documentDate: string;
  fileId: string;
  filedBy: string;
  filedAt: string;
}

/** Brief 15 A1, A4: the document and its one version, for the caller's batch. */
export function buildAutomaticFilingStatements(
  db: D1Database,
  row: AutomaticFilingRow,
): D1PreparedStatement[] {
  const documentId = generateId();
  return [
    db
      .prepare(
        `INSERT INTO archive_documents
          (id, unit_id, category_id, source, source_service, source_record_id,
           title, description, document_date, filed_at, filed_by)
         VALUES (?, ?, ?, 'automatic', ?, ?, ?, NULL, ?, ?, ?)`,
      )
      .bind(
        documentId,
        row.unitId,
        row.categoryId,
        row.sourceService,
        row.sourceRecordId,
        row.title,
        row.documentDate,
        row.filedAt,
        row.filedBy,
      ),
    db
      .prepare(
        `INSERT INTO archive_document_versions (id, document_id, version, file_id, added_by, created_at)
         VALUES (?, ?, 1, ?, ?, ?)`,
      )
      .bind(generateId(), documentId, row.fileId, row.filedBy, row.filedAt),
  ];
}
