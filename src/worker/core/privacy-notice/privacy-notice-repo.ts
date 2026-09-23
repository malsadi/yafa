export interface PrivacyNoticeVersion {
  id: string;
  textEn: string;
  textAr: string | null;
}

/**
 * The current version is the most recently inserted row (T-020: append-only,
 * no "is_current" flag). `null` means no notice has ever been set — D-024:
 * nobody, including administrators (D-027), gets past "access not active"
 * until one exists.
 */
export async function getCurrentPrivacyNoticeVersion(
  db: D1Database,
): Promise<PrivacyNoticeVersion | null> {
  const row = await db
    .prepare(
      'SELECT id, text_en, text_ar FROM privacy_notice_versions ORDER BY created_at DESC LIMIT 1',
    )
    .first<{ id: string; text_en: string; text_ar: string | null }>();
  if (!row) {
    return null;
  }
  return { id: row.id, textEn: row.text_en, textAr: row.text_ar };
}

export async function hasAcknowledgedVersion(
  db: D1Database,
  params: { personId: string; noticeVersionId: string },
): Promise<boolean> {
  const row = await db
    .prepare(
      'SELECT 1 FROM privacy_notice_acknowledgements WHERE person_id = ? AND notice_version_id = ?',
    )
    .bind(params.personId, params.noticeVersionId)
    .first();
  return row !== null;
}
