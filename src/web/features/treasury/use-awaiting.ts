import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchAwaiting } from './treasury.api';
import { treasuryKey } from './treasury-keys';

/** P7 and D-133: what awaits a second officer. */
export function useAwaiting(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: treasuryKey(unitId, 'approvals'),
    queryFn: () => fetchAwaiting(request, unitId),
  });
}
