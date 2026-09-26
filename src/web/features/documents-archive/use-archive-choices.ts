import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchArchiveCategories, fetchArchiveUnits } from './archive.api';

/** Brief 15 A3 and B1: the categories, and the units whose documents the officer sees. */
export function useArchiveChoices() {
  const request = useApiRequest();
  const categories = useQuery({
    queryKey: ['documents-archive', 'categories'],
    queryFn: () => fetchArchiveCategories(request),
  });
  const units = useQuery({
    queryKey: ['documents-archive', 'units'],
    queryFn: () => fetchArchiveUnits(request),
  });
  return { categories, units };
}
