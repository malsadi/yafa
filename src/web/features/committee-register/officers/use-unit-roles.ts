import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchUnitRoles } from './officers.api';

/** Brief 14 B2: the roles a unit can use, standard and its own. */
export function useUnitRoles(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: ['committee-register', unitId, 'roles'],
    queryFn: () => fetchUnitRoles(request, unitId),
  });
}
