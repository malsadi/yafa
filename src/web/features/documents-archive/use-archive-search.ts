import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { searchArchive, type ArchiveSearchFields } from './archive.api';

/** Brief 15 B1: the documents matching the search the officer last ran. */
export function useArchiveSearch(search: ArchiveSearchFields) {
  const request = useApiRequest();
  return useQuery({
    queryKey: ['documents-archive', 'documents', search],
    queryFn: () => searchArchive(request, search),
  });
}
