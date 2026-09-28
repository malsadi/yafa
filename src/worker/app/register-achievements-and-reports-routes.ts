import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { Hono } from 'hono';
import type { FileStorage } from '../core/files';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import {
  registerAchievementPhotosRoutes,
  registerAchievementsRoutes,
  registerAnnualReportRoutes,
  registerContributionsRoutes,
} from '../services/achievements-and-reports';

/** Service 12, Achievements and reports (brief 24): achievements, contributions and annual reports. */
export function registerAchievementsAndReportsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { storage: FileStorage; browser: BrowserWorker | undefined },
): void {
  registerAchievementsRoutes(app, db, keys);
  registerAchievementPhotosRoutes(app, db, keys, services.storage);
  registerContributionsRoutes(app, db, keys);
  registerAnnualReportRoutes(app, db, keys, services);
}
