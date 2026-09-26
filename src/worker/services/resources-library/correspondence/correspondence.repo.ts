import type {
  FiledLetterRecord,
  LetterDirection,
} from '../../../../shared/resources-library/filed-letter';
import { generateId } from '../../../core/ids';

const TABLES: Record<LetterDirection, string> = {
  out: 'library_letters_out',
  in: 'library_letters_in',
};

export interface FiledLetterRow {
  unitId: string;
  referenceNumber: string;
  letterId: string;
  fileId: string;
  filedAt: string;
}

/** Brief 16 D2, D3: one filed letter, for the Correspondence service's batch. */
export function buildFiledLetterStatement(
  db: D1Database,
  direction: LetterDirection,
  row: FiledLetterRow,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO ${TABLES[direction]} (id, unit_id, reference_number, letter_id, file_id, filed_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(generateId(), row.unitId, row.referenceNumber, row.letterId, row.fileId, row.filedAt);
}

/** Brief 16 D2, D3: a unit's filed letters, the latest first. */
export async function listFiledLetters(
  db: D1Database,
  direction: LetterDirection,
  unitId: string,
): Promise<FiledLetterRecord[]> {
  const result = await db
    .prepare(
      `SELECT l.id, l.reference_number AS referenceNumber, f.file_name AS fileName, l.filed_at AS filedAt
       FROM ${TABLES[direction]} l JOIN files f ON f.id = l.file_id
       WHERE l.unit_id = ? ORDER BY l.filed_at DESC`,
    )
    .bind(unitId)
    .all<FiledLetterRecord>();
  return result.results;
}

/** The file of one of a unit's filed letters, or null. */
export async function findFiledLetterFileId(
  db: D1Database,
  direction: LetterDirection,
  params: { unitId: string; letterId: string },
): Promise<string | null> {
  const row = await db
    .prepare(`SELECT file_id AS fileId FROM ${TABLES[direction]} WHERE id = ? AND unit_id = ?`)
    .bind(params.letterId, params.unitId)
    .first<{ fileId: string }>();
  return row?.fileId ?? null;
}
