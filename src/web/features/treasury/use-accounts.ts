import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchAccounts } from './treasury.api';
import { treasuryKey } from './treasury-keys';

/** Brief 17 C1: the unit's accounts and balances. */
export function useAccounts(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: treasuryKey(unitId, 'accounts'),
    queryFn: () => fetchAccounts(request, unitId),
  });
}
