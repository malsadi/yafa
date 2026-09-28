import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { fileHousekeeping } from './file-housekeeping.service';

const PATH = '/api/administration-panel/file-housekeeping';

/** Brief 25 D5: the orphaned file report and storage used. Read-only. HTTP only. */
export function registerFileHousekeepingRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  bucket: R2Bucket,
): void {
  registerRoute({
    method: 'GET',
    path: PATH,
    access: { kind: 'capability', capability: 'administration-panel.file-housekeeping.read' },
  });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) =>
    c.json(await fileHousekeeping(db, c.get('requestContext'), bucket)),
  );
}
