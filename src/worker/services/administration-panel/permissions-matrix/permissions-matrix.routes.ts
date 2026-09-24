import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { listMatrixVersions, restoreMatrixVersion } from './permissions-matrix-versions.service';
import { restoreVersionSchema, setCellSchema } from './permissions-matrix.schema';
import { getMatrix, setCell } from './permissions-matrix.service';

const PATH = '/api/administration-panel/permissions-matrix';
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.permissions-matrix.manage',
} as const;

/** Brief 25 A3: read the matrix, set a cell, list and restore versions. HTTP only. */
export function registerPermissionsMatrixRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'PUT', path: `${PATH}/cells`, access: ACCESS });
  registerRoute({ method: 'GET', path: `${PATH}/versions`, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/versions/:number/restore`, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(PATH, active, async (c) => c.json(await getMatrix(db, c.get('requestContext'))));

  app.put(`${PATH}/cells`, active, async (c) => {
    const input = setCellSchema.parse(await c.req.json());
    return c.json(await setCell(db, c.get('requestContext'), input));
  });

  app.get(`${PATH}/versions`, active, async (c) =>
    c.json(await listMatrixVersions(db, c.get('requestContext'))),
  );

  app.post(`${PATH}/versions/:number/restore`, active, async (c) => {
    const fromVersion = z.coerce.number().int().min(1).parse(c.req.param('number'));
    const { expectedVersion } = restoreVersionSchema.parse(await c.req.json());
    return c.json(
      await restoreMatrixVersion(db, c.get('requestContext'), { fromVersion, expectedVersion }),
    );
  });
}
