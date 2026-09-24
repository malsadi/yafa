import type { RoleDesignation } from '../committee-register/role-designation';
import type { CapabilityDefinition } from '../core/capability-definition';
import type { PermissionScope } from '../core/permission-scope';

export interface MatrixRole {
  id: string;
  /** Null for a standard role; a unit id for a branch's own extra role. */
  unitId: string | null;
  nameEn: string;
  nameAr: string;
  designation: RoleDesignation | null;
}

export interface MatrixGrant {
  roleId: string;
  capability: string;
  scope: PermissionScope;
}

/** Brief 25 A3: the whole matrix as it stands, at one version (T-078). */
export interface PermissionsMatrixView {
  version: number;
  roles: MatrixRole[];
  capabilities: readonly CapabilityDefinition[];
  grants: MatrixGrant[];
}

/** What one version changed: a cell's scopes, or a restore. */
export type MatrixChange =
  | { kind: 'cell'; roleId: string; capability: string; before: string[]; after: string[] }
  | { kind: 'restore'; fromVersion: number };

export interface MatrixVersionSummary {
  number: number;
  createdAt: string;
  createdByEmail: string;
  change: MatrixChange;
}
