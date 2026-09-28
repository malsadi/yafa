import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { dryRunImport, runImport } from './data-import.service';

const PATH = '/api/administration-panel/data-import';
const ACCESS = { kind: 'capability', capability: 'administration-panel.data-import.run' } as const;
const filesSchema = z.object({
  units: z.string().nullable(),
  people: z.string().nullable(),
  accounts: z.string().nullable(),
});

/** Brief 25 D4: the dry run, then the import. HTTP only. */
export function registerDataImportRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'POST', path: `${PATH}/dry-run`, access: ACCESS });
  registerRoute({ method: 'POST', path: PATH, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.post(`${PATH}/dry-run`, active, async (c) =>
    c.json(await dryRunImport(db, c.get('requestContext'), filesSchema.parse(await c.req.json()))),
  );
  app.post(PATH, active, async (c) =>
    c.json(await runImport(db, c.get('requestContext'), filesSchema.parse(await c.req.json()))),
  );
}
