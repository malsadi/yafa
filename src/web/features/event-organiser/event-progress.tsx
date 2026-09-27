import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import type { EventTasksView } from './event-organiser.api';

/** Brief 21 B2: completed against total, recalculated live; overdue tasks highlighted, nothing blocked. */
export function EventProgress({ progress }: { progress: EventTasksView['progress'] }) {
  const t = useText().services['event-organiser'].tasks;
  return (
    <div className="flex flex-col gap-1">
      <progress className="w-full" max={Math.max(progress.total, 1)} value={progress.done} />
      <p className="text-sm">
        {fillText(t.progress, { done: String(progress.done), total: String(progress.total) })}
        {progress.overdue > 0 && (
          <span className="ms-2 rounded bg-amber-100 px-2">
            {fillText(t.overdue, { count: String(progress.overdue) })}
          </span>
        )}
      </p>
    </div>
  );
}
