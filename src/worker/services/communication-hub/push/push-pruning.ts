import { ServiceUnavailableError } from '../../../core/errors';
import { getSetting } from '../../../core/settings';

/**
 * Brief 11 (Push pruning), 9.5 and D-033, D-050: removes devices whose
 * subscriptions have expired, and undelivered alerts older than the
 * administrator's period. With that period not set, the expired devices
 * are still removed, and the job reports the setting missing (rule 5).
 */
export async function prunePush(db: D1Database, now: Date): Promise<void> {
  await db
    .prepare(
      'DELETE FROM push_subscriptions WHERE expiration_time IS NOT NULL AND expiration_time < ?',
    )
    .bind(now.getTime())
    .run();
  const days = await getSetting<number>(db, 'communication-hub.undelivered_alert_retention_days');
  if (days.status !== 'configured') throw new ServiceUnavailableError('setting.not-configured');
  const before = new Date(now.getTime() - days.value * 24 * 60 * 60 * 1000).toISOString();
  await db.prepare('DELETE FROM push_delivery_failures WHERE failed_at < ?').bind(before).run();
}
