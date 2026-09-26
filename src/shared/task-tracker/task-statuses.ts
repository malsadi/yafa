/** Brief 18 A4: a task's status, by its exact name — To do → In progress → Done (or Cancelled). */
export const TaskStatus = {
  ToDo: 'To do',
  InProgress: 'In progress',
  Done: 'Done',
  Cancelled: 'Cancelled',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TASK_STATUSES: readonly TaskStatus[] = Object.values(TaskStatus);

/** D-142: the statuses a task still needs doing in — the only ones reminded or highlighted. */
export const OPEN_TASK_STATUSES: readonly TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress];
