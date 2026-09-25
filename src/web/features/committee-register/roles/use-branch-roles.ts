import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import type { BilingualNames } from '../../../components/bilingual-name-form';
import { useUnitRoles } from '../officers/use-unit-roles';
import { addBranchRole, renameBranchRole } from './branch-roles.api';

/** Brief 14 B2: a unit's roles, and adding or renaming its own extra roles. */
export function useBranchRoles(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<string | null>(null);
  const roles = useUnitRoles(unitId);
  const onSettled = (_data: unknown, error: Error | null) => {
    setRefusal(error ? (error instanceof ApiError ? error.code : 'server.error') : null);
    return queryClient.invalidateQueries({ queryKey: ['committee-register', unitId, 'roles'] });
  };
  const add = useMutation({
    mutationFn: (names: BilingualNames) => addBranchRole(request, unitId, names),
    onSettled,
  });
  const rename = useMutation({
    mutationFn: (p: { roleId: string; names: BilingualNames }) =>
      renameBranchRole(request, { unitId, ...p }),
    onSettled,
  });
  return { roles, add, rename, refusal };
}
