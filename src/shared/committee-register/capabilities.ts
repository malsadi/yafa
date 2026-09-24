import { RoleDesignation } from './role-designation';
import type { CapabilityDefinition, FixedGrant } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

const OWN_AND_ALL = [PermissionScope.OwnUnit, PermissionScope.AllUnits] as const;

// Brief 14 "Who does what": a branch register officer for their own branch,
// the national register officer for every branch.
const REGISTER_OFFICERS: readonly FixedGrant[] = [
  { designation: RoleDesignation.BranchRegisterOfficer, scope: PermissionScope.OwnUnit },
  { designation: RoleDesignation.NationalRegisterOfficer, scope: PermissionScope.AllUnits },
];

// Brief 7.3 and 14: "alone adds or changes branches and maintains the
// standard roles".
const NATIONAL_REGISTER_OFFICER_ONLY: readonly FixedGrant[] = [
  { designation: RoleDesignation.NationalRegisterOfficer, scope: PermissionScope.AllUnits },
];

/** Service 8, Committee register (brief section 14). */
export const COMMITTEE_REGISTER_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'committee-register.branches.manage',
    label: 'Add or change branches',
    description:
      "Add a branch and change a branch's name, code, area and status (14 A1, 15 B1). Fixed: the national register officer alone.",
    allowedScopes: [PermissionScope.AllUnits],
    fixedGrants: NATIONAL_REGISTER_OFFICER_ONLY,
  },
  {
    capability: 'committee-register.standard-roles.manage',
    label: 'Maintain the standard roles',
    description:
      'Keep the national list of roles used by every branch (14 B2, 15 B2). Fixed: the national register officer alone.',
    allowedScopes: [PermissionScope.AllUnits],
    fixedGrants: NATIONAL_REGISTER_OFFICER_ONLY,
  },
  {
    capability: 'committee-register.branch-roles.manage',
    label: "Add a branch's extra roles",
    description:
      "Add roles of a branch's own beyond the standard list (14 B2). Fixed: a branch register officer for their own branch; the national register officer for every branch.",
    allowedScopes: OWN_AND_ALL,
    fixedGrants: REGISTER_OFFICERS,
  },
  {
    capability: 'committee-register.officers.manage',
    label: 'Manage officers and terms',
    description:
      'Add officers and invite them, record and end terms of office, and keep past officers (14 A2, B1, B3, C3). Fixed: a branch register officer for their own branch; the national register officer for every branch.',
    allowedScopes: OWN_AND_ALL,
    fixedGrants: REGISTER_OFFICERS,
  },
  {
    capability: 'committee-register.elections.manage',
    label: 'Record elections',
    description:
      "Record an election's date, positions, candidates, results and vote counts (14 C1, D-055). Fixed: a branch register officer for their own branch; the national register officer for every branch.",
    allowedScopes: OWN_AND_ALL,
    fixedGrants: REGISTER_OFFICERS,
  },
  {
    capability: 'committee-register.elections.confirm',
    label: 'Confirm election results',
    description:
      "Confirm an election's results, which ends the outgoing terms and starts the incoming ones (14 C1). Granted in the permissions matrix (brief 14 build notes).",
    allowedScopes: OWN_AND_ALL,
  },
  {
    capability: 'committee-register.handovers.manage',
    label: 'Set up handovers',
    description:
      'Set up a handover between an outgoing and an incoming officer, with its checklist (14 C2). Fixed: a branch register officer for their own branch; the national register officer for every branch.',
    allowedScopes: OWN_AND_ALL,
    fixedGrants: REGISTER_OFFICERS,
  },
  {
    capability: 'committee-register.register.read',
    label: 'Read the register',
    description:
      "Read a unit's register, including officers' contact details (brief 13: contact details are shown only to officers who may read the register). Granted in the permissions matrix.",
    allowedScopes: OWN_AND_ALL,
  },
];
