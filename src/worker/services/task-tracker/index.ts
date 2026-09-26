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
