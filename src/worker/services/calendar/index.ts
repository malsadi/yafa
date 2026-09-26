import { CALENDAR_CAPABILITIES } from '../../../shared/calendar/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 5's capabilities (brief section 19), into the catalogue (7.2). */
export function registerCalendarCapabilities(): void {
  CALENDAR_CAPABILITIES.forEach(registerCapability);
}

export { registerCalendarSettings } from './settings';
export { registerFeedTokensRoutes } from './feed-tokens/feed-tokens.routes';
export { revokeFeedToken } from './feed-tokens/feed-tokens.service';
export {
  buildCalendarEntryStatement,
  buildRemoveCalendarEntryStatement,
} from './read-model/read-model.repo';
export type { CalendarEntryInput } from './read-model/read-model.repo';
export { checkClashes } from './clashes/clashes.service';
export { registerViewsRoutes } from './views/views.routes';
export { registerCommunityDatesRoutes } from './community-dates/community-dates.routes';
export { registerCalendarFeedRoute } from './feed/feed.routes';
