import type { RoleDesignation } from '../committee-register/role-designation';
import type { RoleRecord } from '../committee-register/role-record';

/** Brief 25 B2: which standard role holds each designation, and the roles to choose from. */
export interface RoleDesignationsView {
  designations: { designation: RoleDesignation; roleId: string | null }[];
  standardRoles: RoleRecord[];
}
