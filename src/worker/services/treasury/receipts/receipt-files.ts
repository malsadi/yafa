import { completeUpload, type FileStorage, type UploadTarget } from '../../../core/files';
import type { ReceiptUpload } from '../entries/entries.schema';
import type { TreasuryUnit } from '../treasury-access';
import { buildInsertReceiptStatement } from './receipts.repo';

/** Brief 9.3: where an entry's receipt photos are stored — under its unit and the entry. */
export function receiptTarget(unit: TreasuryUnit, entryId: string): UploadTarget {
  return {
    unitId: unit.id,
    unitCode: unit.code,
    service: 'treasury',
    recordId: entryId,
    use: 'receipt-photos',
  };
}

/**
 * Brief 17 B4 and 9.3: record uploaded receipt photos — each checked in R2
 * first, then recorded locked (an entry never changes, nor do its receipts)
 * — as statements for the caller's batch.
 */
export async function receiptStatements(
  db: D1Database,
  storage: FileStorage,
  params: {
    unit: TreasuryUnit;
    entryId: string;
    receipts: ReceiptUpload[];
    actor: string;
    at: string;
  },
): Promise<D1PreparedStatement[]> {
  const statements: D1PreparedStatement[] = [];
  for (const receipt of params.receipts) {
    const { file, statement } = await completeUpload(storage.bucket, db, {
      ...receiptTarget(params.unit, params.entryId),
      fileId: receipt.fileId,
      fileName: receipt.fileName,
      multipart: receipt.multipart,
      uploadedBy: params.actor,
      locked: true,
    });
    statements.push(
      statement,
      buildInsertReceiptStatement(db, {
        entryId: params.entryId,
        unitId: params.unit.id,
        fileId: file.id,
        actor: params.actor,
        at: params.at,
      }),
    );
  }
  return statements;
}
