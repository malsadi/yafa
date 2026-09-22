import { buildPublishableKey } from '@clerk/shared/keys';
import { describe, expect, it } from 'vitest';
import { getClerkFrontendApiHost } from '../../../src/worker/core/security-headers';

describe('getClerkFrontendApiHost', () => {
  it('decodes the real per-instance Frontend API host from a fixture key', () => {
    const fixtureHost = 'excited-mule-42.clerk.accounts.dev';
    const fixtureKey = buildPublishableKey(fixtureHost);

    expect(getClerkFrontendApiHost(fixtureKey)).toBe(fixtureHost);
  });

  it('throws on a malformed key rather than silently returning an unusable host', () => {
    expect(() => getClerkFrontendApiHost('not-a-real-key')).toThrow();
  });
});
