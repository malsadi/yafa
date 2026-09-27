import type { TaskRecord } from '../../../../shared/task-tracker/task-records';
import { TaskStatus } from '../../../../shared/task-tracker/task-statuses';

export interface EventProgress {
  done: number;
  total: number;
  overdue: number;
}

/**
 * Brief 21 B2: completed tasks against the total, worked out live from the
 * tasks. Whether cancelled tasks count is the administrator's setting; when
 * they count, they are part of the total, never done. Overdue tasks are
 * counted for highlighting; nothing is blocked.
 */
export function eventProgress(tasks: TaskRecord[], cancelledCount: boolean): EventProgress {
  const counted = cancelledCount
    ? tasks
    : tasks.filter((task) => task.status !== TaskStatus.Cancelled);
  return {
    done: counted.filter((task) => task.status === TaskStatus.Done).length,
    total: counted.length,
    overdue: tasks.filter((task) => task.overdue).length,
  };
}
