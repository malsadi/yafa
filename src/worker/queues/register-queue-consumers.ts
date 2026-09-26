import { registerNotificationsConsumer } from './notifications';

/** Every Queue consumer built so far (brief 10); each phase adds its own. */
export function registerQueueConsumers(): void {
  registerNotificationsConsumer();
}
