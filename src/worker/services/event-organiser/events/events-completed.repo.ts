const LONDON_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' });

/**
 * Brief 24 B2 and P17 (D-215): the unit's events that reached Completed or
 * Closed within the period — never a cancelled one, which is closed without
 * being completed. The day an event was completed is its last move to
 * Completed in the audit log (D-213 choice: the event keeps no such date of
 * its own), as a London day.
 */
export async function eventsCompletedBetween(
  db: D1Database,
  params: { unitId: string; start: string; end: string },
): Promise<{ name: string; completedOn: string }[]> {
  const result = await db
    .prepare(
      `SELECT e.name,
         (SELECT MAX(a.occurred_at) FROM audit_log a
          WHERE a.entity_type = 'event' AND a.entity_id = e.id AND a.action = 'event.status-moved'
            AND json_extract(a.after, '$.status') = 'Completed') AS completedAt
       FROM events e
       WHERE e.unit_id = ? AND e.status IN ('Completed', 'Closed') AND e.cancelled_at IS NULL`,
    )
    .bind(params.unitId)
    .all<{ name: string; completedAt: string | null }>();
  return result.results
    .flatMap((e) =>
      e.completedAt
        ? [{ name: e.name, completedOn: LONDON_DAY.format(new Date(e.completedAt)) }]
        : [],
    )
    .filter((e) => e.completedOn >= params.start && e.completedOn <= params.end)
    .sort((a, b) => a.completedOn.localeCompare(b.completedOn));
}
