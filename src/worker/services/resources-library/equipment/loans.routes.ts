import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { ITEM } from './equipment.routes';
import { loanCorrectionSchema, loanDetailsSchema, loanReturnSchema } from './equipment.schema';
import { MANAGE } from './equipment.service';
import { correctLoan, lendEquipment, returnLoan } from './loans.service';

const LOANS = `${ITEM}/loans`;
const LOAN = `${LOANS}/:loanId`;
const ACCESS = { kind: 'capability', capability: MANAGE } as const;
interface Context {
  req: { param: (name: string) => string };
}
const ids = (c: Context) => ({
  unitId: c.req.param('unitId'),
  equipmentId: c.req.param('equipmentId'),
});

/** Brief 16 C2 (P20, D-099, D-108, D-109): lend, correct a loan, record its return. HTTP only. */
export function registerLoansRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'POST', path: LOANS, access: ACCESS });
  registerRoute({ method: 'PUT', path: LOAN, access: ACCESS });
  registerRoute({ method: 'POST', path: `${LOAN}/return`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.post(LOANS, active, async (c) => {
    const loan = loanDetailsSchema.parse(await c.req.json());
    await lendEquipment(db, c.get('requestContext'), { ...ids(c), loan });
    return c.body(null, 201);
  });
  app.put(LOAN, active, async (c) => {
    const save = loanCorrectionSchema.parse(await c.req.json());
    await correctLoan(db, c.get('requestContext'), {
      ...ids(c),
      loanId: c.req.param('loanId'),
      ...save,
    });
    return c.body(null, 204);
  });
  app.post(`${LOAN}/return`, active, async (c) => {
    const done = loanReturnSchema.parse(await c.req.json());
    await returnLoan(db, c.get('requestContext'), {
      ...ids(c),
      loanId: c.req.param('loanId'),
      ...done,
    });
    return c.body(null, 204);
  });
}
