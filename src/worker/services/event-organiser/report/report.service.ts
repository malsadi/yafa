import type { PostEventReport } from '../../../../shared/event-organiser/post-event-report';
import { EventStatus } from '../../../../shared/event-organiser/event-statuses';
import { ConflictError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireEventCapability } from '../event-access';
import { requireUnitEvent } from '../events/event-guards';
import { READ } from '../events/events.service';
import { buildReportData } from './report-data';

/** D-183 and D-181: the report is shown from Completed — or Cancelled — and stays once closed. */
const REPORTABLE: readonly EventStatus[] = [
  EventStatus.Completed,
  EventStatus.Cancelled,
  EventStatus.Closed,
];

/** Brief 21 C1: the post-event report on screen, for those who see the event. */
export async function postEventReport(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; eventId: string },
): Promise<PostEventReport> {
  await requireEventCapability(db, ctx, READ, params.unitId);
  const event = await requireUnitEvent(db, params.unitId, params.eventId);
  if (!REPORTABLE.includes(event.status))
    throw new ConflictError('event-organiser.report-not-ready');
  return buildReportData(db, event);
}
