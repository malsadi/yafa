import type { AccessCheck } from '../../../../shared/administration-panel/access-check';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/access-check/people';

export function fetchPeople(request: Request): Promise<{ personId: string; name: string }[]> {
  return request<{ personId: string; name: string }[]>(PATH);
}

export function fetchAccessCheck(request: Request, personId: string): Promise<AccessCheck> {
  return request<AccessCheck>(`${PATH}/${personId}`);
}
