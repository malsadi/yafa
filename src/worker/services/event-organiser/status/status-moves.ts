import { EVENT_STEPS, EventStatus } from '../../../../shared/event-organiser/event-statuses';
import { ConflictError, ServiceUnavailableError } from '../../../core/errors';
import { getSetting } from '../../../core/settings';

/**
 * D-180: the lead officer moves an event one step at a time between
 * Approved and Completed. Forward always; back one step only where the
 * administrator allows it — never to Draft, never out of Cancelled or
 * Closed. Draft becomes Approved only by approval; Closed only by closing.
 */
export async function requireStatusMove(
  db: D1Database,
  from: EventStatus,
  to: EventStatus,
): Promise<void> {
  const at = EVENT_STEPS.indexOf(from);
  const next = EVENT_STEPS.indexOf(to);
  if (at === -1 || next === -1) throw new ConflictError('event-organiser.status-move-not-allowed');
  if (next === at + 1) return;
  if (next !== at - 1) throw new ConflictError('event-organiser.status-move-not-allowed');
  const backwards = await getSetting<boolean>(db, 'event-organiser.status_may_move_backwards');
  if (backwards.status !== 'configured')
    throw new ServiceUnavailableError('setting.not-configured');
  if (!backwards.value) throw new ConflictError('event-organiser.status-move-not-allowed');
}

/** D-181: a cancel is possible from any status before Closed, once. */
export function requireCancellable(status: EventStatus): void {
  if (status === EventStatus.Closed || status === EventStatus.Cancelled)
    throw new ConflictError('event-organiser.not-cancellable');
}
