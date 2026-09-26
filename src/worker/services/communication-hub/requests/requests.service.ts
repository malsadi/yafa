import type {
  HubMessage,
  HubRequestRecord,
} from '../../../../shared/communication-hub/conversation-records';
import type { CircularBranch } from '../../../../shared/communication-hub/circular-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';
import { buildInsertMessageStatement, listMessages } from '../conversations/hub-messages.repo';
import {
  requireHubCapability,
  requireHubOfficer,
  requireWritable,
  type HubUnitRow,
} from '../hub-access';
import {
  buildAnsweredStatement,
  buildCloseStatement,
  buildSendRequestStatements,
  findRequestFor,
  listRequestsOf,
} from './requests.repo';
import type { RequestInput } from './requests.schema';

export const SEND_REQUESTS = 'communication-hub.requests.send';

/** Brief 20 B3: requests are between branches (a trigger also refuses others). */
function requireBranch(unit: HubUnitRow): void {
  if (unit.type !== 'branch') throw new ConflictError('communication-hub.branches-only');
}

/** The other branches a request can go to. */
export async function otherBranches(db: D1Database, unitId: string): Promise<CircularBranch[]> {
  return (await listUnits(db))
    .filter((unit) => unit.type === 'branch' && unit.id !== unitId)
    .map((unit) => ({ id: unit.id, nameEn: unit.nameEn, nameAr: unit.nameAr }));
}

/** A sender in a branch that takes changes (P4). */
async function requireSender(db: D1Database, ctx: RequestContext, unitId: string): Promise<void> {
  const unit = await requireHubCapability(db, ctx, SEND_REQUESTS, unitId);
  requireBranch(unit);
  requireWritable(unit);
}

/** Brief 20 B3 and P13: ask one, several or all other branches — every other branch there is now. */
export async function sendRequest(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: RequestInput,
): Promise<{ id: string }> {
  await requireSender(db, ctx, unitId);
  const branches = (await otherBranches(db, unitId)).map((branch) => branch.id);
  const recipientIds = input.toAllBranches ? branches : [...new Set(input.unitIds)];
  if (!recipientIds.every((id) => branches.includes(id)))
    throw new ConflictError('communication-hub.branch-not-found');
  if (recipientIds.length === 0) throw new ConflictError('communication-hub.no-branches');
  const id = generateId();
  const at = new Date().toISOString();
  await db.batch([
    ...buildSendRequestStatements(db, {
      id,
      unitId,
      subject: input.subject,
      body: input.body,
      toAllBranches: input.toAllBranches,
      recipientIds,
      actor: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'request.sent',
      entityType: 'request',
      entityId: id,
      after: { ...input, recipientIds },
    }),
  ]);
  return { id };
}

/** D-160: every officer of a branch the request involves. */
async function requireParty(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; requestId: string },
) {
  const unit = await requireHubOfficer(db, ctx, params.unitId);
  const request = await findRequestFor(db, params);
  if (!request) throw new NotFoundError('communication-hub.request-not-found');
  return { unit, request };
}

export async function unitRequests(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<HubRequestRecord[]> {
  await requireHubOfficer(db, ctx, unitId);
  return listRequestsOf(db, unitId);
}

export async function requestReplies(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; requestId: string },
): Promise<HubMessage[]> {
  await requireParty(db, ctx, params);
  const today = getTodayInLondon();
  return listMessages(db, {
    kind: 'request',
    conversationId: params.requestId,
    personId: ctx.personId,
    today,
  });
}

/** D-160: reply for the branch; a receiving branch's first reply makes it Answered; a closed request takes none. */
export async function replyToRequest(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; requestId: string; body: string },
): Promise<void> {
  const { unit, request } = await requireParty(db, ctx, params);
  requireWritable(unit);
  if (request.status === 'Closed') throw new ConflictError('communication-hub.request-closed');
  const at = new Date().toISOString();
  const receiving = request.fromUnitId !== params.unitId;
  await db.batch([
    buildInsertMessageStatement(db, {
      kind: 'request',
      conversationId: params.requestId,
      authorPersonId: ctx.personId,
      authorUnitId: params.unitId,
      body: params.body,
      at,
    }),
    ...(receiving ? [buildAnsweredStatement(db, { requestId: params.requestId, at })] : []),
  ]);
}

/** D-160: only the asking branch closes its request. */
export async function closeRequest(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; requestId: string },
): Promise<void> {
  await requireSender(db, ctx, params.unitId);
  const request = await findRequestFor(db, params);
  if (request?.fromUnitId !== params.unitId)
    throw new NotFoundError('communication-hub.request-not-found');
  if (request.status === 'Closed') throw new ConflictError('communication-hub.request-closed');
  const at = new Date().toISOString();
  await db.batch([
    buildCloseStatement(db, { requestId: params.requestId, actor: ctx.personId, at }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'request.closed',
      entityType: 'request',
      entityId: params.requestId,
    }),
  ]);
}

/** The other branches, for those who send requests. */
export async function requestBranches(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<CircularBranch[]> {
  await requireSender(db, ctx, unitId);
  return otherBranches(db, unitId);
}
