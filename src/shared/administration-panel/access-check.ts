import type { PermissionScope } from '../core/permission-scope';

/** One capability a person holds today, with its scope, unit and source (brief 25 A4). */
export interface AccessGrant {
  capability: string;
  scope: PermissionScope;
  /** The unit of the term that gives it; null when it isn't a term's. */
  unitId: string | null;
  source: 'matrix' | 'fixed rule' | 'system administrator';
}

/** A current term, named in both languages, as the access check shows it. */
export interface AccessCheckTerm {
  unitId: string;
  unitNameEn: string;
  unitNameAr: string;
  roleNameEn: string;
  roleNameAr: string;
}

/** Brief 25 A4: a person's permissions — never their data. */
export interface AccessCheck {
  personId: string;
  name: string;
  isSystemAdministrator: boolean;
  currentTerms: AccessCheckTerm[];
  grants: AccessGrant[];
}
