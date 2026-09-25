import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchServiceSettings } from './service-settings.api';

type Request = ReturnType<typeof useApiRequest>;

/** One change to one setting: an API call about that setting. */
export interface SettingChange {
  key: string;
  run: (request: Request) => Promise<unknown>;
}

const KEY = ['service-settings'] as const;

/** Brief 25 C1: every setting, and every change to one; a refusal shows beside its setting. */
export function useServiceSettings() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<{ key: string; code: string } | null>(null);
  const view = useQuery({ queryKey: KEY, queryFn: () => fetchServiceSettings(request) });
  const change = useMutation({
    mutationFn: (params: SettingChange) => params.run(request),
    onSettled: (_data, error, params) => {
      const code = error instanceof ApiError ? error.code : 'server.error';
      setRefusal(error ? { key: params.key, code } : null);
      return queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
  return { view, change, refusal };
}
