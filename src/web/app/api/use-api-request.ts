import { useAuth } from '@clerk/react';
import { useCallback } from 'react';
import { apiRequest } from './api-request';

/** `apiRequest` bound to the signed-in officer's current Clerk session. */
export function useApiRequest() {
  const { getToken } = useAuth();
  return useCallback(
    <T>(path: string, init?: { method?: string; body?: unknown }) =>
      apiRequest<T>(() => getToken(), path, init),
    [getToken],
  );
}
