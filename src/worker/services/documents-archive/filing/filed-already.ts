/** Brief 15 A1: whether a service's record is already in the archive (each is filed once). */
export async function isRecordFiled(
  db: D1Database,
  params: { sourceService: string; sourceRecordId: string },
): Promise<boolean> {
  const row = await db
    .prepare(
      'SELECT 1 AS filed FROM archive_documents WHERE source_service = ? AND source_record_id = ?',
    )
    .bind(params.sourceService, params.sourceRecordId)
    .first();
  return row !== null;
}
