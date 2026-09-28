import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// Brief 7.3 and 23 rules: letters in and out are visible to their own
// branch only — the General Council included (D-214, O-135). The officer
// handling a letter in may change its status without a capability.
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 7, Correspondence and letters (brief section 23). Granted in the permissions matrix. */
export const CORRESPONDENCE_AND_LETTERS_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'correspondence-and-letters.registers.read',
    label: 'Read the letter registers',
    description:
      "See the unit's letters out and letters in registers, each letter's exchange, and download the letters (23 B2 to B4; 7.3).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'correspondence-and-letters.letters-out.write',
    label: 'Write letters',
    description:
      "Generate the unit's letters from its own and the national templates, signed with the officer's own name and role (23 A1, A2; D-214).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'correspondence-and-letters.letters-in.record',
    label: 'Record letters in',
    description:
      'Log letters the unit receives, choose who handles each, and change its status (23 B3, B4; D-214).',
    allowedScopes: OWN_UNIT,
  },
];
