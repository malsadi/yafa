import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { getSetupChecklist } from './setup-checklist.service';

const PATH = '/api/administration-panel/setup-checklist';

/** Brief 25 C6: the set-up checklist. HTTP only. */
export function registerSetupChecklistRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({
    method: 'GET',
    path: PATH,
    access: { kind: 'capability', capability: 'administration-panel.setup-checklist.read' },
  });
  app.get(PATH, requireActiveAccess(db, keys), async (c) =>
    c.json(await getSetupChecklist(db, c.get('requestContext'))),
  );
}
