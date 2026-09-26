import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import {
  communityDateSaveSchema,
  communityDateSchema,
  versionSchema,
} from './community-dates.schema';
import {
  addCommunityDate,
  changeCommunityDate,
  MANAGE,
  setCommunityDateRetired,
} from './community-dates.service';

const DATES = '/api/calendar/units/:unitId/community-dates';
const ONE = `${DATES}/:dateId`;

/** Brief 19 A3 (D-145 to D-147): add, change, retire and bring back community dates. HTTP only. */
export function registerCommunityDatesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const access = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({ method: 'POST', path: DATES, access });
  registerRoute({ method: 'PUT', path: ONE, access });
  registerRoute({ method: 'POST', path: `${ONE}/retire`, access });
  registerRoute({ method: 'POST', path: `${ONE}/restore`, access });
  const active = requireActiveAccess(db, keys);
  app.post(DATES, active, async (c) => {
    const input = communityDateSchema.parse(await c.req.json());
    return c.json(
      await addCommunityDate(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.put(ONE, active, async (c) => {
    const save = communityDateSaveSchema.parse(await c.req.json());
    await changeCommunityDate(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      id: c.req.param('dateId'),
      ...save,
    });
    return c.body(null, 204);
  });
  for (const [action, retire] of [
    ['retire', true],
    ['restore', false],
  ] as const) {
    app.post(`${ONE}/${action}`, active, async (c) => {
      const { version } = versionSchema.parse(await c.req.json());
      const params = {
        unitId: c.req.param('unitId'),
        id: c.req.param('dateId'),
        version,
        retire,
      };
      await setCommunityDateRetired(db, c.get('requestContext'), params);
      return c.body(null, 204);
    });
  }
}
