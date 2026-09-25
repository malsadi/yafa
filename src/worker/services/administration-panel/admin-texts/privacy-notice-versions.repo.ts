/** Brief 13 and 25 C5: every version of the privacy notice, newest first. */
export async function listPrivacyNoticeVersions(
  db: D1Database,
): Promise<{ id: string; textEn: string; textAr: string | null; createdAt: string }[]> {
  const result = await db
    .prepare(
      `SELECT id, text_en AS textEn, text_ar AS textAr, created_at AS createdAt
       FROM privacy_notice_versions ORDER BY created_at DESC, rowid DESC`,
    )
    .all<{ id: string; textEn: string; textAr: string | null; createdAt: string }>();
  return result.results;
}

/** A new version; versions are never changed or deleted (a trigger refuses, T-020). */
export function buildInsertPrivacyNoticeVersionStatement(
  db: D1Database,
  version: { id: string; textEn: string; textAr: string | null },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (?, ?, ?, ?)',
    )
    .bind(version.id, version.textEn, version.textAr, new Date().toISOString());
}
