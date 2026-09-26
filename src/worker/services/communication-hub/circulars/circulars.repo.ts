import type {
  OpenedCircular,
  ReceivedCircular,
} from '../../../../shared/communication-hub/circular-records';

/** A circular and the branches it went to, as one set of statements for the sending batch. */
export function buildSendCircularStatements(
  db: D1Database,
  row: {
    id: string;
    unitId: string;
    title: string;
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
        `INSERT INTO circulars (id, unit_id, title, body, to_all_branches, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(row.id, row.unitId, row.title, row.body, row.toAllBranches ? 1 : 0, row.actor, row.at),
    ...row.recipientIds.map((unitId) =>
      db
        .prepare('INSERT INTO circular_recipients (circular_id, unit_id) VALUES (?, ?)')
        .bind(row.id, unitId),
    ),
  ];
}

const RECEIVED = `SELECT c.id, c.title, c.created_at AS sentAt, o.opened_at AS openedAt
  FROM circular_recipients r JOIN circulars c ON c.id = r.circular_id
  LEFT JOIN circular_opens o ON o.circular_id = r.circular_id AND o.unit_id = r.unit_id`;

/** Brief 20 A3: the circulars a branch received, newest first, with when it first opened each (P14). */
export async function listReceivedCirculars(
  db: D1Database,
  unitId: string,
): Promise<ReceivedCircular[]> {
  const { results } = await db
    .prepare(`${RECEIVED} WHERE r.unit_id = ? ORDER BY c.created_at DESC, c.id DESC`)
    .bind(unitId)
    .all<ReceivedCircular>();
  return results;
}

/** One circular the branch received, in full; null if it did not go to that branch. */
export async function findReceivedCircular(
  db: D1Database,
  params: { unitId: string; circularId: string },
): Promise<OpenedCircular | null> {
  return db
    .prepare(
      `SELECT c.id, c.title, c.body, c.created_at AS sentAt, o.opened_at AS openedAt
       FROM circular_recipients r JOIN circulars c ON c.id = r.circular_id
       LEFT JOIN circular_opens o ON o.circular_id = r.circular_id AND o.unit_id = r.unit_id
       WHERE r.unit_id = ? AND r.circular_id = ?`,
    )
    .bind(params.unitId, params.circularId)
    .first<OpenedCircular>();
}

/** P14: the branch's first opening, recorded once; later openings change nothing. */
export function buildRecordOpeningStatement(
  db: D1Database,
  opening: { circularId: string; unitId: string; personId: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO circular_opens (circular_id, unit_id, opened_at, opened_by) VALUES (?, ?, ?, ?)
       ON CONFLICT (circular_id, unit_id) DO NOTHING`,
    )
    .bind(opening.circularId, opening.unitId, opening.at, opening.personId);
}
