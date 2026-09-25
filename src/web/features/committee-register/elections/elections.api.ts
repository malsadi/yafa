import type {
  ElectionRecord,
  ElectionSummary,
} from '../../../../shared/committee-register/election-record';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const REGISTER = '/api/committee-register';
const one = (electionId: string) => `${REGISTER}/elections/${electionId}`;

/** P3: a candidate is someone in the register, or someone new. */
export type CandidateInput =
  { personId: string } | { newPerson: { name: string; email: string; phone: string } };

export interface ResultInput {
  candidateId: string;
  votes: number;
  elected: boolean;
}

export const fetchElections = (request: Request, unitId: string) =>
  request<ElectionSummary[]>(`${REGISTER}/units/${unitId}/elections`);

export const fetchElection = (request: Request, electionId: string) =>
  request<ElectionRecord>(one(electionId));

export const recordElection = (
  request: Request,
  unitId: string,
  input: { electionDate: string; correctsElectionId?: string },
) =>
  request<ElectionRecord>(`${REGISTER}/units/${unitId}/elections`, { method: 'POST', body: input });

export const addPosition = (
  request: Request,
  electionId: string,
  input: { roleId: string; seats: number },
) => request<ElectionRecord>(`${one(electionId)}/positions`, { method: 'POST', body: input });

export const removePosition = (request: Request, electionId: string, positionId: string) =>
  request<ElectionRecord>(`${one(electionId)}/positions/${positionId}`, { method: 'DELETE' });

export const addCandidate = (
  request: Request,
  params: { electionId: string; positionId: string; input: CandidateInput },
) =>
  request<ElectionRecord>(`${one(params.electionId)}/positions/${params.positionId}/candidates`, {
    method: 'POST',
    body: params.input,
  });

export const removeCandidate = (request: Request, electionId: string, candidateId: string) =>
  request<ElectionRecord>(`${one(electionId)}/candidates/${candidateId}`, { method: 'DELETE' });

export const recordResults = (request: Request, electionId: string, results: ResultInput[]) =>
  request<ElectionRecord>(`${one(electionId)}/results`, { method: 'PUT', body: { results } });

export const confirmElection = (request: Request, electionId: string, termsStartDate: string) =>
  request<ElectionRecord>(`${one(electionId)}/confirm`, {
    method: 'POST',
    body: { termsStartDate },
  });
