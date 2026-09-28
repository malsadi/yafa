import { OPEN_STATUSES } from '../../../../shared/correspondence-and-letters/letter-in-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { RECORD, requireWritable, runLetterBatch } from '../letter-access';
import { findLetterOut } from '../letters-out/letters-out.repo';
import { requireLetterInFor } from './letter-in-access';
import { buildSetAnswersStatement } from './letters-in.repo';

/**
 * D-216: which of the unit's letters out a letter in answers is a link
 * between records, so it can be corrected — or cleared — while the letter
 * in is Received or Awaiting reply, by those who record letters in.
 */
export async function changeLetterInAnswers(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; letterId: string; answersLetterOutId: string | null; version: number },
): Promise<void> {
  const { unit, letter } = await requireLetterInFor(db, ctx, {
    ...params,
    capability: RECORD,
    handlerMay: false,
  });
  requireWritable(unit);
  if (!OPEN_STATUSES.includes(letter.status))
    throw new ConflictError('correspondence-and-letters.closed');
  if (params.answersLetterOutId && !(await findLetterOut(db, unit.id, params.answersLetterOutId)))
    throw new ConflictError('correspondence-and-letters.letter-not-found');
  await runLetterBatch(db, [
    buildSetAnswersStatement(db, {
      letterId: letter.id,
      answersLetterOutId: params.answersLetterOutId,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'letter-in.link-changed',
      entityType: 'letter-in',
      entityId: letter.id,
      before: { answersLetterOutId: letter.answersLetterOutId },
      after: { answersLetterOutId: params.answersLetterOutId },
    }),
  ]);
}
