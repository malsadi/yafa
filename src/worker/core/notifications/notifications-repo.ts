import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { notifications } from '../../../db/schema/core/notifications';

export interface NotificationRow {
  id: string;
  kind: string;
  paramsJson: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Always scoped to `personId` — an officer only ever reads their own inbox. */
export async function listNotificationsForPerson(
  db: D1Database,
  personId: string,
): Promise<NotificationRow[]> {
  const orm = drizzle(db);
  return orm
    .select({
      id: notifications.id,
      kind: notifications.kind,
      paramsJson: notifications.paramsJson,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.personId, personId))
    .orderBy(desc(notifications.createdAt));
}

/**
 * Marks one notification read — scoped to `personId` in the `WHERE`
 * clause itself, not checked afterwards, so one officer can never mark
 * (or even discover, via a distinguishable error) another officer's
 * notification.
 */
export async function markNotificationRead(
  db: D1Database,
  params: { notificationId: string; personId: string },
): Promise<void> {
  await db
    .prepare('UPDATE notifications SET read_at = ? WHERE id = ? AND person_id = ?')
    .bind(new Date().toISOString(), params.notificationId, params.personId)
    .run();
}
