import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { ROLE_DESIGNATIONS } from '../../../shared/committee-register/role-designation';
import { units } from './units';

// Brief section 14 B2: unitId is null for a standard (national) role, used
// by every branch, and a unit id for a branch's own extra role. Names in
// English and Arabic (D-052). `designation` marks the one role designated
// as each register officer role (brief 7.2, 15 B2): at most one role per
// designation.
export const roles = sqliteTable(
  'roles',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').references(() => units.id),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar').notNull(),
    designation: text('designation', { enum: ROLE_DESIGNATIONS as [string, ...string[]] }),
    // D-071: the standard roles' order, set by the national register officer.
    position: integer('position'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('roles_designation_unique')
      .on(table.designation)
      .where(sql`${table.designation} IS NOT NULL`),
  ],
);
