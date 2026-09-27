import type { TaskStatus } from '../task-tracker/task-statuses';
import type { EventBudgetFigures } from '../treasury/treasury-records';
import type { EventSummary } from './event-records';

/**
 * Brief 21 C1 and D-183: the post-event report — the tasks done against the
 * total (following the cancelled-tasks setting), each task with its status,
 * and the budget against actual income and spending. A cancelled event's
 * report is headed as cancelled (D-181).
 */
export interface PostEventReport {
  event: EventSummary;
  cancelled: boolean;
  tasks: { done: number; total: number; items: { title: string; status: TaskStatus }[] };
  budget: EventBudgetFigures;
}
