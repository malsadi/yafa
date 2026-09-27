import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { Hono } from 'hono';
import type { FileStorage } from '../core/files';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import type { NotificationsQueue } from '../services/communication-hub';
import {
  registerAgendaRoutes,
  registerAttendeesRoutes,
  registerMeetingChoicesRoutes,
  registerMeetingReportRoutes,
  registerMeetingsRoutes,
  registerMeetingStatusRoutes,
  registerMinutesRoutes,
  registerSendLaterRoutes,
} from '../services/meeting-recorder';

/** Service 2's routes (brief 22), each declaring its capability (7.4). */
export function registerMeetingRecorderRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { queue: NotificationsQueue; storage: FileStorage; browser: BrowserWorker | undefined },
): void {
  registerMeetingChoicesRoutes(app, db, keys);
  registerMeetingsRoutes(app, db, keys, services.queue);
  registerMeetingStatusRoutes(app, db, keys);
  registerAttendeesRoutes(app, db, keys);
  registerAgendaRoutes(app, db, keys);
  registerMinutesRoutes(app, db, keys);
  registerMeetingReportRoutes(app, db, keys, services);
  registerSendLaterRoutes(app, db, keys, services.queue);
}
