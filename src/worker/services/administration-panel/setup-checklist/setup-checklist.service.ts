import type { ChecklistItem } from '../../../../shared/administration-panel/setup-checklist';
import { ROLE_DESIGNATIONS } from '../../../../shared/committee-register/role-designation';
import type { ServiceSlug } from '../../../../shared/core/services';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { getCurrentPrivacyNoticeVersion } from '../../../core/privacy-notice';
import { describeSettingInput, getSetting, listSettingDefinitions } from '../../../core/settings';
import { listRoles } from '../../committee-register';

const CAPABILITY = 'administration-panel.setup-checklist.read';

async function missingSettings(db: D1Database): Promise<ChecklistItem[]> {
  const required = listSettingDefinitions().filter((definition) => definition.required);
  const resolved = await Promise.all(required.map((definition) => getSetting(db, definition.key)));
  return required
    .filter((_, index) => resolved[index]?.status === 'not-configured')
    .map((definition) => ({
      // A setting key starts with its service's slug (settingKeySchema).
      service: definition.key.split('.')[0] as ServiceSlug,
      kind: 'setting',
      key: definition.key,
      input: describeSettingInput(definition),
    }));
}

/**
 * Brief 25 C6: everything required that is not yet configured — the
 * privacy notice first (D-024: "required before anything else"), the two
 * register officer designations (7.2), and every required setting (8.1).
 * An empty list means the set-up is complete as far as built so far.
 */
export async function getSetupChecklist(
  db: D1Database,
  ctx: RequestContext,
): Promise<ChecklistItem[]> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
  const items: ChecklistItem[] = [];
  if (!(await getCurrentPrivacyNoticeVersion(db))) {
    items.push({ service: 'administration-panel', kind: 'privacy-notice' });
  }
  const designated = new Set((await listRoles(db)).map((role) => role.designation));
  for (const designation of ROLE_DESIGNATIONS) {
    if (!designated.has(designation))
      items.push({ service: 'committee-register', kind: 'designation', designation });
  }
  return [...items, ...(await missingSettings(db))];
}
