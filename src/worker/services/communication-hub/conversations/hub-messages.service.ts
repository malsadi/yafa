import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { findMessage } from './hub-messages.repo';

/** D-161: the author removes their own message — a "removed" mark stays; nothing is deleted. */
export async function removeMessage(
  db: D1Database,
  ctx: RequestContext,
  messageId: string,
): Promise<void> {
  const message = await findMessage(db, messageId);
  if (!message) throw new NotFoundError('communication-hub.message-not-found');
  if (message.authorPersonId !== ctx.personId)
    throw new ForbiddenError('communication-hub.author-only');
  if (message.removedAt !== null) throw new ConflictError('communication-hub.already-removed');
  await db.batch([
    db
      .prepare('UPDATE hub_messages SET removed_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), messageId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'hub-message.removed',
      entityType: 'hub-message',
      entityId: messageId,
    }),
  ]);
}
