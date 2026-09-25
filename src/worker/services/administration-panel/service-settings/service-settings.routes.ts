import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import {
  getServiceSettingHistory,
  removeServiceSettingOverride,
  restoreServiceSetting,
  setServiceSetting,
} from './service-setting-changes.service';
import { setServiceSettingSchema } from './service-settings.schema';
import { getServiceSettings } from './service-settings.service';

const PATH = '/api/administration-panel/service-settings';
const ONE = `${PATH}/:key`;
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.service-settings.manage',
} as const;

type App = Hono<{ Variables: ActiveAccessVariables }>;

/** Brief 25 C1: every setting, set, overridden per unit, its history and restore. HTTP only. */
export function registerServiceSettingsRoutes(
  app: App,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const routes = [
    ['GET', PATH],
    ['PUT', ONE],
    ['DELETE', `${ONE}/overrides/:unitId`],
    ['GET', `${ONE}/history`],
    ['POST', `${ONE}/history/:historyId/restore`],
  ] as const;
  for (const [method, path] of routes) registerRoute({ method, path, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => c.json(await getServiceSettings(db, c.get('requestContext'))));
  app.put(ONE, active, async (c) => {
    const body = setServiceSettingSchema.parse(await c.req.json());
    await setServiceSetting(db, c.get('requestContext'), { key: c.req.param('key'), ...body });
    return c.body(null, 204);
  });
  app.delete(`${ONE}/overrides/:unitId`, active, async (c) => {
    await removeServiceSettingOverride(db, c.get('requestContext'), c.req.param());
    return c.body(null, 204);
  });
  app.get(`${ONE}/history`, active, async (c) =>
    c.json(await getServiceSettingHistory(db, c.get('requestContext'), c.req.param('key'))),
  );
  app.post(`${ONE}/history/:historyId/restore`, active, async (c) => {
    await restoreServiceSetting(db, c.get('requestContext'), c.req.param());
    return c.body(null, 204);
  });
}
