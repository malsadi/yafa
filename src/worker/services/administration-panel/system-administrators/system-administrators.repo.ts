import { asc, count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { people } from '../../../../db/schema/committee-register/people';
import { systemAdministrators } from '../../../../db/schema/core/system-administrators';
import type { SystemAdministratorListItem } from './system-administrators.schema';

export async function listSystemAdministrators(
  db: D1Database,
): Promise<SystemAdministratorListItem[]> {
  const orm = drizzle(db);
  return orm
    .select({
      personId: systemAdministrators.personId,
      email: people.email,
      appointedAt: systemAdministrators.createdAt,
    })
    .from(systemAdministrators)
    .innerJoin(people, eq(people.id, systemAdministrators.personId))
    .orderBy(asc(systemAdministrators.createdAt));
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
