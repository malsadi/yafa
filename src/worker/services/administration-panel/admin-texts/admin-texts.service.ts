import type { AdminText, AdminTextKey } from '../../../../shared/administration-panel/admin-texts';
import { buildAuditStatement } from '../../../core/audit';
import { buildWriteAdminTextStatement, findAdminText } from './admin-texts.repo';

/**
 * Brief 8.5 and 25 C4/C5: write one of the administrator's texts, recorded
 * in the audit log with before and after (brief 25 rules). An Arabic text
 * left empty is stored as not yet written (D-022). Callers check the
 * capability of their own screen first.
 */
export async function writeAdminText(
  db: D1Database,
  params: { key: AdminTextKey; textEn: string; textAr: string | null; actorPersonId: string },
): Promise<AdminText> {
  const before = await findAdminText(db, params.key);
  const after: AdminText = {
    key: params.key,
    textEn: params.textEn,
    textAr: params.textAr === '' ? null : params.textAr,
  };
  await db.batch([
    buildWriteAdminTextStatement(db, after, params.actorPersonId),
    buildAuditStatement(db, {
      actorPersonId: params.actorPersonId,
      action: 'admin-text.written',
      entityType: 'admin_text',
      entityId: params.key,
      before,
      after,
    }),
  ]);
  return after;
}
