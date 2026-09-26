import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { reverseEntry } from './corrections.service';

const PATH = '/api/treasury/units/:unitId/entries/:entryId/reverse';
const reverseSchema = z.object({
  description: z
    .string()
    .trim()
    .transform((text) => (text === '' ? null : text))
    .nullable()
    .default(null),
});

/** Brief 17 B6 (D-126): correct an entry with a reversing entry. HTTP only. */
export function registerCorrectionsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({
    method: 'POST',
    path: PATH,
    access: { kind: 'capability', capability: 'treasury.entries.correct' },
  });
  app.post(PATH, requireActiveAccess(db, keys), async (c) => {
    const { description } = reverseSchema.parse(await c.req.json());
    const params = { unitId: c.req.param('unitId'), entryId: c.req.param('entryId'), description };
    return c.json(await reverseEntry(db, c.get('requestContext'), params), 201);
  });
}
