import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { TaskFlagBadges } from './task-flag-badges';

/** A task's first line: its title, marked if an event's, its flags, and when it is due. */
export function TaskHeading({ task }: { task: TaskRecord }) {
  const t = useText().services['task-tracker'];
  const date = useFormatDate();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-medium">{task.title}</span>
      {task.eventId && <span className="rounded bg-slate-100 px-2 text-sm">{t.eventTask}</span>}
      <TaskFlagBadges task={task} />
      <span className="ms-auto text-sm">{fillText(t.due, { date: date(task.dueDate) })}</span>
    </div>
  );
}
