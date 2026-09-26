interface SentRow {
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
export async function listSentCircularRows(
  db: D1Database,
  unitId: string,
): Promise<{ sent: SentRow[]; recipients: RecipientRow[] }> {
  const sent = await db
    .prepare(
      `SELECT c.id, c.title, c.body, c.created_at AS sentAt, p.name AS sentByName, c.to_all_branches AS toAllBranches
       FROM circulars c JOIN people p ON p.id = c.created_by
       WHERE c.unit_id = ? ORDER BY c.created_at DESC, c.id DESC`,
    )
    .bind(unitId)
    .all<SentRow>();
  const recipients = await db
    .prepare(
      `SELECT r.circular_id AS circularId, u.id AS unitId, u.name_en AS nameEn, u.name_ar AS nameAr,
         o.opened_at AS openedAt
       FROM circular_recipients r JOIN circulars c ON c.id = r.circular_id
       JOIN units u ON u.id = r.unit_id
       LEFT JOIN circular_opens o ON o.circular_id = r.circular_id AND o.unit_id = r.unit_id
       WHERE c.unit_id = ? ORDER BY u.name_en`,
    )
    .bind(unitId)
    .all<RecipientRow>();
  return { sent: sent.results, recipients: recipients.results };
}
