import type { MiddlewareHandler } from 'hono';
import { ForbiddenError } from '../errors';

/**
 * T-013: "API accepts requests only from the portal's origin" — done
 * without CORS headers. Any request whose `Origin` header differs from the
 * request URL's own origin is rejected; a request with no `Origin` header
 * at all (server-to-server calls, such as Clerk's signed webhook, never
 * send a browser-style `Origin`) passes through, since there is nothing to
 * compare. Only for routes that expect a browser-origin caller — never
 * applied to `signed-webhook` routes.
 */
export const requireSameOrigin: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('Origin');
  if (origin && origin !== new URL(c.req.url).origin) {
    throw new ForbiddenError('request.origin-mismatch');
  }
  await next();
};
