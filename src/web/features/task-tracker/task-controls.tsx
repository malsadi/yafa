import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { TaskStatusSelect } from './task-status-select';

/**
 * Brief 18 A4 and D-137, D-138: a task's status — chosen by its owner or a
 * manager — and "Change" for a manager. D-184 and brief 28: a closed
 * event's task is locked, marked so, and offers neither.
 */
export function TaskControls(props: { task: TaskRecord; manages: boolean; onEdit: () => void }) {
  const t = useText().services['task-tracker'];
  const { context } = useActiveSession();
  const { task } = props;
  const mayChangeStatus =
    !task.locked && (props.manages || task.ownerPersonId === context.personId);
  return (
    <div className="flex flex-wrap items-start gap-3">
      {mayChangeStatus ? (
        <TaskStatusSelect task={task} />
      ) : (
        <span className="text-sm">{t.statuses[task.status]}</span>
      )}
      {task.locked && <span className="text-sm text-slate-600">{t.locked}</span>}
      {props.manages && !task.locked && (
        <button
          type="button"
          className="rounded border border-slate-400 px-3 py-1"
          onClick={props.onEdit}
        >
          {t.edit}
        </button>
      )}
    </div>
  );
}
