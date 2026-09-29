import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../../src/web/app/api/api-error';
import { shouldRetryQuery } from '../../../../src/web/app/api/should-retry-query';

// T-163: a refusal is shown at once, never asked again; a failure that may
// pass is tried again, as TanStack Query does by default.
describe('which failed reads are tried again (T-163)', () => {
  it('never repeats a refusal', () => {
    for (const status of [400, 401, 403, 404, 409, 429])
      expect(shouldRetryQuery(0, new ApiError(status, 'permission.denied'))).toBe(false);
  });

  it('tries a server error or a network failure again, three times at most', () => {
    for (const error of [
      new ApiError(500, 'server.error'),
      new ApiError(503, 'x'),
      new TypeError('fetch'),
    ]) {
      expect(shouldRetryQuery(0, error)).toBe(true);
      expect(shouldRetryQuery(2, error)).toBe(true);
      expect(shouldRetryQuery(3, error)).toBe(false);
    }
  });
});
