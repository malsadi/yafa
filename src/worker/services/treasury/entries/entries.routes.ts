import type { Hono } from 'hono';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { paramOf } from '../route-params';
import { moneyEntrySchema, transferSchema } from './entries.schema';
import { recordMoneyEntry } from './entries.service';
import { recordTransfer } from './transfers.service';

const UNIT = '/api/treasury/units/:unitId';
const access = (capability: string) => ({ kind: 'capability', capability }) as const;

/** Brief 17 B1 to B3: record credits, debits and transfers. HTTP only. */
export function registerEntriesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  const active = requireActiveAccess(db, keys);
  for (const type of ['credit', 'debit'] as const) {
    registerRoute({
      method: 'POST',
      path: `${UNIT}/${type}s`,
      access: access(`treasury.${type}.create`),
    });
    app.post(`${UNIT}/${type}s`, active, async (c) => {
      const entry = moneyEntrySchema.parse(await c.req.json());
      const params = { unitId: paramOf(c, 'unitId'), type, entry };
      return c.json(await recordMoneyEntry(db, c.get('requestContext'), storage, params), 201);
    });
  }
  registerRoute({
    method: 'POST',
    path: `${UNIT}/transfers`,
    access: access('treasury.transfer.create'),
  });
  app.post(`${UNIT}/transfers`, active, async (c) => {
    const transfer = transferSchema.parse(await c.req.json());
    return c.json(
      await recordTransfer(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        transfer,
      }),
      201,
    );
  });
}
