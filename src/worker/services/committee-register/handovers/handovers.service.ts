import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { can, type RequestContext } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import {
  requireCapability,
  requireRegisterReader,
  requireWritableUnit,
} from '../committee-register-guards';
import { listRoles } from '../roles/roles.repo';
import { canManage, loadHandover, requireManagerOrParticipant } from './handover-access';
import {
  buildInsertHandoverStatement,
  buildInsertItemStatement,
  hasTermInUnit,
  listPersonHandovers,
  listUnitHandovers,
} from './handovers.repo';
import type { CreateHandoverInput, HandoverRecord } from './handovers.schema';

const MANAGE = 'committee-register.handovers.manage';

/** Brief 14 C2: a unit's handovers, newest first, with their checklists. */
export async function listHandovers(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<HandoverRecord[]> {
  await requireRegisterReader(db, ctx, unitId);
  return listUnitHandovers(db, unitId);
}

/**
 * Brief 14 C2 and D-067: the handovers this person is named on and may take
 * part in (or manages) — how an outgoing or incoming officer reaches the
 * handover they confirm, whether or not they can read the register.
 */
export async function listMyHandovers(
  db: D1Database,
  ctx: RequestContext,
): Promise<HandoverRecord[]> {
  const named = await listPersonHandovers(db, ctx.personId);
  const allowed = await Promise.all(
    named.map(
      async (h) =>
        (await can(db, ctx, 'committee-register.handovers.confirm', { unitId: h.unitId })) ||
        canManage(db, ctx, h.unitId),
    ),
  );
  return named.filter((_, index) => allowed[index]);
}

/** One handover, for its unit's readers and managers, or either officer named on it. */
export async function getHandover(
  db: D1Database,
  ctx: RequestContext,
  handoverId: string,
): Promise<HandoverRecord> {
  const handover = await loadHandover(db, handoverId);
  const reads = await can(db, ctx, 'committee-register.register.read', { unitId: handover.unitId });
  if (!reads) {
    await requireManagerOrParticipant(db, ctx, handover);
  }
  return handover;
}

/**
 * Brief 14 C2 and D-067: set up a handover between two officers of the
 * unit, its checklist starting from the handover items list (25 B3).
 */
export async function createHandover(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: CreateHandoverInput,
): Promise<HandoverRecord> {
  await requireCapability(db, ctx, MANAGE, { unitId });
  await requireWritableUnit(db, unitId);
  if (!(await listRoles(db, unitId)).some((role) => role.id === input.roleId)) {
    throw new NotFoundError('roles.not-found');
  }
  if (input.outgoingPersonId === input.incomingPersonId) {
    throw new ConflictError('handovers.same-person');
  }
  const officers = await Promise.all(
    [input.outgoingPersonId, input.incomingPersonId].map((p) => hasTermInUnit(db, p, unitId)),
  );
  if (!officers.every(Boolean)) throw new ConflictError('handovers.not-officers-of-unit');
  const handover = {
    id: generateId(),
    unitId,
    ...input,
    outgoingConfirmedAt: null,
    incomingConfirmedAt: null,
  };
  const defaults = await listChoicesOf(db, 'handover-checklist-items');
  await db.batch([
    buildInsertHandoverStatement(db, handover, ctx.personId),
    ...defaults.map((item) => buildInsertItemStatement(db, handover.id, item)),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'handover.created',
      entityType: 'handover',
      entityId: handover.id,
      after: input,
    }),
  ]);
  return loadHandover(db, handover.id);
}
