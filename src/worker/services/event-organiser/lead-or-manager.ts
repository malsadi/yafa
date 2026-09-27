import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { ForbiddenError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { requireEventUnit, requireWritable } from './event-access';
import { requireUnitEvent } from './events/event-guards';

const MANAGE = 'event-organiser.events.manage';

/**
 * D-174 and D-185: the event's lead officer, with no capability, or anyone
 * who manages the unit's events — in a unit that can be written to.
 */
export async function requireLeadOrManager(
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
