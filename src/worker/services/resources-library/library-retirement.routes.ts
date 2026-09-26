import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../middleware';
import { RETIRABLE, setLibraryRetired, type Retirable } from './library-retirement';

const versionSchema = z.object({ version: z.number().int().positive() });

/**
 * D-100: `POST <item>/retire` and `<item>/restore` for one kind of library
 * material, where `itemPath` ends in the item's id parameter. HTTP only.
 */
export function registerRetirementRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  config: { kind: Retirable; itemPath: string; idParam: string },
): void {
  const access = { kind: 'capability', capability: RETIRABLE[config.kind].capability } as const;
  const active = requireActiveAccess(db, keys);
  for (const [action, retire] of [
    ['retire', true],
    ['restore', false],
  ] as const) {
    const path = `${config.itemPath}/${action}`;
    registerRoute({ method: 'POST', path, access });
    app.post(path, active, async (c) => {
      const { version } = versionSchema.parse(await c.req.json());
      await setLibraryRetired(db, c.get('requestContext'), config.kind, {
        unitId: c.req.param('unitId') ?? '',
        id: c.req.param(config.idParam) ?? '',
        version,
        retire,
      });
      return c.body(null, 204);
    });
  }
}
