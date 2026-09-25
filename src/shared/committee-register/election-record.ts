import type { ElectionStatus } from './election-status';

/** Brief 14 C1 and D-055: a candidate, with their votes and whether elected once recorded. */
export interface ElectionCandidate {
  id: string;
  personId: string;
  name: string;
  votes: number | null;
  elected: boolean | null;
}

/** Brief 14 C1 and D-066: a position — a role, with one or more seats. */
export interface ElectionPosition {
  id: string;
  roleId: string;
  roleNameEn: string;
  roleNameAr: string;
  seats: number;
  candidates: ElectionCandidate[];
}

/** Brief 14 C1: an election, Draft or Confirmed (D-066). */
export interface ElectionRecord {
  id: string;
  unitId: string;
  electionDate: string;
  status: ElectionStatus;
  correctsElectionId: string | null;
  termsStartDate: string | null;
  positions: ElectionPosition[];
}

/** An election as the unit's list shows it, without its ballot. */
export type ElectionSummary = Omit<ElectionRecord, 'positions'>;
