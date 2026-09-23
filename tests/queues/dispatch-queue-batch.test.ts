import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  dispatchQueueBatch,
  registerQueueConsumer,
  resetQueueConsumerRegistryForTests,
} from '../../src/worker/queues';

function fixtureBatch(): MessageBatch {
  return {
    messages: [],
    queue: 'test-queue',
    metadata: { metrics: { backlogCount: 0, backlogBytes: 0 } },
    retryAll: () => undefined,
    ackAll: () => undefined,
  };
}

describe('dispatchQueueBatch', () => {
  beforeEach(() => {
    resetQueueConsumerRegistryForTests();
  });

  it('throws for an unregistered queue name', async () => {
    await expect(dispatchQueueBatch('test-unregistered', fixtureBatch(), env)).rejects.toThrow(
      'Queue consumer is not registered: test-unregistered',
    );
  });

  it('runs the registered handler with the batch and env', async () => {
    const batch = fixtureBatch();
    let received: { batch: MessageBatch; env: typeof env } | undefined;
    registerQueueConsumer('test-queue', (receivedBatch, receivedEnv) => {
      received = { batch: receivedBatch, env: receivedEnv as typeof env };
      return Promise.resolve();
    });

    await dispatchQueueBatch('test-queue', batch, env);

    expect(received?.batch).toBe(batch);
    expect(received?.env).toBe(env);
  });
});
