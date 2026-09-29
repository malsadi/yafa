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
import { READ } from '../events/events.service';
import { postEventReport } from '../report/report.service';
import { browserReportRenderer } from '../report/report-renderer';
import { CLOSE, closeEvent, closePreview } from './closing.service';
import type { PdfRendering } from '../../administration-panel';

const ONE = '/api/event-organiser/units/:unitId/events/:eventId';
const closeSchema = z.object({
  branchAccountId: z.string().min(1),
  language: z.enum(LANGUAGES),
  version: z.number().int().positive(),
});

/** Brief 21 C1, C2, P16 and D-183, D-184: the post-event report, and closing. HTTP only. */
export function registerClosingRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { storage: FileStorage; pdf: PdfRendering },
): void {
  const close = { kind: 'capability', capability: CLOSE } as const;
  registerRoute({
    method: 'GET',
    path: `${ONE}/report`,
    access: { kind: 'capability', capability: READ },
  });
  registerRoute({ method: 'GET', path: `${ONE}/close-preview`, access: close });
  registerRoute({ method: 'POST', path: `${ONE}/close`, access: close });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    eventId: c.req.param('eventId'),
  });
  app.get(`${ONE}/report`, active, async (c) =>
    c.json(await postEventReport(db, c.get('requestContext'), ref(c))),
  );
  app.get(`${ONE}/close-preview`, active, async (c) =>
    c.json(await closePreview(db, c.get('requestContext'), ref(c))),
  );
  app.post(`${ONE}/close`, active, async (c) => {
    const input = closeSchema.parse(await c.req.json());
    const render = browserReportRenderer(services.pdf);
    await closeEvent(
      db,
      c.get('requestContext'),
      { storage: services.storage, render },
      { ...ref(c), ...input },
    );
    return c.body(null, 204);
  });
}
