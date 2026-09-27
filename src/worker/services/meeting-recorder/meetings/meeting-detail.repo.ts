import type {
  AgendaItemRecord,
  AttendeeRecord,
} from '../../../../shared/meeting-recorder/meeting-records';

/** Brief 22 A2: the meeting's attendees, by name, with how each was marked. */
export async function listAttendees(db: D1Database, meetingId: string): Promise<AttendeeRecord[]> {
  const { results } = await db
    .prepare(
      `SELECT a.person_id AS personId, p.name, a.attendance FROM meeting_attendees a
       LEFT JOIN people p ON p.id = a.person_id WHERE a.meeting_id = ? ORDER BY p.name, a.person_id`,
    )
    .bind(meetingId)
    .all<AttendeeRecord>();
  return results;
}

interface ItemRow extends Omit<AgendaItemRecord, 'comments' | 'raisedInMeeting'> {
  raisedInMeeting: number;
}

/** Brief 22 A3, B1, B2: the agenda in order, each item with its comments and its vote or decision. */
export async function listAgenda(db: D1Database, meetingId: string): Promise<AgendaItemRecord[]> {
  const [items, comments] = await db.batch([
    db
      .prepare(
        `SELECT id, position, title, note, raised_in_meeting AS raisedInMeeting, outcome_kind AS outcomeKind,
           votes_for AS votesFor, votes_against AS votesAgainst, votes_abstain AS votesAbstain,
           vote_result AS voteResult, decision, version
         FROM agenda_items WHERE meeting_id = ? ORDER BY position`,
      )
      .bind(meetingId),
    db
      .prepare(
        `SELECT c.item_id AS itemId, c.person_id AS personId, p.name, c.comment, c.version
         FROM agenda_comments c JOIN agenda_items i ON i.id = c.item_id LEFT JOIN people p ON p.id = c.person_id
         WHERE i.meeting_id = ? ORDER BY p.name`,
      )
      .bind(meetingId),
  ]);
  const byItem = new Map<string, AgendaItemRecord['comments']>();
  for (const c of (comments?.results ?? []) as (AgendaItemRecord['comments'][number] & {
    itemId: string;
  })[]) {
    const { itemId, ...comment } = c;
    byItem.set(itemId, [...(byItem.get(itemId) ?? []), comment]);
  }
  return ((items?.results ?? []) as ItemRow[]).map((item) => ({
    ...item,
    raisedInMeeting: item.raisedInMeeting === 1,
    comments: byItem.get(item.id) ?? [],
  }));
}

/** Brief 22 A2: attendees written for a meeting; the chair and secretary always among them (D-198). */
export function buildAttendeeStatements(
  db: D1Database,
  meetingId: string,
  personIds: string[],
): D1PreparedStatement[] {
  return [...new Set(personIds)].map((personId) =>
    db
      .prepare(
        'INSERT OR IGNORE INTO meeting_attendees (meeting_id, person_id, attendance) VALUES (?, ?, NULL)',
      )
      .bind(meetingId, personId),
  );
}
