import type { AlertPlan } from './alert-plan';
import type { HubAlertEvent } from './hub-alert-events';

interface AlertDetails {
  params: AlertPlan['params'];
  unit: AlertPlan['unit'];
  /** The hub section the alert opens. */
  section: 'noticeboard' | 'circulars' | 'requests' | 'role-networks' | 'discussions';
}

interface Row {
  title: string;
  nameEn: string;
  nameAr: string;
}

const first = (db: D1Database, sql: string, id: string) => db.prepare(sql).bind(id).first<Row>();

const withUnit = (row: Row, section: AlertDetails['section']): AlertDetails => ({
  params: { title: row.title, unitEn: row.nameEn, unitAr: row.nameAr },
  unit: { nameEn: row.nameEn, nameAr: row.nameAr },
  section,
});

/** A reply's conversation: its subject, or its role's names (D-158). */
async function replyDetails(
  db: D1Database,
  event: Extract<HubAlertEvent, { kind: 'reply' }>,
): Promise<AlertDetails | null> {
  if (event.conversation === 'role-network') {
    const role = await first(
      db,
      'SELECT name_en AS nameEn, name_ar AS nameAr, name_en AS title FROM roles WHERE id = ?',
      event.conversationId,
    );
    return (
      role && {
        params: { aboutEn: role.nameEn, aboutAr: role.nameAr },
        unit: null,
        section: 'role-networks',
      }
    );
  }
  const sql =
    event.conversation === 'discussion'
      ? "SELECT subject AS title, '' AS nameEn, '' AS nameAr FROM discussions WHERE id = ?"
      : "SELECT subject AS title, '' AS nameEn, '' AS nameAr FROM hub_requests WHERE id = ?";
  const row = await first(db, sql, event.conversationId);
  const section = event.conversation === 'discussion' ? 'discussions' : 'requests';
  return row && { params: { aboutEn: row.title, aboutAr: row.title }, unit: null, section };
}

/** What an alert says: the notice's, circular's or request's title and unit (D-162: only the unit goes to phones). */
export async function findAlertDetails(
  db: D1Database,
  event: HubAlertEvent,
): Promise<AlertDetails | null> {
  if (event.kind === 'notice' || event.kind === 'vote-result') {
    const row = await first(
      db,
      `SELECT COALESCE(v.question, n.title) AS title, u.name_en AS nameEn, u.name_ar AS nameAr
       FROM notices n JOIN units u ON u.id = n.unit_id LEFT JOIN notice_votes v ON v.notice_id = n.id
       WHERE n.id = ? AND n.retired_at IS NULL`,
      event.noticeId,
    );
    return row && withUnit(row, 'noticeboard');
  }
  if (event.kind === 'circular') {
    const row = await first(
      db,
      'SELECT c.title, u.name_en AS nameEn, u.name_ar AS nameAr FROM circulars c JOIN units u ON u.id = c.unit_id WHERE c.id = ?',
      event.circularId,
    );
    return row && withUnit(row, 'circulars');
  }
  if (event.kind === 'request') {
    const row = await first(
      db,
      'SELECT r.subject AS title, u.name_en AS nameEn, u.name_ar AS nameAr FROM hub_requests r JOIN units u ON u.id = r.from_unit_id WHERE r.id = ?',
      event.requestId,
    );
    return row && withUnit(row, 'requests');
  }
  return replyDetails(db, event);
}
