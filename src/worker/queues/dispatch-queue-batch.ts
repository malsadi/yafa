import { getQueueConsumerHandler } from './consumer-registry';

/**
 * Resolves `queueName` to its registered consumer and runs it against the
 * batch. Unlike `dispatchScheduledJob`, nothing here records an outcome —
 * the brief only asks for last-run/outcome tracking for scheduled jobs
 * (section 11); queue backlog and failures for the health screen (15 D1)
 * read from Cloudflare's own Queue metrics, not a table this module writes.
 * `queueName` comes from `env.<BINDING>.queueName` or the consumer's own
 * `wrangler.jsonc` entry once `src/worker/index.ts` exists — not resolved
 * here, same reasoning as `dispatchScheduledJob`'s cron-expression mapping.
 */
export async function dispatchQueueBatch(
  queueName: string,
  batch: MessageBatch,
  env: Env,
): Promise<void> {
  const handler = getQueueConsumerHandler(queueName);
  if (!handler) {
    throw new Error(`Queue consumer is not registered: ${queueName}`);
  }
  await handler(batch, env);
}
