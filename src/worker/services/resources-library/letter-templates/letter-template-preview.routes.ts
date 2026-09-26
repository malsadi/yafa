import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { letterTemplatePreviewSchema } from './letter-template-preview.schema';
import { renderLetterTemplatePreview } from './letter-template-preview.service';

const PATH = '/api/resources-library/units/:unitId/letter-templates/preview';
const ACCESS = {
  kind: 'capability',
  capability: 'resources-library.letter-templates.manage',
} as const;

/** D-111: a letter template being written, as a PDF on the real letterhead. HTTP only. */
export function registerLetterTemplatePreviewRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
): void {
  registerRoute({ method: 'POST', path: PATH, access: ACCESS });
  app.post(PATH, requireActiveAccess(db, keys), async (c) => {
    const preview = letterTemplatePreviewSchema.parse(await c.req.json());
    const pdf = await renderLetterTemplatePreview(db, c.get('requestContext'), services, {
      unitId: c.req.param('unitId'),
      preview,
    });
    return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
  });
}
