import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import { EventStatus } from '../../../../shared/event-organiser/event-statuses';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import { listCurrentOfficersOf } from '../../committee-register';
import { findEvent } from './events.repo';

/** D-172: a type from the event types list, not retired — or the one the event already has. */
export async function requireEventType(
  db: D1Database,
  typeItemId: string,
  current?: string,
): Promise<void> {
  if (typeItemId === current) return;
  const types = await listChoicesOf(db, 'event-types');
  if (!types.some((t) => t.id === typeItemId))
    throw new ConflictError('event-organiser.type-not-in-list');
}

/** D-172: the lead officer is one of the unit's current officers — or the one the event already has. */
export async function requireLeadOfficer(
  db: D1Database,
  unitId: string,
  leadPersonId: string,
  current?: string,
): Promise<void> {
  if (leadPersonId === current) return;
  const officers = await listCurrentOfficersOf(db, unitId, getTodayInLondon());
  if (!officers.some((o) => o.personId === leadPersonId))
    throw new ConflictError('event-organiser.lead-not-an-officer');
}

/** An event of this unit's; another unit's is not found (D-173). */
export async function requireUnitEvent(
  db: D1Database,
  unitId: string,
  eventId: string,
): Promise<EventSummary> {
  const event = await findEvent(db, eventId);
  if (event?.unitId !== unitId) throw new NotFoundError('event-organiser.event-not-found');
  return event;
}

/** D-184: a closed event is locked; nothing about it changes. */
export function requireNotClosed(event: EventSummary): void {
  if (event.status === EventStatus.Closed) throw new ConflictError('event-organiser.locked');
}
