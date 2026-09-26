import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';

/** D-100: retire an item of the library, or bring it back, from the version read. */
export function useLibraryRetirement(queryKey: readonly unknown[]) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { itemPath: string; version: number; retire: boolean }) =>
      request<undefined>(`${p.itemPath}/${p.retire ? 'retire' : 'restore'}`, {
        method: 'POST',
        body: { version: p.version },
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
