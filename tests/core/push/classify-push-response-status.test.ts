import { describe, expect, it } from 'vitest';
import { classifyPushResponseStatus } from '../../../src/worker/core/push';

describe('classifyPushResponseStatus', () => {
  it.each([200, 201, 202, 299])('treats %i as delivered', (status) => {
    expect(classifyPushResponseStatus(status)).toBe('delivered');
  });

  it.each([404, 410])('treats %i as gone, per RFC 8030 §7.3', (status) => {
    expect(classifyPushResponseStatus(status)).toBe('gone');
  });

  it.each([400, 401, 429, 500, 503])('treats %i as retryable, not gone', (status) => {
    expect(classifyPushResponseStatus(status)).toBe('retry');
  });
});
