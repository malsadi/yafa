import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchElections, recordElection } from './elections.api';

/** Brief 14 C1: a unit's elections, and starting a new one as a Draft. */
export function useElections(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<string | null>(null);
  const elections = useQuery({
    queryKey: ['committee-register', unitId, 'elections'],
    queryFn: () => fetchElections(request, unitId),
  });
  const record = useMutation({
    mutationFn: (input: { electionDate: string; correctsElectionId?: string }) =>
      recordElection(request, unitId, input),
    onSettled: (_data, error) => {
      setRefusal(error ? (error instanceof ApiError ? error.code : 'server.error') : null);
      return queryClient.invalidateQueries({ queryKey: ['committee-register', unitId] });
    },
  });
  return { elections, record, refusal };
}
