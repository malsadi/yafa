import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchOfficers, fetchPastOfficers } from './officers/officers.api';

/** Everyone who holds or has held a term in the unit, by name: [personId, name] pairs. */
export function useUnitPeople(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: ['committee-register', unitId, 'people'],
    queryFn: async () => {
      const [current, past] = await Promise.all([
        fetchOfficers(request, unitId),
        fetchPastOfficers(request, unitId),
      ]);
      const byId = new Map([...current, ...past].map((o) => [o.personId, o.name]));
      return [...byId].sort(([, a], [, b]) => a.localeCompare(b));
    },
  });
}
