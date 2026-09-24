import { parsePublishableKey } from '@clerk/shared/keys';
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

// T-071: every worker test runs with the fictional Clerk values set in
// vitest.worker.config.ts, never real keys — so local runs match CI, where
// no .dev.vars exists. Compared as booleans so a failure never prints a
// real secret into the test output.
describe('worker test secrets', () => {
  it('are the fictional values, whatever .dev.vars holds', () => {
    const publishable = parsePublishableKey(env.CLERK_PUBLISHABLE_KEY);

    expect(env.CLERK_SECRET_KEY === 'sk_test_fictional_not_a_real_key').toBe(true);
    expect(env.CLERK_WEBHOOK_SIGNING_SECRET === 'whsec_fictional_not_a_real_secret').toBe(true);
    expect(publishable?.instanceType === 'development').toBe(true);
    expect(publishable?.frontendApi === 'fictional-test-instance.clerk.accounts.dev').toBe(true);
  });
});
