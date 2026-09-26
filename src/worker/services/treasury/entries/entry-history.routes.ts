import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { entryPeriodSchema } from './entries.schema';
import { accountHistory } from './entry-history.service';

const PATH = '/api/treasury/units/:unitId/accounts/:accountId/entries';

/** Brief 17 B and C1: an account's entries in a period. HTTP only. */
export function registerEntryHistoryRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({
    method: 'GET',
    path: PATH,
    access: { kind: 'capability', capability: 'treasury.accounts.read' },
  });
  app.get(PATH, requireActiveAccess(db, keys), async (c) => {
    const period = entryPeriodSchema.parse(c.req.query());
    const params = {
      unitId: c.req.param('unitId'),
      accountId: c.req.param('accountId'),
      ...period,
    };
    return c.json(await accountHistory(db, c.get('requestContext'), params));
  });
}
