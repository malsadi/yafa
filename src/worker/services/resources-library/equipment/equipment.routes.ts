import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { registerRetirementRoutes } from '../library-retirement.routes';
import { equipmentDetailsSchema, equipmentSaveSchema } from './equipment.schema';
import { changeEquipment, createEquipment, listEquipment, MANAGE } from './equipment.service';

export const EQUIPMENT = '/api/resources-library/units/:unitId/equipment';
export const ITEM = `${EQUIPMENT}/:equipmentId`;
const READ = { kind: 'capability', capability: 'resources-library.library.read' } as const;
const ACCESS = { kind: 'capability', capability: MANAGE } as const;

/** Brief 16 C1 (D-100, D-106, D-108): the equipment register. HTTP only. */
export function registerEquipmentRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: EQUIPMENT, access: READ });
  registerRoute({ method: 'POST', path: EQUIPMENT, access: ACCESS });
  registerRoute({ method: 'PUT', path: ITEM, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(EQUIPMENT, active, async (c) =>
    c.json(await listEquipment(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(EQUIPMENT, active, async (c) => {
    const input = equipmentDetailsSchema.parse(await c.req.json());
    return c.json(
      await createEquipment(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.put(ITEM, active, async (c) => {
    const save = equipmentSaveSchema.parse(await c.req.json());
    await changeEquipment(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      equipmentId: c.req.param('equipmentId'),
      ...save,
    });
    return c.body(null, 204);
  });
  registerRetirementRoutes(app, db, keys, {
    kind: 'equipment',
    itemPath: ITEM,
    idParam: 'equipmentId',
  });
}
