import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchStatement } from './treasury.api';
import { treasuryKey } from './treasury-keys';

/** Brief 17 C2: an account's statement for a period, once a period is chosen. */
export function useStatement(
  unitId: string,
  accountId: string,
  period: { from: string; to: string } | null,
) {
  const request = useApiRequest();
  return useQuery({
    queryKey: treasuryKey(unitId, 'statement', accountId, period),
    queryFn: () =>
      period
        ? fetchStatement(request, unitId, accountId, period)
        : Promise.reject(new Error('no period')),
    enabled: period !== null,
  });
}
