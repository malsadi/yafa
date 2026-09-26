import type { HubMessage } from '../../../../shared/communication-hub/conversation-records';
import { generateId } from '../../../core/ids';

export type ConversationKind = 'role-network' | 'discussion' | 'request';

const CURRENT_UNITS = (column: 'name_en' | 'name_ar') =>
  `(SELECT group_concat(u.${column}, ', ') FROM units u WHERE u.id IN (
     SELECT t.unit_id FROM terms t WHERE t.person_id = m.author_person_id
       AND t.start_date <= ?1 AND (t.end_date IS NULL OR t.end_date > ?1)))`;

/**
 * Brief 20 B1 to B3 and D-161: a conversation's messages, oldest first —
 * a removed one without its text — each with its author's units now, or
 * the branch a request's reply was written for.
 */
export async function listMessages(
  db: D1Database,
  params: { kind: ConversationKind; conversationId: string; personId: string; today: string },
): Promise<HubMessage[]> {
  const { results } = await db
    .prepare(
      `SELECT m.id, p.name AS authorName,
         COALESCE((SELECT name_en FROM units WHERE id = m.author_unit_id), ${CURRENT_UNITS('name_en')}) AS authorUnitsEn,
         COALESCE((SELECT name_ar FROM units WHERE id = m.author_unit_id), ${CURRENT_UNITS('name_ar')}) AS authorUnitsAr,
         CASE WHEN m.removed_at IS NULL THEN m.body END AS body, m.sent_at AS sentAt,
         m.removed_at IS NOT NULL AS removed, m.author_person_id = ?2 AS mine
       FROM hub_messages m JOIN people p ON p.id = m.author_person_id
       WHERE m.conversation_kind = ?3 AND m.conversation_id = ?4
       ORDER BY m.sent_at, m.id`,
    )
    .bind(params.today, params.personId, params.kind, params.conversationId)
    .all<Omit<HubMessage, 'removed' | 'mine'> & { removed: number; mine: number }>();
  return results.map((row) => ({ ...row, removed: Boolean(row.removed), mine: Boolean(row.mine) }));
}

export function buildInsertMessageStatement(
  db: D1Database,
  message: {
    kind: ConversationKind;
    conversationId: string;
    authorPersonId: string;
    authorUnitId?: string;
    body: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO hub_messages (id, conversation_kind, conversation_id, author_person_id, author_unit_id, body, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      generateId(),
      message.kind,
      message.conversationId,
      message.authorPersonId,
      message.authorUnitId ?? null,
      message.body,
      message.at,
    );
}

export async function findMessage(
  db: D1Database,
  id: string,
): Promise<{ authorPersonId: string; removedAt: string | null } | null> {
  return db
    .prepare(
      'SELECT author_person_id AS authorPersonId, removed_at AS removedAt FROM hub_messages WHERE id = ?',
    )
    .bind(id)
    .first();
}
