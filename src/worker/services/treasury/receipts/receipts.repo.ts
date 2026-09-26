import type { ReceiptRecord } from '../../../../shared/treasury/treasury-records';
import { generateId } from '../../../core/ids';

/** Brief 17 B4: a receipt photo of an entry — its locked file, recorded earlier in the batch. */
export function buildInsertReceiptStatement(
  db: D1Database,
  row: { entryId: string; unitId: string; fileId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO treasury_entry_receipts (id, entry_id, unit_id, file_id, added_by, added_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(generateId(), row.entryId, row.unitId, row.fileId, row.actor, row.at);
}

/** The receipts of these entries, in the order they were added. */
export async function listReceiptsOf(
  db: D1Database,
  entryIds: string[],
): Promise<(ReceiptRecord & { entryId: string })[]> {
  if (entryIds.length === 0) return [];
  const marks = entryIds.map(() => '?').join(', ');
  const result = await db
    .prepare(
      `SELECT r.id, r.entry_id AS entryId, f.file_name AS fileName
       FROM treasury_entry_receipts r JOIN files f ON f.id = r.file_id
       WHERE r.entry_id IN (${marks}) ORDER BY r.added_at, r.rowid`,
    )
    .bind(...entryIds)
    .all<ReceiptRecord & { entryId: string }>();
  return result.results;
}

/** One receipt's file, if it belongs to that entry of the unit's. */
export async function findReceiptFileId(
  db: D1Database,
  params: { unitId: string; entryId: string; receiptId: string },
): Promise<string | null> {
  const row = await db
    .prepare(
      'SELECT file_id AS fileId FROM treasury_entry_receipts WHERE id = ? AND entry_id = ? AND unit_id = ?',
    )
    .bind(params.receiptId, params.entryId, params.unitId)
    .first<{ fileId: string }>();
  return row?.fileId ?? null;
}
