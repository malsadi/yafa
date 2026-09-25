import type { RoleDesignationsView } from '../../../../shared/administration-panel/role-designations';
import type { RoleDesignation } from '../../../../shared/committee-register/role-designation';
import type { RoleNames, RoleRecord } from '../../../../shared/committee-register/role-record';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const ROLES = '/api/committee-register/roles';
const DESIGNATIONS = '/api/administration-panel/role-designations';

export function fetchStandardRoles(request: Request): Promise<RoleRecord[]> {
  return request<RoleRecord[]>(ROLES);
}

export function createStandardRole(request: Request, names: RoleNames): Promise<RoleRecord> {
  return request<RoleRecord>(ROLES, { method: 'POST', body: names });
}

export function renameStandardRole(
  request: Request,
  roleId: string,
  names: RoleNames,
): Promise<RoleRecord> {
  return request<RoleRecord>(`${ROLES}/${roleId}`, { method: 'PATCH', body: names });
}

export function orderStandardRoles(request: Request, roleIds: string[]): Promise<void> {
  return request<undefined>(`${ROLES}/order`, { method: 'PUT', body: { roleIds } });
}

export function fetchDesignations(request: Request): Promise<RoleDesignationsView> {
  return request<RoleDesignationsView>(DESIGNATIONS);
}

export function setDesignation(
  request: Request,
  designation: RoleDesignation,
  roleId: string | null,
): Promise<void> {
  return request<undefined>(DESIGNATIONS, { method: 'PUT', body: { designation, roleId } });
}
