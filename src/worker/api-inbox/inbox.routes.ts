import type { Hono } from 'hono';
import type { InboxView } from '../../shared/core/inbox';
import {
  countUnreadNotificationsForPerson,
  notificationsQuery,
  type NotificationRow,
  markAllNotificationsRead,
  markNotificationRead,
} from '../core/notifications';
import { pageAsked, pagedQuery } from '../core/pagination';
import { registerRoute } from '../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../middleware';

const INBOX = '/api/notifications';
const OWN = { kind: 'signed-in-only' } as const;

/**
 * Brief 9.5 and D-031: an active officer's own in-portal notifications —
 * read or unread, the unread count, opening one marks it read, "mark all
 * as read"; nothing is deleted. Signed-in-only (D-004): every query is on
 * the caller's own person, so there is nothing to grant.
 */
export function registerInboxRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: `${INBOX}/unread-count`, access: OWN });
  registerRoute({ method: 'GET', path: INBOX, access: OWN });
  registerRoute({ method: 'POST', path: `${INBOX}/:notificationId/read`, access: OWN });
  registerRoute({ method: 'POST', path: `${INBOX}/read-all`, access: OWN });
  const active = requireActiveAccess(db, keys);
  app.get(`${INBOX}/unread-count`, active, async (c) =>
    c.json({
      unreadCount: await countUnreadNotificationsForPerson(db, c.get('requestContext').personId),
    }),
  );
  app.get(INBOX, active, async (c) => {
    const personId = c.get('requestContext').personId;
    const rows = await pagedQuery<NotificationRow>(
      db,
      notificationsQuery(personId),
      pageAsked(c.req.query('page')),
    );
    const view: InboxView = {
      items: rows.items.map((row) => ({
        id: row.id,
        kind: row.kind,
        params: row.paramsJson
          ? (JSON.parse(row.paramsJson) as Record<string, string | number>)
          : null,
        readAt: row.readAt,
        createdAt: row.createdAt,
      })),
      unreadCount: await countUnreadNotificationsForPerson(db, personId),
      page: rows.page,
      pageCount: rows.pageCount,
    };
    return c.json(view);
  });
  app.post(`${INBOX}/:notificationId/read`, active, async (c) => {
    await markNotificationRead(db, {
      notificationId: c.req.param('notificationId'),
      personId: c.get('requestContext').personId,
    });
    return c.body(null, 204);
  });
  app.post(`${INBOX}/read-all`, active, async (c) => {
    await markAllNotificationsRead(db, c.get('requestContext').personId);
    return c.body(null, 204);
  });
}
