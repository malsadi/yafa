import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { Hono } from 'hono';
import type { FileStorage } from '../core/files';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import {
  registerAccountsRoutes,
  registerApprovalsRoutes,
  registerCorrectionsRoutes,
  registerEntriesRoutes,
  registerEntryHistoryRoutes,
  registerReceiptsRoutes,
  registerStatementsRoutes,
  registerYearEndCloseRoutes,
} from '../services/treasury';

/** Service 3's routes (brief 17), each declaring its capability (7.4). */
export function registerTreasuryRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  storage: FileStorage,
  browser: BrowserWorker | undefined,
): void {
  registerAccountsRoutes(app, db, keys);
  registerEntryHistoryRoutes(app, db, keys);
  registerEntriesRoutes(app, db, keys, storage);
  registerReceiptsRoutes(app, db, keys, storage);
  registerApprovalsRoutes(app, db, keys);
  registerCorrectionsRoutes(app, db, keys);
  registerStatementsRoutes(app, db, keys, { storage, browser });
  registerYearEndCloseRoutes(app, db, keys, { storage, browser });
}
