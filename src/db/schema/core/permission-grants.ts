import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { PermissionScope } from '../../../shared/core/permission-scope';
import { roles } from '../committee-register/roles';

// The permissions matrix (brief section 7.2/25 A3): which role holds which
// capability, at which scope. Starts empty; the data administrator fills it
// in during Phase 1 (15 A3). No versioning/history table yet — "every
// change versioned and restorable" is that screen's own feature, not needed
// for can() to read grants (D-003 minimal-columns reasoning; see T-043).
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
