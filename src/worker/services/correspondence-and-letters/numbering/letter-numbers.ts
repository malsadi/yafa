import { formatReference } from '../../../../shared/correspondence-and-letters/reference-format';
import { ServiceUnavailableError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import { NumberTakenError, type LetterUnitRow } from '../letter-access';

export type LetterDirection = 'out' | 'in';

/** The reference a new letter will carry, if no other letter takes its number first (T-154). */
export interface PredictedNumber {
  year: number;
  number: number;
  reference: string;
}

/**
 * Brief 23 B1 and D-214: the next number in the unit's sequence for this
 * year (London), written in the administrator's format. Until the format
 * is set, letters wait (8.1).
 */
export async function predictNumber(
  db: D1Database,
  unit: LetterUnitRow,
  direction: LetterDirection,
): Promise<PredictedNumber> {
  const format = await getSetting<string>(
    db,
    `correspondence-and-letters.reference_format_${direction}`,
  );
  if (format.status === 'not-configured')
    throw new ServiceUnavailableError('setting.not-configured');
  const year = Number(getTodayInLondon().slice(0, 4));
  const row = await db
    .prepare(
      'SELECT last_number AS last FROM letter_counters WHERE unit_id = ? AND direction = ? AND year = ?',
    )
    .bind(unit.id, direction, year)
    .first<{ last: number }>();
  const number = (row?.last ?? 0) + 1;
  return {
    year,
    number,
    reference: formatReference(format.value, { unitCode: unit.code, year, number }),
  };
}

/**
 * Brief 23 build notes: the number taken in SQL, in the register entry's
 * own batch — the counter made if new, then moved on by one. The entry's
 * trigger checks it carries that very number (T-154).
 */
export function takeNumberStatements(
  db: D1Database,
  unitId: string,
  direction: LetterDirection,
  year: number,
): D1PreparedStatement[] {
  return [
    db
      .prepare(
        `INSERT INTO letter_counters (unit_id, direction, year, last_number) VALUES (?, ?, ?, 0)
         ON CONFLICT DO NOTHING`,
      )
      .bind(unitId, direction, year),
    db
      .prepare(
        `UPDATE letter_counters SET last_number = last_number + 1
         WHERE unit_id = ? AND direction = ? AND year = ? RETURNING last_number`,
      )
      .bind(unitId, direction, year),
  ];
}

const ATTEMPTS = 3;

/** T-154: tries again with the next number when another letter took this one first. */
export async function withFreshNumber<T>(attempt: () => Promise<T>): Promise<T> {
  for (let tried = 1; ; tried += 1) {
    try {
      return await attempt();
    } catch (error) {
      if (!(error instanceof NumberTakenError) || tried >= ATTEMPTS) throw error;
    }
  }
}
