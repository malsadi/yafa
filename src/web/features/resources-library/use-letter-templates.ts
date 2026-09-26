import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchLetterTemplates } from './library.api';

export const letterTemplatesKey = (unitId: string) =>
  ['resources-library', unitId, 'letter-templates'] as const;

/** Brief 16 D1: the unit's letter templates and the General Council's. */
export function useLetterTemplates(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: letterTemplatesKey(unitId),
    queryFn: () => fetchLetterTemplates(request, unitId),
  });
}
