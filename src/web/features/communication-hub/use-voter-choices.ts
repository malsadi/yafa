import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchVoterChoices } from './hub.api';
import { HUB_KEY } from './hub-keys';

/** P11: the unit's roles and current officers, for choosing who can vote. */
export function useVoterChoices(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'voter-choices'],
    queryFn: () => fetchVoterChoices(request, unitId),
  });
}
