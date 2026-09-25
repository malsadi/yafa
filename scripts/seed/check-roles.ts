import {
  ROLE_DESIGNATIONS,
  type RoleDesignation,
} from '../../src/shared/committee-register/role-designation.ts';
import type { SeedTable } from './seed-table.ts';

export const ROLE_COLUMNS = ['name_en', 'name_ar', 'designation'] as const;

export interface SeedRole {
  nameEn: string;
  nameAr: string;
  designation: RoleDesignation | null;
}

function isDesignation(value: string): value is RoleDesignation {
  return (ROLE_DESIGNATIONS as readonly string[]).includes(value);
}

/** docs/seed-files.md section 2: unique names in both languages, each designation on exactly one role. */
export function checkRoles(table: SeedTable, errors: string[]): SeedRole[] {
  const names = { en: new Set<string>(), ar: new Set<string>() };
  const roles: SeedRole[] = [];
  for (const { line, values: v } of table.rows) {
    const where = `${table.file} row ${String(line)}`;
    const nameEn = v.name_en ?? '';
    const nameAr = v.name_ar ?? '';
    const designation = v.designation ?? '';
    if (!nameEn || !nameAr) errors.push(`${where}: name_en and name_ar are required.`);
    if (names.en.has(nameEn.toLowerCase()))
      errors.push(`${where}: name_en ${nameEn} is used twice.`);
    if (names.ar.has(nameAr)) errors.push(`${where}: name_ar ${nameAr} is used twice.`);
    names.en.add(nameEn.toLowerCase());
    names.ar.add(nameAr);
    if (designation && !isDesignation(designation)) {
      errors.push(`${where}: designation must be empty, ${ROLE_DESIGNATIONS.join(', or ')}.`);
    }
    roles.push({ nameEn, nameAr, designation: isDesignation(designation) ? designation : null });
  }
  for (const designation of ROLE_DESIGNATIONS) {
    const count = roles.filter((role) => role.designation === designation).length;
    if (count !== 1)
      errors.push(
        `${table.file}: exactly one role must be the ${designation}, not ${String(count)}.`,
      );
  }
  return roles;
}
