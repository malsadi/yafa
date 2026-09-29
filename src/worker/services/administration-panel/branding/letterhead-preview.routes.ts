import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { letterheadPreviewSchema, renderLetterheadPreview } from './letterhead-preview.service';
import type { PdfRendering } from './pdf-rendering';

const PREVIEW = '/api/administration-panel/branding/letterhead-preview';
const ACCESS = { kind: 'capability', capability: 'administration-panel.branding.manage' } as const;

/** D-090: preview the letterhead as a PDF. HTTP only. */
export function registerLetterheadPreviewRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  pdf: PdfRendering,
): void {
  registerRoute({ method: 'POST', path: PREVIEW, access: ACCESS });
  app.post(PREVIEW, requireActiveAccess(db, keys), async (c) => {
    const input = letterheadPreviewSchema.parse(await c.req.json());
    const document = await renderLetterheadPreview(db, c.get('requestContext'), pdf, input);
    return new Response(document, { headers: { 'Content-Type': 'application/pdf' } });
  });
}
