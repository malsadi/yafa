import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { READ } from '../achievement-access';
import { contribution, contributors } from './contributions.service';

const LIST = '/api/achievements-and-reports/units/:unitId/contributions';

/** Brief 24 B1 and D-215: officers' contributions, past officers included. HTTP only. */
export function registerContributionsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  registerRoute({ method: 'GET', path: LIST, access: read });
  registerRoute({ method: 'GET', path: `${LIST}/:personId`, access: read });
  const active = requireActiveAccess(db, keys);
  app.get(LIST, active, async (c) =>
    c.json(await contributors(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(`${LIST}/:personId`, active, async (c) =>
    c.json(
      await contribution(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        personId: c.req.param('personId'),
      }),
    ),
  );
}
