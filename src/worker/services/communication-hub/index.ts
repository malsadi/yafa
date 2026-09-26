import { COMMUNICATION_HUB_CAPABILITIES } from '../../../shared/communication-hub/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 4's capabilities (brief section 20), into the catalogue (7.2). */
export function registerCommunicationHubCapabilities(): void {
  COMMUNICATION_HUB_CAPABILITIES.forEach(registerCapability);
}

/** Service 4, Communication hub (brief 20). Its first setting was set in Phase 2 (25 C4). */
export { registerCommunicationHubSettings } from './settings';
export { registerNoticeboardRoutes } from './noticeboard/noticeboard.routes';
export { registerNoticeVotesRoutes } from './notice-votes/notice-votes.routes';
export { registerCircularsRoutes } from './circulars/circulars.routes';
export { registerRoleNetworksRoutes } from './role-networks/role-networks.routes';
export { registerDiscussionsRoutes } from './discussions/discussions.routes';
export { registerDiscussionMembersRoutes } from './discussions/discussion-members.routes';
export { registerRequestsRoutes } from './requests/requests.routes';
export { registerHubMessagesRoutes } from './conversations/hub-messages.routes';
export { postAutomatic, type AutomaticPostPayload } from './automatic-posts/post-automatic';
export { registerAlertChoicesRoutes } from './alerts/alert-choices.routes';
export { registerPushRoutes } from './push/push.routes';
export { queueHubAlert } from './alerts/queue-hub-alert';
export { deliverAlert } from './alerts/deliver-alert';
export { deliverPush } from './alerts/deliver-push';
export type {
  HubAlertEvent,
  NotificationsQueue,
  NotificationsQueueMessage,
} from './alerts/hub-alert-events';
export { queueVoteResults } from './alerts/vote-results';
export { prunePush } from './push/push-pruning';
