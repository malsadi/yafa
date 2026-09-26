import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { completeArchiveUploadSchema, startArchiveUploadSchema } from './uploads.schema';
import { completeArchiveUpload, startArchiveUpload } from './uploads.service';

const UNIT = '/api/documents-archive/units/:unitId';
const ACCESS = { kind: 'capability', capability: 'documents-archive.documents.upload' } as const;

/** Brief 15 A2 and 9.3: upload an official document to a unit's archive. HTTP only. */
export function registerUploadsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  registerRoute({ method: 'POST', path: `${UNIT}/uploads`, access: ACCESS });
  registerRoute({ method: 'PUT', path: `${UNIT}/documents/:documentId`, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.post(`${UNIT}/uploads`, active, async (c) => {
    const file = startArchiveUploadSchema.parse(await c.req.json());
    return c.json(
      await startArchiveUpload(db, c.get('requestContext'), storage, {
        unitId: c.req.param('unitId'),
        ...file,
      }),
    );
  });
  app.put(`${UNIT}/documents/:documentId`, active, async (c) => {
    const done = completeArchiveUploadSchema.parse(await c.req.json());
    return c.json(
      await completeArchiveUpload(db, c.get('requestContext'), storage, {
        ...done,
        unitId: c.req.param('unitId'),
        documentId: c.req.param('documentId'),
      }),
      201,
    );
  });
}
