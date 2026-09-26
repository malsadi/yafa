import type { RoleNetwork } from '../../../../shared/communication-hub/conversation-records';

/**
 * Brief 20 rules and D-158: the roles the person holds now, in these units
 * — worked out live from current terms, never stored separately.
 */
export async function listHeldRoles(
  db: D1Database,
  params: { personId: string; unitIds: string[]; today: string },
): Promise<RoleNetwork[]> {
  if (params.unitIds.length === 0) return [];
  const { results } = await db
    .prepare(
      `SELECT DISTINCT r.id AS roleId, r.name_en AS nameEn, r.name_ar AS nameAr
       FROM terms t JOIN roles r ON r.id = t.role_id
       WHERE t.person_id = ? AND t.start_date <= ? AND (t.end_date IS NULL OR t.end_date > ?)
         AND t.unit_id IN (${params.unitIds.map(() => '?').join(', ')})
       ORDER BY r.position, r.name_en`,
    )
    .bind(params.personId, params.today, params.today, ...params.unitIds)
    .all<RoleNetwork>();
  return results;
}
