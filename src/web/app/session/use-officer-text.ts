import { useQuery } from '@tanstack/react-query';
import type { AdminText } from '../../../shared/administration-panel/admin-texts';
import { ApiError } from '../api/api-error';
import { useApiRequest } from '../api/use-api-request';

/**
 * Brief 25 C5: an administrator's text officers read. Null while it isn't
 * written (the Worker answers 404), so the page can say so (rule 5).
 */
export function useOfficerText(key: 'access-not-active' | 'help') {
  const request = useApiRequest();
  return useQuery({
    queryKey: ['officer-text', key],
    queryFn: async () => {
      try {
        return await request<AdminText>(`/api/texts/${key}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}
