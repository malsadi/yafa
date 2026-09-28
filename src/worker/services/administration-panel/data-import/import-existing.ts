/** What the database already holds, for matching: an import adds only what is new (D-217, O-165). */
export interface ExistingRecords {
  units: Map<string, { id: string; type: string }>;
  /** Role name (English, lower case) to its id — standard roles for every unit, a branch's own for it. */
  roles: { id: string; nameEn: string; unitId: string | null }[];
  people: Map<string, string>;
  terms: Set<string>;
  accounts: Set<string>;
}

export const termKey = (personEmail: string, roleId: string, unitId: string, start: string) =>
  `${personEmail.toLowerCase()}|${roleId}|${unitId}|${start}`;
export const accountKey = (unitId: string, name: string) => `${unitId}|${name.toLowerCase()}`;

export async function readExisting(db: D1Database): Promise<ExistingRecords> {
  const [units, roles, people, terms, accounts] = await db.batch([
    db.prepare('SELECT id, code, type FROM units'),
    db.prepare('SELECT id, name_en AS nameEn, unit_id AS unitId FROM roles'),
    db.prepare('SELECT id, email FROM people'),
    db.prepare(
      'SELECT p.email, t.role_id AS roleId, t.unit_id AS unitId, t.start_date AS startDate FROM terms t JOIN people p ON p.id = t.person_id',
    ),
    db.prepare("SELECT unit_id AS unitId, name FROM treasury_accounts WHERE kind = 'branch'"),
  ]);
  interface U {
    id: string;
    code: string;
    type: string;
  }
  interface T {
    email: string;
    roleId: string;
    unitId: string;
    startDate: string;
  }
  return {
    units: new Map(
      ((units?.results ?? []) as U[]).map((u) => [u.code, { id: u.id, type: u.type }]),
    ),
    roles: (roles?.results ?? []) as ExistingRecords['roles'],
    people: new Map(
      ((people?.results ?? []) as { id: string; email: string }[]).map((p) => [
        p.email.toLowerCase(),
        p.id,
      ]),
    ),
    terms: new Set(
      ((terms?.results ?? []) as T[]).map((t) => termKey(t.email, t.roleId, t.unitId, t.startDate)),
    ),
    accounts: new Set(
      ((accounts?.results ?? []) as { unitId: string; name: string }[]).map((a) =>
        accountKey(a.unitId, a.name),
      ),
    ),
  };
}
