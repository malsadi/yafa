import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ResourceKind } from '../../../shared/resources-library/resource';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  addResource,
  changeResourceDetails,
  fetchResources,
  replaceResourceFile,
  type ResourceDetailsDraft,
} from './resources.api';

export const resourcesKey = (unitId: string) => ['resources-library', unitId, 'resources'] as const;

/** Brief 16 A1 to A3: the unit's templates and guides, and changing them. */
export function useResources(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: resourcesKey(unitId) });
  const list = useQuery({
    queryKey: resourcesKey(unitId),
    queryFn: () => fetchResources(request, unitId),
  });
  const add = useMutation({
    mutationFn: (p: { kind: ResourceKind; file: File; details: ResourceDetailsDraft }) =>
      addResource(request, unitId, p),
    onSuccess: refresh,
  });
  const change = useMutation({
    mutationFn: (p: { resourceId: string; version: number; details: ResourceDetailsDraft }) =>
      changeResourceDetails(request, unitId, p),
    onSettled: refresh,
  });
  const replace = useMutation({
    mutationFn: (p: { resourceId: string; version: number; file: File }) =>
      replaceResourceFile(request, unitId, p),
    onSettled: refresh,
  });
  return { list, add, change, replace };
}
