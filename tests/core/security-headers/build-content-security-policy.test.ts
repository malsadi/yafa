import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy } from '../../../src/worker/core/security-headers';

const FAPI_HOST = 'excited-mule-42.clerk.accounts.dev';

describe('buildContentSecurityPolicy', () => {
  const csp = buildContentSecurityPolicy(FAPI_HOST, { viteDevServer: false });

  it('restricts default-src to self', () => {
    expect(csp).toContain(`default-src 'self'`);
  });

  it('allows the Clerk Frontend API host, Cloudflare bot protection and Clerk fraud protection for scripts', () => {
    expect(csp).toContain(
      `script-src 'self' https://${FAPI_HOST} https://challenges.cloudflare.com https://*.protect.clerk.com`,
    );
  });

  it('allows the Frontend API host and fraud-protection hosts (with their non-standard ports) for connections', () => {
    expect(csp).toContain(`connect-src 'self' https://${FAPI_HOST} https://*.protect.clerk.com:*`);
  });

  it('allows img.clerk.com for images, and nothing else beyond self', () => {
    expect(csp).toContain(`img-src 'self' https://img.clerk.com`);
  });

  it('never embeds the portal in a frame', () => {
    expect(csp).toContain(`frame-ancestors 'none'`);
  });

  it('does not relax any directive to a host not named in T-006/the Clerk CSP guide', () => {
    const allowedHosts = [
      FAPI_HOST,
      'challenges.cloudflare.com',
      '*.protect.clerk.com',
      'img.clerk.com',
    ];
    const hostPattern = /https:\/\/([a-z0-9.*-]+)/g;
    const foundHosts = [...csp.matchAll(hostPattern)]
      .map((match) => match[1])
      .filter((host): host is string => host !== undefined);

    expect(foundHosts.length).toBeGreaterThan(0);
    for (const host of foundHosts) {
      expect(allowedHosts).toContain(host.replace(/:\*$/, ''));
    }
  });

  it('allows inline scripts only under the Vite dev server, never in a build (T-069)', () => {
    const scriptSrc = (policy: string) =>
      policy.split('; ').find((directive) => directive.startsWith('script-src'));
    const devCsp = buildContentSecurityPolicy(FAPI_HOST, { viteDevServer: true });

    expect(scriptSrc(csp)).not.toContain(`'unsafe-inline'`);
    expect(scriptSrc(devCsp)).toContain(`'unsafe-inline'`);
    expect(devCsp.replace(` 'unsafe-inline'`, '')).toBe(csp);
  });
});
