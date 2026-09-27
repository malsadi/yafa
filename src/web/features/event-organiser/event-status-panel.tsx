import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { EVENT_STEPS } from '../../../shared/event-organiser/event-statuses';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { ActionButton } from './action-button';
import { CancelControl } from './cancel-control';
import { eventPath } from './event-organiser.api';
import { useEventHints } from './event-hints';
import { useEventAction } from './use-event-action';
import { useEventChoices } from './use-event-queries';

/**
 * Brief 21 status, A4 and D-175, D-180, D-181: approval by a second
 * officer; the lead officer moving the event one step on (or back, shown
 * only where the setting allows, D-196); and cancelling it, with a reason.
 */
export function EventStatusPanel({ event }: { event: EventSummary }) {
  const t = useText().services['event-organiser'];
  const hints = useEventHints(event);
  const act = useEventAction();
  const at = EVENT_STEPS.indexOf(event.status);
  const next = at >= 0 ? EVENT_STEPS[at + 1] : undefined;
  // D-196: offered only where the setting allows it; the portal still refuses otherwise.
  const backwards = useEventChoices(event.unitId).data?.backwardsAllowed === true;
  const previous = backwards && at > 0 ? EVENT_STEPS[at - 1] : undefined;
  const busy = act.isPending;
  const post = (action: string, body: object) => () => {
    const path = `${eventPath(event.unitId, event.id)}/${action}`;
    act.mutate({ path, method: 'POST', body: { ...body, version: event.version } });
  };
  const moves = hints.leadsOrManages;
  if (!hints.approves && !moves) return null;
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.status.heading}</h3>
      <ErrorAlert error={act.error} refusals={t.refusals} />
      <div className="flex flex-wrap gap-2">
        {hints.approves && (
          <ActionButton label={t.status.approve} disabled={busy} onClick={post('approve', {})} />
        )}
        {moves && next && (
          <ActionButton
            label={fillText(t.status.moveTo, { status: t.statuses[next] })}
            disabled={busy}
            onClick={post('status', { to: next })}
          />
        )}
        {moves && previous && (
          <ActionButton
            label={fillText(t.status.moveBackTo, { status: t.statuses[previous] })}
            disabled={busy}
            onClick={post('status', { to: previous })}
          />
        )}
      </div>
      {moves && event.status !== 'Cancelled' && <CancelControl event={event} />}
    </section>
  );
}
