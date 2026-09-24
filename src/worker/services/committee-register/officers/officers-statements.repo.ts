import type { Language } from '../../../../shared/core/languages';

export function buildInsertPersonStatement(
  db: D1Database,
  person: { id: string; name: string; email: string; phone: string; language: Language },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO people (id, email, name, phone, language, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(
      person.id,
      person.email,
      person.name,
      person.phone,
      person.language,
      new Date().toISOString(),
    );
}

export function buildInsertTermStatement(
  db: D1Database,
  term: {
    id: string;
    personId: string;
    roleId: string;
    unitId: string;
    startDate: string;
    endDate: string | null;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO terms (id, person_id, role_id, unit_id, start_date, end_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      term.id,
      term.personId,
      term.roleId,
      term.unitId,
      term.startDate,
      term.endDate,
      new Date().toISOString(),
    );
}

export function buildUpdatePersonStatement(
  db: D1Database,
  person: { id: string; name: string; phone: string },
): D1PreparedStatement {
  return db
    .prepare('UPDATE people SET name = ?, phone = ? WHERE id = ?')
    .bind(person.name, person.phone, person.id);
}

/** Ends a term that has not ended yet; an ended term is history (brief 14 C3). */
export function buildEndTermStatement(
  db: D1Database,
  termId: string,
  endDate: string,
  today: string,
): D1PreparedStatement {
  return db
    .prepare('UPDATE terms SET end_date = ? WHERE id = ? AND (end_date IS NULL OR end_date > ?)')
    .bind(endDate, termId, today);
}
