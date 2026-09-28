import type { Hono } from 'hono';
import { buildAuditStatement } from '../../../core/audit';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { requirePortalCapability } from '../operations-access';
import { listBackups, takeBackup } from './backups.service';

const PATH = '/api/administration-panel/backups';
const CAPABILITY = 'administration-panel.backups.manage';
const ACCESS = { kind: 'capability', capability: CAPABILITY } as const;

/** Brief 25 D3: the backups kept, and a backup now. There is no restore button. HTTP only. */
export function registerBackupsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  bucket: R2Bucket,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: PATH, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => {
    await requirePortalCapability(db, c.get('requestContext'), CAPABILITY);
    return c.json(await listBackups(bucket));
  });
  app.post(PATH, active, async (c) => {
    const ctx = c.get('requestContext');
    await requirePortalCapability(db, ctx, CAPABILITY);
    const backup = await takeBackup(db, bucket);
    await buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'backup.taken',
      entityType: 'backup',
      entityId: backup.key,
    }).run();
    return c.json(backup, 201);
  });
}
