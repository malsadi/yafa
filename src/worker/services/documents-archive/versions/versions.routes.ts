import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { startArchiveUploadSchema } from '../uploads/uploads.schema';
import { completeVersionUploadSchema } from './versions.schema';
import { completeVersionUpload, startVersionUpload } from './versions.service';

const VERSIONS = '/api/documents-archive/units/:unitId/documents/:documentId/versions';
const ACCESS = { kind: 'capability', capability: 'documents-archive.documents.upload' } as const;

/** Brief 15 A4 (D-110): add a new version to an uploaded document. HTTP only. */
export function registerVersionsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  registerRoute({ method: 'POST', path: `${VERSIONS}/uploads`, access: ACCESS });
  registerRoute({ method: 'PUT', path: VERSIONS, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  const ids = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    documentId: c.req.param('documentId'),
  });

  app.post(`${VERSIONS}/uploads`, active, async (c) => {
    const file = startArchiveUploadSchema.parse(await c.req.json());
    return c.json(
      await startVersionUpload(db, c.get('requestContext'), storage, { ...ids(c), ...file }),
    );
  });
  app.put(VERSIONS, active, async (c) => {
    const done = completeVersionUploadSchema.parse(await c.req.json());
    await completeVersionUpload(db, c.get('requestContext'), storage, { ...done, ...ids(c) });
    return c.body(null, 204);
  });
}
