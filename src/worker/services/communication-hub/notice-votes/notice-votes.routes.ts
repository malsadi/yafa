import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { ballotSchema } from '../noticeboard/noticeboard.schema';
import { MANAGE, READ } from '../noticeboard/noticeboard.service';
import { castBallot, voterChoices } from './notice-votes.service';

const UNIT = '/api/communication-hub/units/:unitId';
const BALLOT = `${UNIT}/notices/:noticeId/ballot`;

/**
 * Brief 20 A2 and P11: voting on a notice — open to its chosen voters, who
 * must read the Noticeboard; the service checks they were chosen — and the
 * roles and officers a vote can be opened to. HTTP only.
 */
export function registerNoticeVotesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'POST', path: BALLOT, access: { kind: 'capability', capability: READ } });
  registerRoute({
    method: 'GET',
    path: `${UNIT}/voter-choices`,
    access: { kind: 'capability', capability: MANAGE },
  });
  const active = requireActiveAccess(db, keys);
  app.post(BALLOT, active, async (c) => {
    const { optionId } = ballotSchema.parse(await c.req.json());
    await castBallot(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      noticeId: c.req.param('noticeId'),
      optionId,
    });
    return c.body(null, 204);
  });
  app.get(`${UNIT}/voter-choices`, active, async (c) =>
    c.json(await voterChoices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
}
