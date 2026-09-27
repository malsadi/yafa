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
import type { NotificationsQueue } from '../../communication-hub';
import { READ } from '../meetings/meetings.service';
import { logMeetingReport } from './log-report.service';
import { browserMeetingReportRenderer } from './meeting-report-renderer';
import { downloadMeetingReport } from './report-file.service';

const ONE = '/api/meeting-recorder/units/:unitId/meetings/:meetingId';
const logSchema = z.object({ language: z.enum(LANGUAGES), version: z.number().int().positive() });

/**
 * Brief 22 C1 and D-208: logging the report — for the chair, secretary or
 * a manager (checked in the service) — and downloading it once logged. HTTP only.
 */
export function registerReportRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { queue: NotificationsQueue; storage: FileStorage; browser: BrowserWorker | undefined },
): void {
  registerRoute({ method: 'POST', path: `${ONE}/log-report`, access: { kind: 'signed-in-only' } });
  registerRoute({
    method: 'GET',
    path: `${ONE}/report/file`,
    access: { kind: 'capability', capability: READ },
  });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    meetingId: c.req.param('meetingId'),
  });
  app.post(`${ONE}/log-report`, active, async (c) => {
    const input = logSchema.parse(await c.req.json());
    const render = browserMeetingReportRenderer(db, {
      bucket: services.storage.bucket,
      browser: services.browser,
    });
    await logMeetingReport(
      db,
      services.queue,
      c.get('requestContext'),
      { storage: services.storage, render },
      { ...ref(c), ...input },
    );
    return c.body(null, 204);
  });
  app.get(`${ONE}/report/file`, active, async (c) =>
    downloadMeetingReport(db, c.get('requestContext'), services.storage, ref(c)),
  );
}
