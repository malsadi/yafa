import type {
  DiscussionInvitee,
  DiscussionSummary,
  HubMessage,
} from '../../../../shared/communication-hub/conversation-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { requireHubCapability } from '../hub-access';
import { currentOfficersAmong, requireHubSomewhere } from '../conversations/conversation-access';
import { buildInsertMessageStatement, listMessages } from '../conversations/hub-messages.repo';
import {
  buildMemberStatements,
  findMembership,
  listCurrentOfficers,
  listDiscussionsOf,
} from './discussions.repo';
import type { DiscussionInput } from './discussions.schema';

export const START = 'communication-hub.discussions.start';

/** D-159: only current officers, of any unit, are invited. */
async function requireCurrentOfficers(db: D1Database, personIds: string[]): Promise<string[]> {
  const unique = [...new Set(personIds)];
  const found = await currentOfficersAmong(db, unique, getTodayInLondon());
  if (found.length !== unique.length)
    throw new ConflictError('communication-hub.not-a-current-officer');
  return unique;
}

/** Brief 20 B2 and D-159: start a discussion with its first message, inviting officers from any unit. */
export async function startDiscussion(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: DiscussionInput,
): Promise<{ id: string }> {
  await requireHubCapability(db, ctx, START, unitId);
  const invited = (await requireCurrentOfficers(db, input.personIds)).filter(
    (id) => id !== ctx.personId,
  );
  const id = generateId();
  const at = new Date().toISOString();
  await db.batch([
    db
      .prepare('INSERT INTO discussions (id, subject, started_by, started_at) VALUES (?, ?, ?, ?)')
      .bind(id, input.subject, ctx.personId, at),
    ...buildMemberStatements(db, {
      discussionId: id,
      personIds: [ctx.personId, ...invited],
      invitedBy: ctx.personId,
      at,
    }),
    buildInsertMessageStatement(db, {
      kind: 'discussion',
      conversationId: id,
      authorPersonId: ctx.personId,
      body: input.body,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'discussion.started',
      entityType: 'discussion',
      entityId: id,
      after: { subject: input.subject, invited },
    }),
  ]);
  return { id };
}

/** A member of the discussion, where the hub is on in one of their units. */
async function requireMember(db: D1Database, ctx: RequestContext, discussionId: string) {
  await requireHubSomewhere(db, ctx);
  const membership = await findMembership(db, discussionId, ctx.personId);
  if (!membership) throw new NotFoundError('communication-hub.discussion-not-found');
  return membership;
}

/** D-159: the starter invites more officers later; each sees the whole discussion. */
export async function inviteToDiscussion(
  db: D1Database,
  ctx: RequestContext,
  params: { discussionId: string; personIds: string[] },
): Promise<void> {
  const membership = await requireMember(db, ctx, params.discussionId);
  if (membership.startedBy !== ctx.personId)
    throw new ForbiddenError('communication-hub.starter-only');
  const invited = await requireCurrentOfficers(db, params.personIds);
  const at = new Date().toISOString();
  await db.batch([
    ...buildMemberStatements(db, {
      discussionId: params.discussionId,
      personIds: invited,
      invitedBy: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'discussion.invited',
      entityType: 'discussion',
      entityId: params.discussionId,
      after: { invited },
    }),
  ]);
}

export async function myDiscussions(
  db: D1Database,
  ctx: RequestContext,
): Promise<DiscussionSummary[]> {
  await requireHubSomewhere(db, ctx);
  return listDiscussionsOf(db, ctx.personId);
}

/** D-159: the whole discussion, earlier messages included, for every member. */
export async function discussionMessages(
  db: D1Database,
  ctx: RequestContext,
  discussionId: string,
): Promise<HubMessage[]> {
  await requireMember(db, ctx, discussionId);
  const today = getTodayInLondon();
  return listMessages(db, {
    kind: 'discussion',
    conversationId: discussionId,
    personId: ctx.personId,
    today,
  });
}

export async function postDiscussionMessage(
  db: D1Database,
  ctx: RequestContext,
  params: { discussionId: string; body: string },
): Promise<void> {
  await requireMember(db, ctx, params.discussionId);
  await db.batch([
    buildInsertMessageStatement(db, {
      kind: 'discussion',
      conversationId: params.discussionId,
      authorPersonId: ctx.personId,
      body: params.body,
      at: new Date().toISOString(),
    }),
  ]);
}

/** D-159: who can be invited — every current officer of any unit — for those who start discussions. */
export async function discussionInvitees(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<DiscussionInvitee[]> {
  await requireHubCapability(db, ctx, START, unitId);
  return listCurrentOfficers(db, getTodayInLondon());
}
