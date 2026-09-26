import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  fetchDiscussions,
  fetchInvitees,
  fetchMessages,
  fetchRequestBranches,
  fetchRequests,
  fetchRoleNetworks,
} from './conversations.api';
import { HUB_KEY } from './hub-keys';

/** A conversation's messages, from its messages path (D-161: removed ones keep their place). */
export function useMessages(path: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, 'messages', path],
    queryFn: () => fetchMessages(request, path),
  });
}

/** Brief 20 B1 and D-158: the officer's role networks. */
export function useRoleNetworks() {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, 'role-networks'],
    queryFn: () => fetchRoleNetworks(request),
  });
}

/** Brief 20 B2: the discussions the officer was invited to. */
export function useDiscussions() {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, 'discussions'],
    queryFn: () => fetchDiscussions(request),
  });
}

/** D-159: every current officer, to be invited. */
export function useInvitees(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'invitees'],
    queryFn: () => fetchInvitees(request, unitId),
  });
}

/** Brief 20 B3: the requests the branch sent and received. */
export function useRequests(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'requests'],
    queryFn: () => fetchRequests(request, unitId),
  });
}

/** The other branches a request can go to. */
export function useRequestBranches(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'request-branches'],
    queryFn: () => fetchRequestBranches(request, unitId),
  });
}
