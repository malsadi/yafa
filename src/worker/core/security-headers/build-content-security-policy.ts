/**
 * The portal's Content-Security-Policy (brief section 12: "own origin plus
 * Clerk's domains only"). Every relaxation beyond `'self'` is one Clerk's
 * own CSP guide documents as required (fetched 2026-09-22 from
 * https://clerk.com/docs/guides/secure/best-practices/csp-headers — T-006's
 * first pass had only part of this list): the Frontend API host, Cloudflare's
 * bot-protection challenge host, and Clerk's fraud-protection hosts. Plus
 * `frame-ancestors 'none'`, which is this portal's own requirement, not
 * Clerk's — never embedded in a frame anywhere.
 */
export function buildContentSecurityPolicy(clerkFrontendApiHost: string): string {
  const fapi = `https://${clerkFrontendApiHost}`;
  const directives = [
    `default-src 'self'`,
    `script-src 'self' ${fapi} https://challenges.cloudflare.com https://*.protect.clerk.com`,
    `connect-src 'self' ${fapi} https://*.protect.clerk.com:*`,
    `img-src 'self' https://img.clerk.com`,
    `worker-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline'`,
    `frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];
  return directives.join('; ');
}
