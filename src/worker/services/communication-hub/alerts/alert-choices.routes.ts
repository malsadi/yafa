import type { Hono } from 'hono';
import { z } from 'zod';
import {
  SWITCHABLE_ALERT_TYPES,
  type SwitchableAlertType,
} from '../../../../shared/communication-hub/alert-types';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { myAlertChoices, saveMyAlertChoices } from './alert-choices.service';

const PATH = '/api/communication-hub/alert-choices';
const choicesSchema = z.object({
  alertTypes: z.array(z.enum(SWITCHABLE_ALERT_TYPES as [string, ...string[]])),
});

/** Brief 20 C2: each officer's own alert choices — nothing to grant (D-004). HTTP only. */
export function registerAlertChoicesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const own = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'GET', path: PATH, access: own });
  registerRoute({ method: 'PUT', path: PATH, access: own });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => c.json(await myAlertChoices(db, c.get('requestContext'))));
  app.put(PATH, active, async (c) => {
    const { alertTypes } = choicesSchema.parse(await c.req.json());
    await saveMyAlertChoices(db, c.get('requestContext'), alertTypes as SwitchableAlertType[]);
    return c.body(null, 204);
  });
}
