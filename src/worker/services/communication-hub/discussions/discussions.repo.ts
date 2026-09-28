import type {
  DiscussionInvitee,
  DiscussionSummary,
} from '../../../../shared/communication-hub/conversation-records';

/** Whether the person is in the discussion now — invited and not removed or left (D-168). */
export async function findMembership(
  db: D1Database,
  discussionId: string,
  personId: string,
): Promise<{ startedBy: string } | null> {
  return db
    .prepare(
      `SELECT d.started_by AS startedBy FROM discussion_members m JOIN discussions d ON d.id = m.discussion_id
       WHERE m.discussion_id = ? AND m.person_id = ? AND m.left_at IS NULL`,
    )
    .bind(discussionId, personId)
    .first();
}

/** New members, and — D-168 — anyone who was removed or left, invited back; those already in are left alone. */
export function buildMemberStatements(
  db: D1Database,
  params: { discussionId: string; personIds: string[]; invitedBy: string; at: string },
): D1PreparedStatement[] {
  return params.personIds.map((personId) =>
    db
      .prepare(
        `INSERT INTO discussion_members (discussion_id, person_id, invited_by, invited_at) VALUES (?, ?, ?, ?)
         ON CONFLICT (discussion_id, person_id) DO UPDATE SET left_at = NULL,
           invited_by = excluded.invited_by, invited_at = excluded.invited_at
         WHERE discussion_members.left_at IS NOT NULL`,
      )
      .bind(params.discussionId, personId, params.invitedBy, params.at),
  );
}

/** Brief 20 B2: the discussions the person was invited to, newest first, with who is in each. */
export const discussionsQuery = (personId: string) => ({
  sql: `SELECT d.id, d.subject, p.name AS startedByName, d.started_at AS startedAt, d.started_by = ?1 AS startedByMe,
         (SELECT json_group_array(json_object('personId', q.id, 'name', q.name))
            FROM discussion_members x JOIN people q ON q.id = x.person_id
            WHERE x.discussion_id = d.id AND x.left_at IS NULL) AS members
       FROM discussions d JOIN discussion_members m ON m.discussion_id = d.id AND m.person_id = ?1 AND m.left_at IS NULL
       JOIN people p ON p.id = d.started_by
       ORDER BY d.started_at DESC, d.id DESC`,
  binds: [personId],
});

export type DiscussionRow = Omit<DiscussionSummary, 'members' | 'startedByMe'> & {
  members: string;
  startedByMe: number;
};

/** A discussion row with who is in it, by name. */
export function discussionOf(row: DiscussionRow): DiscussionSummary {
  return {
    ...row,
    startedByMe: Boolean(row.startedByMe),
    members: (JSON.parse(row.members) as DiscussionSummary['members']).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}

/** D-159: every current officer of any unit, with their units, to be invited. */
export async function listCurrentOfficers(
  db: D1Database,
  today: string,
): Promise<DiscussionInvitee[]> {
  const { results } = await db
    .prepare(
      `SELECT p.id AS personId, p.name, group_concat(DISTINCT u.name_en) AS unitsEn,
         group_concat(DISTINCT u.name_ar) AS unitsAr
       FROM terms t JOIN people p ON p.id = t.person_id JOIN units u ON u.id = t.unit_id
       WHERE t.start_date <= ? AND (t.end_date IS NULL OR t.end_date > ?)
       GROUP BY p.id, p.name ORDER BY p.name`,
    )
    .bind(today, today)
    .all<DiscussionInvitee>();
  return results;
}
