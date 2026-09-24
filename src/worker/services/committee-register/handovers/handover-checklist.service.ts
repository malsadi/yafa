import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireCapability } from '../committee-register-guards';
import {
  loadHandover,
  requireChecklistOpen,
  requireManagerOrParticipant,
  sideOf,
} from './handover-access';
import {
  buildConfirmStatement,
  buildInsertItemStatement,
  buildRemoveItemStatement,
  buildTickItemStatement,
} from './handovers.repo';
import type { HandoverRecord } from './handovers.schema';

const MANAGE = 'committee-register.handovers.manage';

function audit(
  db: D1Database,
  ctx: RequestContext,
  handoverId: string,
  action: string,
  after?: unknown,
) {
  return buildAuditStatement(db, {
    actorPersonId: ctx.personId,
    action,
    entityType: 'handover',
    entityId: handoverId,
    after,
  });
}

/** D-067: add an item for this handover only, until confirmation starts. */
export async function addChecklistItem(
  db: D1Database,
  ctx: RequestContext,
  handoverId: string,
  item: { nameEn: string; nameAr: string },
): Promise<HandoverRecord> {
  const handover = await loadHandover(db, handoverId);
  await requireCapability(db, ctx, MANAGE, { unitId: handover.unitId });
  requireChecklistOpen(handover);
  await db.batch([
    buildInsertItemStatement(db, handoverId, item),
    audit(db, ctx, handoverId, 'handover.item-added', item),
  ]);
  return loadHandover(db, handoverId);
}

export async function removeChecklistItem(
  db: D1Database,
  ctx: RequestContext,
  params: { handoverId: string; itemId: string },
): Promise<HandoverRecord> {
  const handover = await loadHandover(db, params.handoverId);
  await requireCapability(db, ctx, MANAGE, { unitId: handover.unitId });
  requireChecklistOpen(handover);
  if (!handover.items.some((item) => item.id === params.itemId))
    throw new NotFoundError('handovers.item-not-found');
  await db.batch([
    buildRemoveItemStatement(db, params.itemId),
    audit(db, ctx, params.handoverId, 'handover.item-removed', { itemId: params.itemId }),
  ]);
  return loadHandover(db, params.handoverId);
}

/** Tick an item off the working list, or untick it, until confirmation starts. */
export async function tickChecklistItem(
  db: D1Database,
  ctx: RequestContext,
  params: { handoverId: string; itemId: string; ticked: boolean },
): Promise<HandoverRecord> {
  const handover = await loadHandover(db, params.handoverId);
  await requireManagerOrParticipant(db, ctx, handover);
  requireChecklistOpen(handover);
  if (!handover.items.some((item) => item.id === params.itemId))
    throw new NotFoundError('handovers.item-not-found');
  await db.batch([buildTickItemStatement(db, params.itemId, params.ticked ? ctx.personId : null)]);
  return loadHandover(db, params.handoverId);
}

/**
 * D-067: each named officer confirms the whole handover once; confirmation
 * records who (the officer themselves) and when. Complete — and locked by
 * the database — once both have.
 */
export async function confirmHandover(
  db: D1Database,
  ctx: RequestContext,
  handoverId: string,
): Promise<HandoverRecord> {
  const handover = await loadHandover(db, handoverId);
  await requireManagerOrParticipant(db, ctx, handover);
  const side = sideOf(handover, ctx.personId);
  if (!side) throw new ForbiddenError('handovers.not-a-participant');
  const confirmed =
    side === 'outgoing' ? handover.outgoingConfirmedAt : handover.incomingConfirmedAt;
  if (confirmed) throw new ConflictError('handovers.already-confirmed');
  await db.batch([
    buildConfirmStatement(db, handoverId, side),
    audit(db, ctx, handoverId, `handover.confirmed-${side}`),
  ]);
  return loadHandover(db, handoverId);
}
