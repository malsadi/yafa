import type { ExchangeLetter } from '../../../../shared/correspondence-and-letters/letter-records';

type Node = Pick<ExchangeLetter, 'direction' | 'id'>;

const OUT = `SELECT 'out' AS direction, id, reference_number AS referenceNumber, letter_date AS date,
  recipient_name AS party, subject, reply_to_letter_in_id AS linkedIn FROM letters_out`;
const IN = `SELECT 'in' AS direction, id, reference_number AS referenceNumber, date_received AS date,
  sender AS party, subject, answers_letter_out_id AS linkedOut FROM letters_in`;

type Row = ExchangeLetter & { linkedIn?: string | null; linkedOut?: string | null };

/** The letter itself, and those linked straight to it: its answers, and what it answers. */
async function withNeighbours(db: D1Database, unitId: string, node: Node): Promise<Row[]> {
  const sql =
    node.direction === 'out'
      ? `${OUT} WHERE unit_id = ?1 AND id = ?2 UNION ALL SELECT direction, id, referenceNumber, date, party, subject, NULL FROM (${IN} WHERE unit_id = ?1 AND answers_letter_out_id = ?2)`
      : `${IN} WHERE unit_id = ?1 AND id = ?2 UNION ALL SELECT direction, id, referenceNumber, date, party, subject, NULL FROM (${OUT} WHERE unit_id = ?1 AND reply_to_letter_in_id = ?2)`;
  return (await db.prepare(sql).bind(unitId, node.id).all<Row>()).results;
}

const key = (node: Node) => `${node.direction}:${node.id}`;

/**
 * D-214 (O-146) and brief 23 purpose: the whole exchange a letter belongs
 * to — every letter reached through replies and answers, in either
 * direction, within the unit — by date. The letter itself is included.
 */
export async function exchangeOf(
  db: D1Database,
  unitId: string,
  start: Node,
): Promise<ExchangeLetter[]> {
  const found = new Map<string, ExchangeLetter>();
  const queue: Node[] = [start];
  const queued = new Set([key(start)]);
  for (let node = queue.shift(); node; node = queue.shift()) {
    const [self, ...answers] = await withNeighbours(db, unitId, node);
    if (!self) continue;
    const { linkedIn, linkedOut, ...letter } = self;
    found.set(key(node), letter);
    const next: Node[] = answers.map((a) => ({ direction: a.direction, id: a.id }));
    if (linkedIn) next.push({ direction: 'in', id: linkedIn });
    if (linkedOut) next.push({ direction: 'out', id: linkedOut });
    for (const n of next)
      if (!queued.has(key(n))) {
        queued.add(key(n));
        queue.push(n);
      }
  }
  return [...found.values()].sort((a, b) => a.date.localeCompare(b.date));
}
