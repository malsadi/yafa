import type { PushPayload } from './hub-alert-events';
import {
  buildPushRequest,
  buildRemovePushSubscriptionStatement,
  classifyPushResponseStatus,
} from '../../../core/push';
import { generateId } from '../../../core/ids';
import { getSetting } from '../../../core/settings';

// D-033: how long a push service holds an alert for a phone that is off —
// a technical detail left to the consumer, long enough to outlast the
// Queue's retries.
const PUSH_TTL_SECONDS = 24 * 60 * 60;

export type PushStep = 'done' | 'retry';

interface Keys {
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

interface Device {
  endpoint: string;
  p256dh: string;
  auth: string;
  expirationTime: number | null;
}

async function findDevice(db: D1Database, id: string): Promise<Device | null> {
  return db
    .prepare(
      'SELECT endpoint, p256dh, auth, expiration_time AS expirationTime FROM push_subscriptions WHERE id = ?',
    )
    .bind(id)
    .first<Device>();
}

/** Sends the alert, encrypted for the device and signed with the portal's keys; returns the push service's status. */
async function send(device: Device, payload: PushPayload, keys: Required<Keys>): Promise<number> {
  const request = await buildPushRequest(
    {
      endpoint: device.endpoint,
      expirationTime: device.expirationTime,
      keys: { p256dh: device.p256dh, auth: device.auth },
    },
    { data: { ...payload } },
    {
      subject: keys.VAPID_SUBJECT,
      publicKey: keys.VAPID_PUBLIC_KEY,
      privateKey: keys.VAPID_PRIVATE_KEY,
    },
    PUSH_TTL_SECONDS,
  );
  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  return response.status;
}

const configured = (keys: Keys): keys is Required<Keys> =>
  Boolean(keys.VAPID_PUBLIC_KEY && keys.VAPID_PRIVATE_KEY && keys.VAPID_SUBJECT);

/**
 * Brief 9.5, D-033 and D-164: one phone alert to one device. Delivered, it
 * is done; a device the push service reports gone is removed at once; any
 * other failure is tried again, until the administrator's maximum attempts
 * — read against the queue's own count — then kept for the health screen.
 * With no maximum set, or no push keys, it waits (rule 5).
 */
export async function deliverPush(
  db: D1Database,
  keys: Keys,
  params: {
    subscriptionId: string;
    personId: string;
    alertType: string;
    payload: PushPayload;
    attempts: number;
  },
): Promise<PushStep> {
  const max = await getSetting<number>(db, 'communication-hub.push_max_attempts');
  if (max.status !== 'configured' || !configured(keys)) return 'retry';
  const device = await findDevice(db, params.subscriptionId);
  if (!device) return 'done';
  const status = await send(device, params.payload, keys);
  const outcome = classifyPushResponseStatus(status);
  if (outcome === 'delivered') return 'done';
  if (outcome === 'gone') {
    await db.batch([buildRemovePushSubscriptionStatement(db, params.subscriptionId)]);
    return 'done';
  }
  if (params.attempts < max.value) return 'retry';
  await db.batch([
    db
      .prepare(
        'INSERT INTO push_delivery_failures (id, person_id, alert_kind, last_status, failed_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(
        generateId(),
        params.personId,
        params.alertType,
        String(status),
        new Date().toISOString(),
      ),
  ]);
  return 'done';
}
