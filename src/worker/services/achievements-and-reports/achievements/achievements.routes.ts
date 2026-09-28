import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { READ, RECORD } from '../achievement-access';
import { achievementChoices, timeline } from '../timeline/timeline.service';
import { achievementSchema, changeAchievementSchema, versionSchema } from './achievements.schema';
import {
  changeAchievement,
  recordAchievement,
  setAchievementWithdrawn,
} from './achievements.service';

const UNIT = '/api/achievements-and-reports/units/:unitId';
const LIST = `${UNIT}/achievements`;
const ONE = `${LIST}/:achievementId`;
const scopeSchema = z.enum(['unit', 'national', 'all']);

interface Params {
  req: { param: (name: string) => string };
}
const ref = (c: Params) => ({
  unitId: c.req.param('unitId'),
  achievementId: c.req.param('achievementId'),
});

/** Brief 24 A1 to A3 and D-215: the timelines, and recording achievements. HTTP only. */
export function registerAchievementsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  declareAchievementsRoutes();
  const active = requireActiveAccess(db, keys);
  app.get(LIST, active, async (c) =>
    c.json(
      await timeline(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        scope: scopeSchema.parse(c.req.query('scope') ?? 'unit'),
      }),
    ),
  );
  app.get(`${UNIT}/achievement-choices`, active, async (c) =>
    c.json(await achievementChoices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(LIST, active, async (c) => {
    const achievement = achievementSchema.parse(await c.req.json());
    const unitId = c.req.param('unitId');
    return c.json(
      await recordAchievement(db, c.get('requestContext'), { unitId, achievement }),
      201,
    );
  });
  app.put(ONE, active, async (c) => {
    const input = changeAchievementSchema.parse(await c.req.json());
    await changeAchievement(db, c.get('requestContext'), { ...ref(c), ...input });
    return c.body(null, 204);
  });
  for (const [action, withdraw] of [
    ['withdraw', true],
    ['restore', false],
  ] as const)
    app.post(`${ONE}/${action}`, active, async (c) => {
      const { version } = versionSchema.parse(await c.req.json());
      await setAchievementWithdrawn(db, c.get('requestContext'), { ...ref(c), version, withdraw });
      return c.body(null, 204);
    });
}

/** The routes' access declarations, for the permission sweep (brief 7.4). */
function declareAchievementsRoutes(): void {
  const read = { kind: 'capability', capability: READ } as const;
  const record = { kind: 'capability', capability: RECORD } as const;
  registerRoute({ method: 'GET', path: LIST, access: read });
  registerRoute({ method: 'GET', path: `${UNIT}/achievement-choices`, access: record });
  registerRoute({ method: 'POST', path: LIST, access: record });
  registerRoute({ method: 'PUT', path: ONE, access: record });
  registerRoute({ method: 'POST', path: `${ONE}/withdraw`, access: record });
  registerRoute({ method: 'POST', path: `${ONE}/restore`, access: record });
}
