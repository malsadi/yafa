import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { HandoverRecord } from '../../../../shared/committee-register/handover-record';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchHandover } from './handovers.api';

type Request = ReturnType<typeof useApiRequest>;

/** One change to a handover: an API call that returns the handover as it now is. */
export type HandoverChange = (request: Request) => Promise<HandoverRecord>;

/** Brief 14 C2 and D-067: one handover, and every change to it. */
export function useHandover(handoverId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<string | null>(null);
  const key = ['committee-register', 'handover', handoverId];
  const handover = useQuery({ queryKey: key, queryFn: () => fetchHandover(request, handoverId) });
  const change = useMutation({
    mutationFn: (run: HandoverChange) => run(request),
    onSuccess: (updated) => {
      setRefusal(null);
      queryClient.setQueryData(key, updated);
    },
    onError: (error) => {
      setRefusal(error instanceof ApiError ? error.code : 'server.error');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['committee-register'] }),
  });
  return { handover, change, refusal };
}
