import { generateId } from '../../../core/ids';

export type LetterDirection = 'out' | 'in';

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
