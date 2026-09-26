import {
  deliverAlert,
  deliverPush,
  type NotificationsQueue,
  type NotificationsQueueMessage,
} from '../services/communication-hub';
import { registerQueueConsumer } from './consumer-registry';

export const NOTIFICATIONS_CONSUMER = 'notifications';

/**
 * Brief 9.5 and 10.1: the notifications Queue — an event fanned out to
 * in-portal notifications and one message per phone, then each phone
 * alert delivered, retried by the Queue itself (D-032, D-164). A message
 * that fails for any other reason is retried too.
 */
export function registerNotificationsConsumer(): void {
  registerQueueConsumer(NOTIFICATIONS_CONSUMER, async (batch, env) => {
    const queue = env.NOTIFICATIONS_QUEUE as NotificationsQueue;
    for (const message of (batch as MessageBatch<NotificationsQueueMessage>).messages) {
      try {
        const body = message.body;
        if (body.type === 'alert') {
          await deliverAlert(env.DB, queue, body);
          message.ack();
          continue;
        }
        const step = await deliverPush(env.DB, env, { ...body, attempts: message.attempts });
        if (step === 'done') message.ack();
        else message.retry();
      } catch {
        message.retry();
      }
    }
  });
}
