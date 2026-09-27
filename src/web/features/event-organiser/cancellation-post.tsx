import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { eventPath } from './event-organiser.api';
import { useEventHints } from './event-hints';
import { useEventAction } from './use-event-action';

/**
 * D-190: a cancelled event that was announced gets a "cancelled" post. If
 * the Communication hub was off at the cancel, the screen says so and
 * offers the post, once, when it is back on.
 */
export function CancellationPost(props: { event: EventSummary; hubOn: boolean }) {
  const t = useText().services['event-organiser'];
  const hints = useEventHints(props.event);
  const post = useEventAction();
  const { event } = props;
  if (event.noticeboardPublishedAt === null) return null;
  if (event.cancellationPostedAt !== null)
    return <p className="text-sm">{t.publish.cancellationPosted}</p>;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        {props.hubOn ? t.publish.cancellationWaiting : t.publish.cancellationSkipped}
      </p>
      <ErrorAlert error={post.error} refusals={t.refusals} />
      {hints.manages && props.hubOn && (
        <button
          type="button"
          className="self-start rounded border border-slate-400 px-3 py-1"
          disabled={post.isPending}
          onClick={() => {
            post.mutate({
              path: `${eventPath(event.unitId, event.id)}/post-cancellation`,
              method: 'POST',
            });
          }}
        >
          {t.publish.postCancellation}
        </button>
      )}
    </div>
  );
}
