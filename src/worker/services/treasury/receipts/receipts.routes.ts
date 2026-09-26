import type { Hono } from 'hono';
import { z } from 'zod';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { receiptUploadSchema } from '../entries/entries.schema';
import { paramOf } from '../route-params';
import {
  addReceipt,
  downloadReceipt,
  startReceiptUpload,
  type ReceiptEntryType,
} from './receipts.service';

type App = Hono<{ Variables: ActiveAccessVariables }>;
const UNIT = '/api/treasury/units/:unitId';
const startSchema = z.object({
  entryId: z.string().min(1).optional(),
  fileName: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});

/** D-123: a credit's or debit's receipts — uploaded with a new entry, or added to a recorded one. */
function registerReceiptsFor(
  app: App,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
  type: ReceiptEntryType,
) {
  const access = { kind: 'capability', capability: `treasury.${type}.create` } as const;
  const base = `${UNIT}/${type}s`;
  const active = requireActiveAccess(db, keys);
  registerRoute({ method: 'POST', path: `${base}/receipts/uploads`, access });
  registerRoute({ method: 'POST', path: `${base}/:entryId/receipts/uploads`, access });
  registerRoute({ method: 'PUT', path: `${base}/:entryId/receipts`, access });
  app.post(`${base}/receipts/uploads`, active, async (c) => {
    const file = startSchema.parse(await c.req.json());
    const params = { ...file, unitId: paramOf(c, 'unitId'), type, existing: false };
    return c.json(await startReceiptUpload(db, c.get('requestContext'), storage, params));
  });
  app.post(`${base}/:entryId/receipts/uploads`, active, async (c) => {
    const file = startSchema.parse(await c.req.json());
    const params = {
      ...file,
      unitId: paramOf(c, 'unitId'),
      type,
      entryId: paramOf(c, 'entryId'),
      existing: true,
    };
    return c.json(await startReceiptUpload(db, c.get('requestContext'), storage, params));
  });
  app.put(`${base}/:entryId/receipts`, active, async (c) => {
    const receipt = receiptUploadSchema.parse(await c.req.json());
    const params = { unitId: paramOf(c, 'unitId'), type, entryId: paramOf(c, 'entryId'), receipt };
    await addReceipt(db, c.get('requestContext'), storage, params);
    return c.body(null, 201);
  });
}

/** Brief 17 B4 (D-123): receipt photos, and their downloads. HTTP only. */
export function registerReceiptsRoutes(
  app: App,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
): void {
  registerReceiptsFor(app, db, keys, storage, 'credit');
  registerReceiptsFor(app, db, keys, storage, 'debit');
  const file = `${UNIT}/entries/:entryId/receipts/:receiptId/file`;
  registerRoute({
    method: 'GET',
    path: file,
    access: { kind: 'capability', capability: 'treasury.accounts.read' },
  });
  app.get(file, requireActiveAccess(db, keys), async (c) =>
    downloadReceipt(db, c.get('requestContext'), storage, {
      unitId: c.req.param('unitId'),
      entryId: c.req.param('entryId'),
      receiptId: c.req.param('receiptId'),
    }),
  );
}
