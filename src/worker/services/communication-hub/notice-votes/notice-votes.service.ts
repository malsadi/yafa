import type { VoterChoices } from '../../../../shared/communication-hub/notice-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { listCurrentOfficersOf, listRoles } from '../../committee-register';
import { requireHubCapability, requireWritable, runHubBatch } from '../hub-access';
import { MANAGE, READ, requireUnitNotice } from '../noticeboard/noticeboard.service';
import { buildInsertBallotStatement } from './notice-votes.repo';

interface BallotCheckRow {
  closesAt: string;
  optionFound: number;
  eligible: number;
  voted: number;
}

/**
 * Brief 20 A2, P11, P12 and D-156: an eligible voter's one vote, before the
 * vote closes, on a live notice. It is never changed; the database refuses
 * a second one (a unique constraint) and anything the service would refuse.
 * The audit log records that a vote was cast, never the choice.
 */
export async function castBallot(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; noticeId: string; optionId: string },
): Promise<void> {
  requireWritable(await requireHubCapability(db, ctx, READ, params.unitId));
  const notice = await requireUnitNotice(db, params.unitId, params.noticeId);
  const check = await db
    .prepare(
      `SELECT v.closes_at AS closesAt,
         EXISTS (SELECT 1 FROM notice_vote_options o WHERE o.id = ? AND o.notice_id = v.notice_id) AS optionFound,
         EXISTS (SELECT 1 FROM notice_vote_voters w WHERE w.notice_id = v.notice_id AND w.person_id = ?) AS eligible,
         EXISTS (SELECT 1 FROM notice_ballots b WHERE b.notice_id = v.notice_id AND b.person_id = ?) AS voted
       FROM notice_votes v WHERE v.notice_id = ?`,
    )
    .bind(params.optionId, ctx.personId, ctx.personId, notice.id)
    .first<BallotCheckRow>();
  if (!check || notice.retiredAt !== null)
    throw new NotFoundError('communication-hub.vote-not-found');
  if (new Date().toISOString() >= check.closesAt)
    throw new ConflictError('communication-hub.vote-closed');
  if (!check.eligible) throw new ForbiddenError('communication-hub.not-eligible');
  if (check.voted) throw new ConflictError('communication-hub.already-voted');
  if (!check.optionFound) throw new NotFoundError('communication-hub.option-not-found');
  await runHubBatch(db, [
    buildInsertBallotStatement(db, {
      noticeId: notice.id,
      personId: ctx.personId,
      optionId: params.optionId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'notice-vote.cast',
      entityType: 'notice',
      entityId: notice.id,
    }),
  ]);
}

/** P11: what a vote can be opened to — the unit's roles and its current officers. */
export async function voterChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<VoterChoices> {
  await requireHubCapability(db, ctx, MANAGE, unitId);
  const [roles, officers] = await Promise.all([
    listRoles(db, unitId),
    listCurrentOfficersOf(db, unitId, getTodayInLondon()),
  ]);
  return {
    roles: roles.map((r) => ({ id: r.id, nameEn: r.nameEn, nameAr: r.nameAr })),
    officers,
  };
}
