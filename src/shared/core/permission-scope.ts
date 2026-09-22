/**
 * The three grant scopes brief section 7.2 names. Values are the exact
 * labels from the document (brief section 5.1's enum convention), not
 * snake_case — unlike `NATIONAL_SCOPE` (national-scope.ts), which is an
 * unrelated structural sentinel for settings/service-switches, not a grant
 * scope.
 */
export const PermissionScope = {
  OwnUnit: 'own unit',
  AllUnits: 'all units',
  NationalContent: 'national content',
} as const;

export type PermissionScope = (typeof PermissionScope)[keyof typeof PermissionScope];

export const PERMISSION_SCOPES: readonly PermissionScope[] = Object.values(PermissionScope);
