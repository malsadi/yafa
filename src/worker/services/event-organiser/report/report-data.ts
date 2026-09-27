import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import type { PostEventReport } from '../../../../shared/event-organiser/post-event-report';
import { ServiceUnavailableError } from '../../../core/errors';
import { getSetting } from '../../../core/settings';
import { listEventTasks } from '../../task-tracker';
import { eventBudgetFigures } from '../../treasury';
import { eventProgress } from '../event-tasks/progress';

/** Brief 21 C1 and D-183: the report's figures, pulled automatically from the tasks and the account. */
export async function buildReportData(
  db: D1Database,
  event: EventSummary,
): Promise<PostEventReport> {
  const counts = await getSetting<boolean>(db, 'event-organiser.cancelled_tasks_count_in_progress');
  if (counts.status !== 'configured') throw new ServiceUnavailableError('setting.not-configured');
  const tasks = await listEventTasks(db, event.unitId, event.id);
  const progress = eventProgress(tasks, counts.value);
  return {
    event,
    cancelled: event.cancelledAt !== null,
    tasks: {
      done: progress.done,
      total: progress.total,
      items: tasks.map((task) => ({ title: task.title, status: task.status })),
    },
    budget: await eventBudgetFigures(db, event.id),
  };
}
