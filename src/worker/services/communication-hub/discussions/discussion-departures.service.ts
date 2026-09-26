import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireHubSomewhere } from '../conversations/conversation-access';
import { findMembership } from './discussions.repo';

/**
 * D-168: someone leaves the discussion — removed by its starter, or of
 * their own accord. It is recorded for good, their messages stay, and
 * they no longer see it until invited back. The starter stays.
 */
async function depart(
  db: D1Database,
  ctx: RequestContext,
  params: { discussionId: string; personId: string; removedBy: string | null },
): Promise<void> {
  const membership = await findMembership(db, params.discussionId, params.personId);
  if (!membership) throw new NotFoundError('communication-hub.not-a-member');
  if (membership.startedBy === params.personId)
    throw new ConflictError('communication-hub.starter-stays');
  const at = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        'INSERT INTO discussion_departures (id, discussion_id, person_id, departed_at, removed_by) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(generateId(), params.discussionId, params.personId, at, params.removedBy),
    db
      .prepare(
        'UPDATE discussion_members SET left_at = ? WHERE discussion_id = ? AND person_id = ?',
      )
      .bind(at, params.discussionId, params.personId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: params.removedBy ? 'discussion.member-removed' : 'discussion.left',
      entityType: 'discussion',
      entityId: params.discussionId,
      after: { personId: params.personId },
    }),
  ]);
}

/** D-168: the starter removes a member. */
export async function removeMember(
  db: D1Database,
  ctx: RequestContext,
  params: { discussionId: string; personId: string },
): Promise<void> {
  await requireHubSomewhere(db, ctx);
  const own = await findMembership(db, params.discussionId, ctx.personId);
  if (!own) throw new NotFoundError('communication-hub.discussion-not-found');
  if (own.startedBy !== ctx.personId) throw new ForbiddenError('communication-hub.starter-only');
  await depart(db, ctx, { ...params, removedBy: ctx.personId });
}

/** D-168: a member leaves of their own accord. */
export async function leaveDiscussion(
  db: D1Database,
  ctx: RequestContext,
  discussionId: string,
): Promise<void> {
  await requireHubSomewhere(db, ctx);
  if (!(await findMembership(db, discussionId, ctx.personId)))
    throw new NotFoundError('communication-hub.discussion-not-found');
  await depart(db, ctx, { discussionId, personId: ctx.personId, removedBy: null });
}
