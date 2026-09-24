/**
 * The portal's Content-Security-Policy (brief section 12: "own origin plus
 * Clerk's domains only"). Every relaxation beyond `'self'` is one Clerk's
 * own CSP guide documents as required (fetched 2026-09-22 from
 * https://clerk.com/docs/guides/secure/best-practices/csp-headers — T-006's
 * first pass had only part of this list): the Frontend API host, Cloudflare's
 * bot-protection challenge host, and Clerk's fraud-protection hosts. Plus
 * `frame-ancestors 'none'`, which is this portal's own requirement, not
 * Clerk's — never embedded in a frame anywhere.
 *
 * `viteDevServer` (T-069): Vite's dev server injects an inline script (the
 * React refresh preamble) that a strict `script-src` blocks, leaving `npm
 * run dev` blank. Only then are inline scripts allowed; the caller passes
 * `import.meta.env.DEV`, which a production build replaces with `false`.
 */
export function buildContentSecurityPolicy(
  clerkFrontendApiHost: string,
  options: { viteDevServer: boolean },
): string {
  const fapi = `https://${clerkFrontendApiHost}`;
  const devInline = options.viteDevServer ? ` 'unsafe-inline'` : '';
  const directives = [
    `default-src 'self'`,
    `script-src 'self'${devInline} ${fapi} https://challenges.cloudflare.com https://*.protect.clerk.com`,
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
