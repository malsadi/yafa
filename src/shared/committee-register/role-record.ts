import type { RoleDesignation } from './role-designation';

/** Brief 14 B2: a standard role, or a branch's own extra role. */
export interface RoleRecord {
  id: string;
  /** Null for a standard role; the branch's unit id for its own extra role. */
  unitId: string | null;
  nameEn: string;
  nameAr: string;
  designation: RoleDesignation | null;
}

/** A role's names, in English and Arabic (D-052). */
export interface RoleNames {
  nameEn: string;
  nameAr: string;
}
