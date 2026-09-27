import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useActiveSession } from '../../app/session/use-active-session';

/**
 * What the event screen offers this officer — hints only (T-042): the
 * portal decides each request itself. The lead officer moves the event,
 * cancels it and adds files with no capability (D-174, D-185).
 */
export function useEventHints(event: EventSummary) {
  const { context } = useActiveSession();
  const has = (capability: string) =>
    context.capabilities.includes(`event-organiser.events.${capability}`);
  const open = event.status !== 'Closed';
  const lead = event.leadPersonId === context.personId;
  return {
    manages: has('manage') && open,
    leadsOrManages: (lead || has('manage')) && open,
    approves: has('approve') && event.status === 'Draft' && event.createdBy !== context.personId,
    closes: has('close'),
  };
}
