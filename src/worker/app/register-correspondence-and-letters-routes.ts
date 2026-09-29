import type { Hono } from 'hono';
import type { FileStorage } from '../core/files';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import {
  registerLettersInRoutes,
  registerLettersOutRoutes,
} from '../services/correspondence-and-letters';
import type { PdfRendering } from '../services/administration-panel';

/** Service 7, Correspondence and letters (brief 23): letters out and letters in. */
export function registerCorrespondenceAndLettersRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  services: { storage: FileStorage; pdf: PdfRendering },
): void {
  registerLettersOutRoutes(app, db, keys, services);
  registerLettersInRoutes(app, db, keys, services.storage);
}
