/** Brief 24 B2 and D-215 (O-156): the unit's meetings held in the period — marked Held or Report logged. */
export async function meetingsHeldBetween(
  db: D1Database,
  params: { unitId: string; start: string; end: string },
): Promise<{ typeNameEn: string; typeNameAr: string; date: string }[]> {
  const result = await db
    .prepare(
      `SELECT t.name_en AS typeNameEn, t.name_ar AS typeNameAr, m.date
       FROM meetings m JOIN list_items t ON t.id = m.type_item_id
       WHERE m.unit_id = ? AND m.status IN ('Held', 'Report logged') AND m.date BETWEEN ? AND ?
       ORDER BY m.date, m.start_time`,
    )
    .bind(params.unitId, params.start, params.end)
    .all<{ typeNameEn: string; typeNameAr: string; date: string }>();
  return result.results;
}
