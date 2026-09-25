import type {
  SystemAdministratorCandidate,
  SystemAdministratorListItem,
} from '../../../../shared/administration-panel/system-administrators';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/system-administrators';

export function fetchAdministrators(request: Request): Promise<SystemAdministratorListItem[]> {
  return request<SystemAdministratorListItem[]>(PATH);
}

export function fetchCandidates(request: Request): Promise<SystemAdministratorCandidate[]> {
  return request<SystemAdministratorCandidate[]>(`${PATH}/candidates`);
}

export function appointAdministrator(request: Request, personId: string): Promise<void> {
  return request<undefined>(PATH, { method: 'POST', body: { personId } });
}

export function removeAdministrator(request: Request, personId: string): Promise<void> {
  return request<undefined>(`${PATH}/${personId}`, { method: 'DELETE' });
}
