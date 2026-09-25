import type { AdminText } from '../../../../shared/administration-panel/admin-texts';
import type { TextsView } from '../../../../shared/administration-panel/texts';
import { buildAuditStatement } from '../../../core/audit';
import { ForbiddenError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { can, type RequestContext } from '../../../core/permissions';
import { findAdminText } from './admin-texts.repo';
import { writeAdminText } from './admin-texts.service';
import {
  buildInsertPrivacyNoticeVersionStatement,
  listPrivacyNoticeVersions,
} from './privacy-notice-versions.repo';

const CAPABILITY = 'administration-panel.texts.manage';

async function requireTextsCapability(db: D1Database, ctx: RequestContext) {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/** Brief 25 C5: the privacy notice's versions, the "access not active" message and the help text. */
export async function getTexts(db: D1Database, ctx: RequestContext): Promise<TextsView> {
  await requireTextsCapability(db, ctx);
  const [privacyNotice, accessNotActive, help] = await Promise.all([
    listPrivacyNoticeVersions(db),
    findAdminText(db, 'access-not-active'),
    findAdminText(db, 'help'),
  ]);
  return { privacyNotice, accessNotActive, help };
}

/**
 * Brief 13, 25 C5 and D-016: publish a new version of the privacy notice.
 * Every officer, administrators included (D-027), is shown it again the
 * next time they open the portal. Earlier versions are kept unchanged.
 */
export async function publishPrivacyNotice(
  db: D1Database,
  ctx: RequestContext,
  text: { textEn: string; textAr: string | null },
): Promise<{ id: string }> {
  await requireTextsCapability(db, ctx);
  const version = {
    id: generateId(),
    textEn: text.textEn,
    textAr: text.textAr === '' ? null : text.textAr,
  };
  await db.batch([
    buildInsertPrivacyNoticeVersionStatement(db, version),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'privacy-notice.published',
      entityType: 'privacy_notice_version',
      entityId: version.id,
      after: version,
    }),
  ]);
  return { id: version.id };
}

/** Brief 25 C5: write the "access not active" message or the help text. */
export async function writeOfficerText(
  db: D1Database,
  ctx: RequestContext,
  params: { key: 'access-not-active' | 'help'; textEn: string; textAr: string | null },
): Promise<AdminText> {
  await requireTextsCapability(db, ctx);
  return writeAdminText(db, { ...params, actorPersonId: ctx.personId });
}
