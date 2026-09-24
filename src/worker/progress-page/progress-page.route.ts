import type { Hono } from 'hono';
import { registerRoute } from '../core/permissions';
import { serveStaticAsset } from '../app/serve-static-asset';

export const PROGRESS_PAGE_PATH = '/progress.html';

async function serveProgressPage(assets: Fetcher, request: Request): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = PROGRESS_PAGE_PATH;
  url.search = '';
  const response = await serveStaticAsset(assets, new Request(url, request));
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

/**
 * D-040: the owner's public build progress page, a static file generated
 * from `docs/`, served as it is, with its own access class. It is given only
 * the static assets, never the database, and asks search engines not to
 * list it. D-047: where `showAtRoot` is on (the preview environment only,
 * `ROOT_SHOWS_PROGRESS_PAGE`), the root answers with the same page, which
 * links to the portal at `/portal`; sign-in itself is unchanged.
 */
export function registerProgressPageRoute(
  app: Hono,
  assets: Fetcher,
  options: { showAtRoot: boolean },
): void {
  const paths = options.showAtRoot ? [PROGRESS_PAGE_PATH, '/'] : [PROGRESS_PAGE_PATH];
  for (const path of paths) {
    registerRoute({ method: 'GET', path, access: { kind: 'public-progress-page' } });
    app.get(path, (c) => serveProgressPage(assets, c.req.raw));
  }
}
