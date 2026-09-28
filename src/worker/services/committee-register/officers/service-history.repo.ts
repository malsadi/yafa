/** Brief 24 B2 and O-156: a unit's current officers, each with each role they hold today. */
export async function listCurrentOfficerRolesOf(
  db: D1Database,
  unitId: string,
  today: string,
): Promise<{ personId: string; name: string; roleNameEn: string; roleNameAr: string }[]> {
  const result = await db
    .prepare(
      `SELECT p.id AS personId, p.name, r.name_en AS roleNameEn, r.name_ar AS roleNameAr
       FROM terms t JOIN people p ON p.id = t.person_id JOIN roles r ON r.id = t.role_id
       WHERE t.unit_id = ? AND t.start_date <= ? AND (t.end_date IS NULL OR t.end_date > ?)
       ORDER BY p.name, r.name_en`,
    )
    .bind(unitId, today, today)
    .all<{ personId: string; name: string; roleNameEn: string; roleNameAr: string }>();
  return result.results;
}

/** Brief 24 A1, B1 and O-151: everyone who has held a term in these units, past officers included. */
export async function listPeopleWhoServedIn(
  db: D1Database,
  unitIds: readonly string[] | 'all',
): Promise<{ personId: string; name: string }[]> {
  const where =
    unitIds === 'all' ? '' : `WHERE t.unit_id IN (${unitIds.map(() => '?').join(', ')})`;
  const result = await db
    .prepare(
      `SELECT DISTINCT p.id AS personId, p.name FROM terms t JOIN people p ON p.id = t.person_id
       ${where} ORDER BY p.name`,
    )
    .bind(...(unitIds === 'all' ? [] : unitIds))
    .all<{ personId: string; name: string }>();
  return result.results;
}

/** Brief 24 B1 and O-153: a person's terms of office in these units, current and past, the latest first. */
export async function listTermsOfPerson(
  db: D1Database,
  personId: string,
  unitIds: readonly string[] | 'all',
): Promise<
  {
    unitNameEn: string;
    unitNameAr: string;
    roleNameEn: string;
    roleNameAr: string;
    startDate: string;
    endDate: string | null;
  }[]
> {
  const where = unitIds === 'all' ? '' : `AND t.unit_id IN (${unitIds.map(() => '?').join(', ')})`;
  const result = await db
    .prepare(
      `SELECT u.name_en AS unitNameEn, u.name_ar AS unitNameAr, r.name_en AS roleNameEn,
         r.name_ar AS roleNameAr, t.start_date AS startDate, t.end_date AS endDate
       FROM terms t JOIN units u ON u.id = t.unit_id JOIN roles r ON r.id = t.role_id
       WHERE t.person_id = ? ${where} ORDER BY t.start_date DESC`,
    )
    .bind(personId, ...(unitIds === 'all' ? [] : unitIds))
    .all<{
      unitNameEn: string;
      unitNameAr: string;
      roleNameEn: string;
      roleNameAr: string;
      startDate: string;
      endDate: string | null;
    }>();
  return result.results;
}
