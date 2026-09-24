import type { RoleDesignation } from '../committee-register/role-designation';
import type { PermissionScope } from './permission-scope';

/**
 * One entry in the capability catalogue (brief section 7.2): the name, what
 * it means, and the scopes a grant may be made at. `label` and
 * `description` document the capability in `docs/permissions.md`; the
 * interface shows its own text from `src/web/text/`.
 */
export interface CapabilityDefinition {
  capability: string;
  label: string;
  description: string;
  allowedScopes: readonly PermissionScope[];
  /**
   * Brief section 7.3's fixed rules: who holds this capability is decided
   * here, by role designation, never by the matrix. Shown locked in the
   * matrix editor, and `can()` ignores any matrix grant for it.
   */
  fixedGrants?: readonly FixedGrant[];
}

export interface FixedGrant {
  designation: RoleDesignation;
  scope: PermissionScope;
}
