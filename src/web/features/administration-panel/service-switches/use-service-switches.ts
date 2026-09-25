import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { ME_QUERY_KEY } from '../../../app/session/use-me';
import { changeServiceSwitch, fetchServiceSwitches } from './service-switches.api';

const KEY = ['service-switches'] as const;

/** Brief 25 C2: the switches, and changing one; a refusal shows beside its service. */
export function useServiceSwitches() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<{ service: string; code: string } | null>(null);
  const view = useQuery({ queryKey: KEY, queryFn: () => fetchServiceSwitches(request) });
  const change = useMutation({
    mutationFn: (p: { service: string; enabled: boolean | null; unitId?: string }) =>
      changeServiceSwitch(request, p.service, { enabled: p.enabled, unitId: p.unitId }),
    onSettled: async (_data, error, p) => {
      const code = error instanceof ApiError ? error.code : 'server.error';
      setRefusal(error ? { service: p.service, code } : null);
      // The navigation shows the services on for the officer's unit.
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      return queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
  return { view, change, refusal };
}
