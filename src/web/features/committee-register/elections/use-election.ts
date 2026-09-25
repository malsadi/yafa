import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ElectionRecord } from '../../../../shared/committee-register/election-record';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchElection } from './elections.api';

type Request = ReturnType<typeof useApiRequest>;

/** One change to an election: an API call that returns the election as it now is. */
export type ElectionChange = (request: Request) => Promise<ElectionRecord>;

/**
 * Brief 14 C1: one election, and every change to it. Each change returns
 * the whole election, which replaces the one shown; a refusal keeps its
 * code for the screen to explain.
 */
export function useElection(electionId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<string | null>(null);
  const key = ['committee-register', 'election', electionId];
  const election = useQuery({ queryKey: key, queryFn: () => fetchElection(request, electionId) });
  const change = useMutation({
    mutationFn: (run: ElectionChange) => run(request),
    onSuccess: (updated) => {
      setRefusal(null);
      queryClient.setQueryData(key, updated);
    },
    onError: (error) => {
      setRefusal(error instanceof ApiError ? error.code : 'server.error');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['committee-register'] }),
  });
  return { election, change, refusal };
}
