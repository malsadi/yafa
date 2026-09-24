import type { Hono } from 'hono';
import { registerRoute } from '../core/permissions';
import { serveStaticAsset } from '../app/serve-static-asset';

export const PROGRESS_PAGE_PATH = '/progress.html';

/**
 * D-040: the owner's public build progress page — a static file generated
 * from `docs/` (`scripts/progress-page/`), served as it is. Public by the
 * owner's decision, with its own access class. It is given only the static
 * assets, never the database, and asks search engines not to list it.
 */
export function registerProgressPageRoute(app: Hono, assets: Fetcher): void {
  registerRoute({
    method: 'GET',
    path: PROGRESS_PAGE_PATH,
    access: { kind: 'public-progress-page' },
  });

  app.get(PROGRESS_PAGE_PATH, async (c) => {
    const response = await serveStaticAsset(assets, c.req.raw);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  });
}
