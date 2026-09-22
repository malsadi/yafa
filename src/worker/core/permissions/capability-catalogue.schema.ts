import { z } from 'zod';
import { PERMISSION_SCOPES } from '../../../shared/core/permission-scope';
import { CAPABILITY_PATTERN } from './route-access.schema';

export const capabilityNameSchema = z.string().regex(CAPABILITY_PATTERN);

export interface CapabilityDefinition {
  capability: string;
  label: string;
  description: string;
  /** The scopes a grant for this capability may be made at (brief section 7.2). */
  allowedScopes: readonly (typeof PERMISSION_SCOPES)[number][];
}
