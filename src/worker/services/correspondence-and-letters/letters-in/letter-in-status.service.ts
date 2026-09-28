import {
  LETTER_IN_MOVES,
  OPEN_STATUSES,
  type LetterInStatus,
} from '../../../../shared/correspondence-and-letters/letter-in-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { listCurrentOfficersOf } from '../../committee-register';
import { RECORD, requireWritable, runLetterBatch } from '../letter-access';
import { requireLetterInFor } from './letter-in-access';
import { buildUpdateLetterInStatement, type LetterInFound } from './letters-in.repo';

interface LetterRef {
  unitId: string;
  letterId: string;
}

async function saveChange(
  db: D1Database,
  ctx: RequestContext,
  letter: LetterInFound,
  change: { status: LetterInStatus; handlerPersonId: string; version: number; action: string },
): Promise<void> {
  await runLetterBatch(db, [
    buildUpdateLetterInStatement(db, {
      letterId: letter.id,
      status: change.status,
      handlerPersonId: change.handlerPersonId,
      version: change.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: change.action,
      entityType: 'letter-in',
      entityId: letter.id,
      before: { status: letter.status, handlerPersonId: letter.handlerPersonId },
      after: { status: change.status, handlerPersonId: change.handlerPersonId },
    }),
  ]);
}

/**
 * Brief 23 B4 and D-214 (O-144): a status moved by hand — by those who
 * record letters in, or the officer handling it. Replied comes only from a
 * reply; the database holds the same moves.
 */
export async function moveLetterInStatus(
  db: D1Database,
  ctx: RequestContext,
  params: LetterRef & { status: LetterInStatus; version: number },
): Promise<void> {
  const { unit, letter } = await requireLetterInFor(db, ctx, {
    ...params,
    capability: RECORD,
    handlerMay: true,
  });
  requireWritable(unit);
  if (!LETTER_IN_MOVES[letter.status].includes(params.status))
    throw new ConflictError('correspondence-and-letters.wrong-status');
  await saveChange(db, ctx, letter, {
    status: params.status,
    handlerPersonId: letter.handlerPersonId,
    version: params.version,
    action: 'letter-in.status-changed',
  });
}

/** O-145: another current officer handles it, while it is still open — for those who record letters in. */
export async function changeLetterInHandler(
  db: D1Database,
  ctx: RequestContext,
  params: LetterRef & { handlerPersonId: string; version: number },
): Promise<void> {
  const { unit, letter } = await requireLetterInFor(db, ctx, {
    ...params,
    capability: RECORD,
    handlerMay: false,
  });
  requireWritable(unit);
  if (!OPEN_STATUSES.includes(letter.status))
    throw new ConflictError('correspondence-and-letters.closed');
  const officers = await listCurrentOfficersOf(db, unit.id, getTodayInLondon());
  if (!officers.some((o) => o.personId === params.handlerPersonId))
    throw new ConflictError('correspondence-and-letters.not-an-officer');
  await saveChange(db, ctx, letter, {
    status: letter.status,
    handlerPersonId: params.handlerPersonId,
    version: params.version,
    action: 'letter-in.handler-changed',
  });
}
