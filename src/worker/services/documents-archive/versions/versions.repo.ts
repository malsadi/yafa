import { generateId } from '../../../core/ids';

/** The document a version is added to: its unit, and whether it was filed automatically. */
export async function findDocumentSource(
  db: D1Database,
  documentId: string,
): Promise<{ unitId: string; source: 'automatic' | 'upload' } | null> {
  return db
    .prepare('SELECT unit_id AS unitId, source FROM archive_documents WHERE id = ?')
    .bind(documentId)
    .first<{ unitId: string; source: 'automatic' | 'upload' }>();
}

/**
 * Brief 15 A4 (D-110): the next version, numbered in SQL from the versions
 * already there when the batch runs (build rule 6), with its own date.
 */
export function buildNextVersionStatement(
  db: D1Database,
  row: { documentId: string; fileId: string; documentDate: string; addedBy: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO archive_document_versions (id, document_id, version, file_id, document_date, added_by, created_at)
       SELECT ?, ?, MAX(version) + 1, ?, ?, ?, ? FROM archive_document_versions WHERE document_id = ?`,
    )
    .bind(
      generateId(),
      row.documentId,
      row.fileId,
      row.documentDate,
      row.addedBy,
      row.at,
      row.documentId,
    );
}
