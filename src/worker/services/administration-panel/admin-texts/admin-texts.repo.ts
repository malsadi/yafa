import type { AdminText, AdminTextKey } from '../../../../shared/administration-panel/admin-texts';

/** One text as written, or null until the administrator writes it. */
export async function findAdminText(db: D1Database, key: AdminTextKey): Promise<AdminText | null> {
  return db
    .prepare('SELECT key, text_en AS textEn, text_ar AS textAr FROM admin_texts WHERE key = ?')
    .bind(key)
    .first<AdminText>();
}

export function buildWriteAdminTextStatement(
  db: D1Database,
  text: AdminText,
  actorPersonId: string,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO admin_texts (key, text_en, text_ar, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (key) DO UPDATE SET text_en = excluded.text_en, text_ar = excluded.text_ar,
         updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    )
    .bind(text.key, text.textEn, text.textAr, new Date().toISOString(), actorPersonId);
}
