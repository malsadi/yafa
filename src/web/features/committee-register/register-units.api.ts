import type { UnitRecord } from '../../../shared/committee-register/unit-record';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export function fetchRegisterUnits(request: Request): Promise<UnitRecord[]> {
  return request<UnitRecord[]>('/api/committee-register/units');
}
