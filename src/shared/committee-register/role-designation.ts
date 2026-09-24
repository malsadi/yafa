/**
 * The two role designations with a special meaning in the fixed rules
 * (brief sections 7.2, 7.3 and 15 B2). Values are the brief's exact labels
 * (brief section 5.1). The code refers to a designation, never a role name.
 */
export const RoleDesignation = {
  BranchRegisterOfficer: 'Branch register officer',
  NationalRegisterOfficer: 'National register officer',
} as const;

export type RoleDesignation = (typeof RoleDesignation)[keyof typeof RoleDesignation];

export const ROLE_DESIGNATIONS: readonly RoleDesignation[] = Object.values(RoleDesignation);
