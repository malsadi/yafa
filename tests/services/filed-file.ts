import type { FileRecord } from '../../src/shared/core/file-record';

/** A unit, and a stored file of it, for the filing tests (brief 9.3). */
export async function insertUnitForFiling(db: D1Database, unitId: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO units (id, type, code, name_en, name_ar, status, created_at) VALUES (?, 'branch', ?, 'Filing unit', 'وحدة تجريبية', 'active', ?)`,
    )
    .bind(unitId, unitId, new Date().toISOString())
    .run();
}

export function fileFor(unitId: string, id: string, locked: boolean): FileRecord {
  return {
    id,
    key: `${unitId}/test/${id}`,
    unitId,
    service: 'test',
    recordId: 'record',
    use: 'documents',
    fileName: 'document.pdf',
    uploadedBy: 'person',
    size: 1,
    contentType: 'application/pdf',
    checksum: 'c',
    locked,
    createdAt: new Date().toISOString(),
  };
}

export function insertFileStatement(db: D1Database, file: FileRecord): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO files (id, key, unit_id, service, record_id, use, file_name, uploaded_by, size, content_type, checksum, locked, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      file.id,
      file.key,
      file.unitId,
      file.service,
      file.recordId,
      file.use,
      file.fileName,
      file.uploadedBy,
      file.size,
      file.contentType,
      file.checksum,
      file.locked ? 1 : 0,
      file.createdAt,
    );
}
