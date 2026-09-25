import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { setRequiredSetting } from './set-required-setting.service';
import { requiredSettingValueSchema } from './setup-checklist.schema';
import { getSetupChecklist } from './setup-checklist.service';

const PATH = '/api/administration-panel/setup-checklist';
const SETTING = `${PATH}/settings/:key`;

/** Brief 25 C6 and D-074: the set-up checklist, and setting a required setting from it. HTTP only. */
export function registerSetupChecklistRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({
    method: 'GET',
    path: PATH,
    access: { kind: 'capability', capability: 'administration-panel.setup-checklist.read' },
  });
  registerRoute({
    method: 'PUT',
    path: SETTING,
    access: { kind: 'capability', capability: 'administration-panel.setup-checklist.manage' },
  });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => c.json(await getSetupChecklist(db, c.get('requestContext'))));
  app.put(SETTING, active, async (c) => {
    const { value } = requiredSettingValueSchema.parse(await c.req.json());
    await setRequiredSetting(db, c.get('requestContext'), { key: c.req.param('key'), value });
    return c.body(null, 204);
  });
}
