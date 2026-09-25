import type { ElectionPosition, ElectionRecord } from './elections.schema';

type ElectionRow = Omit<ElectionRecord, 'positions'>;

interface CandidateRow {
  id: string;
  positionId: string;
  personId: string;
  name: string;
  votes: number | null;
  /** SQLite stores the flag as 0 or 1. */
  elected: number | null;
}

const ELECTION_COLUMNS = `id, unit_id AS unitId, election_date AS electionDate, status,
  corrects_election_id AS correctsElectionId, terms_start_date AS termsStartDate`;

export async function listUnitElections(db: D1Database, unitId: string): Promise<ElectionRow[]> {
  const result = await db
    .prepare(
      `SELECT ${ELECTION_COLUMNS} FROM elections WHERE unit_id = ? ORDER BY election_date DESC, created_at DESC`,
    )
    .bind(unitId)
    .all<ElectionRow>();
  return result.results;
}

/** One election with its positions and candidates, or null. */
export async function findElection(
  db: D1Database,
  electionId: string,
): Promise<ElectionRecord | null> {
  const election = await db
    .prepare(`SELECT ${ELECTION_COLUMNS} FROM elections WHERE id = ?`)
    .bind(electionId)
    .first<ElectionRow>();
  if (!election) return null;
  const positions = await db
    .prepare(
      `SELECT ep.id, ep.role_id AS roleId, r.name_en AS roleNameEn, r.name_ar AS roleNameAr, ep.seats
       FROM election_positions ep JOIN roles r ON r.id = ep.role_id
       WHERE ep.election_id = ? ORDER BY ep.rowid`,
    )
    .bind(electionId)
    .all<Omit<ElectionPosition, 'candidates'>>();
  const candidates = await db
    .prepare(
      `SELECT c.id, c.position_id AS positionId, c.person_id AS personId, p.name, c.votes, c.elected
       FROM election_candidates c JOIN people p ON p.id = c.person_id
       JOIN election_positions ep ON ep.id = c.position_id
       WHERE ep.election_id = ? ORDER BY c.rowid`,
    )
    .bind(electionId)
    .all<CandidateRow>();
  return {
    ...election,
    positions: positions.results.map((position) => ({
      ...position,
      candidates: candidates.results
        .filter((candidate) => candidate.positionId === position.id)
        .map((c) => ({
          id: c.id,
          personId: c.personId,
          name: c.name,
          votes: c.votes,
          elected: c.elected === null ? null : Boolean(c.elected),
        })),
    })),
  };
}
