import {
  PUBLISH_TARGETS,
  type PublishTarget,
} from '../../../shared/event-organiser/publish-targets';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** D-182 and D-186: where the event has been published, and a target not yet published — or switched off. */
export function PublishTargets(props: {
  publishedAt: Record<PublishTarget, string | null>;
  on: (target: PublishTarget) => boolean;
}) {
  const t = useText().services['event-organiser'].publish;
  const when = useFormatTimestamp();
  const line = (target: PublishTarget) => {
    const at = props.publishedAt[target];
    const name = t.targets[target];
    if (at !== null) return fillText(t.published, { target: name, date: when(at) });
    return fillText(props.on(target) ? t.notYet : t.switchedOff, { target: name });
  };
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {PUBLISH_TARGETS.map((target) => (
        <li key={target}>{line(target)}</li>
      ))}
    </ul>
  );
}
