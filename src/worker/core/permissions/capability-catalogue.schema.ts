import { z } from 'zod';
import type { RoleDesignation } from '../../../shared/committee-register/role-designation';
import { PERMISSION_SCOPES } from '../../../shared/core/permission-scope';
import { CAPABILITY_PATTERN } from './route-access.schema';

export const capabilityNameSchema = z.string().regex(CAPABILITY_PATTERN);

export interface CapabilityDefinition {
  capability: string;
  label: string;
  description: string;
  /** The scopes a grant for this capability may be made at (brief section 7.2). */
  allowedScopes: readonly (typeof PERMISSION_SCOPES)[number][];
  /**
   * Brief section 7.3's fixed rules: who holds this capability is decided
   * here, by role designation, never by the matrix — shown locked in the
   * matrix editor, and `can()` ignores any matrix grant for it.
   */
  fixedGrants?: readonly FixedGrant[];
}

export interface FixedGrant {
  designation: RoleDesignation;
  scope: (typeof PERMISSION_SCOPES)[number];
}
