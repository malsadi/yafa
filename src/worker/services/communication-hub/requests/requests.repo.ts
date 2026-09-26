import type {
  HubRequestRecord,
  RequestStatus,
} from '../../../../shared/communication-hub/conversation-records';

interface RequestRow {
  id: string;
  fromUnitId: string;
  fromUnitNameEn: string;
  fromUnitNameAr: string;
  subject: string;
  body: string;
  toAllBranches: number;
  status: RequestStatus;
  createdByName: string;
  createdAt: string;
  recipients: string;
}

/** Brief 20 B3: the requests the branch sent or received, newest first, with the branches each went to. */
export async function listRequestsOf(db: D1Database, unitId: string): Promise<HubRequestRecord[]> {
  const { results } = await db
    .prepare(
      `SELECT r.id, r.from_unit_id AS fromUnitId, f.name_en AS fromUnitNameEn, f.name_ar AS fromUnitNameAr,
         r.subject, r.body, r.to_all_branches AS toAllBranches, r.status, p.name AS createdByName,
         r.created_at AS createdAt,
         (SELECT json_group_array(json_object('unitId', u.id, 'nameEn', u.name_en, 'nameAr', u.name_ar))
            FROM hub_request_recipients x JOIN units u ON u.id = x.unit_id WHERE x.request_id = r.id) AS recipients
       FROM hub_requests r JOIN units f ON f.id = r.from_unit_id JOIN people p ON p.id = r.created_by
       WHERE r.from_unit_id = ?1
          OR EXISTS (SELECT 1 FROM hub_request_recipients x WHERE x.request_id = r.id AND x.unit_id = ?1)
       ORDER BY r.created_at DESC, r.id DESC`,
    )
    .bind(unitId)
    .all<RequestRow>();
  return results.map((row) => ({
    ...row,
    direction: row.fromUnitId === unitId ? 'sent' : 'received',
    toAllBranches: Boolean(row.toAllBranches),
    recipients: JSON.parse(row.recipients) as HubRequestRecord['recipients'],
  }));
}

/** The request as this branch is part of it — the asker, or a branch it went to; null otherwise. */
export async function findRequestFor(
  db: D1Database,
  params: { requestId: string; unitId: string },
): Promise<{ fromUnitId: string; status: RequestStatus } | null> {
  return db
    .prepare(
      `SELECT r.from_unit_id AS fromUnitId, r.status FROM hub_requests r
       WHERE r.id = ?1 AND (r.from_unit_id = ?2
         OR EXISTS (SELECT 1 FROM hub_request_recipients x WHERE x.request_id = r.id AND x.unit_id = ?2))`,
    )
    .bind(params.requestId, params.unitId)
    .first();
}

export function buildSendRequestStatements(
  db: D1Database,
  row: {
    id: string;
    unitId: string;
    subject: string;
    body: string;
    toAllBranches: boolean;
    recipientIds: string[];
    actor: string;
    at: string;
  },
): D1PreparedStatement[] {
  return [
    db
      .prepare(
        `INSERT INTO hub_requests (id, from_unit_id, subject, body, to_all_branches, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)`,
      )
      .bind(
        row.id,
        row.unitId,
        row.subject,
        row.body,
        row.toAllBranches ? 1 : 0,
        row.actor,
        row.at,
      ),
    ...row.recipientIds.map((unitId) =>
      db
        .prepare('INSERT INTO hub_request_recipients (request_id, unit_id) VALUES (?, ?)')
        .bind(row.id, unitId),
    ),
  ];
}

/** D-160: a receiving branch's first reply makes an Open request Answered — decided in SQL, in the reply's batch. */
export function buildAnsweredStatement(
  db: D1Database,
  params: { requestId: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      "UPDATE hub_requests SET status = 'Answered', answered_at = ? WHERE id = ? AND status = 'Open'",
    )
    .bind(params.at, params.requestId);
}

export function buildCloseStatement(
  db: D1Database,
  params: { requestId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      "UPDATE hub_requests SET status = 'Closed', closed_by = ?, closed_at = ? WHERE id = ? AND status <> 'Closed'",
    )
    .bind(params.actor, params.at, params.requestId);
}
