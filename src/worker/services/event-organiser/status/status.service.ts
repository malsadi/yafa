import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import { EventStatus } from '../../../../shared/event-organiser/event-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { queueHubAlert, type NotificationsQueue } from '../../communication-hub';
import {
  requireEventCapability,
  requireEventUnit,
  requireWritable,
  runEventBatch,
} from '../event-access';
import { cancellationPost, cancellationStatements } from './cancellation-post';
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

/**
 * D-181 and D-190: the event cancelled, with its reason — for good; it is
 * then closed in the usual way. A published event leaves the Calendar and,
 * if announced, gets a "cancelled" post, alerted through the Queue.
 */
export async function cancelEvent(
  db: D1Database,
  queue: NotificationsQueue,
  ctx: RequestContext,
  params: { unitId: string; eventId: string; version: number; reason: string },
): Promise<void> {
  const event = await requireMover(db, ctx, params);
  requireCancellable(event.status);
  const at = new Date().toISOString();
  const cancellation = await cancellationStatements(db, event, ctx.personId, at);
  await runEventBatch(db, [
    db
      .prepare(
        `UPDATE events SET status = 'Cancelled', cancel_reason = ?, cancelled_by = ?, cancelled_at = ?,
           version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(params.reason, ctx.personId, at, params.version + 1, ctx.personId, at, event.id),
    ...cancellation.statements,
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.cancelled',
      entityType: 'event',
      entityId: event.id,
      before: { status: event.status },
      after: { status: EventStatus.Cancelled, reason: params.reason },
    }),
  ]);
  await alertCancellation(queue, event.unitId, cancellation.noticeId, ctx.personId);
}

/** D-190: the "cancelled" post skipped while the hub was off, made once it is back on. */
export async function postCancellation(
  db: D1Database,
  queue: NotificationsQueue,
  ctx: RequestContext,
  params: { unitId: string; eventId: string },
): Promise<void> {
  requireWritable(await requireEventCapability(db, ctx, MANAGE, params.unitId));
  const event = await requireUnitEvent(db, params.unitId, params.eventId);
  if (event.status !== EventStatus.Cancelled)
    throw new ConflictError('event-organiser.not-cancelled');
  const post = await cancellationPost(db, event, ctx.personId, new Date().toISOString());
  if (post.noticeId === null) throw new ConflictError('event-organiser.nothing-to-post');
  await runEventBatch(db, post.statements);
  await alertCancellation(queue, event.unitId, post.noticeId, ctx.personId);
}

async function alertCancellation(
  queue: NotificationsQueue,
  unitId: string,
  noticeId: string | null,
  author: string,
): Promise<void> {
  if (noticeId !== null)
    await queueHubAlert(queue, { kind: 'notice', unitId, noticeId, authorPersonId: author });
}
