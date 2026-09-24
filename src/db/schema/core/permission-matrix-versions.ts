import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { people } from '../committee-register/people';
import { roles } from '../committee-register/roles';

// Brief 25 A3: "every change versioned and restorable" (T-078). Each change
// to the matrix — or a restore — adds one version, numbered 1, 2, 3 … with
// no gaps (a trigger checks, migration 0013), and a full snapshot of the
// grants as they stood after it. Both tables are append-only.
export const permissionMatrixVersions = sqliteTable('permission_matrix_versions', {
  id: text('id').primaryKey(),
  number: integer('number').notNull().unique(),
  // JSON: what changed — one cell's scopes, or a restore of an earlier version.
  change: text('change').notNull(),
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => people.id),
});

export const permissionMatrixVersionGrants = sqliteTable(
  'permission_matrix_version_grants',
  {
    versionId: text('version_id')
      .notNull()
      .references(() => permissionMatrixVersions.id),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id),
    capability: text('capability').notNull(),
    scope: text('scope').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.versionId, table.roleId, table.capability, table.scope] }),
  ],
);
