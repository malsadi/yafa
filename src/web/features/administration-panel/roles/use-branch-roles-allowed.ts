import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../../app/api/use-api-request';
import { ROLES_KEY } from './use-refusal';

const PATH = '/api/committee-register/branch-roles-allowed';

/** Brief 25 B2 and D-073: whether branches may add extra roles, and changing it. */
export function useBranchRolesAllowed() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const allowed = useQuery({
    queryKey: [...ROLES_KEY, 'branch-roles-allowed'],
    queryFn: () => request<{ allowed: boolean | null }>(PATH),
  });
  const change = useMutation({
    mutationFn: (value: boolean) =>
      request<{ allowed: boolean }>(PATH, { method: 'PUT', body: { allowed: value } }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  });
  return { allowed, change };
}
