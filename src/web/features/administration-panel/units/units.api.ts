import type { UnitInput, UnitRecord } from '../../../../shared/committee-register/unit-record';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/committee-register/branches';

export function fetchUnits(request: Request): Promise<UnitRecord[]> {
  return request<UnitRecord[]>(PATH);
}

export function createBranch(request: Request, input: UnitInput): Promise<UnitRecord> {
  return request<UnitRecord>(PATH, { method: 'POST', body: input });
}

export function updateUnit(
  request: Request,
  unitId: string,
  changes: Partial<UnitInput>,
): Promise<UnitRecord> {
  return request<UnitRecord>(`${PATH}/${unitId}`, { method: 'PATCH', body: changes });
}
