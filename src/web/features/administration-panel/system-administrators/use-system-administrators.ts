import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import {
  appointAdministrator,
  fetchAdministrators,
  fetchCandidates,
  removeAdministrator,
} from './system-administrators.api';

const KEY = ['system-administrators'] as const;

/**
 * Brief 25 A1: the administrators, who may be appointed, and the two
 * changes. A refusal keeps its code for the screen to explain; either
 * way, both lists reload so the screen shows what the server holds.
 */
export function useSystemAdministrators() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<string | null>(null);
  const administrators = useQuery({ queryKey: KEY, queryFn: () => fetchAdministrators(request) });
  const candidates = useQuery({
    queryKey: [...KEY, 'candidates'],
    queryFn: () => fetchCandidates(request),
  });

  const settle = (error: Error | null) => {
    setRefusal(error ? (error instanceof ApiError ? error.code : 'server.error') : null);
    return queryClient.invalidateQueries({ queryKey: KEY });
  };
  const appoint = useMutation({
    mutationFn: (personId: string) => appointAdministrator(request, personId),
    onSettled: (_data, error) => settle(error),
  });
  const remove = useMutation({
    mutationFn: (personId: string) => removeAdministrator(request, personId),
    onSettled: (_data, error) => settle(error),
  });

  return { administrators, candidates, appoint, remove, refusal };
}
