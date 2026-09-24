import type { Hono } from 'hono';
import type { ClerkAccounts } from '../../../clerk';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { listOfficerAccounts, resendInvitation } from './officer-accounts.service';

const PATH = '/api/administration-panel/officer-accounts';
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.officer-accounts.manage',
} as const;

/** Brief 25 A2: account states, and resending an invitation. HTTP only. */
export function registerOfficerAccountsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  clerk: ClerkAccounts,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/:personId/invitation`, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(PATH, active, async (c) =>
    c.json(await listOfficerAccounts(db, c.get('requestContext'))),
  );
  app.post(`${PATH}/:personId/invitation`, active, async (c) =>
    c.json(await resendInvitation(db, clerk, c.get('requestContext'), c.req.param('personId'))),
  );
}
