/** Brief 20 C1: the current officers of these units, with every unit each serves in now. */
export async function listCurrentOfficersIn(
  db: D1Database,
  unitIds: string[],
  today: string,
): Promise<{ personId: string; units: string[] }[]> {
  if (unitIds.length === 0) return [];
  const units = unitIds.map((_, i) => `?${String(i + 2)}`).join(', ');
  const { results } = await db
    .prepare(
      `WITH current AS (
         SELECT person_id, unit_id FROM terms WHERE start_date <= ?1 AND (end_date IS NULL OR end_date > ?1))
       SELECT person_id AS personId, json_group_array(DISTINCT unit_id) AS units FROM current
       WHERE person_id IN (SELECT person_id FROM current WHERE unit_id IN (${units}))
       GROUP BY person_id`,
    )
    .bind(today, ...unitIds)
    .all<{ personId: string; units: string }>();
  return results.map((row) => ({
    personId: row.personId,
    units: JSON.parse(row.units) as string[],
  }));
}

/** P11: a vote's chosen voters. */
export async function listVoterIds(db: D1Database, noticeId: string): Promise<string[]> {
  const { results } = await db
    .prepare('SELECT person_id AS personId FROM notice_vote_voters WHERE notice_id = ?')
    .bind(noticeId)
    .all<{ personId: string }>();
  return results.map((row) => row.personId);
}

/** The units a circular or request went to — and, for a request's replies, the unit that asked too. */
export async function listInvolvedUnits(
  db: D1Database,
  params: { circularId?: string; requestId?: string; withAsker?: boolean },
): Promise<string[]> {
  const asker = params.withAsker
    ? ' UNION SELECT from_unit_id FROM hub_requests WHERE id = ?1'
    : '';
  const sql = params.circularId
    ? 'SELECT unit_id AS unitId FROM circular_recipients WHERE circular_id = ?1'
    : `SELECT unit_id AS unitId FROM hub_request_recipients WHERE request_id = ?1${asker}`;
  const { results } = await db
    .prepare(sql)
    .bind(params.circularId ?? params.requestId)
    .all<{ unitId: string }>();
  return results.map((row) => row.unitId);
}

/** D-168: a discussion's members now. */
export async function listDiscussionMemberIds(
  db: D1Database,
  discussionId: string,
): Promise<string[]> {
  const { results } = await db
    .prepare(
      'SELECT person_id AS personId FROM discussion_members WHERE discussion_id = ? AND left_at IS NULL',
    )
    .bind(discussionId)
    .all<{ personId: string }>();
  return results.map((row) => row.personId);
}

/** D-158: the role's holders now, in these units. */
export async function listRoleHolderIds(
  db: D1Database,
  params: { roleId: string; unitIds: string[]; today: string },
): Promise<string[]> {
  if (params.unitIds.length === 0) return [];
  const { results } = await db
    .prepare(
      `SELECT DISTINCT person_id AS personId FROM terms
       WHERE role_id = ? AND start_date <= ? AND (end_date IS NULL OR end_date > ?)
         AND unit_id IN (${params.unitIds.map(() => '?').join(', ')})`,
    )
    .bind(params.roleId, params.today, params.today, ...params.unitIds)
    .all<{ personId: string }>();
  return results.map((row) => row.personId);
}
