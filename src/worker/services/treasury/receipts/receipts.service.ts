import type { StartedUpload } from '../../../../shared/core/file-record';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { findFile, serveFile, startUpload, type FileStorage } from '../../../core/files';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { findEntry } from '../entries/entries.repo';
import type { ReceiptUpload } from '../entries/entries.schema';
import { inClosedYear } from '../entries/entry-dates';
import { requireTreasuryCapability, requireTreasuryWriter } from '../treasury-access';
import { receiptStatements, receiptTarget } from './receipt-files';
import { findReceiptFileId } from './receipts.repo';

export type ReceiptEntryType = 'credit' | 'debit';
const CAPABILITY = { credit: 'treasury.credit.create', debit: 'treasury.debit.create' } as const;

interface FileParams {
  fileName: string;
  size: number;
  contentType: string;
}

/** An entry of the unit's of that type, outside a closed year (locked, C3). */
async function requireReceivingEntry(
  db: D1Database,
  unitId: string,
  type: ReceiptEntryType,
  entryId: string,
) {
  const entry = await findEntry(db, entryId);
  if (entry?.unitId !== unitId || entry.type !== type)
    throw new NotFoundError('treasury.entry-not-found');
  if (await inClosedYear(db, unitId, entry.entryDate))
    throw new ConflictError('treasury.closed-year');
  return entry;
}

/**
 * Brief 17 B4 and 9.3: the upload link for a receipt photo — of a credit or
 * debit about to be recorded (its id given out now, or the one already
 * given), or of one already recorded (D-123).
 */
export async function startReceiptUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: FileParams & {
    unitId: string;
    type: ReceiptEntryType;
    entryId?: string;
    existing: boolean;
  },
): Promise<StartedUpload & { entryId: string }> {
  const unit = await requireTreasuryWriter(db, ctx, CAPABILITY[params.type], params.unitId);
  const entryId = params.entryId ?? generateId();
  if (params.existing) await requireReceivingEntry(db, unit.id, params.type, entryId);
  else if (await findEntry(db, entryId)) throw new ConflictError('treasury.entry-exists');
  const started = await startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    {
      ...receiptTarget(unit, entryId),
      fileName: params.fileName,
      size: params.size,
      contentType: params.contentType,
    },
  );
  return { ...started, entryId };
}

/** D-123: add a receipt photo to a credit or debit already recorded; the entry itself never changes. */
export async function addReceipt(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { unitId: string; type: ReceiptEntryType; entryId: string; receipt: ReceiptUpload },
): Promise<void> {
  const unit = await requireTreasuryWriter(db, ctx, CAPABILITY[params.type], params.unitId);
  const entry = await requireReceivingEntry(db, unit.id, params.type, params.entryId);
  const at = new Date().toISOString();
  await db.batch([
    ...(await receiptStatements(db, storage, {
      unit,
      entryId: entry.id,
      receipts: [params.receipt],
      actor: ctx.personId,
      at,
    })),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'treasury-receipt.added',
      entityType: 'treasury-entry',
      entityId: entry.id,
    }),
  ]);
}

/** Brief 17 B4 and 9.3: download a receipt photo of the unit's. */
export async function downloadReceipt(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { unitId: string; entryId: string; receiptId: string },
): Promise<Response> {
  await requireTreasuryCapability(db, ctx, 'treasury.accounts.read', params.unitId);
  const fileId = await findReceiptFileId(db, params);
  const file = fileId ? await findFile(db, fileId) : null;
  if (!file) throw new NotFoundError('treasury.receipt-not-found');
  return serveFile(db, storage, file);
}
