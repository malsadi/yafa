import type {
  CurrentOfficerRecord,
  OfficerRecord,
} from '../../../../shared/committee-register/officer-record';
import type { RoleRecord } from '../../../../shared/committee-register/role-record';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const REGISTER = '/api/committee-register';

export interface NewOfficer {
  name: string;
  email: string;
  phone: string;
  roleId: string;
  startDate: string;
  endDate: string | null;
}

export type InvitationOutcome = 'sent' | 'failed' | 'not-needed';

export function fetchOfficers(request: Request, unitId: string) {
  return request<CurrentOfficerRecord[]>(`${REGISTER}/units/${unitId}/officers`);
}

export function fetchPastOfficers(request: Request, unitId: string) {
  return request<OfficerRecord[]>(`${REGISTER}/units/${unitId}/past-officers`);
}

/** The roles a unit can use, standard and its own (brief 14 B2). */
export function fetchUnitRoles(request: Request, unitId: string) {
  return request<RoleRecord[]>(`${REGISTER}/branches/${unitId}/roles`);
}

export function addOfficer(request: Request, unitId: string, officer: NewOfficer) {
  return request<{ invitation: InvitationOutcome }>(`${REGISTER}/units/${unitId}/officers`, {
    method: 'POST',
    body: officer,
  });
}

export function updatePerson(
  request: Request,
  personId: string,
  changes: { name: string; phone: string },
) {
  return request<undefined>(`${REGISTER}/people/${personId}`, { method: 'PATCH', body: changes });
}

export function endTerm(request: Request, termId: string, endDate: string) {
  return request<{ accountLocked: boolean }>(`${REGISTER}/terms/${termId}`, {
    method: 'PATCH',
    body: { endDate },
  });
}
