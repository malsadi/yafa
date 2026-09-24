import type { Hono } from 'hono';
import { registerRoute } from '../core/permissions';
import { serveStaticAsset } from '../app/serve-static-asset';

/** The public progress page in English and in Arabic (D-040, D-058). */
export const PROGRESS_PAGE_PATHS = ['/progress.html', '/progress.ar.html'] as const;

async function serveProgressPage(
  assets: Fetcher,
  request: Request,
  assetPath: string,
): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = assetPath;
  url.search = '';
  const response = await serveStaticAsset(assets, new Request(url, request));
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

/**
 * D-040: the owner's public build progress page, static files generated
 * from `docs/`, served as they are, with their own access class. Given only
 * the static assets, never the database, and not indexed. D-047: where
 * `showAtRoot` is on (the preview only), the root answers with the English
 * page, which links to the Arabic one and to the portal at `/portal`.
 */
export function registerProgressPageRoute(
  app: Hono,
  assets: Fetcher,
  options: { showAtRoot: boolean },
): void {
  const routes: [string, string][] = PROGRESS_PAGE_PATHS.map((path) => [path, path]);
  if (options.showAtRoot) routes.push(['/', PROGRESS_PAGE_PATHS[0]]);
  for (const [path, assetPath] of routes) {
    registerRoute({ method: 'GET', path, access: { kind: 'public-progress-page' } });
    app.get(path, (c) => serveProgressPage(assets, c.req.raw, assetPath));
  }
}
