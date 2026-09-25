import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { adminTextSchema } from '../admin-texts/admin-texts.schema';
import { alertTypesSchema } from './notifications.schema';
import {
  getNotifications,
  setAlertTypesForNewOfficers,
  setInstallGuide,
} from './notifications.service';

const PATH = '/api/administration-panel/notifications';
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.notifications.manage',
} as const;

/** Brief 25 C4: notification defaults and the iPhone install guide. HTTP only. */
export function registerNotificationsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'PUT', path: `${PATH}/alert-types`, access: ACCESS });
  registerRoute({ method: 'PUT', path: `${PATH}/install-guide`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => c.json(await getNotifications(db, c.get('requestContext'))));
  app.put(`${PATH}/alert-types`, active, async (c) => {
    const { types } = alertTypesSchema.parse(await c.req.json());
    await setAlertTypesForNewOfficers(db, c.get('requestContext'), types);
    return c.body(null, 204);
  });
  app.put(`${PATH}/install-guide`, active, async (c) => {
    const text = adminTextSchema.parse(await c.req.json());
    return c.json(await setInstallGuide(db, c.get('requestContext'), text));
  });
}
