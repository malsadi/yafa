import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { post } from './treasury.api';
import { treasuryKey } from './treasury-keys';

/** A change to the unit's Treasury, posted to `path`; every Treasury view of the unit refreshes after. */
export function useTreasuryAction<T = undefined>(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; body?: object }) => post<T>(request, unitId, p.path, p.body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: treasuryKey(unitId) }),
  });
}
