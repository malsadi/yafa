import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { openBranchAccountSchema } from './accounts.schema';
import { closeBranchAccount, listAccounts, openBranchAccount } from './accounts.service';

const ACCOUNTS = '/api/treasury/units/:unitId/accounts';
const READ = { kind: 'capability', capability: 'treasury.accounts.read' } as const;
const MANAGE = { kind: 'capability', capability: 'treasury.accounts.manage' } as const;

/** Brief 17 A1 and C1: the unit's accounts and balances; open and close branch accounts. HTTP only. */
export function registerAccountsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: ACCOUNTS, access: READ });
  registerRoute({ method: 'POST', path: ACCOUNTS, access: MANAGE });
  registerRoute({ method: 'POST', path: `${ACCOUNTS}/:accountId/close`, access: MANAGE });
  const active = requireActiveAccess(db, keys);
  app.get(ACCOUNTS, active, async (c) =>
    c.json(await listAccounts(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(ACCOUNTS, active, async (c) => {
    const input = openBranchAccountSchema.parse(await c.req.json());
    return c.json(
      await openBranchAccount(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.post(`${ACCOUNTS}/:accountId/close`, active, async (c) => {
    await closeBranchAccount(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      accountId: c.req.param('accountId'),
    });
    return c.body(null, 204);
  });
}
