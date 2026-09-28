import type { StartedUpload } from '../../../../shared/core/file-record';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import {
  completeUpload,
  startUpload,
  type FileStorage,
  type UploadTarget,
} from '../../../core/files';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { listCurrentOfficersOf } from '../../committee-register';
import { fileLetter } from '../../resources-library';
import {
  RECORD,
  requireLetterCapability,
  requireWritable,
  runLetterBatch,
  type LetterUnitRow,
} from '../letter-access';
import { findLetterOut } from '../letters-out/letters-out.repo';
import { predictNumber, takeNumberStatements, withFreshNumber } from '../numbering/letter-numbers';
import { buildInsertLetterInStatement } from './letters-in.repo';
import type { CompleteLetterIn, StartLetterIn } from './letters-in.schema';

/** Brief 9.3: where a letter's scan goes — its unit, the letter, and the "letter scans" rules. */
async function writableTarget(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  letterId: string,
): Promise<{ unit: LetterUnitRow; target: UploadTarget }> {
  const unit = await requireLetterCapability(db, ctx, RECORD, unitId);
  requireWritable(unit);
  return {
    unit,
    target: {
      unitId: unit.id,
      unitCode: unit.code,
      service: 'correspondence-and-letters',
      recordId: letterId,
      use: 'letter-scans',
    },
  };
}

/** Brief 23 B3: the upload link for a new letter's scan; the letter's id is fixed now (9.3's key). */
export async function startLetterInUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: StartLetterIn & { unitId: string },
): Promise<StartedUpload & { letterId: string }> {
  const letterId = generateId();
  const { target } = await writableTarget(db, ctx, params.unitId, letterId);
  const started = await startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    { ...target, ...params },
  );
  return { ...started, letterId };
}

/** O-143 and O-146: a date not in the future, a current officer to handle it, and the unit's own letter it answers. */
async function requireDetails(db: D1Database, unitId: string, params: CompleteLetterIn) {
  const today = getTodayInLondon();
  if (params.dateReceived > today)
    throw new ConflictError('correspondence-and-letters.future-date');
  const officers = await listCurrentOfficersOf(db, unitId, today);
  if (!officers.some((o) => o.personId === params.handlerPersonId))
    throw new ConflictError('correspondence-and-letters.not-an-officer');
  if (params.answersLetterOutId && !(await findLetterOut(db, unitId, params.answersLetterOutId)))
    throw new ConflictError('correspondence-and-letters.letter-not-found');
}

/**
 * Brief 23 B1, B3, 10.1 ("Letter received") and D-214: the scan checked in
 * R2 and recorded locked; then in one batch the letter is numbered, logged
 * Received, and filed under Letters in. If another letter takes its number
 * first, the batch is run again with the next.
 */
export async function recordLetterIn(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: CompleteLetterIn & { unitId: string; letterId: string },
): Promise<{ id: string; referenceNumber: string }> {
  const { unit, target } = await writableTarget(db, ctx, params.unitId, params.letterId);
  await requireDetails(db, unit.id, params);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...target,
    fileId: params.fileId,
    fileName: params.fileName,
    multipart: params.multipart,
    uploadedBy: ctx.personId,
    locked: true,
  });
  return withFreshNumber(async () => {
    const next = await predictNumber(db, unit, 'in');
    await runLetterBatch(db, [
      statement,
      ...takeNumberStatements(db, unit.id, 'in', next.year),
      buildInsertLetterInStatement(db, {
        id: params.letterId,
        unitId: unit.id,
        referenceNumber: next.reference,
        sequenceYear: next.year,
        sequenceNumber: next.number,
        dateReceived: params.dateReceived,
        sender: params.sender,
        subject: params.subject,
        handlerPersonId: params.handlerPersonId,
        answersLetterOutId: params.answersLetterOutId,
        fileId: file.id,
        actor: ctx.personId,
        at: new Date().toISOString(),
      }),
      fileLetter(db, 'in', { file, referenceNumber: next.reference, letterId: params.letterId }),
      buildAuditStatement(db, {
        actorPersonId: ctx.personId,
        action: 'letter-in.recorded',
        entityType: 'letter-in',
        entityId: params.letterId,
        after: { referenceNumber: next.reference, answersLetterOutId: params.answersLetterOutId },
      }),
    ]);
    return { id: params.letterId, referenceNumber: next.reference };
  });
}
