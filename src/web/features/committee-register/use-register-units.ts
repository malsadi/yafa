import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchRegisterUnits } from './register-units.api';

/** Brief 14: the units whose register this officer may open (T-102). */
export function useRegisterUnits() {
  const request = useApiRequest();
  return useQuery({
    queryKey: ['committee-register', 'units'],
    queryFn: () => fetchRegisterUnits(request),
  });
}
