import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import { EventStatus } from '../../../../shared/event-organiser/event-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { requireEventUnit, requireWritable, runEventBatch } from '../event-access';
import { requireUnitEvent } from '../events/event-guards';
import { MANAGE } from '../events/events.service';
import { requireCancellable, requireStatusMove } from './status-moves';

/** D-174: the lead officer moves their event with no capability, as does anyone who manages events. */
async function requireMover(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; eventId: string },
): Promise<EventSummary> {
  requireWritable(await requireEventUnit(db, params.unitId));
  const event = await requireUnitEvent(db, params.unitId, params.eventId);
  if (event.leadPersonId === ctx.personId) return event;
  if (!(await can(db, ctx, MANAGE, { unitId: params.unitId })))
    throw new ForbiddenError('permission.denied');
  return event;
}

/** Brief 21 status and D-180: the event moved one step, from the version read (9.1). */
export async function moveEventStatus(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; eventId: string; version: number; to: EventStatus },
): Promise<void> {
  const event = await requireMover(db, ctx, params);
  await requireStatusMove(db, event.status, params.to);
  const at = new Date().toISOString();
  await runEventBatch(db, [
    db
      .prepare(
        'UPDATE events SET status = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
      )
      .bind(params.to, params.version + 1, ctx.personId, at, event.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.status-moved',
      entityType: 'event',
      entityId: event.id,
      before: { status: event.status },
      after: { status: params.to },
    }),
  ]);
}

/** D-181: the event cancelled, with its reason — for good; it is then closed in the usual way. */
export async function cancelEvent(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; eventId: string; version: number; reason: string },
): Promise<void> {
  const event = await requireMover(db, ctx, params);
  requireCancellable(event.status);
  const at = new Date().toISOString();
  await runEventBatch(db, [
    db
      .prepare(
        `UPDATE events SET status = 'Cancelled', cancel_reason = ?, cancelled_by = ?, cancelled_at = ?,
           version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(params.reason, ctx.personId, at, params.version + 1, ctx.personId, at, event.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.cancelled',
      entityType: 'event',
      entityId: event.id,
      before: { status: event.status },
      after: { status: EventStatus.Cancelled, reason: params.reason },
    }),
  ]);
}
