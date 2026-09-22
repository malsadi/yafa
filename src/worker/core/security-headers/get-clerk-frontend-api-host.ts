import { parsePublishableKey } from '@clerk/shared/keys';

/**
 * The Clerk Frontend API host, derived from the publishable key at runtime
 * (T-006): no instance-specific host is written in the code. `@clerk/backend`'s
 * own `fapiUrlFromPublishableKey` is deliberately not used here — it's built
 * for Clerk's *proxy* feature and returns one of three generic constants
 * (`frontend-api.clerk.dev` and similar), not the actual per-instance host
 * the Clerk JS SDK talks to directly when nothing is proxied, which is what
 * the CSP needs to allowlist.
 */
export function getClerkFrontendApiHost(publishableKey: string): string {
  const parsed = parsePublishableKey(publishableKey, { fatal: true });
  return parsed.frontendApi;
}
