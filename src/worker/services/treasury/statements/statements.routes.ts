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
import { browserStatementRenderer } from './statement-renderer';
import { fileStatement, statementPdf, viewStatement } from './statements.service';

const PATH = '/api/treasury/units/:unitId/accounts/:accountId/statement';
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const periodSchema = z
  .object({ from: date, to: date })
  .refine((p) => p.from <= p.to, { message: 'From is not after to.' });
const pdfSchema = periodSchema.and(z.object({ language: z.enum(LANGUAGES) }));
const READ = { kind: 'capability', capability: 'treasury.accounts.read' } as const;

/** Brief 17 C2 and P9: an account's statement — to view, as a PDF, and filed to the archive. HTTP only. */
export function registerStatementsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { storage: FileStorage; browser: BrowserWorker | undefined },
): void {
  registerRoute({ method: 'GET', path: PATH, access: READ });
  registerRoute({ method: 'GET', path: `${PATH}/pdf`, access: READ });
  registerRoute({
    method: 'POST',
    path: `${PATH}/file`,
    access: { kind: 'capability', capability: 'treasury.statements.file' },
  });
  const active = requireActiveAccess(db, keys);
  const render = browserStatementRenderer(db, {
    bucket: services.storage.bucket,
    browser: services.browser,
  });
  const ids = (c: { req: { param: (name: 'unitId' | 'accountId') => string } }) => ({
    unitId: c.req.param('unitId'),
    accountId: c.req.param('accountId'),
  });
  app.get(PATH, active, async (c) =>
    c.json(
      await viewStatement(db, c.get('requestContext'), {
        ...ids(c),
        ...periodSchema.parse(c.req.query()),
      }),
    ),
  );
  app.get(`${PATH}/pdf`, active, async (c) => {
    const pdf = await statementPdf(db, c.get('requestContext'), render, {
      ...ids(c),
      ...pdfSchema.parse(c.req.query()),
    });
    return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
  });
  app.post(`${PATH}/file`, active, async (c) => {
    const params = { ...ids(c), ...pdfSchema.parse(await c.req.json()) };
    await fileStatement(db, c.get('requestContext'), { storage: services.storage, render }, params);
    return c.body(null, 201);
  });
}
