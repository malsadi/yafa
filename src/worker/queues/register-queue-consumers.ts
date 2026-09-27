import { hasQueueConsumers } from './consumer-registry';
import { registerNotificationsConsumer } from './notifications';

/**
 * Every Queue consumer built so far (brief 10); each phase adds its own.
 * T-150: a second call, as Vite's dev server can make, does nothing.
 */
export function registerQueueConsumers(): void {
  if (hasQueueConsumers()) return;
  registerNotificationsConsumer();
}
