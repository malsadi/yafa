import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { changeServiceSwitchSchema } from './service-switches.schema';
import { changeServiceSwitch, getServiceSwitches } from './service-switches.service';

const PATH = '/api/administration-panel/service-switches';
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.service-switches.manage',
} as const;

/** Brief 25 C2: the service switches, and changing one. HTTP only. */
export function registerServiceSwitchesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'PUT', path: `${PATH}/:service`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => c.json(await getServiceSwitches(db, c.get('requestContext'))));
  app.put(`${PATH}/:service`, active, async (c) => {
    const body = changeServiceSwitchSchema.parse(await c.req.json());
    await changeServiceSwitch(db, c.get('requestContext'), {
      service: c.req.param('service'),
      ...body,
    });
    return c.body(null, 204);
  });
}
