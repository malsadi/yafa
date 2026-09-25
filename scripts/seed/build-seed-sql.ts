import type { SeedPlanInput } from './seed-plan-input.ts';

/** A SQL string literal, or NULL. */
function sql(value: string | null): string {
  return value === null ? 'NULL' : `'${value.replaceAll("'", "''")}'`;
}

interface SeedSqlContext {
  /** The language a new person starts with: the data administrator's setting (brief 8.5, rule 5). */
  language: string;
  now: string;
  newId: () => string;
}

/**
 * The INSERT statements that load the checked seed files: units, standard
 * roles, people, their terms, the system administrators and the first
 * privacy notice. Nothing here invites anyone (D-062).
 */
export function buildSeedSql(input: SeedPlanInput, ctx: SeedSqlContext): string[] {
  const unitIds = new Map(input.units.map((u) => [u.code, ctx.newId()]));
  const roleIds = new Map(input.roles.map((r) => [r.nameEn, ctx.newId()]));
  const people = [...new Map(input.terms.map((t) => [t.email, t])).values()];
  const personIds = new Map(people.map((p) => [p.email, ctx.newId()]));
  const at = sql(ctx.now);
  return [
    ...input.units.map(
      (u) =>
        `INSERT INTO units (id, type, code, name_en, name_ar, area, status, created_at) VALUES (${sql(unitIds.get(u.code) ?? null)}, ${sql(u.type)}, ${sql(u.code)}, ${sql(u.nameEn)}, ${sql(u.nameAr)}, ${sql(u.area)}, ${sql(u.status)}, ${at});`,
    ),
    ...input.roles.map(
      (r) =>
        `INSERT INTO roles (id, unit_id, name_en, name_ar, designation, created_at) VALUES (${sql(roleIds.get(r.nameEn) ?? null)}, NULL, ${sql(r.nameEn)}, ${sql(r.nameAr)}, ${sql(r.designation)}, ${at});`,
    ),
    ...people.map(
      (p) =>
        `INSERT INTO people (id, email, name, phone, language, created_at) VALUES (${sql(personIds.get(p.email) ?? null)}, ${sql(p.email)}, ${sql(p.name)}, ${sql(p.phone)}, ${sql(ctx.language)}, ${at});`,
    ),
    ...input.terms.map(
      (t) =>
        `INSERT INTO terms (id, person_id, role_id, unit_id, start_date, end_date, created_at) VALUES (${sql(ctx.newId())}, ${sql(personIds.get(t.email) ?? null)}, ${sql(roleIds.get(t.roleNameEn) ?? null)}, ${sql(unitIds.get(t.unitCode) ?? null)}, ${sql(t.startDate)}, ${sql(t.endDate)}, ${at});`,
    ),
    ...people
      .filter((p) => p.systemAdministrator)
      .map(
        (p) =>
          `INSERT INTO system_administrators (person_id, created_at) VALUES (${sql(personIds.get(p.email) ?? null)}, ${at});`,
      ),
    `INSERT INTO privacy_notice_versions (id, text_en, text_ar, created_at) VALUES (${sql(ctx.newId())}, ${sql(input.notice.en)}, ${sql(input.notice.ar)}, ${at});`,
  ];
}
