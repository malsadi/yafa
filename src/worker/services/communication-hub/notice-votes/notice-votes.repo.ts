import { generateId } from '../../../core/ids';
import type { VoteInput } from '../noticeboard/noticeboard.schema';

/** P11: the unit's current officers — all of them, or those holding the chosen roles. */
export async function listCurrentOfficerIds(
  db: D1Database,
  params: { unitId: string; today: string; roleIds?: string[] },
): Promise<string[]> {
  const roles = params.roleIds ?? [];
  const byRole = roles.length ? `AND role_id IN (${roles.map(() => '?').join(', ')})` : '';
  const { results } = await db
    .prepare(
      `SELECT DISTINCT person_id AS personId FROM terms
       WHERE unit_id = ? AND start_date <= ? AND (end_date IS NULL OR end_date > ?) ${byRole}`,
    )
    .bind(params.unitId, params.today, params.today, ...roles)
    .all<{ personId: string }>();
  return results.map((row) => row.personId);
}

/** A vote's rows: its details, options, chosen roles and the eligible voters (P11). */
export function buildInsertVoteStatements(
  db: D1Database,
  noticeId: string,
  vote: VoteInput & { closesAt: string; voterIds: string[] },
): D1PreparedStatement[] {
  const roleIds = vote.eligibility.kind === 'roles' ? vote.eligibility.roleIds : [];
  return [
    db
      .prepare(
        'INSERT INTO notice_votes (notice_id, question, closes_on, closes_at, eligibility) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(noticeId, vote.question, vote.closesOn, vote.closesAt, vote.eligibility.kind),
    ...vote.options.map((label, position) =>
      db
        .prepare(
          'INSERT INTO notice_vote_options (id, notice_id, position, label) VALUES (?, ?, ?, ?)',
        )
        .bind(generateId(), noticeId, position, label),
    ),
    ...roleIds.map((roleId) =>
      db
        .prepare('INSERT INTO notice_vote_roles (notice_id, role_id) VALUES (?, ?)')
        .bind(noticeId, roleId),
    ),
    ...vote.voterIds.map((personId) =>
      db
        .prepare('INSERT INTO notice_vote_voters (notice_id, person_id) VALUES (?, ?)')
        .bind(noticeId, personId),
    ),
  ];
}

/** Takes a vote off a notice before anyone has voted; the database refuses once someone has (D-155). */
export function buildRemoveVoteStatements(db: D1Database, noticeId: string): D1PreparedStatement[] {
  return ['notice_vote_voters', 'notice_vote_roles', 'notice_vote_options', 'notice_votes'].map(
    (table) => db.prepare(`DELETE FROM ${table} WHERE notice_id = ?`).bind(noticeId),
  );
}

export function buildInsertBallotStatement(
  db: D1Database,
  ballot: { noticeId: string; personId: string; optionId: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO notice_ballots (notice_id, person_id, option_id, cast_at) VALUES (?, ?, ?, ?)',
    )
    .bind(ballot.noticeId, ballot.personId, ballot.optionId, ballot.at);
}
