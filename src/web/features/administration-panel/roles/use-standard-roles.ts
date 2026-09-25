import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoleNames } from '../../../../shared/committee-register/role-record';
import { useApiRequest } from '../../../app/api/use-api-request';
import { createStandardRole, fetchStandardRoles, renameStandardRole } from './roles.api';
import { ROLES_KEY, useRefusal } from './use-refusal';

/** Brief 25 B2 and 14 B2: the standard roles, adding one and renaming one. */
export function useStandardRoles() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const { refusal, settle } = useRefusal(() =>
    queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  );
  const roles = useQuery({
    queryKey: [...ROLES_KEY, 'standard'],
    queryFn: () => fetchStandardRoles(request),
  });
  const create = useMutation({
    mutationFn: (names: RoleNames) => createStandardRole(request, names),
    onSettled: (_data, error) => settle(error),
  });
  const rename = useMutation({
    mutationFn: (params: { roleId: string; names: RoleNames }) =>
      renameStandardRole(request, params.roleId, params.names),
    onSettled: (_data, error) => settle(error),
  });
  return { roles, create, rename, refusal };
}
