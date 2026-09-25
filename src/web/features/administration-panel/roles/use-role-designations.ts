import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoleDesignation } from '../../../../shared/committee-register/role-designation';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchDesignations, setDesignation } from './roles.api';
import { ROLES_KEY, useRefusal } from './use-refusal';

/** Brief 25 B2: which standard role holds each register officer designation. */
export function useRoleDesignations() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const { refusal, settle } = useRefusal(() =>
    queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  );
  const designations = useQuery({
    queryKey: [...ROLES_KEY, 'designations'],
    queryFn: () => fetchDesignations(request),
  });
  const change = useMutation({
    mutationFn: (params: { designation: RoleDesignation; roleId: string | null }) =>
      setDesignation(request, params.designation, params.roleId),
    onSettled: (_data, error) => settle(error),
  });
  return { designations, change, refusal };
}
