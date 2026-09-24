import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { PermissionScope } from '../../../shared/core/permission-scope';
import { roles } from '../committee-register/roles';

// The permissions matrix (brief section 7.2/25 A3): which role holds which
// capability, at which scope. Starts empty; the data administrator fills it
// in during Phase 1 (15 A3). This is the live matrix can() reads; its
// versions and snapshots are in permission-matrix-versions.ts (T-078).
export const permissionGrants = sqliteTable(
  'permission_grants',
  {
    id: text('id').primaryKey(),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id),
    capability: text('capability').notNull(),
    scope: text('scope', {
      enum: [PermissionScope.OwnUnit, PermissionScope.AllUnits, PermissionScope.NationalContent],
    }).notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('permission_grants_role_capability_scope_unique').on(
      table.roleId,
      table.capability,
      table.scope,
    ),
  ],
);
