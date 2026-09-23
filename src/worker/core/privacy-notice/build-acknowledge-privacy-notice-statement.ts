import { generateId } from '../ids';

export interface AcknowledgePrivacyNoticeInput {
  personId: string;
  noticeVersionId: string;
}

/**
 * D-005: "the portal records who, when, and which version." Batch-composable
 * (`buildInPortalNotificationStatement`'s shape) — no route calls this yet
 * (no notice can be set until Phase 2's Administration panel), but unlike
 * `core/files`' `fileRecord()` (T-056), this needs no infrastructure that
 * doesn't already exist, so it's built now rather than deferred.
 */
export function buildAcknowledgePrivacyNoticeStatement(
  db: D1Database,
  input: AcknowledgePrivacyNoticeInput,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO privacy_notice_acknowledgements
         (id, person_id, notice_version_id, acknowledged_at)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(generateId(), input.personId, input.noticeVersionId, new Date().toISOString());
}
