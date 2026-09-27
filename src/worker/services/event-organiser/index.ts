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
