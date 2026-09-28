export interface SentRow {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  sentByName: string;
  toAllBranches: number;
}

interface RecipientRow {
  circularId: string;
  unitId: string;
  nameEn: string;
  nameAr: string;
  openedAt: string | null;
}

/** Brief 20 A3 and A4: what the General Council sent, newest first, and each branch's first opening. */
export const sentCircularsQuery = (unitId: string) => ({
  sql: `SELECT c.id, c.title, c.body, c.created_at AS sentAt, p.name AS sentByName, c.to_all_branches AS toAllBranches
       FROM circulars c JOIN people p ON p.id = c.created_by
       WHERE c.unit_id = ? ORDER BY c.created_at DESC, c.id DESC`,
  binds: [unitId],
});

/** Brief 20 A4 and P14: which branches each of these circulars went to, and when each first opened it. */
export async function listCircularRecipients(
  db: D1Database,
  circularIds: readonly string[],
): Promise<RecipientRow[]> {
  if (circularIds.length === 0) return [];
  const { results } = await db
    .prepare(
      `SELECT r.circular_id AS circularId, u.id AS unitId, u.name_en AS nameEn, u.name_ar AS nameAr,
         o.opened_at AS openedAt
       FROM circular_recipients r JOIN units u ON u.id = r.unit_id
       LEFT JOIN circular_opens o ON o.circular_id = r.circular_id AND o.unit_id = r.unit_id
       WHERE r.circular_id IN (${circularIds.map(() => '?').join(', ')}) ORDER BY u.name_en`,
    )
    .bind(...circularIds)
    .all<RecipientRow>();
  return results;
}
