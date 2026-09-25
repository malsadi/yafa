import type { RoleRecord } from '../../../../shared/committee-register/role-record';
import type { useApiRequest } from '../../../app/api/use-api-request';
import type { BilingualNames } from '../../../components/bilingual-name-form';

type Request = ReturnType<typeof useApiRequest>;

const rolesOf = (unitId: string) => `/api/committee-register/branches/${unitId}/roles`;

export function addBranchRole(request: Request, unitId: string, names: BilingualNames) {
  return request<RoleRecord>(rolesOf(unitId), { method: 'POST', body: names });
}

export function renameBranchRole(
  request: Request,
  params: { unitId: string; roleId: string; names: BilingualNames },
) {
  return request<RoleRecord>(`${rolesOf(params.unitId)}/${params.roleId}`, {
    method: 'PATCH',
    body: params.names,
  });
}
