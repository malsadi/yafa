import type { EventSummary } from '../../../shared/event-organiser/event-records';
import {
  PUBLISH_TARGETS,
  type PublishTarget,
} from '../../../shared/event-organiser/publish-targets';
import { useText } from '../../app/language/use-text';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { ActionButton } from '../../components/action-button';
import { CancellationPost } from './cancellation-post';
import { eventPath } from './event-organiser.api';
import { useEventHints } from './event-hints';
import { PublishTargets } from './publish-targets';
import { useEventAction } from './use-event-action';

const PUBLISHABLE = ['Approved', 'In preparation', 'Ready', 'Completed'];
const SERVICE_OF = { calendar: 'calendar', noticeboard: 'communication-hub' } as const;

/**
 * Brief 21 B4, D-182 and D-186: publishing to the Calendar and the
 * Noticeboard, once each; a target whose service is off is shown as such,
 * and offered again once it is back on.
 */
export function PublishPanel({ event }: { event: EventSummary }) {
  const e = useText().services['event-organiser'];
  const { unit } = useSelectedUnit();
  const hints = useEventHints(event);
  const publish = useEventAction();
  const publishedAt = {
    calendar: event.calendarPublishedAt,
    noticeboard: event.noticeboardPublishedAt,
  };
  const on = (target: PublishTarget) => unit?.enabledServices.includes(SERVICE_OF[target]) ?? false;
  const ready = PUBLISH_TARGETS.filter((target) => publishedAt[target] === null && on(target));
  const offered = hints.manages && PUBLISHABLE.includes(event.status);
  const send = (targets: PublishTarget[]) => () => {
    const path = `${eventPath(event.unitId, event.id)}/publish`;
    publish.mutate({ path, method: 'POST', body: { targets, version: event.version } });
  };
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{e.publish.heading}</h3>
      <ErrorAlert error={publish.error} refusals={e.refusals} />
      <PublishTargets publishedAt={publishedAt} on={on} />
      {offered && ready.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ready.map((target) => (
            <ActionButton
              key={target}
              label={fillText(e.publish.publishTo, { target: e.publish.targets[target] })}
              disabled={publish.isPending}
              onClick={send([target])}
            />
          ))}
          {ready.length > 1 && (
            <ActionButton
              primary
              label={e.publish.publishAll}
              disabled={publish.isPending}
              onClick={send(ready)}
            />
          )}
        </div>
      )}
      {event.status === 'Cancelled' && <CancellationPost event={event} hubOn={on('noticeboard')} />}
    </section>
  );
}
