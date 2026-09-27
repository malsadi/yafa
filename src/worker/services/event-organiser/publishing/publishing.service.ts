import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import { EventStatus } from '../../../../shared/event-organiser/event-statuses';
import {
  PublishTarget,
  type PublishTarget as Target,
} from '../../../../shared/event-organiser/publish-targets';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { isServiceEnabled } from '../../../core/service-switches';
import { buildCalendarEntryStatement } from '../../calendar';
import { postAutomatic, queueHubAlert, type NotificationsQueue } from '../../communication-hub';
import { requireEventCapability, requireWritable, runEventBatch } from '../event-access';
import { requireUnitEvent } from '../events/event-guards';
import { MANAGE } from '../events/events.service';
import { calendarEntry } from './calendar-entry';

/** D-182: published from Approved until Completed (never a draft, a cancelled or a closed event). */
const PUBLISHABLE: readonly EventStatus[] = [
  EventStatus.Approved,
  EventStatus.InPreparation,
  EventStatus.Ready,
  EventStatus.Completed,
];

const SERVICE_OF = { calendar: 'calendar', noticeboard: 'communication-hub' } as const;

/** Whether the event already went to this target. */
const publishedTo = (event: EventSummary, target: Target) =>
  target === PublishTarget.Calendar
    ? event.calendarPublishedAt !== null
    : event.noticeboardPublishedAt !== null;

/** D-182 and D-186: the chosen targets not yet published to, split by whether their service is on. */
async function sortTargets(db: D1Database, event: EventSummary, targets: Target[]) {
  const pending = targets.filter((target) => !publishedTo(event, target));
  const on = await Promise.all(
    pending.map((target) => isServiceEnabled(db, SERVICE_OF[target], event.unitId)),
  );
  return {
    publish: pending.filter((_, i) => on[i]),
    skipped: pending.filter((_, i) => !on[i]),
  };
}

/**
 * Brief 21 B4, 10.1 ("Event published"), D-182 and D-186: the event shown
 * read-only in the Calendar and posted automatically on the Noticeboard, in
 * one batch, each once; the alert goes through the Queue after it. A target
 * whose service is off is skipped, and can be published to later.
 */
export async function publishEvent(
  db: D1Database,
  queue: NotificationsQueue,
  ctx: RequestContext,
  params: { unitId: string; eventId: string; version: number; targets: Target[] },
): Promise<{ published: Target[]; skipped: Target[] }> {
  requireWritable(await requireEventCapability(db, ctx, MANAGE, params.unitId));
  const event = await requireUnitEvent(db, params.unitId, params.eventId);
  if (!PUBLISHABLE.includes(event.status))
    throw new ConflictError('event-organiser.not-publishable');
  const { publish, skipped } = await sortTargets(db, event, params.targets);
  if (publish.length === 0) return { published: [], skipped };
  const { statements, post } = publishStatements(db, ctx.personId, event, {
    publish,
    skipped,
    version: params.version,
  });
  await runEventBatch(db, statements);
  if (post)
    await queueHubAlert(queue, {
      kind: 'notice',
      unitId: event.unitId,
      noticeId: post.noticeId,
      authorPersonId: ctx.personId,
    });
  return { published: publish, skipped };
}

/** The batch: the event marked, the Calendar entry and the automatic post, each where chosen (10.1). */
function publishStatements(
  db: D1Database,
  actor: string,
  event: EventSummary,
  params: { publish: Target[]; skipped: Target[]; version: number },
) {
  const at = new Date().toISOString();
  const toCalendar = params.publish.includes(PublishTarget.Calendar);
  const post = params.publish.includes(PublishTarget.Noticeboard)
    ? postAutomatic(db, event.unitId, 'event-published', {
        sourceRecordId: event.id,
        title: event.name,
        date: event.firstDay,
        actorPersonId: actor,
      })
    : null;
  const statements = [
    db
      .prepare(
        `UPDATE events SET calendar_published_at = COALESCE(calendar_published_at, ?),
           noticeboard_published_at = COALESCE(noticeboard_published_at, ?),
           version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(toCalendar ? at : null, post ? at : null, params.version + 1, actor, at, event.id),
    ...(toCalendar ? [buildCalendarEntryStatement(db, calendarEntry(event))] : []),
    ...(post ? [post.statement] : []),
    buildAuditStatement(db, {
      actorPersonId: actor,
      action: 'event.published',
      entityType: 'event',
      entityId: event.id,
      after: { published: params.publish, skipped: params.skipped },
    }),
  ];
  return { statements, post };
}
