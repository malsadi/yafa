import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { MANAGE } from '../meetings/meetings.service';
import { agendaItemSaveSchema, agendaItemSchema, agendaOrderSchema } from './agenda.schema';
import { addAgendaItem, changeAgendaItem, orderAgenda, removeAgendaItem } from './agenda.service';

const MEETING = '/api/meeting-recorder/units/:unitId/meetings/:meetingId';
const AGENDA = `${MEETING}/agenda`;
const ITEM = `${AGENDA}/:itemId`;

/**
 * Brief 22 A3 and D-204: the agenda — set by those who manage meetings
 * before it; points raised in it added by its chair, secretary or a
 * manager (checked in the service). HTTP only.
 */
export function registerAgendaRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const manage = { kind: 'capability', capability: MANAGE } as const;
  const chairOrManager = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'POST', path: AGENDA, access: chairOrManager });
  registerRoute({ method: 'PUT', path: ITEM, access: chairOrManager });
  registerRoute({ method: 'POST', path: `${ITEM}/remove`, access: manage });
  registerRoute({ method: 'PUT', path: `${MEETING}/agenda-order`, access: manage });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    meetingId: c.req.param('meetingId'),
  });
  app.post(AGENDA, active, async (c) => {
    const item = agendaItemSchema.parse(await c.req.json());
    return c.json(await addAgendaItem(db, c.get('requestContext'), { ...ref(c), item }), 201);
  });
  app.put(ITEM, active, async (c) => {
    const save = agendaItemSaveSchema.parse(await c.req.json());
    await changeAgendaItem(db, c.get('requestContext'), {
      ...ref(c),
      itemId: c.req.param('itemId'),
      ...save,
    });
    return c.body(null, 204);
  });
  app.post(`${ITEM}/remove`, active, async (c) => {
    await removeAgendaItem(db, c.get('requestContext'), {
      ...ref(c),
      itemId: c.req.param('itemId'),
    });
    return c.body(null, 204);
  });
  app.put(`${MEETING}/agenda-order`, active, async (c) => {
    const { itemIds } = agendaOrderSchema.parse(await c.req.json());
    await orderAgenda(db, c.get('requestContext'), { ...ref(c), itemIds });
    return c.body(null, 204);
  });
}
