import type { HandoverRecord } from '../../../../shared/committee-register/handover-record';
import type { useApiRequest } from '../../../app/api/use-api-request';
import type { BilingualNames } from '../../../components/bilingual-name-form';

type Request = ReturnType<typeof useApiRequest>;

const REGISTER = '/api/committee-register';
const one = (handoverId: string) => `${REGISTER}/handovers/${handoverId}`;

export interface NewHandover {
  roleId: string;
  outgoingPersonId: string;
  incomingPersonId: string;
}

export const fetchUnitHandovers = (request: Request, unitId: string) =>
  request<HandoverRecord[]>(`${REGISTER}/units/${unitId}/handovers`);

export const fetchMyHandovers = (request: Request) =>
  request<HandoverRecord[]>(`${REGISTER}/my-handovers`);

export const fetchHandover = (request: Request, handoverId: string) =>
  request<HandoverRecord>(one(handoverId));

export const createHandover = (request: Request, unitId: string, handover: NewHandover) =>
  request<HandoverRecord>(`${REGISTER}/units/${unitId}/handovers`, {
    method: 'POST',
    body: handover,
  });

export const addItem = (request: Request, handoverId: string, names: BilingualNames) =>
  request<HandoverRecord>(`${one(handoverId)}/items`, { method: 'POST', body: names });

export const removeItem = (request: Request, handoverId: string, itemId: string) =>
  request<HandoverRecord>(`${one(handoverId)}/items/${itemId}`, { method: 'DELETE' });

export const tickItem = (
  request: Request,
  params: { handoverId: string; itemId: string; ticked: boolean },
) =>
  request<HandoverRecord>(`${one(params.handoverId)}/items/${params.itemId}/tick`, {
    method: 'POST',
    body: { ticked: params.ticked },
  });

export const confirmHandover = (request: Request, handoverId: string) =>
  request<HandoverRecord>(`${one(handoverId)}/confirm`, { method: 'POST' });
