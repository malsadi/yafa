import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { READ } from '../events/events.service';
import { completeFileSchema, startFileSchema } from './event-files.schema';
import {
  addEventFile,
  downloadEventFile,
  eventFiles,
  removeEventFile,
  startEventFileUpload,
} from './event-files.service';

const FILES = '/api/event-organiser/units/:unitId/events/:eventId/files';
const ONE = `${FILES}/:fileId`;

/**
 * Brief 21 F1, F2, 9.3 and D-185: the event's Documents and Media. Adding
 * and removing are for its lead officer (no capability) or those who
 * manage events, checked in the service. HTTP only.
 */
export function registerEventFilesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  const leadOrManager = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'GET', path: FILES, access: read });
  registerRoute({ method: 'GET', path: `${ONE}/file`, access: read });
  registerRoute({ method: 'POST', path: `${FILES}/uploads`, access: leadOrManager });
  registerRoute({ method: 'PUT', path: FILES, access: leadOrManager });
  registerRoute({ method: 'POST', path: `${ONE}/remove`, access: leadOrManager });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    eventId: c.req.param('eventId'),
  });
  app.get(FILES, active, async (c) =>
    c.json(await eventFiles(db, c.get('requestContext'), ref(c))),
  );
  app.get(`${ONE}/file`, active, async (c) =>
    downloadEventFile(db, c.get('requestContext'), storage, {
      ...ref(c),
      fileId: c.req.param('fileId'),
    }),
  );
  app.post(`${FILES}/uploads`, active, async (c) => {
    const file = startFileSchema.parse(await c.req.json());
    return c.json(
      await startEventFileUpload(db, c.get('requestContext'), storage, { ...ref(c), ...file }),
    );
  });
  app.put(FILES, active, async (c) => {
    const file = completeFileSchema.parse(await c.req.json());
    await addEventFile(db, c.get('requestContext'), storage, { ...ref(c), ...file });
    return c.body(null, 204);
  });
  app.post(`${ONE}/remove`, active, async (c) => {
    await removeEventFile(db, c.get('requestContext'), storage, {
      ...ref(c),
      fileId: c.req.param('fileId'),
    });
    return c.body(null, 204);
  });
}
