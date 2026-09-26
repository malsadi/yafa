import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import { londonTimeToUtc } from '../../../../shared/core/london-time-to-utc';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireHubCapability, requireWritable, runHubBatch } from '../hub-access';
import { MANAGE, requireUnitNotice } from '../noticeboard/noticeboard.service';

/**
 * D-166: move a vote's closing date later — never earlier — while the vote
 * is open; allowed after voting has started, when nothing else about the
 * vote can change (D-155). A trigger refuses anything else.
 */
export async function extendVoteClosing(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; noticeId: string; closesOn: string },
): Promise<void> {
  requireWritable(await requireHubCapability(db, ctx, MANAGE, params.unitId));
  const notice = await requireUnitNotice(db, params.unitId, params.noticeId);
  const vote = await db
    .prepare(
      'SELECT closes_on AS closesOn, closes_at AS closesAt FROM notice_votes WHERE notice_id = ?',
    )
    .bind(notice.id)
    .first<{ closesOn: string; closesAt: string }>();
  if (!vote || notice.retiredAt !== null)
    throw new NotFoundError('communication-hub.vote-not-found');
  if (new Date().toISOString() >= vote.closesAt)
    throw new ConflictError('communication-hub.vote-closed');
  if (params.closesOn <= vote.closesOn)
    throw new ConflictError('communication-hub.closing-date-not-later');
  const closesAt = londonTimeToUtc(addDaysToDate(params.closesOn, 1), '00:00').toISOString();
  await runHubBatch(db, [
    db
      .prepare('UPDATE notice_votes SET closes_on = ?, closes_at = ? WHERE notice_id = ?')
      .bind(params.closesOn, closesAt, notice.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'notice-vote.closing-extended',
      entityType: 'notice',
      entityId: notice.id,
      before: { closesOn: vote.closesOn },
      after: { closesOn: params.closesOn },
    }),
  ]);
}
