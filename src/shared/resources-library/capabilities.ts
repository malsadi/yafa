import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// Each capability works in the officer's own unit. What else a unit sees is
// the brief's fixed rules (7.3): General Council resources and national
// letter templates are shared with all branches; a branch's own, and its
// letters in and out, are for that branch only.
// D-221: granted for the holder's own unit, or for all units (the owner's
// "main administrator" role); the service's own rules apply either way.
const OWN_OR_ALL_UNITS = [PermissionScope.OwnUnit, PermissionScope.AllUnits] as const;

/** Service 6, Resources library (brief section 16). Granted in the permissions matrix. */
export const RESOURCES_LIBRARY_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'resources-library.library.read',
    label: 'Read the library',
    description:
      "See the unit's templates, guides, venues, equipment, loans and letter templates, and what the fixed rules share with it from the General Council (16 A, B, C, D1; 7.3).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
  {
    capability: 'resources-library.resources.manage',
    label: 'Manage templates and guides',
    description:
      "Add, replace, retire and bring back the unit's templates and guides (16 A1, A2; D-100).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
  {
    capability: 'resources-library.venues.manage',
    label: 'Manage venues',
    description:
      "Add and change the unit's venues, add dated notes, retire and bring back (16 B1; D-098, D-100).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
  {
    capability: 'resources-library.equipment.manage',
    label: 'Manage equipment and loans',
    description:
      "Keep the unit's equipment register, and record loans and their returns (16 C1, C2; P20, D-099, D-100).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
  {
    capability: 'resources-library.letter-templates.manage',
    label: 'Manage letter templates',
    description:
      "Write, change, retire and bring back the unit's letter templates (16 D1; P19, D-100 to D-102).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
  {
    capability: 'resources-library.correspondence.read',
    label: 'Read letters in and out',
    description:
      "See and download the unit's filed letters in and out; its own only (16 D2, D3; 7.3).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
];
