import { EventStatus } from '../../../../shared/event-organiser/event-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireEventCapability, requireWritable, runEventBatch } from '../event-access';
import { requireUnitEvent } from '../events/event-guards';

export const APPROVE = 'event-organiser.events.approve';

/**
 * Brief 21 A4, D-175 and D-180: the committee's approval of a draft event
 * and its budget together, recorded by an officer other than the event's
 * creator (refused by the service and the database). Draft to Approved.
 */
export async function approveEvent(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; eventId: string; version: number },
): Promise<void> {
  requireWritable(await requireEventCapability(db, ctx, APPROVE, params.unitId));
  const event = await requireUnitEvent(db, params.unitId, params.eventId);
  if (event.status !== EventStatus.Draft) throw new ConflictError('event-organiser.not-a-draft');
  if (event.createdBy === ctx.personId) throw new ForbiddenError('event-organiser.own-event');
  const at = new Date().toISOString();
  await runEventBatch(db, [
    db
      .prepare(
        `UPDATE events SET status = 'Approved', approved_by = ?, approved_at = ?, version = ?,
           updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(ctx.personId, at, params.version + 1, ctx.personId, at, event.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.approved',
      entityType: 'event',
      entityId: event.id,
      before: { status: event.status },
      after: { status: EventStatus.Approved },
    }),
  ]);
}
