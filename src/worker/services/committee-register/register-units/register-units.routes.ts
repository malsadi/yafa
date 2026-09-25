import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { listRegisterUnits } from './register-units.service';

const PATH = '/api/committee-register/units';
const ACCESS = { kind: 'capability', capability: 'committee-register.register.read' } as const;

/** Brief 14: the units whose register the officer may open. HTTP only. */
export function registerRegisterUnitsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  app.get(PATH, requireActiveAccess(db, keys), async (c) =>
    c.json(await listRegisterUnits(db, c.get('requestContext'))),
  );
}
