import type { FeedTokenStatus } from '../../../../shared/calendar/feed-path';
import { buildAuditStatement } from '../../../core/audit';
import type { RequestContext } from '../../../core/permissions';
import { hashFeedToken, newFeedToken } from './feed-token-hash';
import {
  buildRevokeFeedTokenStatement,
  buildSetFeedTokenStatement,
  feedTokenCreatedAt,
} from './feed-tokens.repo';

/** Brief 6.4: whether the officer has a feed token, and since when. */
export async function myFeedTokenStatus(
  db: D1Database,
  ctx: RequestContext,
): Promise<FeedTokenStatus> {
  return { createdAt: await feedTokenCreatedAt(db, ctx.personId) };
}

/**
 * Brief 6.4 and 19 C1: a new feed token for the officer — shown to them
 * once, stored only hashed; any old one stops working. Recorded in the
 * audit log without the token.
 */
export async function regenerateMyFeedToken(
  db: D1Database,
  ctx: RequestContext,
): Promise<{ token: string }> {
  const token = newFeedToken();
  const at = new Date().toISOString();
  await db.batch([
    buildSetFeedTokenStatement(db, {
      personId: ctx.personId,
      tokenHash: await hashFeedToken(token),
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'calendar-feed.token-made',
      entityType: 'person',
      entityId: ctx.personId,
    }),
  ]);
  return { token };
}

/** Brief 6.4 and 25 A2: the statements that revoke an officer's feed token, for the caller's batch. */
export function revokeFeedToken(
  db: D1Database,
  params: { personId: string; actorPersonId: string },
): D1PreparedStatement[] {
  return [
    buildRevokeFeedTokenStatement(db, params.personId),
    buildAuditStatement(db, {
      actorPersonId: params.actorPersonId,
      action: 'calendar-feed.token-revoked',
      entityType: 'person',
      entityId: params.personId,
    }),
  ];
}
