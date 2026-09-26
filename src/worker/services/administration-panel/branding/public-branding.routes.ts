import type { Hono } from 'hono';
import type { BrandingFileSlot } from '../../../../shared/administration-panel/branding-files';
import { registerRoute, type RouteAccess } from '../../../core/permissions';
import { buildInstallFile, readBrandingFile } from './public-branding.service';

// D-088: exactly these, each with its own class. No route here takes an id
// or path from the request: each serves its one slot's file.
const FILE_ROUTES: { path: string; slot: BrandingFileSlot; access: RouteAccess }[] = [
  { path: '/branding/icon-192.png', slot: 'icon-192', access: { kind: 'public-install-icon' } },
  { path: '/branding/icon-512.png', slot: 'icon-512', access: { kind: 'public-install-icon' } },
  { path: '/branding/fonts/latin', slot: 'latin-font', access: { kind: 'public-font-file' } },
  { path: '/branding/fonts/arabic', slot: 'arabic-font', access: { kind: 'public-font-file' } },
];
const INSTALL_FILE = '/manifest.webmanifest';

/**
 * D-036 and D-088: the branding files a browser fetches on its own, without
 * a sign-in — the install file, its icons, and the fonts. Branding, not data;
 * nothing else is served without a sign-in.
 */
export function registerPublicBrandingRoutes(app: Hono, db: D1Database, bucket: R2Bucket): void {
  registerRoute({ method: 'GET', path: INSTALL_FILE, access: { kind: 'public-install-file' } });
  app.get(INSTALL_FILE, async (c) => {
    const installFile = await buildInstallFile(db);
    if (!installFile) return c.notFound();
    return c.body(JSON.stringify(installFile), 200, {
      'Content-Type': 'application/manifest+json',
    });
  });
  for (const { path, slot, access } of FILE_ROUTES) {
    registerRoute({ method: 'GET', path, access });
    app.get(path, async (c) => (await readBrandingFile(db, bucket, slot)) ?? c.notFound());
  }
}
