import type { SwitchableAlertType } from '../../../../shared/communication-hub/alert-types';

/** Brief 20 C2: the choices these people have saved; someone who never chose is absent. */
export async function findAlertChoices(
  db: D1Database,
  personIds: string[],
): Promise<Map<string, SwitchableAlertType[]>> {
  if (personIds.length === 0) return new Map();
  const { results } = await db
    .prepare(
      `SELECT person_id AS personId, alert_types AS alertTypes FROM alert_choices
       WHERE person_id IN (${personIds.map(() => '?').join(', ')})`,
    )
    .bind(...personIds)
    .all<{ personId: string; alertTypes: string }>();
  return new Map(
    results.map((row) => [row.personId, JSON.parse(row.alertTypes) as SwitchableAlertType[]]),
  );
}

export function buildSaveAlertChoicesStatement(
  db: D1Database,
  params: { personId: string; alertTypes: SwitchableAlertType[]; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO alert_choices (person_id, alert_types, updated_at) VALUES (?, ?, ?)
       ON CONFLICT (person_id) DO UPDATE SET alert_types = excluded.alert_types, updated_at = excluded.updated_at`,
    )
    .bind(params.personId, JSON.stringify(params.alertTypes), params.at);
}
