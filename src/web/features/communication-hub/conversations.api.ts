import type { CircularBranch } from '../../../shared/communication-hub/circular-records';
import type {
  DiscussionInvitee,
  DiscussionSummary,
  HubMessage,
  HubRequestRecord,
  RoleNetwork,
} from '../../../shared/communication-hub/conversation-records';
import type { useApiRequest } from '../../app/api/use-api-request';
import { unitHubPath } from './hub.api';

type Request = ReturnType<typeof useApiRequest>;

export const HUB_API = '/api/communication-hub';
export const roleNetworkPath = (roleId: string) => `${HUB_API}/role-networks/${roleId}/messages`;
export const discussionPath = (id: string) => `${HUB_API}/discussions/${id}`;
export const requestPath = (unitId: string, id: string) => `${unitHubPath(unitId)}/requests/${id}`;
export const removeMessagePath = (id: string) => `${HUB_API}/messages/${id}/remove`;

export const fetchMessages = (request: Request, path: string) => request<HubMessage[]>(path);
export const fetchRoleNetworks = (request: Request) =>
  request<RoleNetwork[]>(`${HUB_API}/role-networks`);
export const fetchDiscussions = (request: Request) =>
  request<DiscussionSummary[]>(`${HUB_API}/discussions`);
export const fetchInvitees = (request: Request, unitId: string) =>
  request<DiscussionInvitee[]>(`${unitHubPath(unitId)}/discussion-invitees`);
export const fetchRequests = (request: Request, unitId: string) =>
  request<HubRequestRecord[]>(`${unitHubPath(unitId)}/requests`);
export const fetchRequestBranches = (request: Request, unitId: string) =>
  request<CircularBranch[]>(`${unitHubPath(unitId)}/request-branches`);
