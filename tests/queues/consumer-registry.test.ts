import { beforeEach, describe, expect, it } from 'vitest';
import {
  getQueueConsumerHandler,
  registerQueueConsumer,
  resetQueueConsumerRegistryForTests,
} from '../../src/worker/queues';

describe('consumer-registry', () => {
  beforeEach(() => {
    resetQueueConsumerRegistryForTests();
  });

  it('registers a consumer and returns its handler by queue name', () => {
    const handler = () => Promise.resolve();
    registerQueueConsumer('test-queue', handler);

    expect(getQueueConsumerHandler('test-queue')).toBe(handler);
  });

  it('returns undefined for a queue name nothing registered', () => {
    expect(getQueueConsumerHandler('test-nothing')).toBeUndefined();
  });

  it('throws registering the same queue name twice', () => {
    registerQueueConsumer('test-queue', () => Promise.resolve());

    expect(() => {
      registerQueueConsumer('test-queue', () => Promise.resolve());
    }).toThrow('Queue consumer already registered: test-queue');
  });
});
