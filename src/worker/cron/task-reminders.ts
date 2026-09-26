import { getTodayInLondon } from '../core/permissions';
import { sendTaskReminders } from '../services/task-tracker';
import { registerCronJob } from './job-registry';

export const TASK_REMINDERS_JOB = 'task-reminders';

/** Brief 11 and 18 B3: daily (D-001's schedule), in-portal reminders before the due date and when overdue. */
export function registerTaskRemindersJob(): void {
  registerCronJob(TASK_REMINDERS_JOB, async (env) => {
    await sendTaskReminders(env.DB, getTodayInLondon());
  });
}
