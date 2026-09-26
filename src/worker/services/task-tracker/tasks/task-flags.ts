import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import type { TaskRecord } from '../../../../shared/task-tracker/task-records';
import { OPEN_TASK_STATUSES } from '../../../../shared/task-tracker/task-statuses';
import { ServiceUnavailableError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import type { TaskRow } from './tasks.repo';

/** Brief 18 B1: the due-soon window, in days; a refusal while it isn't set (8.1). */
export async function dueSoonWindow(db: D1Database): Promise<number> {
  const setting = await getSetting<number>(db, 'task-tracker.due_soon_window_days');
  if (setting.status === 'not-configured')
    throw new ServiceUnavailableError('setting.not-configured');
  return setting.value;
}

/**
 * Brief 18 B1 and 28: an open task (D-142) past its due date is overdue;
 * one due within the window is due soon. Both inform; nothing is blocked.
 */
export function withFlags(
  rows: TaskRow[],
  windowDays: number,
  today = getTodayInLondon(),
): TaskRecord[] {
  const soonUntil = addDaysToDate(today, windowDays);
  return rows.map((row) => {
    const open = OPEN_TASK_STATUSES.includes(row.status);
    return {
      ...row,
      overdue: open && row.dueDate < today,
      dueSoon: open && row.dueDate >= today && row.dueDate <= soonUntil,
    };
  });
}
