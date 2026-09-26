import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchAccountHistory } from './treasury.api';
import { treasuryKey } from './treasury-keys';

/** Brief 17 B: one account's entries in a period, and its budget lines. */
export function useAccountHistory(
  unitId: string,
  accountId: string,
  period: { from: string; to: string },
) {
  const request = useApiRequest();
  return useQuery({
    queryKey: treasuryKey(unitId, 'history', accountId, period),
    queryFn: () => fetchAccountHistory(request, unitId, accountId, period),
  });
}
