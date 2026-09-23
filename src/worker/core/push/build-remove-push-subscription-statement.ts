/**
 * Brief section 9.5: "expired subscriptions are removed." `db.batch()`-
 * composable, same shape as `buildInPortalNotificationStatement` — the
 * caller (Phase 7's Queue consumer) adds this to its own batch once
 * `classifyPushResponseStatus` reports `'gone'`.
 */
export function buildRemovePushSubscriptionStatement(
  db: D1Database,
  subscriptionId: string,
): D1PreparedStatement {
  return db.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(subscriptionId);
}
