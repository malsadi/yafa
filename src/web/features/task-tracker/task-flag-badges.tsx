import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useText } from '../../app/language/use-text';

/** Brief 18 B1 and 28: due soon and overdue are highlighted — they inform, never block. */
export function TaskFlagBadges({ task }: { task: Pick<TaskRecord, 'dueSoon' | 'overdue'> }) {
  const t = useText().services['task-tracker'].flags;
  return (
    <>
      {task.overdue && <span className="rounded bg-red-100 px-2 text-sm">{t.overdue}</span>}
      {task.dueSoon && <span className="rounded bg-amber-100 px-2 text-sm">{t.dueSoon}</span>}
    </>
  );
}
