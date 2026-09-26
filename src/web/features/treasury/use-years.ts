import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchYears } from './treasury.api';
import { treasuryKey } from './treasury-keys';

/** Brief 17 C3: the unit's financial years. */
export function useYears(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: treasuryKey(unitId, 'years'),
    queryFn: () => fetchYears(request, unitId),
  });
}
