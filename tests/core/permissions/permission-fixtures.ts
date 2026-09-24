// Raw-SQL row insertion for tests, matching the rest of the suite's fixture
// style (e.g. tests/integrity/append-only-tables.test.ts) — these tables
// have no application-level write path yet (Phase 1 builds officer/role
// admin screens), so tests insert rows directly.
const NOW = () => new Date().toISOString();

/**
 * `INSERT OR IGNORE`: several tests in one file share the same small set of
 * fixture units, calling this once each with identical values — a plain
 * INSERT would collide on the primary key from the second test onward,
 * since a test file's D1 storage isn't reset between individual `it()`s.
 */
export async function insertUnit(
  db: D1Database,
  params: { id: string; type: 'national' | 'branch'; code: string; name: string },
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO units (id, type, code, name_en, name_ar, status, created_at) VALUES (?, ?, ?, ?, 'وحدة تجريبية', 'active', ?)`,
    )
    .bind(params.id, params.type, params.code, params.name, NOW())
    .run();
}

export async function insertPerson(
  db: D1Database,
  params: { id: string; email: string; clerkUserId?: string },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO people (id, email, clerk_user_id, name, phone, created_at) VALUES (?, ?, ?, 'Fictional Person', '07700 900000', ?)`,
    )
    .bind(params.id, params.email, params.clerkUserId ?? null, NOW())
    .run();
}

export async function insertRole(
  db: D1Database,
  params: { id: string; name: string; unitId?: string; designation?: string },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO roles (id, unit_id, name_en, name_ar, designation, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      params.id,
      params.unitId ?? null,
      params.name,
      `${params.name} (ar)`,
      params.designation ?? null,
      NOW(),
    )
    .run();
}

export async function insertTerm(
  db: D1Database,
  params: {
    id: string;
    personId: string;
    roleId: string;
    unitId: string;
    startDate: string;
    endDate?: string | null;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO terms (id, person_id, role_id, unit_id, start_date, end_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      params.id,
      params.personId,
      params.roleId,
      params.unitId,
      params.startDate,
      params.endDate ?? null,
      NOW(),
    )
    .run();
}

export async function insertGrant(
  db: D1Database,
  params: { id: string; roleId: string; capability: string; scope: string },
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO permission_grants (id, role_id, capability, scope, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(params.id, params.roleId, params.capability, params.scope, NOW())
    .run();
}

export async function insertSystemAdministrator(db: D1Database, personId: string): Promise<void> {
  await db
    .prepare('INSERT INTO system_administrators (person_id, created_at) VALUES (?, ?)')
    .bind(personId, NOW())
    .run();
}
