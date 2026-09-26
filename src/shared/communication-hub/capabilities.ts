import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// Each works in the officer's own unit: D-154, a unit's Noticeboard is read
// by its own officers only. Voting needs no capability of its own: P11's
// eligible voters are chosen when the vote is created. D-157: every officer
// of a branch a circular went to reads it, and the General Council's
// officers see what it sent, with the read confirmation — no capability.
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 4, Communication hub (brief section 20). Granted in the permissions matrix. */
export const COMMUNICATION_HUB_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'communication-hub.noticeboard.read',
    label: 'Read the Noticeboard',
    description:
      "See the unit's notices and votes, and vote where chosen as a voter (20 A1, A2; P11; D-154).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'communication-hub.noticeboard.manage',
    label: 'Manage the Noticeboard',
    description:
      "Post, change, retire and bring back the unit's notices, and put a notice to a vote (20 A1, A2; D-155).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'communication-hub.circulars.send',
    label: 'Send national circulars',
    description:
      'Send a national circular from the General Council to all branches or to selected branches; granted in a branch it does nothing (20 A3; D-157).',
    allowedScopes: OWN_UNIT,
  },
];
