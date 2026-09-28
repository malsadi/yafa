import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { READ, RECORD } from '../achievement-access';
import { completePhotoSchema, startPhotoSchema } from './photos.schema';
import { addPhoto, downloadPhoto, removePhoto, startPhotoUpload } from './photos.service';

const PHOTOS = '/api/achievements-and-reports/units/:unitId/achievements/:achievementId/photos';
const ONE = `${PHOTOS}/:fileId`;

interface Params {
  req: { param: (name: string) => string };
}
const ref = (c: Params) => ({
  unitId: c.req.param('unitId'),
  achievementId: c.req.param('achievementId'),
});

/** Brief 24 A1 and 9.3: an achievement's photos — added and taken off by recorders, seen by readers. HTTP only. */
export function registerPhotosRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  const record = { kind: 'capability', capability: RECORD } as const;
  registerRoute({ method: 'POST', path: `${PHOTOS}/uploads`, access: record });
  registerRoute({ method: 'PUT', path: PHOTOS, access: record });
  registerRoute({ method: 'POST', path: `${ONE}/remove`, access: record });
  registerRoute({
    method: 'GET',
    path: `${ONE}/file`,
    access: { kind: 'capability', capability: READ },
  });
  const active = requireActiveAccess(db, keys);
  app.post(`${PHOTOS}/uploads`, active, async (c) => {
    const file = startPhotoSchema.parse(await c.req.json());
    return c.json(
      await startPhotoUpload(db, c.get('requestContext'), storage, { ...ref(c), ...file }),
    );
  });
  app.put(PHOTOS, active, async (c) => {
    const file = completePhotoSchema.parse(await c.req.json());
    await addPhoto(db, c.get('requestContext'), storage, { ...ref(c), ...file });
    return c.body(null, 204);
  });
  app.post(`${ONE}/remove`, active, async (c) => {
    await removePhoto(db, c.get('requestContext'), { ...ref(c), fileId: c.req.param('fileId') });
    return c.body(null, 204);
  });
  app.get(`${ONE}/file`, active, async (c) =>
    downloadPhoto(db, c.get('requestContext'), storage, {
      ...ref(c),
      fileId: c.req.param('fileId'),
    }),
  );
}
