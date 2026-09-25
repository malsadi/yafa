import { asc, count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { people } from '../../../../db/schema/committee-register/people';
import { systemAdministrators } from '../../../../db/schema/core/system-administrators';
import type {
  SystemAdministratorCandidate,
  SystemAdministratorListItem,
} from './system-administrators.schema';

export async function listSystemAdministrators(
  db: D1Database,
): Promise<SystemAdministratorListItem[]> {
  const orm = drizzle(db);
  return orm
    .select({
      personId: systemAdministrators.personId,
      name: people.name,
      email: people.email,
      appointedAt: systemAdministrators.createdAt,
    })
    .from(systemAdministrators)
    .innerJoin(people, eq(people.id, systemAdministrators.personId))
    .orderBy(asc(systemAdministrators.createdAt));
}

/**
 * Brief 25 A1: who may be appointed — people holding a current term in the
 * General Council (the national unit), not already administrators. The
 * same currency rule as current-term-condition.ts (D-029).
 */
export async function listAppointableCandidates(
  db: D1Database,
  today: string,
): Promise<SystemAdministratorCandidate[]> {
  const result = await db
    .prepare(
      `SELECT DISTINCT p.id AS personId, p.name AS name, p.email AS email
       FROM people p
       JOIN terms t ON t.person_id = p.id
       JOIN units u ON u.id = t.unit_id AND u.type = 'national'
       WHERE t.start_date <= ? AND (t.end_date IS NULL OR t.end_date > ?)
         AND p.id NOT IN (SELECT person_id FROM system_administrators)
       ORDER BY p.name`,
    )
    .bind(today, today)
    .all<SystemAdministratorCandidate>();
  return result.results;
}

export async function countSystemAdministrators(db: D1Database): Promise<number> {
  const orm = drizzle(db);
  const rows = await orm.select({ total: count() }).from(systemAdministrators);
  return rows[0]?.total ?? 0;
}

export function buildAppointStatement(db: D1Database, personId: string): D1PreparedStatement {
  return db
    .prepare('INSERT INTO system_administrators (person_id, created_at) VALUES (?, ?)')
    .bind(personId, new Date().toISOString());
}

/** Refused by the database while two or fewer remain (P21, migration 0011). */
export function buildRemoveStatement(db: D1Database, personId: string): D1PreparedStatement {
  return db.prepare('DELETE FROM system_administrators WHERE person_id = ?').bind(personId);
}
