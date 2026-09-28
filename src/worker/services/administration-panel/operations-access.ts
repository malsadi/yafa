import { ForbiddenError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';

/** Brief 25 D: each Operations screen checks its own portal-wide capability. */
export async function requirePortalCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
): Promise<void> {
  if (!(await can(db, ctx, capability, { portalWide: true })))
    throw new ForbiddenError('permission.denied');
}
