import { EVENT_ORGANISER_CAPABILITIES } from '../../../shared/event-organiser/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 1's capabilities (brief section 21), into the catalogue (7.2). */
export function registerEventOrganiserCapabilities(): void {
  EVENT_ORGANISER_CAPABILITIES.forEach(registerCapability);
}

export { registerEventOrganiserSettings } from './settings';
export { registerTemplatesRoutes } from './templates/templates.routes';
export { registerEventsRoutes } from './events/events.routes';
export { registerApprovalRoutes } from './approval/approval.routes';
export { registerChoicesRoutes } from './choices/choices.routes';
export { registerStatusRoutes } from './status/status.routes';
export { registerEventTasksRoutes } from './event-tasks/event-tasks.routes';
export { registerPublishingRoutes } from './publishing/publishing.routes';
export { registerEventAccountRoutes } from './event-account/event-account.routes';
export { registerEventFilesRoutes } from './event-files/event-files.routes';
export { registerClosingRoutes } from './closing/closing.routes';
export { closeEvent } from './closing/closing.service';
export { eventsCompletedBetween } from './events/events-completed.repo';
