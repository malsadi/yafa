import { useQuery } from '@tanstack/react-query';
import type { Branding } from '../../../shared/administration-panel/branding';
import { useApiRequest } from '../api/use-api-request';

export const BRANDING_QUERY_KEY = ['branding'] as const;

/** Brief 25 C3: the branding as set, for every active officer's screens (D-082). */
export function useBranding() {
  const request = useApiRequest();
  return useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: () => request<Branding>('/api/branding'),
  });
}
