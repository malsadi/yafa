import type { RoleDesignation } from '../committee-register/role-designation';
import type { ServiceSlug } from '../core/services';

/** Brief 25 C6: one required thing not yet configured. */
export type ChecklistItem =
  | { service: 'administration-panel'; kind: 'privacy-notice' }
  | { service: 'committee-register'; kind: 'designation'; designation: RoleDesignation }
  | { service: ServiceSlug; kind: 'setting'; key: string };
