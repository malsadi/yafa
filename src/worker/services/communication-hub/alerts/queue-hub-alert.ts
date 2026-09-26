import { generateId } from '../../../core/ids';
import type { HubAlertEvent, NotificationsQueue } from './hub-alert-events';

/**
 * Brief 10.1: after its batch, a service queues the event; the consumer
 * works out who is alerted, in the portal and on their phones. Exported
 * for the Event organiser and Meeting recorder's automatic posts too.
 */
export async function queueHubAlert(
  queue: NotificationsQueue,
  event: HubAlertEvent,
): Promise<void> {
  await queue.send({ type: 'alert', eventId: generateId(), event });
}

/** A new message in a conversation — a reply (20 C1) — for everyone else in it. */
export async function queueReplyAlert(
  queue: NotificationsQueue,
  reply: {
    conversation: 'role-network' | 'discussion' | 'request';
    conversationId: string;
    authorPersonId: string;
  },
): Promise<void> {
  await queueHubAlert(queue, { kind: 'reply', ...reply });
}
