import type {
  MatrixVersionSummary,
  PermissionsMatrixView,
} from '../../../../shared/administration-panel/permissions-matrix';
import type { PermissionScope } from '../../../../shared/core/permission-scope';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/permissions-matrix';

export interface CellEdit {
  roleId: string;
  capability: string;
  scopes: PermissionScope[];
  expectedVersion: number;
}

export function fetchMatrix(request: Request): Promise<PermissionsMatrixView> {
  return request<PermissionsMatrixView>(PATH);
}

export function saveCell(request: Request, edit: CellEdit): Promise<{ version: number }> {
  return request<{ version: number }>(`${PATH}/cells`, { method: 'PUT', body: edit });
}

export function fetchVersions(request: Request): Promise<MatrixVersionSummary[]> {
  return request<MatrixVersionSummary[]>(`${PATH}/versions`);
}

export function restoreVersion(
  request: Request,
  fromVersion: number,
  expectedVersion: number,
): Promise<{ version: number }> {
  return request<{ version: number }>(`${PATH}/versions/${String(fromVersion)}/restore`, {
    method: 'POST',
    body: { expectedVersion },
  });
}
