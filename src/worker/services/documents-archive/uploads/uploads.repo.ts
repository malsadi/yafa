import { generateId } from '../../../core/ids';

export interface UploadedDocumentRow {
  id: string;
  unitId: string;
  categoryId: string;
  title: string;
  description: string | null;
  documentDate: string;
  fileId: string;
  filedBy: string;
  filedAt: string;
}

/** Brief 15 A2, A4: an uploaded document and its first version. */
export function buildUploadedDocumentStatements(
  db: D1Database,
  row: UploadedDocumentRow,
): D1PreparedStatement[] {
  return [
    db
      .prepare(
        `INSERT INTO archive_documents
          (id, unit_id, category_id, source, source_service, source_record_id,
           title, description, document_date, filed_at, filed_by)
         VALUES (?, ?, ?, 'upload', NULL, NULL, ?, ?, ?, ?, ?)`,
      )
      .bind(
        row.id,
        row.unitId,
        row.categoryId,
        row.title,
        row.description,
        row.documentDate,
        row.filedAt,
        row.filedBy,
      ),
    db
      .prepare(
        `INSERT INTO archive_document_versions (id, document_id, version, file_id, added_by, created_at)
         VALUES (?, ?, 1, ?, ?, ?)`,
      )
      .bind(generateId(), row.id, row.fileId, row.filedBy, row.filedAt),
  ];
}
