import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { requireHubCapability, requireWritable, runHubBatch, type HubUnitRow } from '../hub-access';
import {
  buildInsertVoteStatements,
  buildRemoveVoteStatements,
} from '../notice-votes/notice-votes.repo';
import { prepareVote } from '../notice-votes/prepare-vote';
import {
  buildInsertNoticeStatement,
  buildUpdateNoticeStatement,
  findNotice,
  voteHasBallots,
  type NoticeRow,
} from './noticeboard.repo';
import type { NoticeChangeInput, NoticeInput, VoteInput } from './noticeboard.schema';

export const READ = 'communication-hub.noticeboard.read';
export const MANAGE = 'communication-hub.noticeboard.manage';

/** A managing officer, in a unit that can take changes (P4). */
async function requireManager(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<HubUnitRow> {
  const unit = await requireHubCapability(db, ctx, MANAGE, unitId);
  requireWritable(unit);
  return unit;
}

/** A notice of this unit's; another unit's is not found (D-154). */
export async function requireUnitNotice(
  db: D1Database,
  unitId: string,
  id: string,
): Promise<NoticeRow> {
  const row = await findNotice(db, id);
  if (row?.unitId !== unitId) throw new NotFoundError('communication-hub.notice-not-found');
  return row;
}

/** Brief 20 A1 and A2: post a notice to the unit's Noticeboard, perhaps put to a vote. */
export async function postNotice(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: NoticeInput,
): Promise<{ id: string }> {
  await requireManager(db, ctx, unitId);
  const vote = input.vote && (await prepareVote(db, unitId, input.vote, getTodayInLondon()));
  const id = generateId();
  const at = new Date().toISOString();
  await runHubBatch(db, [
    buildInsertNoticeStatement(db, {
      id,
      unitId,
      title: input.title,
      body: input.body,
      actor: ctx.personId,
      at,
    }),
    ...(vote ? buildInsertVoteStatements(db, id, vote) : []),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'notice.posted',
      entityType: 'notice',
      entityId: id,
      after: input,
    }),
  ]);
  return { id };
}

/** D-155: the vote's statements for a change — none if left out; refused once anyone has voted. */
async function voteChangeStatements(
  db: D1Database,
  notice: NoticeRow,
  vote: VoteInput | null | undefined,
): Promise<D1PreparedStatement[]> {
  if (vote === undefined) return [];
  if (await voteHasBallots(db, notice.id)) throw new ConflictError('communication-hub.vote-locked');
  const removed = buildRemoveVoteStatements(db, notice.id);
  if (vote === null) return removed;
  const prepared = await prepareVote(db, notice.unitId, vote, getTodayInLondon());
  return [...removed, ...buildInsertVoteStatements(db, notice.id, prepared)];
}

/** Brief 20 A1 and D-155: change an officer's notice from the version read (9.1); automatic posts never change. */
export async function changeNotice(
  db: D1Database,
  ctx: RequestContext,
  params: {
    unitId: string;
    id: string;
    version: number;
    notice: NoticeChangeInput;
  },
): Promise<void> {
  await requireManager(db, ctx, params.unitId);
  const notice = await requireUnitNotice(db, params.unitId, params.id);
  if (notice.source === 'automatic')
    throw new ConflictError('communication-hub.automatic-post-unchanged');
  const { title, body, vote } = params.notice;
  await runHubBatch(db, [
    buildUpdateNoticeStatement(db, {
      id: notice.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
      title,
      body,
    }),
    ...(await voteChangeStatements(db, notice, vote)),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'notice.changed',
      entityType: 'notice',
      entityId: notice.id,
      after: params.notice,
    }),
  ]);
}

/** D-155: retire a notice — hidden, kept — or bring it back. */
export async function setNoticeRetired(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; id: string; version: number; retire: boolean },
): Promise<void> {
  await requireManager(db, ctx, params.unitId);
  const notice = await requireUnitNotice(db, params.unitId, params.id);
  if (params.retire === (notice.retiredAt !== null)) {
    throw new ConflictError(
      params.retire ? 'communication-hub.already-retired' : 'communication-hub.not-retired',
    );
  }
  const at = new Date().toISOString();
  await runHubBatch(db, [
    buildUpdateNoticeStatement(db, {
      id: notice.id,
      version: params.version,
      actor: ctx.personId,
      at,
      retiredAt: params.retire ? at : null,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: params.retire ? 'notice.retired' : 'notice.restored',
      entityType: 'notice',
      entityId: notice.id,
    }),
  ]);
}
