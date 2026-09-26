import type { FileRecord } from '../../../shared/core/file-record';

const COLUMNS = `id, key, unit_id AS unitId, service, record_id AS recordId, use, file_name AS fileName,
  uploaded_by AS uploadedBy, size, content_type AS contentType, checksum, locked, created_at AS createdAt`;

type FileRow = Omit<FileRecord, 'locked'> & { locked: number };
const toRecord = (row: FileRow): FileRecord => ({ ...row, locked: row.locked === 1 });

export async function findFile(db: D1Database, fileId: string): Promise<FileRecord | null> {
  const row = await db
    .prepare(`SELECT ${COLUMNS} FROM files WHERE id = ?`)
    .bind(fileId)
    .first<FileRow>();
  return row ? toRecord(row) : null;
}

/** Which of these object keys have a record — the rest are orphans (brief 9.3). */
export async function findRecordedKeys(db: D1Database, keys: string[]): Promise<Set<string>> {
  if (keys.length === 0) return new Set();
  const result = await db
    .prepare(`SELECT key FROM files WHERE key IN (${keys.map(() => '?').join(', ')})`)
    .bind(...keys)
    .all<{ key: string }>();
  return new Set(result.results.map((row) => row.key));
}

export function buildInsertFileStatement(db: D1Database, file: FileRecord): D1PreparedStatement {
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
