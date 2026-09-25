import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { readBranding, setBranding } from './branding.service';

const ADMIN = '/api/administration-panel/branding';
const OFFICERS = '/api/branding';
const ACCESS = { kind: 'capability', capability: 'administration-panel.branding.manage' } as const;
// Each part is checked by its own setting's schema (brief 8.1).
const changesSchema = z.object({
  organisationName: z.unknown().optional(),
  mainColour: z.unknown().optional(),
  accentColour: z.unknown().optional(),
});

/**
 * Brief 25 C3: the branding, set by the administrator; and read by every
 * active officer, whose screens take its colours (D-082). HTTP only.
 */
export function registerBrandingRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: OFFICERS, access: { kind: 'signed-in-only' } });
  registerRoute({ method: 'PUT', path: ADMIN, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(OFFICERS, active, async (c) => c.json(await readBranding(db)));
  app.put(ADMIN, active, async (c) => {
    const changes = changesSchema.parse(await c.req.json());
    return c.json(await setBranding(db, c.get('requestContext'), changes));
  });
}
