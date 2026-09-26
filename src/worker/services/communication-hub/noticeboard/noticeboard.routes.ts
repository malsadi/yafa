import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { listNotices } from './notice-list.service';
import { noticeChangeSchema, noticeSchema, versionSchema } from './noticeboard.schema';
import { changeNotice, MANAGE, postNotice, READ, setNoticeRetired } from './noticeboard.service';

const NOTICES = '/api/communication-hub/units/:unitId/notices';
const ONE = `${NOTICES}/:noticeId`;

/** Brief 20 A1 and D-154, D-155: the unit's Noticeboard — read, post, change, retire, bring back. HTTP only. */
export function registerNoticeboardRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const manage = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({ method: 'GET', path: NOTICES, access: { kind: 'capability', capability: READ } });
  registerRoute({ method: 'POST', path: NOTICES, access: manage });
  registerRoute({ method: 'PUT', path: ONE, access: manage });
  registerRoute({ method: 'POST', path: `${ONE}/retire`, access: manage });
  registerRoute({ method: 'POST', path: `${ONE}/restore`, access: manage });
  const active = requireActiveAccess(db, keys);
  app.get(NOTICES, active, async (c) =>
    c.json(await listNotices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(NOTICES, active, async (c) => {
    const input = noticeSchema.parse(await c.req.json());
    return c.json(await postNotice(db, c.get('requestContext'), c.req.param('unitId'), input), 201);
  });
  app.put(ONE, active, async (c) => {
    const change = noticeChangeSchema.parse(await c.req.json());
    await changeNotice(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      id: c.req.param('noticeId'),
      ...change,
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
        id: c.req.param('noticeId'),
        version,
        retire,
      };
      await setNoticeRetired(db, c.get('requestContext'), params);
      return c.body(null, 204);
    });
  }
}
