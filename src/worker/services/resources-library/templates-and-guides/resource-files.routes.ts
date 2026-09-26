import type { Hono } from 'hono';
import type { RouteAccess } from '../../../core/permissions';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import {
  completeNewResource,
  completeReplacement,
  downloadResource,
  startNewResource,
  startReplacement,
} from './resource-files.service';
import {
  completeReplacementSchema,
  completeResourceSchema,
  startResourceUploadSchema,
} from './templates-and-guides.schema';
import { MANAGE } from './templates-and-guides.service';
import { RESOURCE, RESOURCES } from './templates-and-guides.routes';

const ACCESS = { kind: 'capability', capability: MANAGE } as const;
const READ = { kind: 'capability', capability: 'resources-library.library.read' } as const;
interface Context {
  req: { param: (name: string) => string };
}
const ids = (c: Context) => ({
  unitId: c.req.param('unitId'),
  resourceId: c.req.param('resourceId'),
});

/** Brief 16 A1 to A3, D-104 and 9.3: add, replace and download templates' and guides' files. HTTP only. */
export function registerResourceFilesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  const active = requireActiveAccess(db, keys);
  const route = (method: 'GET' | 'POST' | 'PUT', path: string, access: RouteAccess = ACCESS) => {
    registerRoute({ method, path, access });
  };
  route('POST', `${RESOURCES}/uploads`);
  route('PUT', RESOURCE);
  route('POST', `${RESOURCE}/file/uploads`);
  route('PUT', `${RESOURCE}/file`);
  route('GET', `${RESOURCE}/file`, READ);
  app.post(`${RESOURCES}/uploads`, active, async (c) => {
    const file = startResourceUploadSchema.parse(await c.req.json());
    return c.json(
      await startNewResource(db, c.get('requestContext'), storage, {
        unitId: c.req.param('unitId'),
        ...file,
      }),
    );
  });
  app.put(RESOURCE, active, async (c) => {
    const done = completeResourceSchema.parse(await c.req.json());
    await completeNewResource(db, c.get('requestContext'), storage, { ...done, ...ids(c) });
    return c.body(null, 201);
  });
  app.post(`${RESOURCE}/file/uploads`, active, async (c) => {
    const file = startResourceUploadSchema.parse(await c.req.json());
    return c.json(
      await startReplacement(db, c.get('requestContext'), storage, { ...ids(c), ...file }),
    );
  });
  app.put(`${RESOURCE}/file`, active, async (c) => {
    const done = completeReplacementSchema.parse(await c.req.json());
    await completeReplacement(db, c.get('requestContext'), storage, { ...done, ...ids(c) });
    return c.body(null, 204);
  });
  app.get(`${RESOURCE}/file`, active, async (c) =>
    downloadResource(db, c.get('requestContext'), storage, ids(c)),
  );
}
