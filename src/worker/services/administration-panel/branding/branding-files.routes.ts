import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { Hono } from 'hono';
import { z } from 'zod';
import { BRANDING_FILE_SLOT_NAMES } from '../../../../shared/administration-panel/branding-files';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { completeBrandingUpload, startBrandingUpload } from './branding-files.service';
import type { BrandingStorage } from './branding-storage';
import { letterheadPreviewSchema, renderLetterheadPreview } from './letterhead-preview.service';

const PATH = '/api/administration-panel/branding/files/:slot';
const PREVIEW = '/api/administration-panel/branding/letterhead-preview';
const ACCESS = { kind: 'capability', capability: 'administration-panel.branding.manage' } as const;
const slotSchema = z
  .enum(BRANDING_FILE_SLOT_NAMES as [string, ...string[]])
  .transform((slot) => slot as (typeof BRANDING_FILE_SLOT_NAMES)[number]);
const startSchema = z.object({
  fileName: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});
const completeSchema = z.object({
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  multipart: z
    .object({
      uploadId: z.string().min(1),
      parts: z.array(
        z.object({ partNumber: z.number().int().positive(), etag: z.string().min(1) }),
      ),
    })
    .optional(),
});

/** Brief 25 C3 and 9.3: upload a branding file, and preview the letterhead as a PDF (D-090). HTTP only. */
export function registerBrandingFilesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: BrandingStorage,
  browser: BrowserWorker | undefined,
): void {
  registerRoute({ method: 'POST', path: `${PATH}/uploads`, access: ACCESS });
  registerRoute({ method: 'PUT', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: PREVIEW, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.post(`${PATH}/uploads`, active, async (c) => {
    const slot = slotSchema.parse(c.req.param('slot'));
    const file = startSchema.parse(await c.req.json());
    return c.json(
      await startBrandingUpload(db, c.get('requestContext'), storage, { slot, ...file }),
    );
  });
  app.put(PATH, active, async (c) => {
    const slot = slotSchema.parse(c.req.param('slot'));
    const done = completeSchema.parse(await c.req.json());
    return c.json(
      await completeBrandingUpload(db, c.get('requestContext'), storage, { slot, ...done }),
    );
  });
  app.post(PREVIEW, active, async (c) => {
    const input = letterheadPreviewSchema.parse(await c.req.json());
    const pdf = await renderLetterheadPreview(
      db,
      c.get('requestContext'),
      { bucket: storage.bucket, browser },
      input,
    );
    return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
  });
}
