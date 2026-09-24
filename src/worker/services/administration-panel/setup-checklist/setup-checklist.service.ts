import {
  ROLE_DESIGNATIONS,
  type RoleDesignation,
} from '../../../../shared/committee-register/role-designation';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { getCurrentPrivacyNoticeVersion } from '../../../core/privacy-notice';
import { getSetting, listSettingDefinitions } from '../../../core/settings';
import { listRoles } from '../../committee-register';

const CAPABILITY = 'administration-panel.setup-checklist.read';

export type ChecklistItem =
  | { service: 'administration-panel'; kind: 'privacy-notice' }
  | { service: 'committee-register'; kind: 'designation'; designation: RoleDesignation }
  | { service: string; kind: 'setting'; key: string };

async function missingSettings(db: D1Database): Promise<ChecklistItem[]> {
  const required = listSettingDefinitions().filter((definition) => definition.required);
  const resolved = await Promise.all(required.map((definition) => getSetting(db, definition.key)));
  return required
    .filter((_, index) => resolved[index]?.status === 'not-configured')
    .map((definition) => ({
      service: definition.key.split('.')[0] ?? '',
      kind: 'setting',
      key: definition.key,
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
