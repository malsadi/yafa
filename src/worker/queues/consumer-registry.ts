export type QueueConsumerHandler = (batch: MessageBatch, env: Env) => Promise<void>;

const handlers = new Map<string, QueueConsumerHandler>();

/**
 * Registers one queue's consumer by queue name (brief section 10:
 * notification fan-out, heavy PDF jobs). Empty in Phase 0 (T-016) — each
 * consumer file (`src/worker/queues/<queue>.ts`) registers itself in the
 * phase that owns it. Exactly one consumer per queue, matching how a
 * Cloudflare Queue only ever has one consumer Worker attached.
 */
export function registerQueueConsumer(queueName: string, handler: QueueConsumerHandler): void {
  if (handlers.has(queueName)) {
    throw new Error(`Queue consumer already registered: ${queueName}`);
  }
  handlers.set(queueName, handler);
}

export function getQueueConsumerHandler(queueName: string): QueueConsumerHandler | undefined {
  return handlers.get(queueName);
}

/** Test-only: keeps one test file's registrations from leaking into another. */
export function resetQueueConsumerRegistryForTests(): void {
  handlers.clear();
}
