import { buildInPortalNotificationStatement } from '../../../core/notifications';
import { peopleReceiving } from './alert-choices.service';
import type { AlertPlan } from './alert-plan';
import type {
  HubAlertEvent,
  NotificationsQueue,
  NotificationsQueueMessage,
} from './hub-alert-events';
import { phoneAlertWords } from './phone-alert-words';
import { planAlert } from './plan-alert';

// Cloudflare Queues takes at most 100 messages in one sendBatch call.
const SEND_BATCH_LIMIT = 100;

/** Those alerted who chose this type of alert — or all of them, for a national circular (20 C2). */
async function receivers(db: D1Database, plan: AlertPlan): Promise<AlertPlan['recipients']> {
  const kept = new Set<string>();
  for (const type of new Set(plan.recipients.map((r) => r.alertType))) {
    const ids = plan.recipients.filter((r) => r.alertType === type).map((r) => r.personId);
    for (const id of await peopleReceiving(db, ids, type)) kept.add(`${type}:${id}`);
  }
  return plan.recipients.filter((r) => kept.has(`${r.alertType}:${r.personId}`));
}

async function devicesOf(db: D1Database, personIds: string[]) {
  if (personIds.length === 0) return [];
  const { results } = await db
    .prepare(
      `SELECT s.id, s.person_id AS personId, p.language FROM push_subscriptions s JOIN people p ON p.id = s.person_id
       WHERE s.person_id IN (${personIds.map(() => '?').join(', ')})`,
    )
    .bind(...personIds)
    .all<{ id: string; personId: string; language: 'en' | 'ar' | null }>();
  return results;
}

/**
 * Brief 20 C1, 9.5 and 10.1: one event fanned out — an in-portal
 * notification for everyone who receives it (written once, however often
 * the message is retried), then one phone alert per device of theirs.
 */
export async function deliverAlert(
  db: D1Database,
  queue: NotificationsQueue,
  params: { eventId: string; event: HubAlertEvent },
): Promise<void> {
  const plan = await planAlert(db, params.event);
  if (!plan) return;
  const alerted = await receivers(db, plan);
  if (alerted.length === 0) return;
  await db.batch(
    alerted.map((r) =>
      buildInPortalNotificationStatement(db, {
        id: `${params.eventId}:${r.personId}`,
        personId: r.personId,
        kind: r.kind,
        params: plan.params,
      }),
    ),
  );
  const messages: { body: NotificationsQueueMessage }[] = (
    await devicesOf(
      db,
      alerted.map((r) => r.personId),
    )
  ).map((device) => {
    const r = alerted.find((one) => one.personId === device.personId);
    const kind = r?.kind ?? 'communication-hub.notice';
    return {
      body: {
        type: 'push',
        subscriptionId: device.id,
        personId: device.personId,
        alertType: r?.alertType ?? 'notices',
        payload: phoneAlertWords({ kind, plan, language: device.language }),
      },
    };
  });
  for (let i = 0; i < messages.length; i += SEND_BATCH_LIMIT)
    await queue.sendBatch(messages.slice(i, i + SEND_BATCH_LIMIT));
}
