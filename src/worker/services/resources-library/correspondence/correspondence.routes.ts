import type { Hono } from 'hono';
import { z } from 'zod';
import { LETTER_DIRECTIONS } from '../../../../shared/resources-library/filed-letter';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { downloadUnitLetter, listUnitLetters } from './filed-letters.service';

const PATH = '/api/resources-library/units/:unitId/letters/:direction';
const FILE = `${PATH}/:letterId/file`;
const ACCESS = { kind: 'capability', capability: 'resources-library.correspondence.read' } as const;
const directionSchema = z.enum(LETTER_DIRECTIONS);

/** Brief 16 D2, D3: a unit's letters out and in, read-only, and their files. HTTP only. */
export function registerCorrespondenceRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'GET', path: FILE, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(PATH, active, async (c) =>
    c.json(
      await listUnitLetters(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        direction: directionSchema.parse(c.req.param('direction')),
      }),
    ),
  );
  app.get(FILE, active, async (c) =>
    downloadUnitLetter(db, c.get('requestContext'), storage, {
      unitId: c.req.param('unitId'),
      direction: directionSchema.parse(c.req.param('direction')),
      letterId: c.req.param('letterId'),
    }),
  );
}
