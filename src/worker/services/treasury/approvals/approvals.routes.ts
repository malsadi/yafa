import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { decideEntry, listAwaitingApproval } from './approvals.service';

const UNIT = '/api/treasury/units/:unitId';
const ACCESS = { kind: 'capability', capability: 'treasury.debit.approve' } as const;
const declineSchema = z.object({ reason: z.string().trim().min(1) });

/** Brief 17 B5 (P7, D-122, D-133): what awaits approval; approve or decline it. HTTP only. */
export function registerApprovalsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: `${UNIT}/approvals`, access: ACCESS });
  registerRoute({ method: 'POST', path: `${UNIT}/entries/:entryId/approve`, access: ACCESS });
  registerRoute({ method: 'POST', path: `${UNIT}/entries/:entryId/decline`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(`${UNIT}/approvals`, active, async (c) =>
    c.json(await listAwaitingApproval(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(`${UNIT}/entries/:entryId/approve`, active, async (c) => {
    const params = {
      unitId: c.req.param('unitId'),
      entryId: c.req.param('entryId'),
      decision: 'Approved' as const,
      reason: null,
    };
    return c.json(await decideEntry(db, c.get('requestContext'), params));
  });
  app.post(`${UNIT}/entries/:entryId/decline`, active, async (c) => {
    const { reason } = declineSchema.parse(await c.req.json());
    const params = {
      unitId: c.req.param('unitId'),
      entryId: c.req.param('entryId'),
      decision: 'Declined' as const,
      reason,
    };
    return c.json(await decideEntry(db, c.get('requestContext'), params));
  });
}
