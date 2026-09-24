import { generateId } from '../../../core/ids';

export function buildInsertElectionStatement(
  db: D1Database,
  election: { id: string; unitId: string; electionDate: string; correctsElectionId: string | null },
  createdBy: string,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO elections (id, unit_id, election_date, status, corrects_election_id, created_at, created_by)
       VALUES (?, ?, ?, 'Draft', ?, ?, ?)`,
    )
    .bind(
      election.id,
      election.unitId,
      election.electionDate,
      election.correctsElectionId,
      new Date().toISOString(),
      createdBy,
    );
}

export function buildInsertPositionStatement(
  db: D1Database,
  electionId: string,
  roleId: string,
  seats: number,
): D1PreparedStatement {
  return db
    .prepare('INSERT INTO election_positions (id, election_id, role_id, seats) VALUES (?, ?, ?, ?)')
    .bind(generateId(), electionId, roleId, seats);
}

export function buildRemovePositionStatements(
  db: D1Database,
  positionId: string,
): D1PreparedStatement[] {
  return [
    db.prepare('DELETE FROM election_candidates WHERE position_id = ?').bind(positionId),
    db.prepare('DELETE FROM election_positions WHERE id = ?').bind(positionId),
  ];
}

export function buildInsertCandidateStatement(
  db: D1Database,
  positionId: string,
  personId: string,
): D1PreparedStatement {
  return db
    .prepare('INSERT INTO election_candidates (id, position_id, person_id) VALUES (?, ?, ?)')
    .bind(generateId(), positionId, personId);
}

export function buildRemoveCandidateStatement(
  db: D1Database,
  candidateId: string,
): D1PreparedStatement {
  return db.prepare('DELETE FROM election_candidates WHERE id = ?').bind(candidateId);
}

export function buildRecordResultStatement(
  db: D1Database,
  result: { candidateId: string; votes: number; elected: boolean },
): D1PreparedStatement {
  return db
    .prepare('UPDATE election_candidates SET votes = ?, elected = ? WHERE id = ?')
    .bind(result.votes, result.elected ? 1 : 0, result.candidateId);
}

/** D-066: Confirmed, with the start date entered; the lock trigger refuses a second time. */
export function buildConfirmElectionStatement(
  db: D1Database,
  params: { electionId: string; termsStartDate: string; confirmedBy: string },
): D1PreparedStatement {
  return db
    .prepare(
      "UPDATE elections SET status = 'Confirmed', terms_start_date = ?, confirmed_at = ?, confirmed_by = ? WHERE id = ?",
    )
    .bind(params.termsStartDate, new Date().toISOString(), params.confirmedBy, params.electionId);
}

/**
 * D-068: the terms of a role in a unit that are still running at the new
 * start date end on it — no gap, no overlap.
 */
export function buildEndOutgoingTermsStatement(
  db: D1Database,
  params: { unitId: string; roleId: string; startDate: string },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE terms SET end_date = ?1
       WHERE unit_id = ?2 AND role_id = ?3 AND start_date < ?1 AND (end_date IS NULL OR end_date > ?1)`,
    )
    .bind(params.startDate, params.unitId, params.roleId);
}

/** The people whose terms that statement will end, found first so they can be locked after. */
export async function findOutgoingPeople(
  db: D1Database,
  params: { unitId: string; roleId: string; startDate: string },
): Promise<string[]> {
  const result = await db
    .prepare(
      `SELECT DISTINCT person_id AS personId FROM terms
       WHERE unit_id = ?2 AND role_id = ?3 AND start_date < ?1 AND (end_date IS NULL OR end_date > ?1)`,
    )
    .bind(params.startDate, params.unitId, params.roleId)
    .all<{ personId: string }>();
  return result.results.map((row) => row.personId);
}
