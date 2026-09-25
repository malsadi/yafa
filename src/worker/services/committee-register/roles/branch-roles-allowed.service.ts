import type { RequestContext } from '../../../core/permissions';
import { getSetting, setSetting } from '../../../core/settings';
import { requireCapability } from '../committee-register-guards';

// D-073: the national register officer sets this on the Roles screen (25 B2),
// with the capability that maintains the standard roles.
const CAPABILITY = 'committee-register.standard-roles.manage';
const SETTING = 'committee-register.branches_may_add_roles';

/** Brief 25 B2: whether branches may add extra roles — null while not set. */
export async function getBranchRolesAllowed(
  db: D1Database,
  ctx: RequestContext,
): Promise<{ allowed: boolean | null }> {
  await requireCapability(db, ctx, CAPABILITY, { portalWide: true });
  const setting = await getSetting<boolean>(db, SETTING);
  return { allowed: setting.status === 'configured' ? setting.value : null };
}

/** Brief 25 B2 and D-073: set it, with history and an audit entry (brief 8.1). */
export async function setBranchRolesAllowed(
  db: D1Database,
  ctx: RequestContext,
  allowed: boolean,
): Promise<{ allowed: boolean }> {
  await requireCapability(db, ctx, CAPABILITY, { portalWide: true });
  await setSetting(db, { key: SETTING, value: allowed, actorPersonId: ctx.personId });
  return { allowed };
}
