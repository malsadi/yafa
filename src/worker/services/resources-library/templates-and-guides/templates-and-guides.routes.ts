import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { registerRetirementRoutes } from '../library-retirement.routes';
import { resourceDetailsSaveSchema } from './templates-and-guides.schema';
import { changeResourceDetails, listResources, MANAGE } from './templates-and-guides.service';

export const RESOURCES = '/api/resources-library/units/:unitId/resources';
export const RESOURCE = `${RESOURCES}/:resourceId`;
const READ = { kind: 'capability', capability: 'resources-library.library.read' } as const;

/** Brief 16 A1 to A3 (D-100, D-103): list templates and guides, change their details, retire and bring back. HTTP only. */
export function registerTemplatesAndGuidesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: RESOURCES, access: READ });
  registerRoute({
    method: 'PATCH',
    path: RESOURCE,
    access: { kind: 'capability', capability: MANAGE },
  });
  const active = requireActiveAccess(db, keys);
  app.get(RESOURCES, active, async (c) =>
    c.json(await listResources(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.patch(RESOURCE, active, async (c) => {
    const save = resourceDetailsSaveSchema.parse(await c.req.json());
    await changeResourceDetails(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      resourceId: c.req.param('resourceId'),
      ...save,
    });
    return c.body(null, 204);
  });
  registerRetirementRoutes(app, db, keys, {
    kind: 'resource',
    itemPath: RESOURCE,
    idParam: 'resourceId',
  });
}
