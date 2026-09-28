import { describe, expect, it } from 'vitest';
import { limitRequest } from '../../../src/worker/core/rate-limits';

const limiter = (success: boolean) =>
  ({ limit: () => Promise.resolve({ success }) }) as unknown as RateLimit;

describe('rate limits (brief 12; D-217, O-163)', () => {
  it('lets a request through under the limit, and where no limiter is bound', async () => {
    await expect(limitRequest(limiter(true), 'officer')).resolves.toBeUndefined();
    await expect(limitRequest(undefined, 'officer')).resolves.toBeUndefined();
  });

  it('refuses one over the limit with 429', async () => {
    await expect(limitRequest(limiter(false), 'officer')).rejects.toMatchObject({
      status: 429,
      code: 'rate-limit.too-many',
    });
  });
});
