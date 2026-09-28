import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// Brief 24 rules and D-215 (O-150): a branch's readers see their branch's
// achievements and the General Council's; the General Council's readers see
// every branch's, and only they have the all-branches view (A3).
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 12, Achievements and reports (brief section 24). Granted in the permissions matrix. */
export const ACHIEVEMENTS_AND_REPORTS_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'achievements-and-reports.achievements.read',
    label: 'Read achievements',
    description:
      "See the unit's timeline, officers' contributions and annual reports, and the General Council's achievements. Held in the General Council, every branch's too (24 A2, A3, B1; D-215).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'achievements-and-reports.achievements.record',
    label: 'Record achievements',
    description:
      "Record the unit's achievements, change them, and withdraw or bring them back until their year's report is finalised (24 A1; D-215).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'achievements-and-reports.annual-report.manage',
    label: 'Manage the annual report',
    description:
      "Start the unit's annual report once its year has ended, write its summary, and finalise it (24 B2; D-215).",
    allowedScopes: OWN_UNIT,
  },
];
