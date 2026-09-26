import type { PushSetup } from '../../../../shared/communication-hub/push-setup';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { findAdminText } from '../../administration-panel';
import { requireHubSomewhere } from '../conversations/conversation-access';
import type { SubscriptionInput } from './push.schema';

/** Brief 20 C1, 15 C4 and D-086: the public key a device subscribes with, and the iPhone install guide. */
export async function pushSetup(
  db: D1Database,
  ctx: RequestContext,
  publicKey: string | undefined,
): Promise<PushSetup> {
  await requireHubSomewhere(db, ctx);
  const guide = await findAdminText(db, 'iphone-install-guide');
  return {
    publicKey: publicKey ?? null,
    installGuide: guide ? { textEn: guide.textEn, textAr: guide.textAr } : null,
  };
}

/** Brief 9.5: this device receives the officer's phone alerts; a device registered again is the latest officer's. */
export async function subscribeDevice(
  db: D1Database,
  ctx: RequestContext,
  device: SubscriptionInput,
): Promise<void> {
  await requireHubSomewhere(db, ctx);
  await db
    .prepare(
      `INSERT INTO push_subscriptions (id, person_id, endpoint, p256dh, auth, expiration_time, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (endpoint) DO UPDATE SET person_id = excluded.person_id, p256dh = excluded.p256dh,
         auth = excluded.auth, expiration_time = excluded.expiration_time`,
    )
    .bind(
      generateId(),
      ctx.personId,
      device.endpoint,
      device.keys.p256dh,
      device.keys.auth,
      device.expirationTime,
      new Date().toISOString(),
    )
    .run();
}

/** The officer stops phone alerts on this device (a device registration, not a record). */
export async function unsubscribeDevice(
  db: D1Database,
  ctx: RequestContext,
  endpoint: string,
): Promise<void> {
  await db
    .prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND person_id = ?')
    .bind(endpoint, ctx.personId)
    .run();
}
