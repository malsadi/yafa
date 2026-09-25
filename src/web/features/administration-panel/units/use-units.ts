import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { UnitInput } from '../../../../shared/committee-register/unit-record';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { createBranch, fetchUnits, updateUnit } from './units.api';

const KEY = ['units'] as const;

/** Brief 25 B1: the units, adding a branch and changing a unit. */
export function useUnits() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<string | null>(null);
  const units = useQuery({ queryKey: KEY, queryFn: () => fetchUnits(request) });

  const settle = (error: Error | null) => {
    setRefusal(error ? (error instanceof ApiError ? error.code : 'server.error') : null);
    return queryClient.invalidateQueries({ queryKey: KEY });
  };
  const create = useMutation({
    mutationFn: (input: UnitInput) => createBranch(request, input),
    onSettled: (_data, error) => settle(error),
  });
  const update = useMutation({
    mutationFn: (params: { unitId: string; changes: Partial<UnitInput> }) =>
      updateUnit(request, params.unitId, params.changes),
    onSettled: (_data, error) => settle(error),
  });

  return { units, create, update, refusal };
}
