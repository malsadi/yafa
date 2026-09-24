import type { Hono } from 'hono';
import type { ClerkAccounts } from '../../../clerk';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { addOfficerSchema, endTermSchema, updatePersonSchema } from './officers.schema';
import { addOfficer, listOfficers, listPastOfficers } from './officers.service';
import { endTerm, updatePerson } from './people.service';

const UNIT = '/api/committee-register/units/:unitId';
const READ = { kind: 'capability', capability: 'committee-register.register.read' } as const;
const MANAGE = { kind: 'capability', capability: 'committee-register.officers.manage' } as const;

/** Brief 14 B1, B3, C3: officers, people and terms. HTTP only. */
export function registerOfficersRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  clerk: ClerkAccounts,
): void {
  registerRoute({ method: 'GET', path: `${UNIT}/officers`, access: READ });
  registerRoute({ method: 'GET', path: `${UNIT}/past-officers`, access: READ });
  registerRoute({ method: 'POST', path: `${UNIT}/officers`, access: MANAGE });
  registerRoute({
    method: 'PATCH',
    path: '/api/committee-register/people/:personId',
    access: MANAGE,
  });
  registerRoute({ method: 'PATCH', path: '/api/committee-register/terms/:termId', access: MANAGE });
  const active = requireActiveAccess(db, keys);

  app.get(`${UNIT}/officers`, active, async (c) =>
    c.json(await listOfficers(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(`${UNIT}/past-officers`, active, async (c) =>
    c.json(await listPastOfficers(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(`${UNIT}/officers`, active, async (c) => {
    const input = addOfficerSchema.parse(await c.req.json());
    const unitId = c.req.param('unitId');
    return c.json(await addOfficer(db, clerk, c.get('requestContext'), { unitId, input }), 201);
  });
  app.patch('/api/committee-register/people/:personId', active, async (c) => {
    const changes = updatePersonSchema.parse(await c.req.json());
    await updatePerson(db, c.get('requestContext'), c.req.param('personId'), changes);
    return c.body(null, 204);
  });
  app.patch('/api/committee-register/terms/:termId', active, async (c) => {
    const { endDate } = endTermSchema.parse(await c.req.json());
    const termId = c.req.param('termId');
    return c.json(await endTerm(db, clerk, c.get('requestContext'), { termId, endDate }));
  });
}
