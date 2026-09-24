import { z } from 'zod';
import type { ElectionStatus } from '../../../../shared/committee-register/election-status';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const text = z.string().trim().min(1);

export const createElectionSchema = z.object({
  electionDate: isoDate,
  correctsElectionId: text.optional(),
});
export const addPositionSchema = z.object({ roleId: text, seats: z.number().int().min(1) });
/** P3: an existing person, or a new one not yet in the portal. */
export const addCandidateSchema = z.union([
  z.object({ personId: text }),
  z.object({
    newPerson: z.object({
      name: text,
      email: z.email().transform((email) => email.trim().toLowerCase()),
      phone: text,
    }),
  }),
]);
export const recordResultsSchema = z.object({
  results: z.array(
    z.object({ candidateId: text, votes: z.number().int().min(0), elected: z.boolean() }),
  ),
});
export const confirmElectionSchema = z.object({ termsStartDate: isoDate });

export type AddCandidateInput = z.infer<typeof addCandidateSchema>;

export interface ElectionCandidate {
  id: string;
  personId: string;
  name: string;
  votes: number | null;
  elected: boolean | null;
}

export interface ElectionPosition {
  id: string;
  roleId: string;
  seats: number;
  candidates: ElectionCandidate[];
}

export interface ElectionRecord {
  id: string;
  unitId: string;
  electionDate: string;
  status: ElectionStatus;
  correctsElectionId: string | null;
  termsStartDate: string | null;
  positions: ElectionPosition[];
}
