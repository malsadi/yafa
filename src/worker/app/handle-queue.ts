import { dispatchQueueBatch } from '../queues';

/**
 * Maps the batch's queue to its consumer through `vars.QUEUE_CONSUMERS`
 * (a batch carries only its queue's name, which differs per environment),
 * then hands it over. A queue with no mapped consumer is a wiring error.
 */
export async function handleQueue(batch: MessageBatch, env: Env): Promise<void> {
  const consumers: Record<string, string | undefined> = env.QUEUE_CONSUMERS;
  const name = consumers[batch.queue];
  if (!name) throw new Error(`No consumer is mapped to queue: ${batch.queue}`);
  await dispatchQueueBatch(name, batch, env);
}
