import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import { buildInstallFile } from './public-branding.service';

const INSTALL_FILE = '/manifest.webmanifest';

/**
 * D-036 and D-088: the install file, which a browser fetches on its own,
 * without a sign-in. Branding, not data. Its icons and the fonts are fixed
 * static files (D-223); nothing else is served without a sign-in.
 */
export function registerPublicBrandingRoutes(app: Hono, db: D1Database): void {
  registerRoute({ method: 'GET', path: INSTALL_FILE, access: { kind: 'public-install-file' } });
  app.get(INSTALL_FILE, async (c) => {
    const installFile = await buildInstallFile(db);
    if (!installFile) return c.notFound();
    return c.body(JSON.stringify(installFile), 200, {
      'Content-Type': 'application/manifest+json',
    });
  });
}
