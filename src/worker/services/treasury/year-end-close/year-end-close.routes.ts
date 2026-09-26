import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { Hono } from 'hono';
import { z } from 'zod';
import { LANGUAGES } from '../../../../shared/core/languages';
import type { FileStorage } from '../../../core/files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { browserStatementRenderer } from '../statements/statement-renderer';
import { closeFinancialYear, listFinancialYears } from './year-end-close.service';

const YEARS = '/api/treasury/units/:unitId/financial-years';
const closeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  language: z.enum(LANGUAGES),
});

/** Brief 17 C3 (D-128): the unit's financial years; close one. HTTP only. */
export function registerYearEndCloseRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { storage: FileStorage; browser: BrowserWorker | undefined },
): void {
  registerRoute({
    method: 'GET',
    path: YEARS,
    access: { kind: 'capability', capability: 'treasury.accounts.read' },
  });
  registerRoute({
    method: 'POST',
    path: `${YEARS}/close`,
    access: { kind: 'capability', capability: 'treasury.year-end.close' },
  });
  const active = requireActiveAccess(db, keys);
  const render = browserStatementRenderer(db, {
    bucket: services.storage.bucket,
    browser: services.browser,
  });
  app.get(YEARS, active, async (c) =>
    c.json(await listFinancialYears(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(`${YEARS}/close`, active, async (c) => {
    const params = { unitId: c.req.param('unitId'), ...closeSchema.parse(await c.req.json()) };
    await closeFinancialYear(
      db,
      c.get('requestContext'),
      { storage: services.storage, render },
      params,
    );
    return c.body(null, 204);
  });
}
