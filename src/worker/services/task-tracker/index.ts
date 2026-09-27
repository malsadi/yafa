import { TASK_TRACKER_CAPABILITIES } from '../../../shared/task-tracker/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 9's capabilities (brief section 18), into the catalogue (7.2). */
export function registerTaskTrackerCapabilities(): void {
  TASK_TRACKER_CAPABILITIES.forEach(registerCapability);
}

export { registerTaskTrackerSettings } from './settings';
export { registerTasksRoutes } from './tasks/tasks.routes';
export { registerMyTasksRoutes } from './my-tasks/my-tasks.routes';
export { sendTaskReminders } from './reminders/reminders.service';
export { buildEventTaskStatements } from './event-tasks/event-tasks.repo';
export {
  buildEventTaskChangeStatements,
  eventTaskHistory,
  listEventTasks,
} from './event-tasks/event-tasks.service';
export { requireOwner as requireTaskOwner } from './tasks/task-guards';
export { taskDetailsSchema, taskChangeSchema } from './tasks/tasks.schema';
export type { TaskChange, TaskDetails } from './tasks/tasks.schema';
