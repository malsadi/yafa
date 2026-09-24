import type { MiddlewareHandler } from 'hono';
import { buildContentSecurityPolicy } from './build-content-security-policy';
import { getClerkFrontendApiHost } from './get-clerk-frontend-api-host';

// T-053: a strict-but-functional default (OWASP-recommended, and the
// current browser default) — brief section 12 says "strict referrer
// policy" without naming one.
const REFERRER_POLICY = 'strict-origin-when-cross-origin';
// Two years, applied to subdomains too — a common strict default; brief
// section 12 says "HSTS" without a max-age.
const HSTS_VALUE = 'max-age=63072000; includeSubDomains; preload';

/**
 * Security headers on every response (brief section 12): CSP, HSTS,
 * `X-Content-Type-Options: nosniff`, and a strict referrer policy. Built
 * once per Worker instance from the publishable key, not per request.
 */
export function securityHeaders(
  clerkPublishableKey: string,
  options: { viteDevServer: boolean },
): MiddlewareHandler {
  const csp = buildContentSecurityPolicy(getClerkFrontendApiHost(clerkPublishableKey), options);

  return async (c, next) => {
    await next();
    c.header('Content-Security-Policy', csp);
    c.header('Strict-Transport-Security', HSTS_VALUE);
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', REFERRER_POLICY);
  };
}
