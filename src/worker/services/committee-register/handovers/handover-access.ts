import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { findHandover } from './handovers.repo';
import type { HandoverRecord } from './handovers.schema';

const MANAGE = 'committee-register.handovers.manage';
const TAKE_PART = 'committee-register.handovers.confirm';

export async function loadHandover(db: D1Database, handoverId: string): Promise<HandoverRecord> {
  const handover = await findHandover(db, handoverId);
  if (!handover) throw new NotFoundError('handovers.not-found');
  return handover;
}

/** The side the person is on, if they are one of the two named officers. */
export function sideOf(handover: HandoverRecord, personId: string): 'outgoing' | 'incoming' | null {
  if (handover.outgoingPersonId === personId) return 'outgoing';
  if (handover.incomingPersonId === personId) return 'incoming';
  return null;
}

export function confirmationStarted(handover: HandoverRecord): boolean {
  return handover.outgoingConfirmedAt !== null || handover.incomingConfirmedAt !== null;
}

/** D-067: the checklist changes only until confirmation starts. */
export function requireChecklistOpen(handover: HandoverRecord): void {
  if (confirmationStarted(handover)) throw new ConflictError('handovers.checklist-fixed');
}

export async function canManage(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<boolean> {
  return can(db, ctx, MANAGE, { unitId });
}

/** A named officer who may take part (matrix), or a register officer. */
export async function requireManagerOrParticipant(
  db: D1Database,
  ctx: RequestContext,
  handover: HandoverRecord,
): Promise<void> {
  if (await canManage(db, ctx, handover.unitId)) return;
  const takesPart = sideOf(handover, ctx.personId) !== null;
  if (!takesPart || !(await can(db, ctx, TAKE_PART, { unitId: handover.unitId }))) {
    throw new ForbiddenError('permission.denied');
  }
}
