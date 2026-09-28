import type { Hono } from 'hono';
import { z } from 'zod';
import {
  isMaintenanceModeOn,
  MAINTENANCE_MODE_PATH,
  setMaintenanceMode,
} from '../../../core/maintenance-mode';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { requirePortalCapability } from '../operations-access';

const CAPABILITY = 'administration-panel.maintenance-mode.manage';
const ACCESS = { kind: 'capability', capability: CAPABILITY } as const;

/** Brief 25 D6: whether the portal is read-only, switched on and off with an audit entry. HTTP only. */
export function registerMaintenanceModeRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: MAINTENANCE_MODE_PATH, access: ACCESS });
  registerRoute({ method: 'PUT', path: MAINTENANCE_MODE_PATH, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(MAINTENANCE_MODE_PATH, active, async (c) => {
    await requirePortalCapability(db, c.get('requestContext'), CAPABILITY);
    return c.json({ enabled: await isMaintenanceModeOn(db) });
  });
  app.put(MAINTENANCE_MODE_PATH, active, async (c) => {
    const ctx = c.get('requestContext');
    await requirePortalCapability(db, ctx, CAPABILITY);
    const { enabled } = z.object({ enabled: z.boolean() }).parse(await c.req.json());
    await setMaintenanceMode(db, { enabled, actorPersonId: ctx.personId });
    return c.body(null, 204);
  });
}
