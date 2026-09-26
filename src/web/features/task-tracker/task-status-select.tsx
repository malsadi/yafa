import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { TASK_STATUSES } from '../../../shared/task-tracker/task-statuses';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { unitPath } from './task-tracker.api';
import { useTaskAction } from './use-task-action';

/** Brief 18 A4, D-137 and D-138: the task's owner, or a manager, sets any status — nothing is blocked. */
export function TaskStatusSelect({ task }: { task: TaskRecord }) {
  const t = useText().services['task-tracker'];
  const change = useTaskAction();
  return (
    <span className="flex flex-col gap-1">
      <select
        aria-label={fillText(t.statusLabel, { title: task.title })}
        className="rounded border border-slate-400 p-1"
        value={task.status}
        disabled={change.isPending}
        onChange={(event) => {
          change.mutate({
            path: `${unitPath(task.unitId)}/tasks/${task.id}/status`,
            method: 'POST',
            body: { status: event.target.value, version: task.version },
          });
        }}
      >
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {t.statuses[s]}
          </option>
        ))}
      </select>
      <ErrorAlert error={change.error} refusals={t.refusals} />
    </span>
  );
}
