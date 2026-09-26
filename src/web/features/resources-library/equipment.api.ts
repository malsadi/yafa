import type {
  EquipmentDetails,
  EquipmentView,
  LoanDetails,
} from '../../../shared/resources-library/equipment';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const equipmentPath = (unitId: string) => `/api/resources-library/units/${unitId}/equipment`;
const loansPath = (unitId: string, equipmentId: string) =>
  `${equipmentPath(unitId)}/${equipmentId}/loans`;

export function fetchEquipment(request: Request, unitId: string) {
  return request<EquipmentView>(equipmentPath(unitId));
}

export function createEquipment(request: Request, unitId: string, item: EquipmentDetails) {
  return request<{ id: string }>(equipmentPath(unitId), { method: 'POST', body: item });
}

export function saveEquipment(
  request: Request,
  unitId: string,
  p: { equipmentId: string; version: number; equipment: EquipmentDetails },
) {
  return request<undefined>(`${equipmentPath(unitId)}/${p.equipmentId}`, {
    method: 'PUT',
    body: { version: p.version, equipment: p.equipment },
  });
}

export function lendEquipment(
  request: Request,
  unitId: string,
  p: { equipmentId: string; loan: LoanDetails },
) {
  return request<undefined>(loansPath(unitId, p.equipmentId), { method: 'POST', body: p.loan });
}

export function correctLoan(
  request: Request,
  unitId: string,
  p: { equipmentId: string; loanId: string; version: number; loan: LoanDetails },
) {
  return request<undefined>(`${loansPath(unitId, p.equipmentId)}/${p.loanId}`, {
    method: 'PUT',
    body: { version: p.version, loan: p.loan },
  });
}

export function returnLoan(
  request: Request,
  unitId: string,
  p: { equipmentId: string; loanId: string; version: number; returnedOn: string },
) {
  return request<undefined>(`${loansPath(unitId, p.equipmentId)}/${p.loanId}/return`, {
    method: 'POST',
    body: { version: p.version, returnedOn: p.returnedOn },
  });
}
